/**
 * 插件 Worker 入口
 *
 * 每个插件运行在独立的 worker_thread 中，通过 napcat-rpc 的 MessageTransport
 * 与主线程通信。这样实现了：
 * 1. 进程隔离 — 插件崩溃不影响主进程
 * 2. 完整热重载 — 直接终止 worker 并重新 spawn，无需清理模块缓存
 * 3. 内存隔离 — 每个插件有独立的 V8 堆
 */

import { parentPort, workerData } from 'node:worker_threads';
import { createMessageServerHandler } from 'napcat-rpc';
import type { PluginModule } from './types';

interface WorkerData {
  /** 插件入口文件绝对路径 */
  entryPath: string;
  /** 插件 ID */
  pluginId: string;
  /** 插件目录路径 */
  pluginPath: string;
}

/**
 * Worker 端暴露给主线程的 API
 * 主线程通过 RPC 调用这些方法来控制插件生命周期
 */
interface WorkerPluginAPI {
  /** 加载并初始化插件 */
  loadAndInit: (serializedContext: SerializedPluginContext) => Promise<PluginModuleCapabilities>;
  /** 分发事件到插件 */
  dispatchEvent: (event: unknown) => Promise<void>;
  /** 分发消息事件到插件 */
  dispatchMessage: (message: unknown) => Promise<void>;
  /** 获取插件配置 */
  getConfig: () => Promise<unknown>;
  /** 设置插件配置 */
  setConfig: (config: unknown) => Promise<void>;
  /** 获取配置 Schema */
  getConfigSchema: () => Promise<unknown>;
  /** 清理并卸载插件 */
  cleanup: () => Promise<void>;
  /** 健康检查 */
  ping: () => Promise<'pong'>;
}

/**
 * 序列化的插件上下文 — 只传输可序列化的数据
 * 不可序列化的对象（如 core, oneBot 等）通过 RPC 代理访问
 */
interface SerializedPluginContext {
  pluginName: string;
  pluginPath: string;
  configPath: string;
  dataPath: string;
  adapterName: string;
}

/**
 * 插件模块能力描述
 * 告诉主线程该插件支持哪些回调
 */
