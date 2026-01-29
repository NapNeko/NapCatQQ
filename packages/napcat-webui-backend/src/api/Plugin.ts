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

  // Support legacy schema or new API
  const schema = plugin.module.plugin_config_schema || plugin.module.plugin_config_ui;
  let config = {};

  if (plugin.module.plugin_get_config) {
    try {
      config = await plugin.module.plugin_get_config(plugin.context);
    } catch (e) { }
  } else if (schema) {
    // Default behavior: read from default config path
    try {
      // Use context configPath if available
      const configPath = plugin.context?.configPath || pluginManager.getPluginConfigPath(id);
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
    } catch (e) { }
  }

  return sendSuccess(res, { schema, config });
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
  } else if (plugin.module.plugin_config_schema || plugin.module.plugin_config_ui) {
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
