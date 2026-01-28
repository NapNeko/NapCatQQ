import { RequestHandler } from 'express';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { NapCatOneBot11Adapter } from '@/napcat-onebot/index';
import { OB11PluginMangerAdapter } from '@/napcat-onebot/network/plugin-manger';
import path from 'path';
import fs from 'fs';

// Helper to get the plugin manager adapter
const getPluginManager = (): OB11PluginMangerAdapter | null => {
  const ob11 = WebUiDataRuntime.getOneBotContext() as NapCatOneBot11Adapter;
  if (!ob11) return null;
  return ob11.networkManager.findSomeAdapter('plugin_manager') as OB11PluginMangerAdapter;
};

export const GetPluginListHandler: RequestHandler = async (_req, res) => {
  const pluginManager = getPluginManager();
  if (!pluginManager) {
    // 返回成功但带特殊标记
    return sendSuccess(res, { plugins: [], pluginManagerNotFound: true });
  }

  // 辅助函数：根据文件名/路径生成唯一ID（作为配置键）
  const getPluginId = (fsName: string, isFile: boolean): string => {
    if (isFile) {
      return path.parse(fsName).name;
    }
    return fsName;
  };

  const loadedPlugins = pluginManager.getLoadedPlugins();
  const loadedPluginMap = new Map<string, any>(); // Map ID -> Loaded Info

  // 1. 整理已加载的插件
  for (const p of loadedPlugins) {
    // 计算 ID：需要回溯到加载时的入口信息
    // 对于已加载的插件，我们通过判断 pluginPath 是否等于根 pluginPath 来判断它是单文件还是目录
    const isFilePlugin = p.pluginPath === pluginManager.getPluginPath();
    const fsName = isFilePlugin ? path.basename(p.entryPath) : path.basename(p.pluginPath);
    const id = getPluginId(fsName, isFilePlugin);

    loadedPluginMap.set(id, {
      name: p.packageJson?.name || p.name, // 优先使用 package.json 的 name
      id: id,
      version: p.version || '0.0.0',
      description: p.packageJson?.description || '',
      author: p.packageJson?.author || '',
      status: 'active',
      filename: fsName, // 真实文件/目录名
      loadedName: p.name, // 运行时注册的名称，用于重载/卸载
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
      let id = '';

      if (item.isFile()) {
        if (!['.js', '.mjs'].includes(path.extname(item.name))) continue;
        id = getPluginId(item.name, true);
      } else if (item.isDirectory()) {
        id = getPluginId(item.name, false);
      } else {
        continue;
      }

      const isActiveConfig = pluginConfig[id] !== false; // 默认为 true

      if (loadedPluginMap.has(id)) {
        // 已加载，使用加载的信息
        const loadedInfo = loadedPluginMap.get(id);
        allPlugins.push(loadedInfo);
      } else {
        // 未加载 (可能是被禁用，或者加载失败，或者新增未运行)
        let version = '0.0.0';
        let description = '';
        let author = '';
        // 默认显示名称为 ID (文件名/目录名)
        let name = id;

        try {
          // 尝试读取 package.json 获取信息
          if (item.isDirectory()) {
            const packageJsonPath = path.join(pluginPath, item.name, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
              const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
              version = pkg.version || version;
              description = pkg.description || description;
              author = pkg.author || author;
              // 如果 package.json 有 name，优先使用
              name = pkg.name || name;
            }
          }
        } catch (e) { }

        allPlugins.push({
          name: name,
          id: id,
          version,
          description,
          author,
          // 如果配置是 false，则为 disabled；否则是 stopped (应启动但未启动)
          status: isActiveConfig ? 'stopped' : 'disabled',
          filename: item.name
        });
      }
    }
  }

  return sendSuccess(res, { plugins: allPlugins, pluginManagerNotFound: false });
};

// ReloadPluginHandler removed

export const SetPluginStatusHandler: RequestHandler = async (req, res) => {
  const { enable, filename } = req.body;
  // We Use filename / id to control config
  // Front-end should pass the 'filename' or 'id' as the key identifier

  if (!filename) return sendError(res, 'Plugin Filename/ID is required');

  const pluginManager = getPluginManager();
  if (!pluginManager) {
    return sendError(res, 'Plugin Manager not found');
  }

  // ID IS the filename (directory name) now
  const id = filename;

  try {
    pluginManager.setPluginStatus(id, enable);

    // If enabling, trigger load
    if (enable) {
      const pluginPath = pluginManager.getPluginPath();
      const fullPath = path.join(pluginPath, filename);

      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        await pluginManager.loadDirectoryPlugin(filename);
      } else {
        return sendError(res, 'Plugin directory not found: ' + filename);
      }
    } else {
      // Disabling behavior is managed by setPluginStatus which updates config
      // If we want to unload immediately?
      // The config update will prevent load on next startup.
      // Does pluginManager.setPluginStatus unload it?
      // Inspecting pluginManager.setPluginStatus... it iterates and unloads if match found.
    }

    return sendSuccess(res, { message: 'Status updated successfully' });
  } catch (e: any) {
    return sendError(res, 'Failed to update status: ' + e.message);
  }
};

