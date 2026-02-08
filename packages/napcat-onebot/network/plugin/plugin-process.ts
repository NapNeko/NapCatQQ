/**
 * 插件进程隔离运行器
 *
 * 参考 Karin 的热重载机制，结合 napcat-rpc 实现插件进程隔离。
 *
 * 核心理念：
 * - 每个插件运行在独立的 worker_thread 中
 * - 主线程通过 napcat-rpc 的 MessageTransport 与 worker 通信
 * - 热重载 = 终止旧 worker + 启动新 worker（无需清理模块缓存，因为是全新的 V8 隔离堆）
 * - 插件崩溃自动隔离，不影响主进程和其他插件
 *
 * 对比 Karin 的改进：
 * - Karin 使用 chokidar 文件监听 + 同进程重新 import（需要清除 require.cache）
 * - NapCat 使用 worker_threads + RPC 代理，实现真正的进程级隔离
 * - 热重载更彻底：不存在缓存残留问题
 */

import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MessageTransport, createDeepProxy } from 'napcat-rpc';

import type { LogWrapper } from 'napcat-core/helper/log';
import type {
  PluginEntry,
} from './types.js';

// ==================== 类型定义 ====================

/**
 * 隔离插件运行时状态
 */
export type IsolatedPluginStatus = 'starting' | 'running' | 'stopping' | 'stopped' | 'error' | 'crashed';

/**
 * 插件模块能力描述（从 worker 返回）
 */
export interface PluginModuleCapabilities {
  hasOnMessage: boolean;
  hasOnEvent: boolean;
  hasCleanup: boolean;
  hasGetConfig: boolean;
  hasSetConfig: boolean;
  hasConfigSchema: boolean;
  hasConfigUI: boolean;
  hasConfigController: boolean;
  hasOnConfigChange: boolean;
}

/**
 * Worker RPC API 接口（主线程通过代理调用）
 */
interface WorkerPluginAPI {
  loadAndInit: (serializedContext: any) => Promise<PluginModuleCapabilities>;
  dispatchEvent: (event: unknown) => Promise<void>;
  dispatchMessage: (message: unknown) => Promise<void>;
  getConfig: () => Promise<unknown>;
  setConfig: (config: unknown) => Promise<void>;
  getConfigSchema: () => Promise<unknown>;
  cleanup: () => Promise<void>;
  ping: () => Promise<'pong'>;
}

/**
 * 隔离插件运行器的配置选项
 */
export interface PluginProcessOptions {
  /** 插件条目 */
  entry: PluginEntry;
  /** 日志器 */
  logger: LogWrapper;
  /** Worker 入口文件路径（默认使用同目录下的 worker-entry.ts） */
  workerEntryPath?: string;
  /** Worker 启动超时时间（ms） */
  startupTimeout?: number;
  /** 心跳检查间隔（ms）设为 0 禁用 */
  heartbeatInterval?: number;
  /** 心跳超时（ms） */
  heartbeatTimeout?: number;
  /** 崩溃后是否自动重启 */
  autoRestart?: boolean;
  /** 最大自动重启次数 */
  maxRestartCount?: number;
  /** 提供给插件的上下文数据（可序列化部分） */
  contextData?: {
    pluginName: string;
    pluginPath: string;
    configPath: string;
    dataPath: string;
    adapterName: string;
  };
}

// ==================== 插件进程运行器 ====================

/**
 * 隔离插件运行器
 *
 * 管理单个插件的 worker_thread 生命周期，通过 RPC 与插件通信。
 *
 * 使用方式：
 * ```ts
 * const runner = new PluginProcessRunner({
 *   entry: pluginEntry,
 *   logger: coreLogger,
 *   contextData: { pluginName: 'my-plugin', ... }
 * });
 *
 * await runner.start();
 * await runner.dispatchEvent(someEvent);
 * await runner.restart(); // 热重载
 * await runner.stop();
 * ```
 */
export class PluginProcessRunner {
  /** 当前 worker 实例 */
  private worker: Worker | null = null;
  /** RPC 客户端代理 */
  private rpcClient: WorkerPluginAPI | null = null;
  /** RPC 传输层 */
  private transport: MessageTransport | null = null;
  /** 当前状态 */
  private _status: IsolatedPluginStatus = 'stopped';
  /** 自动重启计数 */
  private restartCount = 0;

