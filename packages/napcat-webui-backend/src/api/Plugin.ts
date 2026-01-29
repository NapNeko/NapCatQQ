import { RequestHandler } from 'express';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { NapCatOneBot11Adapter } from '@/napcat-onebot/index';
import { OB11PluginMangerAdapter } from '@/napcat-onebot/network/plugin-manger';
import { webUiPathWrapper } from '@/napcat-webui-backend/index';
import path from 'path';
import fs from 'fs';

// Helper to get the plugin manager adapter
const getPluginManager = (): OB11PluginMangerAdapter | null => {
  const ob11 = WebUiDataRuntime.getOneBotContext() as NapCatOneBot11Adapter;
  if (!ob11) return null;
  return ob11.networkManager.findSomeAdapter('plugin_manager') as OB11PluginMangerAdapter;
};

// Helper to get OneBot context
const getOneBotContext = (): NapCatOneBot11Adapter | null => {
  return WebUiDataRuntime.getOneBotContext() as NapCatOneBot11Adapter;
};

/**
 * 手动注册插件管理器到 NetworkManager
 */
export const RegisterPluginManagerHandler: RequestHandler = async (_req, res) => {
  const ob11 = getOneBotContext();
  if (!ob11) {
    return sendError(res, 'OneBot context not found');
  }

  // 检查是否已经注册
  const existingManager = ob11.networkManager.findSomeAdapter('plugin_manager');
  if (existingManager) {
    return sendError(res, '插件管理器已经注册');
  }

  try {
    // 确保插件目录存在
    const pluginPath = webUiPathWrapper.pluginPath;
    if (!fs.existsSync(pluginPath)) {
      fs.mkdirSync(pluginPath, { recursive: true });
    }

    // 创建并注册插件管理器
    const pluginManager = new OB11PluginMangerAdapter(
      'plugin_manager',
      ob11.core,
      ob11,
      ob11.actions
    );

    await ob11.networkManager.registerAdapterAndOpen(pluginManager);

    return sendSuccess(res, { message: '插件管理器注册成功' });
  } catch (e: any) {
    return sendError(res, '注册插件管理器失败: ' + e.message);
  }
};

export const GetPluginListHandler: RequestHandler = async (_req, res) => {
  const pluginManager = getPluginManager();
  if (!pluginManager) {
    // 返回成功但带特殊标记
    return sendSuccess(res, { plugins: [], pluginManagerNotFound: true });
  }

  const loadedPlugins = pluginManager.getLoadedPlugins();
  const loadedPluginMap = new Map<string, any>(); // Map id -> Loaded Info

  // 1. 整理已加载的插件
  for (const p of loadedPlugins) {
    loadedPluginMap.set(p.name, {
      name: p.packageJson?.plugin || p.name, // 优先显示 package.json 的 plugin 字段
      id: p.name, // 包名，用于 API 操作
      version: p.version || '0.0.0',
      description: p.packageJson?.description || '',
      author: p.packageJson?.author || '',
      status: 'active',
      hasConfig: !!(p.module.plugin_config_schema || p.module.plugin_config_ui)
    });
  }

  const pluginPath = pluginManager.getPluginPath();
  const pluginConfig = pluginManager.getPluginConfig();
  const allPlugins: any[] = [];

  // 2. 扫描文件系统，合并状态
  if (fs.existsSync(pluginPath)) {
    const items = fs.readdirSync(pluginPath, { withFileTypes: true });

    for (const item of items) {
      if (!item.isDirectory()) continue;

      // 读取 package.json 获取插件信息
      let id = item.name;
      let name = item.name;
      let version = '0.0.0';
      let description = '';
      let author = '';

      const packageJsonPath = path.join(pluginPath, item.name, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          id = pkg.name || id;
          name = pkg.plugin || pkg.name || name;
          version = pkg.version || version;
          description = pkg.description || description;
          author = pkg.author || author;
        } catch (e) { }
      }

      const isActiveConfig = pluginConfig[id] !== false; // 默认为 true

      if (loadedPluginMap.has(id)) {
        // 已加载，使用加载的信息
        const loadedInfo = loadedPluginMap.get(id);
        allPlugins.push(loadedInfo);
      } else {
        allPlugins.push({
          name,
          id,
          version,
          description,
          author,
          // 如果配置是 false，则为 disabled；否则是 stopped (应启动但未启动)
          status: isActiveConfig ? 'stopped' : 'disabled'
        });
      }
    }
  }

  return sendSuccess(res, { plugins: allPlugins, pluginManagerNotFound: false });
};

