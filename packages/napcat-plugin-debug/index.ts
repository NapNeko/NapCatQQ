/**
 * napcat-plugin-debug — 插件调试服务
 *
 * 这是一个 NapCat 插件，启动后会开启一个 WebSocket 调试服务器，
 * 将 PluginManager 的所有接口通过 napcat-rpc 代理暴露出去。
 *
 * 外部 CLI 工具连接此 WebSocket 后，即可：
 * - 查看/管理插件列表
 * - 加载/卸载/重载插件
 * - 监听文件变更实现热重载 (HMR)
 * - 接收实时事件推送
 *
 * 架构：
 *   NapCat 主进程
 *     └─ napcat-plugin-debug (本插件)
 *         └─ WebSocket Server (端口可配置)
 *             └─ napcat-rpc 代理 IPluginManager
 *                 └─ CLI 客户端连接
 *                     └─ 文件监听 + 热重载
 */

import type { PluginModule, NapCatPluginContext, PluginConfigSchema, PluginLogger } from 'napcat-types';

// ======================== 配置 ========================

interface DebugPluginConfig {
  /** 调试服务监听端口 */
  port: number;
  /** 调试服务监听地址 */
  host: string;
  /** 是否启用认证 */
  enableAuth: boolean;
  /** 认证 token（enableAuth 为 true 时必填） */
  authToken: string;
}

const DEFAULT_CONFIG: DebugPluginConfig = {
  port: 8998,
  host: '127.0.0.1',
  enableAuth: false,
  authToken: '',
};

let currentConfig: DebugPluginConfig = { ...DEFAULT_CONFIG };
let debugServer: DebugServerInstance | null = null;
let logger: PluginLogger | null = null;

// ======================== 调试服务器核心 ========================

interface DebugServerInstance {
  start (): Promise<void>;
  stop (): Promise<void>;
  broadcastEvent (event: unknown): void;
}

/**
 * 创建调试服务器 — 通过 WebSocket 暴露 PluginManager API
 *
 * 使用 napcat-rpc 的 createMessageServerHandler 将 pluginAPI
 * 以 RPC 代理方式暴露给 CLI 客户端。
 *
 * 同时支持 SSE 风格的事件推送（通过 WS 消息的 event 类型）
 */
