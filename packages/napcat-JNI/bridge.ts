import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import type { PluginLogger } from 'napcat-types/napcat-onebot/network/plugin-manger';
import {
  JniErrorCode,
  isRequest,
  isNotification,
  isResponse,
} from './protocol';
import type {
  JsonRpcRequest,
  JsonRpcNotification,
  JsonRpcResponse,
  JsonRpcMessage,
  InitParams,
  InitResult,
  JavaPluginInfo,
  LogNotificationParams,
  CallActionNotificationParams,
  EmitEventNotificationParams,
} from './protocol';

/** 桥接器配置 */
export interface JniBridgeOptions {
  /** Java 可执行文件路径，默认 java */
  javaPath: string;
  /** JVM 启动参数 */
  jvmArgs: string[];
  /** 桥接 JAR 路径（Java 侧主程序） */
  bridgeJar: string;
  /** 额外 classpath */
  classpath: string[];
  /** 单次请求默认超时（毫秒） */
  callTimeout: number;
  /** 日志器 */
  logger: PluginLogger;
}

/** 桥接事件 */
export interface JniBridgeEvents {
  /** Java 侧发起的 Action 调用 */
  action: (params: CallActionNotificationParams) => void;
  /** Java 侧发起的事件推送 */
  event: (event: EmitEventNotificationParams['event']) => void;
  /** Java 进程退出 */
  exit: (code: number | null, signal: NodeJS.Signals | null) => void;
}

/**
 * Java 插件桥接器
 *
 * 通过子进程方式启动 Java 主程序，使用 NDJSON（换行分隔 JSON）进行双向通信：
 * - stdin  ：Node → Java 的请求 / 通知
 * - stdout ：Java → Node 的响应 / 通知（每行一条 JSON）
 * - stderr ：Java 侧原始日志，转发到 logger
 *
 * 所有调用以 JSON-RPC 2.0 request/response 模式进行，支持超时与并发。
 */
export class JniBridge extends EventEmitter {
  private process: ChildProcess | null = null;
  private seq = 0;
  private readonly pending = new Map<number | string, {
    resolve: (value: any) => void;
    reject: (err: Error) => void;
    timer: NodeJS.Timeout;
  }>();
  private stdoutBuffer = '';
  private starting: Promise<void> | null = null;
  private destroyed = false;

  constructor (private readonly options: JniBridgeOptions) {
    super();
  }

  /** Java 进程是否正在运行 */
  get running (): boolean {
    return this.process !== null && !this.process.killed && this.process.exitCode === null;
  }

  /**
   * 启动 Java 桥接进程
   */
  async start (): Promise<void> {
    if (this.destroyed) {
      throw new Error('[JniBridge] Bridge has been destroyed');
    }
    if (this.running) {
      return;
    }
    if (this.starting) {
      return this.starting;
    }

    this.starting = this.doStart();
    try {
      await this.starting;
    } finally {
      this.starting = null;
    }
  }

  private async doStart (): Promise<void> {
    const { javaPath, jvmArgs, bridgeJar, classpath, logger } = this.options;

    if (!bridgeJar || !fs.existsSync(bridgeJar)) {
      throw new Error(`[JniBridge] Bridge jar not found: ${bridgeJar}`);
    }

    // 构建 classpath
    const cp = [path.dirname(bridgeJar), ...classpath].join(path.delimiter);
    const args = [
      ...jvmArgs,
      '-cp',
      cp,
      '-jar',
      bridgeJar,
    ];

    logger.info(`[JniBridge] Starting Java bridge: ${javaPath} ${args.join(' ')}`);

    const child = spawn(javaPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      env: {
        ...process.env,
        // 标记通信模式，便于 Java 侧识别
        NAPCAT_JNI_MODE: 'ndjson',
      },
    });

    this.process = child;

    child.stdout?.setEncoding('utf-8');
    child.stdout?.on('data', (chunk: string) => this.handleStdout(chunk));
    child.stderr?.setEncoding('utf-8');
    child.stderr?.on('data', (chunk: string) => this.handleStderr(chunk));