export const SetPluginStatusHandler: RequestHandler = async (req, res) => {
  const { enable, id } = req.body;

  if (!id) return sendError(res, 'Plugin id is required');

  const pluginManager = getPluginManager();
  if (!pluginManager) {
    return sendError(res, 'Plugin Manager not found');
  }

  try {
    // 设置插件状态
    pluginManager.setPluginStatus(id, enable);

    // 如果启用，需要加载插件
    if (enable) {
      const loaded = await pluginManager.loadPluginById(id);
      if (!loaded) {
        return sendError(res, 'Plugin not found: ' + id);
      }
    }

    return sendSuccess(res, { message: 'Status updated successfully' });
  } catch (e: any) {
    return sendError(res, 'Failed to update status: ' + e.message);
  }
};

export const UninstallPluginHandler: RequestHandler = async (req, res) => {
  const { id, cleanData } = req.body;

  if (!id) return sendError(res, 'Plugin id is required');

  const pluginManager = getPluginManager();
  if (!pluginManager) {
    return sendError(res, 'Plugin Manager not found');
  }

  try {
    await pluginManager.uninstallPlugin(id, cleanData);
    return sendSuccess(res, { message: 'Uninstalled successfully' });
  } catch (e: any) {
    return sendError(res, 'Failed to uninstall: ' + e.message);
  }
};

export const GetPluginConfigHandler: RequestHandler = async (req, res) => {
  const id = req.query['id'] as string;

  if (!id) return sendError(res, 'Plugin id is required');

  const pluginManager = getPluginManager();
  if (!pluginManager) return sendError(res, 'Plugin Manager not found');

  const plugin = pluginManager.getPluginInfo(id);
  if (!plugin) return sendError(res, 'Plugin not loaded');

  // 获取配置值
  let config = {};
  if (plugin.module.plugin_get_config) {
    try {
      config = await plugin.module.plugin_get_config(plugin.context);
    } catch (e) { }
  } else {
    // Default behavior: read from default config path
    try {
      const configPath = plugin.context?.configPath || pluginManager.getPluginConfigPath(id);
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
    } catch (e) { }
  }

  // 获取静态 schema
  const schema = plugin.module.plugin_config_schema || plugin.module.plugin_config_ui || [];

  // 检查是否支持动态控制
  const supportReactive = !!(plugin.module.plugin_config_controller || plugin.module.plugin_on_config_change);

  return sendSuccess(res, { schema, config, supportReactive });
};

/** 活跃的 SSE 连接 */
const activeConfigSessions = new Map<string, {
  res: any;
  cleanup?: () => void;
  currentConfig: Record<string, any>;
}>();

/**
 * 插件配置 SSE 连接 - 用于动态更新配置界面
 */