function createDebugServer (ctx: NapCatPluginContext, config: DebugPluginConfig): DebugServerInstance {
  // 延迟导入 ws（运行时加载）
  let wss: any = null;
  const clients = new Set<any>();

  /**
   * 暴露给 CLI 客户端的 API 接口
   * 通过 napcat-rpc 透明代理所有 IPluginManager 方法
   */
  const pluginDebugAPI = {
    // ==================== 插件管理 API ====================

    /** 获取插件目录路径 */
    async getPluginPath (): Promise<string> {
      return ctx.pluginManager.getPluginPath();
    },

    /** 获取所有插件列表 */
    async getAllPlugins () {
      const entries = ctx.pluginManager.getAllPlugins();
      return entries.map(e => ({
        id: e.id,
        fileId: e.fileId,
        name: e.name,
        version: e.version,
        description: e.description,
        author: e.author,
        pluginPath: e.pluginPath,
        entryPath: e.entryPath,
        enable: e.enable,
        loaded: e.loaded,
        runtimeStatus: e.runtime.status,
        runtimeError: e.runtime.error,
      }));
    },

    /** 获取已加载的插件列表 */
    async getLoadedPlugins () {
      const entries = ctx.pluginManager.getLoadedPlugins();
      return entries.map(e => ({
        id: e.id,
        name: e.name,
        version: e.version,
        loaded: e.loaded,
      }));
    },

    /** 获取插件信息 */
    async getPluginInfo (pluginId: string) {
      const entry = ctx.pluginManager.getPluginInfo(pluginId);
      if (!entry) return null;
      return {
        id: entry.id,
        fileId: entry.fileId,
        name: entry.name,
        version: entry.version,
        description: entry.description,
        author: entry.author,
        pluginPath: entry.pluginPath,
        entryPath: entry.entryPath,
        enable: entry.enable,
        loaded: entry.loaded,
        runtimeStatus: entry.runtime.status,
        runtimeError: entry.runtime.error,
      };
    },

    /** 设置插件状态（启用/禁用） */
    async setPluginStatus (pluginId: string, enable: boolean): Promise<void> {
      await ctx.pluginManager.setPluginStatus(pluginId, enable);
    },

    /** 加载插件 */
    async loadPluginById (pluginId: string): Promise<boolean> {
      return ctx.pluginManager.loadPluginById(pluginId);
    },

    /** 卸载插件 */
    async unregisterPlugin (pluginId: string): Promise<void> {
      await ctx.pluginManager.unregisterPlugin(pluginId);
    },

    /** 重载插件（卸载 + 重新加载） */
    async reloadPlugin (pluginId: string): Promise<boolean> {
      return ctx.pluginManager.reloadPlugin(pluginId);
    },

    /** 加载目录插件 */
    async loadDirectoryPlugin (dirname: string): Promise<void> {
      await ctx.pluginManager.loadDirectoryPlugin(dirname);
    },

    /** 卸载并删除插件 */
    async uninstallPlugin (pluginId: string, cleanData?: boolean): Promise<void> {
      await ctx.pluginManager.uninstallPlugin(pluginId, cleanData);
    },

    /** 获取插件数据目录 */
    async getPluginDataPath (pluginId: string): Promise<string> {
      return ctx.pluginManager.getPluginDataPath(pluginId);
    },

    /** 获取插件配置路径 */
    async getPluginConfigPath (pluginId: string): Promise<string> {
      return ctx.pluginManager.getPluginConfigPath(pluginId);
    },

    /** 获取插件状态配置 */
    async getPluginConfig () {
      return ctx.pluginManager.getPluginConfig();
    },

    // ==================== 调试专用 API ====================

    /** 心跳检查 */
    async ping (): Promise<'pong'> {
      return 'pong';
    },

    /** 获取调试服务版本信息 */
    async getDebugInfo () {
      return {
        version: '1.0.0',
        pluginCount: ctx.pluginManager.getAllPlugins().length,
        loadedCount: ctx.pluginManager.getLoadedPlugins().length,
        pluginPath: ctx.pluginManager.getPluginPath(),
        uptime: process.uptime(),
      };
    },
  };

  return {
    async start () {
      const { WebSocketServer } = await import('ws');

      wss = new WebSocketServer({
        port: config.port,
        host: config.host,
      });

      wss.on('connection', (ws: any, req: any) => {
        // 认证检查
        if (config.enableAuth && config.authToken) {
          const url = new URL(req.url || '/', `http://${req.headers.host}`);
          const token = url.searchParams.get('token') || req.headers['authorization']?.replace('Bearer ', '');
          if (token !== config.authToken) {
            ws.close(4001, 'Unauthorized');
            logger?.warn('Connection rejected: invalid token');
            return;
          }
        }

        logger?.info(`CLI client connected from ${req.socket.remoteAddress}`);
        clients.add(ws);

        // 为每个连接建立 RPC 通道
        setupRpcForConnection(ws, pluginDebugAPI);

        ws.on('close', () => {
          clients.delete(ws);
          logger?.info('CLI client disconnected');
        });

        ws.on('error', (err: Error) => {
          logger?.error('WebSocket error:', err.message);
          clients.delete(ws);
        });

        // 发送欢迎消息
        ws.send(JSON.stringify({
          type: 'welcome',
          data: {
            version: '1.0.0',
            pluginCount: ctx.pluginManager.getAllPlugins().length,
          },
        }));
      });

      wss.on('error', (err: Error) => {
        logger?.error('WebSocket server error:', err.message);
      });

      logger?.info(`Debug server started on ws://${config.host}:${config.port}`);
    },

    async stop () {
      if (wss) {
        for (const client of clients) {
          try { client.close(1000, 'Server shutting down'); } catch { /* ignore */ }
        }
        clients.clear();
        await new Promise<void>((resolve) => {
          wss.close(() => resolve());
        });
        wss = null;
        logger?.info('Debug server stopped');
      }
    },

    broadcastEvent (event: unknown) {
      const message = JSON.stringify({ type: 'event', data: event });
      for (const client of clients) {
        try {
          if (client.readyState === 1 /* WebSocket.OPEN */) {
            client.send(message);
          }
        } catch { /* ignore */ }
      }
    },
  };
}

/**
 * 为单个 WebSocket 连接建立 RPC 通道
 *
 * 使用 napcat-rpc 的 createMessageServerHandler，
 * 将 pluginDebugAPI 暴露给客户端透明调用。
 */
