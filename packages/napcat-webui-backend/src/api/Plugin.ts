import { RequestHandler } from 'express';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { NapCatOneBot11Adapter } from '@/napcat-onebot/index';
import { OB11PluginMangerAdapter } from '@/napcat-onebot/network/plugin-manger';
import { webUiPathWrapper } from '@/napcat-webui-backend/index';
import path from 'path';
import fs from 'fs';
import compressing from 'compressing';

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
    return sendSuccess(res, { plugins: [], pluginManagerNotFound: true, extensionPages: [] });
  }

  const loadedPlugins = pluginManager.getAllPlugins();
  const AllPlugins: Array<{
    name: string;
    id: string;
    version: string;
    description: string;
    author: string;
    status: string;
    hasConfig: boolean;
    hasPages: boolean;
  }> = new Array();

  // 收集所有插件的扩展页面
  const extensionPages: Array<{
    pluginId: string;
    pluginName: string;
    path: string;
    title: string;
    icon?: string;
    description?: string;
  }> = [];

  // 1. 整理已加载的插件
  for (const p of loadedPlugins) {
    // 根据插件状态确定 status
    let status: string;
    if (!p.enable) {
      status = 'disabled';
    } else if (p.loaded) {
      status = 'active';
    } else {
      status = 'stopped'; // 启用但未加载（可能加载失败）
    }

    // 检查插件是否有注册页面
    const pluginRouter = pluginManager.getPluginRouter(p.id);
    const hasPages = pluginRouter?.hasPages() ?? false;

    AllPlugins.push({
      name: p.packageJson?.plugin || p.name || '', // 优先显示 package.json 的 plugin 字段
      id: p.id, // 包名，用于 API 操作
      version: p.version || '0.0.0',
      description: p.packageJson?.description || '',
      author: p.packageJson?.author || '',
      status,
      hasConfig: !!(p.runtime.module?.plugin_config_schema || p.runtime.module?.plugin_config_ui),
      hasPages
    });

    // 收集插件的扩展页面
    if (hasPages && pluginRouter) {
      const pages = pluginRouter.getPages();
      for (const page of pages) {
        extensionPages.push({
          pluginId: p.id,
          pluginName: p.packageJson?.plugin || p.name || p.id,
          path: page.path,
          title: page.title,
          icon: page.icon,
          description: page.description
        });
      }
    }
  }


  return sendSuccess(res, { plugins: AllPlugins, pluginManagerNotFound: false, extensionPages });
};