export const PluginConfigSSEHandler: RequestHandler = (req, res): void => {
  const id = req.query['id'] as string;
  const initialConfigStr = req.query['config'] as string;

  if (!id) {
    res.status(400).json({ error: 'Plugin id is required' });
    return;
  }

  const pluginManager = getPluginManager();
  if (!pluginManager) {
    res.status(400).json({ error: 'Plugin Manager not found' });
    return;
  }

  const plugin = pluginManager.getPluginInfo(id);
  if (!plugin) {
    res.status(400).json({ error: 'Plugin not loaded' });
    return;
  }

  // 设置 SSE 头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // 生成会话 ID
  const sessionId = `${id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // 解析初始配置
  let currentConfig: Record<string, any> = {};
  if (initialConfigStr) {
    try {
      currentConfig = JSON.parse(initialConfigStr);
    } catch (e) { }
  }

  // 发送 SSE 消息的辅助函数
  const sendSSE = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // 创建 UI 控制器
  const uiController = {
    updateSchema: (schema: any[]) => {
      sendSSE('schema', { type: 'full', schema });
    },
    updateField: (key: string, field: any) => {
      sendSSE('schema', { type: 'updateField', key, field });
    },
    removeField: (key: string) => {
      sendSSE('schema', { type: 'removeField', key });
    },
    addField: (field: any, afterKey?: string) => {
      sendSSE('schema', { type: 'addField', field, afterKey });
    },
    showField: (key: string) => {
      sendSSE('schema', { type: 'showField', key });
    },
    hideField: (key: string) => {
      sendSSE('schema', { type: 'hideField', key });
    },
    getCurrentConfig: () => currentConfig
  };

  // 存储会话
  activeConfigSessions.set(sessionId, { res, currentConfig });

  // 发送连接成功消息
  sendSSE('connected', { sessionId });

  // 调用插件的控制器初始化（异步处理）
  (async () => {
    let cleanup: (() => void) | undefined;
    if (plugin.module.plugin_config_controller) {
      try {
        const result = await plugin.module.plugin_config_controller(
          plugin.context,
          uiController,
          currentConfig
        );
        if (typeof result === 'function') {
          cleanup = result;
        }
      } catch (e: any) {
        sendSSE('error', { message: e.message });
      }
    }

    // 更新会话的 cleanup
    const session = activeConfigSessions.get(sessionId);
    if (session) {
      session.cleanup = cleanup;
    }
  })();

  // 心跳保持连接
  const heartbeat = setInterval(() => {
    sendSSE('ping', { time: Date.now() });
  }, 30000);

  // 连接关闭时清理
  req.on('close', () => {
    clearInterval(heartbeat);
    const session = activeConfigSessions.get(sessionId);
    if (session?.cleanup) {
      try {
        session.cleanup();
      } catch (e) { }
    }
    activeConfigSessions.delete(sessionId);
  });
};

/**
 * 插件配置字段变化通知
 */
export const PluginConfigChangeHandler: RequestHandler = async (req, res) => {
  const { id, sessionId, key, value, currentConfig } = req.body;

  if (!id || !sessionId || !key) {
    return sendError(res, 'Missing required parameters');
  }

  const pluginManager = getPluginManager();
  if (!pluginManager) return sendError(res, 'Plugin Manager not found');

  const plugin = pluginManager.getPluginInfo(id);
  if (!plugin) return sendError(res, 'Plugin not loaded');

  // 获取会话
  const session = activeConfigSessions.get(sessionId);
  if (!session) {
    return sendError(res, 'Session not found');
  }

  // 更新会话中的当前配置
  session.currentConfig = currentConfig || {};

  // 如果插件有响应式处理器，调用它
  if (plugin.module.plugin_on_config_change) {
    const uiController = {
      updateSchema: (schema: any[]) => {
        session.res.write(`event: schema\n`);
        session.res.write(`data: ${JSON.stringify({ type: 'full', schema })}\n\n`);
      },
      updateField: (fieldKey: string, field: any) => {
        session.res.write(`event: schema\n`);
        session.res.write(`data: ${JSON.stringify({ type: 'updateField', key: fieldKey, field })}\n\n`);
      },
      removeField: (fieldKey: string) => {
        session.res.write(`event: schema\n`);
        session.res.write(`data: ${JSON.stringify({ type: 'removeField', key: fieldKey })}\n\n`);
      },
      addField: (field: any, afterKey?: string) => {
        session.res.write(`event: schema\n`);
        session.res.write(`data: ${JSON.stringify({ type: 'addField', field, afterKey })}\n\n`);
      },
      showField: (fieldKey: string) => {
        session.res.write(`event: schema\n`);
        session.res.write(`data: ${JSON.stringify({ type: 'showField', key: fieldKey })}\n\n`);
      },
      hideField: (fieldKey: string) => {
        session.res.write(`event: schema\n`);
        session.res.write(`data: ${JSON.stringify({ type: 'hideField', key: fieldKey })}\n\n`);
      },
      getCurrentConfig: () => session.currentConfig
    };

    try {
      await plugin.module.plugin_on_config_change(
        plugin.context,
        uiController,
        key,
        value,
        currentConfig || {}
      );
    } catch (e: any) {
      session.res.write(`event: error\n`);
      session.res.write(`data: ${JSON.stringify({ message: e.message })}\n\n`);
    }
  }

  return sendSuccess(res, { message: 'Change processed' });
};

export const SetPluginConfigHandler: RequestHandler = async (req, res) => {
  const { id, config } = req.body;
  if (!id || !config) return sendError(res, 'Plugin id and config required');

  const pluginManager = getPluginManager();
  if (!pluginManager) return sendError(res, 'Plugin Manager not found');

  const plugin = pluginManager.getPluginInfo(id);
  if (!plugin) return sendError(res, 'Plugin not loaded');

  if (plugin.module.plugin_set_config) {
    try {
      await plugin.module.plugin_set_config(plugin.context, config);
      return sendSuccess(res, { message: 'Config updated' });
    } catch (e: any) {
      return sendError(res, 'Error updating config: ' + e.message);
    }
  } else if (plugin.module.plugin_config_schema || plugin.module.plugin_config_ui || plugin.module.plugin_config_controller) {
    // Default behavior: write to default config path
    try {
      const configPath = plugin.context?.configPath || pluginManager.getPluginConfigPath(id);

      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

      // Auto-Reload plugin to apply changes
      await pluginManager.reloadPlugin(id);

      return sendSuccess(res, { message: 'Config saved and plugin reloaded' });
    } catch (e: any) {
      return sendError(res, 'Error saving config: ' + e.message);
    }
  } else {
    return sendError(res, 'Plugin does not support config update');
  }
};