    child.on('exit', (code, signal) => {
      logger.warn(`[JniBridge] Java process exited (code=${code}, signal=${signal})`);
      this.cleanupPending(new Error(`Java process exited (code=${code}, signal=${signal})`));
      this.process = null;
      this.emit('exit', code, signal);
    });

    child.on('error', (err) => {
      logger.error('[JniBridge] Failed to spawn Java process:', err);
      this.cleanupPending(err);
      this.process = null;
    });

    // 等待 Java 侧的 ready 通知
    await this.waitForReady();
  }

  /** 等待 Java 侧发出 ready 通知 */
  private waitForReady (): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('[JniBridge] Timed out waiting for Java bridge ready'));
      }, 30_000);

      const onReady = () => {
        cleanup();
        resolve();
      };
      const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
        cleanup();
        reject(new Error(`[JniBridge] Java process exited before ready (code=${code}, signal=${signal})`));
      };

      const cleanup = () => {
        clearTimeout(timeout);
        this.off('ready', onReady);
        this.off('exit', onExit);
      };

      this.once('ready', onReady);
      this.once('exit', onExit);
    });
  }

  private handleStdout (chunk: string): void {
    this.stdoutBuffer += chunk;
    let idx: number;
    while ((idx = this.stdoutBuffer.indexOf('\n')) >= 0) {
      const line = this.stdoutBuffer.slice(0, idx).trim();
      this.stdoutBuffer = this.stdoutBuffer.slice(idx + 1);
      if (!line) continue;
      this.handleMessage(line);
    }
  }

  private handleStderr (chunk: string): void {
    // Java 侧原始日志直接转发
    const text = chunk.toString();
    for (const line of text.split(/\r?\n/)) {
      if (line.trim()) {
        this.options.logger.log(`[Java] ${line}`);
      }
    }
  }

  private handleMessage (line: string): void {
    let msg: JsonRpcMessage;
    try {
      msg = JSON.parse(line);
    } catch (e) {
      this.options.logger.warn(`[JniBridge] Failed to parse stdout line: ${line}`);
      return;
    }

    // 响应：匹配 pending 请求
    if (isResponse(msg)) {
      const id = (msg as JsonRpcResponse).id;
      const pending = this.pending.get(id);
      if (!pending) {
        this.options.logger.warn(`[JniBridge] Received response with unknown id: ${id}`);
        return;
      }
      clearTimeout(pending.timer);
      this.pending.delete(id);

      if ('error' in msg) {
        pending.reject(new Error(`${msg.error.message} (code=${msg.error.code})`));
      } else {
        pending.resolve((msg as { result: unknown }).result);
      }
      return;
    }

    // 通知：分发到事件
    if (isNotification(msg)) {
      this.handleNotification(msg as JsonRpcNotification);
      return;
    }

    // Java → Node 的请求（例如 Java 主动调用 Action 时也用请求模式）
    if (isRequest(msg)) {
      // 这里只处理一种特殊请求：ready 信号
      const req = msg as JsonRpcRequest;
      if (req.method === 'ready') {
        this.emit('ready');
        // 无需响应（按通知处理）
      }
      return;
    }
  }

  private handleNotification (msg: JsonRpcNotification): void {
    switch (msg.method) {
      case 'ready':
        this.emit('ready');
        break;
      case 'log': {
        const params = (msg.params ?? {}) as LogNotificationParams;
        const args = params.args ?? [];
        switch (params.level) {
          case 'debug': this.options.logger.debug(`[Java] ${params.message}`, ...args); break;
          case 'info': this.options.logger.info(`[Java] ${params.message}`, ...args); break;
          case 'warn': this.options.logger.warn(`[Java] ${params.message}`, ...args); break;
          case 'error': this.options.logger.error(`[Java] ${params.message}`, ...args); break;
          default: this.options.logger.log(`[Java] ${params.message}`, ...args);
        }
        break;
      }
      case 'action': {
        const params = (msg.params ?? {}) as CallActionNotificationParams;
        this.emit('action', params);
        break;
      }
      case 'event': {
        const params = (msg.params ?? {}) as EmitEventNotificationParams;
        this.emit('event', params.event);
        break;
      }
      default:
        this.options.logger.debug(`[JniBridge] Unknown notification: ${msg.method}`);
    }
  }

  /**
   * 发送 JSON-RPC 请求并等待响应
   */
  call<R = unknown> (method: string, params?: unknown, timeout?: number): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      if (!this.running) {
        reject(new Error(`[JniBridge] Bridge not running (call: ${method})`));
        return;
      }

      const id = ++this.seq;
      const req: JsonRpcRequest = { jsonrpc: '2.0', id, method, params };
      const ttl = timeout ?? this.options.callTimeout;

      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`[JniBridge] Call '${method}' timed out after ${ttl}ms`));
        }
      }, ttl);

      this.pending.set(id, { resolve: resolve as (v: any) => void, reject, timer });

      try {
        this.writeLine(JSON.stringify(req));
      } catch (e) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(e as Error);
      }
    });
  }

  /**
   * 发送通知（无需响应）
   */
  notify (method: string, params?: unknown): void {
    if (!this.running) {
      this.options.logger.warn(`[JniBridge] Bridge not running, notify '${method}' dropped`);
      return;
    }
    const msg: JsonRpcNotification = { jsonrpc: '2.0', method, params };
    try {
      this.writeLine(JSON.stringify(msg));
    } catch (e) {
      this.options.logger.error(`[JniBridge] Failed to send notification '${method}':`, e);
    }
  }

  /**
   * 向 Java 回传 Action 调用结果
   */
  replyAction (requestId: number | string, ok: boolean, data?: unknown, error?: string): void {
    this.notify('action_result', { requestId, ok, data, error } as any);
  }

  private writeLine (line: string): void {
    if (!this.process?.stdin) {
      throw new Error('[JniBridge] stdin not available');
    }
    this.process.stdin.write(line + '\n');
  }

  /** 清理所有 pending 请求 */
  private cleanupPending (err: Error): void {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(err);
      this.pending.delete(id);
    }
  }

  /**
   * 停止 Java 进程
   */
  async stop (timeout = 5000): Promise<void> {
    if (!this.process) return;

    // 通知 Java 侧优雅退出
    try {
      await this.call('cleanup', {}, Math.min(timeout, 3000)).catch(() => void 0);
    } catch {
      // 忽略清理调用失败
    }

    const child = this.process;
    if (!child) return;

    await new Promise<void>((resolve) => {
      const killer = setTimeout(() => {
        if (this.process) {
          this.process.kill('SIGKILL');
        }
        resolve();
      }, timeout);

      child.once('exit', () => {
        clearTimeout(killer);
        resolve();
      });

      try {
        child.stdin?.end();
      } catch {
        // 忽略
      }
      try {
        child.kill('SIGTERM');
      } catch {
        // 忽略
      }
    });

    this.process = null;
    this.cleanupPending(new Error('[JniBridge] Bridge stopped'));
  }

  /**
   * 销毁桥接器（不可再使用）
   */
  async destroy (): Promise<void> {
    this.destroyed = true;
    await this.stop();
    this.removeAllListeners();
  }
}

/**
 * 创建并启动 Java 桥接器，完成初始化握手
 */
export async function createJniBridge (
  options: JniBridgeOptions,
  initParams: InitParams
): Promise<{ bridge: JniBridge; info: InitResult }> {
  const bridge = new JniBridge(options);
  await bridge.start();
  const info = await bridge.call<InitResult>('init', initParams);
  return { bridge, info };
}

/** 默认桥接 JAR 文件名 */
export const DEFAULT_BRIDGE_JAR = 'napcat-jni-bridge.jar';

/** 默认 Java 插件目录名 */
export const DEFAULT_JAVA_PLUGIN_DIR = 'java-plugins';

export { JniErrorCode };
export type { JavaPluginInfo };
