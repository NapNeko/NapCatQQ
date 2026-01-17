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
    return sendError(res, 'Plugin Manager not found');
  }

  const loadedPlugins = pluginManager.getLoadedPlugins().map(p => ({
    name: p.name,
    version: p.version || '0.0.0',
    description: p.packageJson?.description || '',
    author: p.packageJson?.author || '',
    status: 'active',
  }));

  // Find disabled plugins (those with .disabled extension)
  const pluginPath = pluginManager.getPluginPath();
  const disabledPlugins: any[] = [];
  if (fs.existsSync(pluginPath)) {
    const items = fs.readdirSync(pluginPath, { withFileTypes: true });
    for (const item of items) {
      if (item.name.endsWith('.disabled')) {
        const originalName = item.name.replace(/\.disabled$/, '');
        const isDirectory = item.isDirectory();
        let version = '0.0.0';
        let description = '';
        let author = '';
        let name = originalName;

        try {
          if (isDirectory) {
            const packageJsonPath = path.join(pluginPath, item.name, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
              const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
              version = pkg.version || version;
              description = pkg.description || description;
              author = pkg.author || author;
              name = pkg.name || name;
            }
          }
        } catch (e) { }

        disabledPlugins.push({
          name: name,
          version,
          description,
          author,
          status: 'disabled',
          filename: item.name // Store real filename for operations
        });
      }
    }
  }

  return sendSuccess(res, [...loadedPlugins, ...disabledPlugins]);
};

export const ReloadPluginHandler: RequestHandler = async (req, res) => {
  const { name } = req.body;
  if (!name) return sendError(res, 'Plugin Name is required');

  const pluginManager = getPluginManager();
  if (!pluginManager) {
    return sendError(res, 'Plugin Manager not found');
  }

  const success = await pluginManager.reloadPlugin(name);
  if (success) {
    return sendSuccess(res, { message: 'Reloaded successfully' });
  } else {
    return sendError(res, 'Failed to reload plugin');
  }
};

export const SetPluginStatusHandler: RequestHandler = async (req, res) => {
  const { name, enable, filename } = req.body; // filename required for enabling
  if (!name) return sendError(res, 'Plugin Name is required');

  const pluginManager = getPluginManager();
  if (!pluginManager) {
    return sendError(res, 'Plugin Manager not found');
  }

  const pluginPath = pluginManager.getPluginPath();

  if (enable) {
    // Enable: Rename back from .disabled
    // We need the filename since we can't guess if it was a dir or file easily without scanning or passing it
    if (!filename) return sendError(res, 'Filename is required to enable');

    const disabledPath = path.join(pluginPath, filename);
    const enabledPath = path.join(pluginPath, filename.replace(/\.disabled$/, ''));

    if (!fs.existsSync(disabledPath)) {
      return sendError(res, 'Disabled plugin not found');
    }

    try {
      fs.renameSync(disabledPath, enabledPath);
      // After rename, we need to load it
      const isDirectory = fs.statSync(enabledPath).isDirectory();
      if (isDirectory) {
        await pluginManager.loadDirectoryPlugin(path.basename(enabledPath));
      } else {
        await pluginManager.loadFilePlugin(path.basename(enabledPath));
      }
      return sendSuccess(res, { message: 'Enabled successfully' });
    } catch (e: any) {
      return sendError(res, 'Failed to enable: ' + e.message);
    }

  } else {
    // Disable: Unload and rename to .disabled
    const plugin = pluginManager.getPluginInfo(name);
    if (!plugin) return sendError(res, 'Plugin not found/loaded');

    try {
      await pluginManager.unregisterPlugin(name);
      // Determine the file/dir key in the fs

      // plugin.pluginPath is the directory for dir plugins, and the directory containing the file for file plugins??
      // Let's check LoadedPlugin definition again.
      // pluginPath: this.pluginPath (for file plugins), pluginDir (for dir plugins)

      // Wait, for file plugins: pluginPath = this.pluginPath, entryPath = filePath
      // For dir plugins: pluginPath = pluginDir, entryPath = join(pluginDir, entryFile)

      let fsPath = '';
      // We need to rename the whole thing that constitutes the plugin.
      if (plugin.pluginPath === pluginManager.getPluginPath()) {
        // It's a file plugin
        fsPath = plugin.entryPath;
      } else {
        // It's a directory plugin
        fsPath = plugin.pluginPath;
      }

      const disabledPath = fsPath + '.disabled';
      fs.renameSync(fsPath, disabledPath);
      return sendSuccess(res, { message: 'Disabled successfully' });
    } catch (e: any) {
      return sendError(res, 'Failed to disable: ' + e.message);
    }
  }
};

export const UninstallPluginHandler: RequestHandler = async (req, res) => {
  const { name, filename } = req.body;
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
    return sendSuccess(res, { message: 'Uninstalled successfully' });
  } catch (e: any) {
    return sendError(res, 'Failed to uninstall: ' + e.message);
  }
};