interface PluginModuleCapabilities {
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

// ==================== Worker 主逻辑 ====================

const data = workerData as WorkerData;
let pluginModule: PluginModule | null = null;
let pluginContext: SerializedPluginContext | null = null;

/**
 * 动态导入插件模块
 * 使用时间戳参数绕过 ESM 缓存
 *
 * Windows 兼容：entryPath 可能是 D:\xxx\yyy 格式
 * 需要转为 file:///D:/xxx/yyy 格式才能用于 ESM import
 */
async function importPluginModule (entryPath: string): Promise<PluginModule> {
  // 使用 pathToFileURL 实现跨平台兼容
  const { pathToFileURL } = await import('node:url');
  const fileUrl = pathToFileURL(entryPath).href;
  const fileUrlWithQuery = `${fileUrl}?t=${Date.now()}`;

  let module: any;
  try {
    module = await import(fileUrlWithQuery);
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    throw new Error(`Failed to import plugin module from ${entryPath}: ${errorMsg}`);
  }

  // 处理 default export 和 named export
  const resolved = module?.default ?? module;

  if (!resolved || typeof resolved.plugin_init !== 'function') {
    const exportedKeys = module ? Object.keys(module).join(', ') : 'none';
    throw new Error(
      `Invalid plugin module: missing plugin_init function in ${entryPath}. ` +
      `Exported keys: [${exportedKeys}]`
    );
  }

  return resolved as PluginModule;
}

/**
 * Worker 端 API 实现
 */
const workerAPI: WorkerPluginAPI = {
  async loadAndInit (serializedContext: SerializedPluginContext): Promise<PluginModuleCapabilities> {
    pluginContext = serializedContext;

    // 导入插件模块
    pluginModule = await importPluginModule(data.entryPath);

    // 构建 Worker 端的简化上下文
    // 注意：core, oneBot, actions, pluginManager, router 等不可序列化的对象
    // 将通过主线程 RPC 代理提供（见 plugin-process.ts 中的 createRpcContext）
    const workerContext = {
      ...serializedContext,
      // logger 在 worker 端重建，通过 parentPort 转发日志
      logger: createWorkerLogger(data.pluginId),
      // NapCatConfig 可以在 worker 端独立使用
      NapCatConfig: await importNapCatConfig(),
    } as any;

    // 调用插件初始化
    await pluginModule.plugin_init(workerContext);

    // 返回能力描述
    return {
      hasOnMessage: typeof pluginModule.plugin_onmessage === 'function',
      hasOnEvent: typeof pluginModule.plugin_onevent === 'function',
      hasCleanup: typeof pluginModule.plugin_cleanup === 'function',
      hasGetConfig: typeof pluginModule.plugin_get_config === 'function',
      hasSetConfig: typeof pluginModule.plugin_set_config === 'function',
      hasConfigSchema: !!pluginModule.plugin_config_schema,
      hasConfigUI: !!pluginModule.plugin_config_ui,
      hasConfigController: typeof pluginModule.plugin_config_controller === 'function',
      hasOnConfigChange: typeof pluginModule.plugin_on_config_change === 'function',
    };
  },

  async dispatchEvent (event: unknown): Promise<void> {
    if (pluginModule?.plugin_onevent && pluginContext) {
      await pluginModule.plugin_onevent(pluginContext as any, event as any);
    }
  },

  async dispatchMessage (message: unknown): Promise<void> {
    if (pluginModule?.plugin_onmessage && pluginContext) {
      await pluginModule.plugin_onmessage(pluginContext as any, message as any);
    }
  },

  async getConfig (): Promise<unknown> {
    if (pluginModule?.plugin_get_config && pluginContext) {
      return pluginModule.plugin_get_config(pluginContext as any);
    }
    return undefined;
  },

  async setConfig (config: unknown): Promise<void> {
    if (pluginModule?.plugin_set_config && pluginContext) {
      await pluginModule.plugin_set_config(pluginContext as any, config);
    }
  },

  async getConfigSchema (): Promise<unknown> {
    return pluginModule?.plugin_config_ui ?? pluginModule?.plugin_config_schema ?? [];
  },

  async cleanup (): Promise<void> {
    if (pluginModule?.plugin_cleanup && pluginContext) {
      await pluginModule.plugin_cleanup(pluginContext as any);
    }
    pluginModule = null;
    pluginContext = null;
  },

  async ping (): Promise<'pong'> {
    return 'pong';
  },
};

/**
 * 创建 Worker 端日志器 — 通过 parentPort 将日志消息转发到主线程
 */
function createWorkerLogger (pluginId: string) {
  const prefix = `[Plugin: ${pluginId}]`;

  const sendLog = (level: string, args: unknown[]) => {
    parentPort?.postMessage({
      type: 'log',
      level,
      prefix,
      args: args.map(arg => {
        if (arg instanceof Error) {
          return { __isError: true, message: arg.message, stack: arg.stack };
        }
        try {
          // 尝试序列化，失败则转字符串
          JSON.stringify(arg);
          return arg;
        } catch {
          return String(arg);
        }
      }),
    });
  };

  return {
    log: (...args: unknown[]) => sendLog('log', args),
    debug: (...args: unknown[]) => sendLog('debug', args),
    info: (...args: unknown[]) => sendLog('info', args),
    warn: (...args: unknown[]) => sendLog('warn', args),
    error: (...args: unknown[]) => sendLog('error', args),
  };
}

/**
 * 安全地尝试导入 NapCatConfig
 * 如果不可用则提供一个空的占位实现
 */
async function importNapCatConfig () {
  try {
    const { NapCatConfig } = await import('./config.js');
    return NapCatConfig;
  } catch {
    // 提供一个最小化的 fallback
    return {
      text: (key: string, label: string, defaultValue = '', description = '') =>
        ({ key, type: 'text' as const, label, default: defaultValue, description }),
      number: (key: string, label: string, defaultValue = 0, description = '') =>
        ({ key, type: 'number' as const, label, default: defaultValue, description }),
      boolean: (key: string, label: string, defaultValue = false, description = '') =>
        ({ key, type: 'boolean' as const, label, default: defaultValue, description }),
      select: (key: string, label: string, options: any[], defaultValue?: any, description = '') =>
        ({ key, type: 'select' as const, label, options, default: defaultValue, description }),
      multiSelect: (key: string, label: string, options: any[], defaultValue?: any, description = '') =>
        ({ key, type: 'multi-select' as const, label, options, default: defaultValue, description }),
      html: (content: string) =>
        ({ key: `html_${Date.now()}`, type: 'html' as const, label: '', default: content }),
      plainText: (content: string) =>
        ({ key: `text_${Date.now()}`, type: 'text' as const, label: content }),
      combine: (...items: any[]) => items,
    };
  }
}

// ==================== 启动 RPC 服务 ====================

if (!parentPort) {
  throw new Error('This file must be run as a worker thread');
}

const port = parentPort;

// 全局未捕获异常处理 — 通过日志转发到主线程
process.on('uncaughtException', (error) => {
  port.postMessage({
    type: 'log',
    level: 'error',
    prefix: `[Plugin: ${data.pluginId}]`,
    args: [{
      __isError: true,
      message: `Uncaught Exception: ${error.message}`,
      stack: error.stack,
    }],
  });
});

process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : undefined;
  port.postMessage({
    type: 'log',
    level: 'error',
    prefix: `[Plugin: ${data.pluginId}]`,
    args: [{
      __isError: true,
      message: `Unhandled Rejection: ${message}`,
      stack,
    }],
  });
});

// 使用 napcat-rpc 的 createMessageServerHandler 将 workerAPI 暴露给主线程
createMessageServerHandler(workerAPI, {
  sendMessage: (message) => {
    port.postMessage({ type: 'rpc', data: message });
  },
  onMessage: (handler) => {
    port.on('message', (msg) => {
      if (msg && typeof msg === 'object' && msg.type === 'rpc') {
        handler(msg.data);
      }
    });
  },
});

// 通知主线程 worker 已就绪
port.postMessage({ type: 'ready' });