async function setupRpcForConnection (ws: any, api: Record<string, any>): Promise<void> {
  // 动态导入 napcat-rpc（运行时通过宿主环境提供）
  // 注意：插件构建后在 NapCat 环境中运行，napcat-rpc 来自宿主
  try {
    const { createMessageServerHandler } = await import('napcat-rpc');

    createMessageServerHandler(api, {
      sendMessage: (message: string) => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({ type: 'rpc', data: message }));
        }
      },
      onMessage: (handler: (message: string) => void) => {
        ws.on('message', (raw: any) => {
          try {
            const parsed = JSON.parse(raw.toString());
            if (parsed && parsed.type === 'rpc' && parsed.data) {
              handler(parsed.data);
            }
          } catch { /* ignore malformed messages */ }
        });
      },
    });
  } catch (err) {
    logger?.error('Failed to setup RPC channel — napcat-rpc not available:', err);
  }
}

// ======================== 插件生命周期 ========================

export const plugin_init = async (ctx: NapCatPluginContext) => {
  logger = ctx.logger;
  logger.info('Loading debug plugin configuration...');

  // 加载配置
  try {
    const fs = await import('fs');
    if (fs.existsSync(ctx.configPath)) {
      const saved = JSON.parse(fs.readFileSync(ctx.configPath, 'utf-8'));
      currentConfig = { ...DEFAULT_CONFIG, ...saved };
    }
  } catch {
    logger.warn('Failed to load config, using defaults');
  }

  // 启动调试服务器
  debugServer = createDebugServer(ctx, currentConfig);
  await debugServer.start();

  logger.info('Plugin Debug Service ready');
  logger.info(`Connect CLI: npx napcat-plugin-debug ws://${currentConfig.host}:${currentConfig.port}`);
};

export const plugin_onmessage = async (ctx: NapCatPluginContext, event: any) => {
  // 将消息事件广播给所有 CLI 客户端
  debugServer?.broadcastEvent({
    eventType: 'message',
    ...serializeEvent(event),
  });
};

export const plugin_onevent = async (ctx: NapCatPluginContext, event: any) => {
  // 将事件广播给所有 CLI 客户端
  debugServer?.broadcastEvent({
    eventType: 'notify',
    ...serializeEvent(event),
  });
};

export const plugin_cleanup = async (ctx: NapCatPluginContext) => {
  logger?.info('Stopping debug server...');
  await debugServer?.stop();
  debugServer = null;
  logger = null;
};

export const plugin_get_config = async () => currentConfig;

export const plugin_set_config = async (ctx: NapCatPluginContext, config: unknown) => {
  if (config && typeof config === 'object') {
    currentConfig = { ...DEFAULT_CONFIG, ...(config as Partial<DebugPluginConfig>) };

    // 持久化
    const fs = await import('fs');
    const path = await import('path');
    const dir = path.dirname(ctx.configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ctx.configPath, JSON.stringify(currentConfig, null, 2));

    // 重启服务器
    await debugServer?.stop();
    debugServer = createDebugServer(ctx, currentConfig);
    await debugServer.start();
  }
};

export const plugin_config_ui: PluginConfigSchema = [
  {
    key: 'info',
    type: 'html',
    label: '',
    default: `<div style="padding:12px;background:#faf5ff;border-radius:8px;border:1px solid #d8b4fe">
      <h3 style="margin:0 0 8px">🔧 插件调试服务</h3>
      <p style="margin:0">启动 WebSocket 调试服务器，配合 CLI 实现插件热重载。</p>
      <p style="margin:4px 0 0"><code>npx napcat-plugin-debug ws://host:port</code></p>
    </div>`,
  },
  {
    key: 'port',
    type: 'number',
    label: '调试服务端口',
    default: 8998,
    description: 'WebSocket 调试服务的监听端口',
  },
  {
    key: 'host',
    type: 'string',
    label: '监听地址',
    default: '127.0.0.1',
    description: '建议仅监听 127.0.0.1，不要暴露到公网',
  },
  {
    key: 'enableAuth',
    type: 'boolean',
    label: '启用认证',
    default: false,
    description: '启用后客户端需要提供 token 才能连接',
  },
  {
    key: 'authToken',
    type: 'string',
    label: '认证 Token',
    default: '',
    description: '客户端连接时使用的认证 token',
  },
];

// ======================== 辅助方法 ========================

function serializeEvent (event: any): Record<string, unknown> {
  try {
    // 提取可序列化的字段
    return JSON.parse(JSON.stringify(event));
  } catch {
    return { raw: String(event) };
  }
}

export default {
  plugin_init,
  plugin_onmessage,
  plugin_onevent,
  plugin_cleanup,
  plugin_get_config,
  plugin_set_config,
  plugin_config_ui,
} satisfies PluginModule;