export const SetPluginStatusHandler: RequestHandler = async (req, res) => {
  const { enable, id } = req.body;

  if (!id) return sendError(res, 'Plugin id is required');

  const pluginManager = getPluginManager();
  if (!pluginManager) {
    return sendError(res, 'Plugin Manager not found');
  }

  try {
    // 设置插件状态（需要 await，因为内部会加载/卸载插件）
    await pluginManager.setPluginStatus(id, enable);

    // 如果启用，检查插件是否加载成功
    if (enable) {
      const plugin = pluginManager.getPluginInfo(id);
      if (!plugin || !plugin.loaded) {
        return sendError(res, 'Plugin load failed: ' + id);
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
  let config: unknown = {};
  if (plugin.runtime.module?.plugin_get_config && plugin.runtime.context) {
    try {
      config = await plugin.runtime.module?.plugin_get_config(plugin.runtime.context);
    } catch (e) { }
  } else {
    // Default behavior: read from default config path
    try {
      const configPath = plugin.runtime.context?.configPath || pluginManager.getPluginConfigPath(id);
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
    } catch (e) { }
  }

  // 获取静态 schema
  const schema = plugin.runtime.module?.plugin_config_schema || plugin.runtime.module?.plugin_config_ui || [];

  // 检查是否支持动态控制
  const supportReactive = !!(plugin.runtime.module?.plugin_config_controller || plugin.runtime.module?.plugin_on_config_change);

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
    if (plugin.runtime.module?.plugin_config_controller && plugin.runtime.context) {
      try {
        const result = await plugin.runtime.module.plugin_config_controller(
          plugin.runtime.context,
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
  if (plugin.runtime.module?.plugin_on_config_change) {
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
      if (plugin.runtime.context) {
        await plugin.runtime.module.plugin_on_config_change(
          plugin.runtime.context,
          uiController,
          key,
          value,
          currentConfig || {}
        );
      }
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

  if (plugin.runtime.module?.plugin_set_config && plugin.runtime.context) {
    try {
      await plugin.runtime.module.plugin_set_config(plugin.runtime.context, config);
      return sendSuccess(res, { message: 'Config updated' });
    } catch (e: any) {
      return sendError(res, 'Error updating config: ' + e.message);
    }
  } else if (plugin.runtime.module?.plugin_config_schema || plugin.runtime.module?.plugin_config_ui || plugin.runtime.module?.plugin_config_controller) {
    // Default behavior: write to default config path
    try {
      const configPath = plugin.runtime.context?.configPath || pluginManager.getPluginConfigPath(id);

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

/**
 * 导入本地插件包（支持 .zip 文件）
 */
export const ImportLocalPluginHandler: RequestHandler = async (req, res) => {
  const pluginManager = getPluginManager();
  if (!pluginManager) {
    return sendError(res, 'Plugin Manager not found');
  }

  // multer 会将文件信息放在 req.file 中
  const file = req.file;
  if (!file) {
    return sendError(res, 'No file uploaded');
  }

  const PLUGINS_DIR = webUiPathWrapper.pluginPath;

  // 确保插件目录存在
  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR, { recursive: true });
  }

  const tempZipPath = file.path;

  try {
    // 创建临时解压目录
    const tempExtractDir = path.join(PLUGINS_DIR, `_temp_extract_${Date.now()}`);
    fs.mkdirSync(tempExtractDir, { recursive: true });

    // 解压到临时目录
    await compressing.zip.uncompress(tempZipPath, tempExtractDir);

    // 检查解压后的内容
    const extractedItems = fs.readdirSync(tempExtractDir);

    let pluginSourceDir: string;
    let pluginId: string;

    // 判断解压结构：可能是直接的插件文件，或者包含一个子目录
    const hasPackageJson = extractedItems.includes('package.json');
    const hasIndexFile = extractedItems.some(item =>
      ['index.js', 'index.mjs', 'main.js', 'main.mjs'].includes(item)
    );

    if (hasPackageJson || hasIndexFile) {
      // 直接是插件文件
      pluginSourceDir = tempExtractDir;

      // 尝试从 package.json 获取插件 ID
      const packageJsonPath = path.join(tempExtractDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          pluginId = pkg.name || path.basename(file.originalname, '.zip');
        } catch {
          pluginId = path.basename(file.originalname, '.zip');
        }
      } else {
        pluginId = path.basename(file.originalname, '.zip');
      }
    } else if (extractedItems.length === 1 && fs.statSync(path.join(tempExtractDir, extractedItems[0]!)).isDirectory()) {
      // 包含一个子目录
      const subDir = extractedItems[0]!;
      pluginSourceDir = path.join(tempExtractDir, subDir);

      // 尝试从子目录的 package.json 获取插件 ID
      const packageJsonPath = path.join(pluginSourceDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          pluginId = pkg.name || subDir;
        } catch {
          pluginId = subDir;
        }
      } else {
        pluginId = subDir;
      }
    } else {
      // 清理临时文件
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
      fs.unlinkSync(tempZipPath);
      return sendError(res, 'Invalid plugin package structure');
    }

    // 目标插件目录
    const targetPluginDir = path.join(PLUGINS_DIR, pluginId);

    // 如果目标目录已存在，先删除
    if (fs.existsSync(targetPluginDir)) {
      // 先卸载已存在的插件
      const existingPlugin = pluginManager.getPluginInfo(pluginId);
      if (existingPlugin && existingPlugin.loaded) {
        await pluginManager.unregisterPlugin(pluginId);
      }
      fs.rmSync(targetPluginDir, { recursive: true, force: true });
    }

    // 移动插件文件到目标目录
    if (pluginSourceDir === tempExtractDir) {
      // 直接重命名临时目录
      fs.renameSync(tempExtractDir, targetPluginDir);
    } else {
      // 移动子目录内容
      fs.renameSync(pluginSourceDir, targetPluginDir);
      // 清理临时目录
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
    }

    // 删除上传的临时文件
    if (fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }

    // 加载插件
    const loaded = await pluginManager.loadPluginById(pluginId);

    if (loaded) {
      return sendSuccess(res, {
        message: 'Plugin imported and loaded successfully',
        pluginId,
        installPath: targetPluginDir,
      });
    } else {
      return sendSuccess(res, {
        message: 'Plugin imported but failed to load (check plugin structure)',
        pluginId,
        installPath: targetPluginDir,
      });
    }
  } catch (e: any) {
    // 清理临时文件
    if (fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }
    return sendError(res, 'Failed to import plugin: ' + e.message);
  }
};