  /** 插件能力（初始化后由 worker 返回） */
  private capabilities: PluginModuleCapabilities | null = null;
  /** 心跳定时器 */
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  /** 事件监听器 */
  private eventListeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  constructor (private readonly options: PluginProcessOptions) { }

  /** 获取当前状态 */
  get status (): IsolatedPluginStatus {
    return this._status;
  }

  /** 获取插件 ID */
  get pluginId (): string {
    return this.options.entry.id;
  }

  /** 获取插件能力 */
  get pluginCapabilities (): PluginModuleCapabilities | null {
    return this.capabilities;
  }

  // ==================== 生命周期管理 ====================

  /**
   * 启动插件 worker
   */
  async start (): Promise<void> {
    if (this._status === 'running' || this._status === 'starting') {
      this.options.logger.logWarn(`[PluginProcess:${this.pluginId}] Already running or starting`);
      return;
    }

    this._status = 'starting';
    const { entry, logger } = this.options;
    const startupTimeout = this.options.startupTimeout ?? 30000;

    logger.log(`[PluginProcess:${this.pluginId}] Starting isolated worker...`);

    try {
      // 确定 worker 入口文件
      // Windows 兼容：import.meta.url 为 file:///D:/... 格式
      // 使用 fileURLToPath 正确处理跨平台路径
      const workerEntry = this.options.workerEntryPath
        ?? path.join(path.dirname(fileURLToPath(import.meta.url)), 'worker-entry.ts');

      // 创建 Worker
      this.worker = new Worker(workerEntry, {
        workerData: {
          entryPath: entry.entryPath,
          pluginId: entry.id,
          pluginPath: entry.pluginPath,
        },
        // 允许 TypeScript 的 --loader 或 tsx
        execArgv: [...process.execArgv],
      });

      // 等待 worker ready 信号
      await this.waitForReady(startupTimeout);

      // 建立 RPC 通道
      this.setupRpcChannel();

      // 通过 RPC 初始化插件
      const contextData = this.options.contextData ?? {
        pluginName: entry.id,
        pluginPath: entry.pluginPath,
        configPath: path.join(entry.pluginPath, 'data', 'config.json'),
        dataPath: path.join(entry.pluginPath, 'data'),
        adapterName: 'plugin_manager',
      };

      this.capabilities = await this.rpcClient!.loadAndInit(contextData);

      // 设置错误和退出处理
      this.setupWorkerHandlers();

      // 启动心跳
      if (this.options.heartbeatInterval && this.options.heartbeatInterval > 0) {
        this.startHeartbeat();
      }

      this._status = 'running';
      this.restartCount = 0;
      logger.log(`[PluginProcess:${this.pluginId}] Worker started successfully`);
      this.emit('started');
    } catch (error) {
      this._status = 'error';
      logger.logError(`[PluginProcess:${this.pluginId}] Failed to start worker:`, error);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * 停止插件 worker
   */
  async stop (): Promise<void> {
    if (this._status === 'stopped' || this._status === 'stopping') {
      return;
    }

    this._status = 'stopping';
    this.options.logger.log(`[PluginProcess:${this.pluginId}] Stopping worker...`);

    try {
      // 调用插件清理方法
      if (this.rpcClient && this.capabilities?.hasCleanup) {
        try {
          await Promise.race([
            this.rpcClient.cleanup(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Cleanup timeout')), 5000)),
          ]);
        } catch (error) {
          this.options.logger.logWarn(
            `[PluginProcess:${this.pluginId}] Cleanup error (non-fatal):`, error
          );
        }
      }
    } finally {
      await this.cleanup();
      this._status = 'stopped';
      this.options.logger.log(`[PluginProcess:${this.pluginId}] Worker stopped`);
      this.emit('stopped');
    }
  }

  /**
   * 重启插件 worker（热重载）
   *
   * 这是核心热重载方法：
   * 1. 终止旧 worker（连带其整个 V8 堆 — 彻底清除所有模块缓存和状态）
   * 2. 启动新 worker
   * 3. 重新导入插件模块并初始化
   *
   * 相比 Karin 的 hmr.ts 中 chokidar + import 重新导入的方式，
   * 这种方法不需要手动清除 require.cache 或使用 ?t=timestamp hack
   */
  async restart (): Promise<void> {
    this.options.logger.log(`[PluginProcess:${this.pluginId}] Restarting (hot reload)...`);
    this.emit('reloading');

    await this.stop();
    await this.start();

    this.options.logger.log(`[PluginProcess:${this.pluginId}] Restart complete`);
    this.emit('reloaded');
  }

  // ==================== 事件分发 ====================

  /**
   * 分发通用事件到插件
   */
  async dispatchEvent (event: unknown): Promise<void> {
    if (this._status !== 'running' || !this.rpcClient || !this.capabilities?.hasOnEvent) {
      return;
    }

    try {
      await this.rpcClient.dispatchEvent(event);
    } catch (error) {
      this.options.logger.logError(
        `[PluginProcess:${this.pluginId}] Error dispatching event:`, error
      );
    }
  }

  /**
   * 分发消息事件到插件
   */
  async dispatchMessage (message: unknown): Promise<void> {
    if (this._status !== 'running' || !this.rpcClient || !this.capabilities?.hasOnMessage) {
      return;
    }

    try {
      await this.rpcClient.dispatchMessage(message);
    } catch (error) {
      this.options.logger.logError(
        `[PluginProcess:${this.pluginId}] Error dispatching message:`, error
      );
    }
  }

  // ==================== 配置操作 ====================

  /**
   * 获取插件配置
   */
  async getConfig (): Promise<unknown> {
    if (this._status !== 'running' || !this.rpcClient || !this.capabilities?.hasGetConfig) {
      return undefined;
    }
    return this.rpcClient.getConfig();
  }

  /**
   * 设置插件配置
   */
  async setConfig (config: unknown): Promise<void> {
    if (this._status !== 'running' || !this.rpcClient || !this.capabilities?.hasSetConfig) {
      return;
    }
    await this.rpcClient.setConfig(config);
  }

  /**
   * 获取配置 Schema
   */
  async getConfigSchema (): Promise<unknown> {
    if (this._status !== 'running' || !this.rpcClient) {
      return [];
    }
    return this.rpcClient.getConfigSchema();
  }

  /**
   * 健康检查
   */
  async healthCheck (): Promise<boolean> {
    if (this._status !== 'running' || !this.rpcClient) {
      return false;
    }

    try {
      const result = await Promise.race([
        this.rpcClient.ping(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), this.options.heartbeatTimeout ?? 5000)
        ),
      ]);
      return result === 'pong';
    } catch {
      return false;
    }
  }

  // ==================== 内部方法 ====================

  /**
   * 等待 worker 发送 ready 信号
   */
  private waitForReady (timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        return reject(new Error('Worker not created'));
      }

      const timer = setTimeout(() => {
        reject(new Error(`Worker startup timeout (${timeout}ms)`));
      }, timeout);

      const handler = (msg: any) => {
        if (msg && msg.type === 'ready') {
          clearTimeout(timer);
          this.worker?.removeListener('message', handler);
          resolve();
        }
      };

      this.worker.on('message', handler);
      this.worker.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  /**
   * 建立 RPC 通道
   *
   * 使用 napcat-rpc 的 MessageTransport，将 worker_threads 的
   * postMessage/onMessage 适配为 RPC 传输层
   */
  private setupRpcChannel (): void {
    if (!this.worker) {
      throw new Error('Worker not available');
    }

    const worker = this.worker;

    // 创建 MessageTransport，适配 worker_threads 消息格式
    this.transport = new MessageTransport({
      sendMessage: (message) => {
        worker.postMessage({ type: 'rpc', data: message });
      },
      onMessage: (handler) => {
        worker.on('message', (msg) => {
          if (msg && typeof msg === 'object' && msg.type === 'rpc') {
            handler(msg.data);
          }
        });
      },
    });

    // 创建 RPC 客户端代理
    this.rpcClient = createDeepProxy<WorkerPluginAPI>({
      transport: this.transport,
    });
  }

  /**
   * 设置 worker 错误和退出处理
   */
  private setupWorkerHandlers (): void {
    if (!this.worker) return;

    // 处理 worker 日志转发
    this.worker.on('message', (msg) => {
      if (msg && typeof msg === 'object' && msg.type === 'log') {
        this.handleWorkerLog(msg);
      }
    });

    // 处理 worker 错误
    this.worker.on('error', (error) => {
      this.options.logger.logError(
        `[PluginProcess:${this.pluginId}] Worker error:`, error
      );
      this._status = 'crashed';
      this.emit('error', error);
      this.handleCrash();
    });

    // 处理 worker 退出
    this.worker.on('exit', (code) => {
      if (this._status === 'stopping' || this._status === 'stopped') {
        return; // 预期的退出
      }

      this.options.logger.logWarn(
        `[PluginProcess:${this.pluginId}] Worker exited unexpectedly with code ${code}`
      );
      this._status = 'crashed';
      this.emit('crashed', code);
      this.handleCrash();
    });
  }

  /**
   * 处理 worker 转发的日志
   */
  private handleWorkerLog (msg: { level: string; prefix: string; args: unknown[]; }): void {
    const logger = this.options.logger;
    const { level, args } = msg;

    // 还原错误对象
    const processedArgs = args.map((arg: any) => {
      if (arg && typeof arg === 'object' && arg.__isError) {
        const error = new Error(arg.message);
        error.stack = arg.stack;
        return error;
      }
      return arg;
    });

    switch (level) {
      case 'debug':
        logger.logDebug(`[Plugin: ${this.pluginId}]`, ...processedArgs);
        break;
      case 'warn':
        logger.logWarn(`[Plugin: ${this.pluginId}]`, ...processedArgs);
        break;
      case 'error':
        logger.logError(`[Plugin: ${this.pluginId}]`, ...processedArgs);
        break;
      default:
        logger.log(`[Plugin: ${this.pluginId}]`, ...processedArgs);
    }
  }

  /**
   * 处理 worker 崩溃 — 可选自动重启
   */
  private async handleCrash (): Promise<void> {
    await this.cleanup();

    if (
      this.options.autoRestart &&
      this.restartCount < (this.options.maxRestartCount ?? 3)
    ) {
      this.restartCount++;
      const delay = Math.min(1000 * Math.pow(2, this.restartCount - 1), 30000);

      this.options.logger.logWarn(
        `[PluginProcess:${this.pluginId}] Auto-restarting in ${delay}ms ` +
        `(attempt ${this.restartCount}/${this.options.maxRestartCount ?? 3})`
      );

      setTimeout(async () => {
        try {
          await this.start();
        } catch (error) {
          this.options.logger.logError(
            `[PluginProcess:${this.pluginId}] Auto-restart failed:`, error
          );
        }
      }, delay);
    }
  }

  /**
   * 启动心跳检查
   */
  private startHeartbeat (): void {
    this.stopHeartbeat();

    const interval = this.options.heartbeatInterval ?? 30000;

    this.heartbeatTimer = setInterval(async () => {
      const healthy = await this.healthCheck();
      if (!healthy && this._status === 'running') {
        this.options.logger.logWarn(
          `[PluginProcess:${this.pluginId}] Heartbeat failed, marking as crashed`
        );
        this._status = 'crashed';
        this.emit('heartbeat-failed');
        this.handleCrash();
      }
    }, interval);
  }

  /**
   * 停止心跳检查
   */
  private stopHeartbeat (): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 清理所有资源
   */
  private async cleanup (): Promise<void> {
    this.stopHeartbeat();

    // 关闭 RPC 传输层
    if (this.transport) {
      this.transport.close();
      this.transport = null;
    }
    this.rpcClient = null;

    // 终止 worker
    if (this.worker) {
      try {
        await this.worker.terminate();
      } catch {
        // 忽略终止错误
      }
      this.worker = null;
    }
  }

  // ==================== 简单的事件发射器 ====================

  on (event: string, listener: (...args: any[]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off (event: string, listener: (...args: any[]) => void): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  private emit (event: string, ...args: any[]): void {
    this.eventListeners.get(event)?.forEach(listener => {
      try {
        listener(...args);
      } catch {
        // 忽略监听器错误
      }
    });
  }
}