export const UninstallPluginHandler: RequestHandler = async (req, res) => {
  const { name, filename, cleanData } = req.body;
  // If it's loaded, we use name. If it's disabled, we might use filename.

  const pluginManager = getPluginManager();
  if (!pluginManager) {
    return sendError(res, 'Plugin Manager not found');
  }

  // Check if loaded
  const plugin = pluginManager.getPluginInfo(name);
  let fsPath = '';

  if (plugin) {
    // Active plugin
    await pluginManager.unregisterPlugin(name);
    if (plugin.pluginPath === pluginManager.getPluginPath()) {
      fsPath = plugin.entryPath;
    } else {
      fsPath = plugin.pluginPath;
    }
  } else {
    // Disabled or not loaded
    if (filename) {
      fsPath = path.join(pluginManager.getPluginPath(), filename);
    } else {
      return sendError(res, 'Plugin not found, provide filename if disabled');
    }
  }

  try {
    if (fs.existsSync(fsPath)) {
      fs.rmSync(fsPath, { recursive: true, force: true });
    }

    if (cleanData && name) {
      const dataPath = pluginManager.getPluginDataPath(name);
      if (fs.existsSync(dataPath)) {
        fs.rmSync(dataPath, { recursive: true, force: true });
      }
    }

    return sendSuccess(res, { message: 'Uninstalled successfully' });
  } catch (e: any) {
    return sendError(res, 'Failed to uninstall: ' + e.message);
  }
};

export const GetPluginConfigHandler: RequestHandler = async (req, res) => {
  const name = req.query['name'] as string;
  if (!name) return sendError(res, 'Plugin Name is required');

  const pluginManager = getPluginManager();
  if (!pluginManager) return sendError(res, 'Plugin Manager not found');

  const plugin = pluginManager.getPluginInfo(name);
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
      const configPath = plugin.context?.configPath || pluginManager.getPluginConfigPath(name);
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
    } catch (e) { }
  }

  return sendSuccess(res, { schema, config });
};

export const SetPluginConfigHandler: RequestHandler = async (req, res) => {
  const { name, config } = req.body;
  if (!name || !config) return sendError(res, 'Name and Config required');

  const pluginManager = getPluginManager();
  if (!pluginManager) return sendError(res, 'Plugin Manager not found');

  const plugin = pluginManager.getPluginInfo(name);
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
      const configPath = plugin.context?.configPath || pluginManager.getPluginConfigPath(name);

      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

      // Auto-Reload plugin to apply changes
      await pluginManager.reloadPlugin(name);

      return sendSuccess(res, { message: 'Config saved and plugin reloaded' });
    } catch (e: any) {
      return sendError(res, 'Error saving config: ' + e.message);
    }
  } else {
    return sendError(res, 'Plugin does not support config update');
  }
};
