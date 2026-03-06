import type { Context } from 'hono';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { NapCatOneBot11Adapter } from '@/napcat-onebot/index';
import { OB11PluginMangerAdapter } from '@/napcat-onebot/network/plugin-manger';
import { webUiPathWrapper } from '@/napcat-webui-backend/index';
import path from 'path';
import fs from 'fs';
import compressing from 'compressing';

/**
 * 获取插件图标 URL
 * 优先使用 package.json 中的 icon 字段，否则检查缓存的图标文件
 */
function getPluginIconUrl (pluginId: string, pluginPath: string, iconField?: string): string | undefined {
  // 1. 检查 package.json 中指定的 icon 文件
  if (iconField) {
    const iconPath = path.join(pluginPath, iconField);
    if (fs.existsSync(iconPath)) {
      return `/api/Plugin/Icon/${encodeURIComponent(pluginId)}`;
    }
  }

  // 2. 检查 config 目录中缓存的图标 (固定 icon.png)
  const cachedIcon = path.join(webUiPathWrapper.configPath, 'plugins', pluginId, 'icon.png');
  if (fs.existsSync(cachedIcon)) {
    return `/api/Plugin/Icon/${encodeURIComponent(pluginId)}`;
  }

  return undefined;
}

/**
 * 查找插件图标文件的实际路径
 */
function findPluginIconPath (pluginId: string, pluginPath: string, iconField?: string): string | undefined {
  // 1. 优先使用 package.json 中指定的 icon
  if (iconField) {
    const iconPath = path.join(pluginPath, iconField);
    if (fs.existsSync(iconPath)) {
      return iconPath;
    }
  }

  // 2. 检查 config 目录中缓存的图标 (固定 icon.png)
  const cachedIcon = path.join(webUiPathWrapper.configPath, 'plugins', pluginId, 'icon.png');
  if (fs.existsSync(cachedIcon)) {
    return cachedIcon;
  }

  return undefined;
}

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
export const RegisterPluginManagerHandler = async (c: Context) => {
  const ob11 = getOneBotContext();
  if (!ob11) {
    return sendError(c, 'OneBot context not found');
  }

  // 检查是否已经注册
  const existingManager = ob11.networkManager.findSomeAdapter('plugin_manager');
  if (existingManager) {
    return sendError(c, '插件管理器已经注册');
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

    return sendSuccess(c, { message: '插件管理器注册成功' });
  } catch (e: any) {
    return sendError(c, '注册插件管理器失败: ' + e.message);
  }
};

export const GetPluginListHandler = async (c: Context) => {
  const pluginManager = getPluginManager();
  if (!pluginManager) {
    // 返回成功但带特殊标记
    return sendSuccess(c, { plugins: [], pluginManagerNotFound: true, extensionPages: [] });
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
    homepage?: string;
    repository?: string;
    icon?: string;
  }> = [];

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
      hasPages,
      homepage: p.packageJson?.homepage,
      repository: typeof p.packageJson?.repository === 'string'
        ? p.packageJson.repository
        : p.packageJson?.repository?.url,
      icon: getPluginIconUrl(p.id, p.pluginPath, p.packageJson?.icon),
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
          description: page.description,
        });
      }
    }
  }

  return sendSuccess(c, { plugins: AllPlugins, pluginManagerNotFound: false, extensionPages });
};

export const SetPluginStatusHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { enable, id } = body as { enable?: boolean; id?: string };

  if (!id) return sendError(c, 'Plugin id is required');

  const pluginManager = getPluginManager();
  if (!pluginManager) {
    return sendError(c, 'Plugin Manager not found');
  }

  try {
    // 设置插件状态（需要 await，因为内部会加载/卸载插件）
    await pluginManager.setPluginStatus(id, enable ?? false);

    // 如果启用，检查插件是否加载成功
    if (enable) {
      const plugin = pluginManager.getPluginInfo(id);
      if (!plugin || !plugin.loaded) {
        return sendError(c, 'Plugin load failed: ' + id);
      }
    }

    return sendSuccess(c, { message: 'Status updated successfully' });
  } catch (e: any) {
    return sendError(c, 'Failed to update status: ' + e.message);
  }
};

export const UninstallPluginHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { id, cleanData } = body as { id?: string; cleanData?: boolean };

  if (!id) return sendError(c, 'Plugin id is required');

  const pluginManager = getPluginManager();
  if (!pluginManager) {
    return sendError(c, 'Plugin Manager not found');
  }

  try {
    await pluginManager.uninstallPlugin(id, cleanData);
    return sendSuccess(c, { message: 'Uninstalled successfully' });
  } catch (e: any) {
    return sendError(c, 'Failed to uninstall: ' + e.message);
  }
};

export const GetPluginConfigHandler = async (c: Context) => {
  const id = c.req.query('id') as string;

  if (!id) return sendError(c, 'Plugin id is required');

  const pluginManager = getPluginManager();
  if (!pluginManager) return sendError(c, 'Plugin Manager not found');

  const plugin = pluginManager.getPluginInfo(id);
  if (!plugin) return sendError(c, 'Plugin not loaded');

  // 获取配置值
  let config: unknown = {};
  if (plugin.runtime.module?.plugin_get_config && plugin.runtime.context) {
    try {
      config = await plugin.runtime.module?.plugin_get_config(plugin.runtime.context);
    } catch (_e) { }
  } else {
    // Default behavior: read from default config path
    try {
      const configPath = plugin.runtime.context?.configPath || pluginManager.getPluginConfigPath(id);
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
    } catch (_e) { }
  }

  // 获取静态 schema
  const schema = plugin.runtime.module?.plugin_config_schema || plugin.runtime.module?.plugin_config_ui || [];

  // 检查是否支持动态控制
  const supportReactive = !!(plugin.runtime.module?.plugin_config_controller || plugin.runtime.module?.plugin_on_config_change);

  return sendSuccess(c, { schema, config, supportReactive });
};

/** 活跃的 SSE 连接 - 存储 controller 用于从 PluginConfigChangeHandler 推送更新 */
const activeConfigSessions = new Map<string, {
  enqueue: (data: string) => void;
  cleanup?: () => void;
  currentConfig: Record<string, any>;
  heartbeatId?: ReturnType<typeof setInterval>;
}>();

/**
 * 插件配置 SSE 连接 - 用于动态更新配置界面
 */
export const PluginConfigSSEHandler = async (c: Context) => {
  const id = c.req.query('id') as string;
  const initialConfigStr = c.req.query('config') as string;

  if (!id) {
    return c.json({ error: 'Plugin id is required' }, 400);
  }

  const pluginManager = getPluginManager();
  if (!pluginManager) {
    return c.json({ error: 'Plugin Manager not found' }, 400);
  }

  const plugin = pluginManager.getPluginInfo(id);
  if (!plugin) {
    return c.json({ error: 'Plugin not loaded' }, 400);
  }

  const sessionId = `${id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  let currentConfig: Record<string, any> = {};
  if (initialConfigStr) {
    try {
      currentConfig = JSON.parse(initialConfigStr);
    } catch (_e) { }
  }

  let heartbeatId: ReturnType<typeof setInterval> | undefined;
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const enqueue = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch (_e) { }
      };

      const sendSSE = (event: string, data: any) => {
        enqueue(`event: ${event}\n`);
        enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      activeConfigSessions.set(sessionId, {
        enqueue: (data) => controller.enqueue(encoder.encode(data)),
        currentConfig,
        heartbeatId,
      });

      const uiController = {
        updateSchema: (schema: any[]) => sendSSE('schema', { type: 'full', schema }),
        updateField: (key: string, field: any) => sendSSE('schema', { type: 'updateField', key, field }),
        removeField: (key: string) => sendSSE('schema', { type: 'removeField', key }),
        addField: (field: any, afterKey?: string) => sendSSE('schema', { type: 'addField', field, afterKey }),
        showField: (key: string) => sendSSE('schema', { type: 'showField', key }),
        hideField: (key: string) => sendSSE('schema', { type: 'hideField', key }),
        getCurrentConfig: () => currentConfig,
      };

      sendSSE('connected', { sessionId });

      (async () => {
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

        const session = activeConfigSessions.get(sessionId);
        if (session) session.cleanup = cleanup;
      })();

      heartbeatId = setInterval(() => sendSSE('ping', { time: Date.now() }), 30000);
      const session = activeConfigSessions.get(sessionId);
      if (session) session.heartbeatId = heartbeatId;
    },
    cancel() {
      clearInterval(heartbeatId);
      const session = activeConfigSessions.get(sessionId);
      if (session?.cleanup) {
        try { session.cleanup(); } catch (_e) { }
      }
      activeConfigSessions.delete(sessionId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
};

/**
 * 插件配置字段变化通知
 */
export const PluginConfigChangeHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { id, sessionId, key, value, currentConfig } = body as { id?: string; sessionId?: string; key?: string; value?: unknown; currentConfig?: Record<string, any> };

  if (!id || !sessionId || !key) {
    return sendError(c, 'Missing required parameters');
  }

  const pluginManager = getPluginManager();
  if (!pluginManager) return sendError(c, 'Plugin Manager not found');

  const plugin = pluginManager.getPluginInfo(id);
  if (!plugin) return sendError(c, 'Plugin not loaded');

  const session = activeConfigSessions.get(sessionId);
  if (!session) {
    return sendError(c, 'Session not found');
  }

  session.currentConfig = currentConfig || {};

  if (plugin.runtime.module?.plugin_on_config_change) {
    const sendSSE = (event: string, data: any) => {
      session.enqueue(`event: ${event}\n`);
      session.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    };
    const uiController = {
      updateSchema: (schema: any[]) => sendSSE('schema', { type: 'full', schema }),
      updateField: (fieldKey: string, field: any) => sendSSE('schema', { type: 'updateField', key: fieldKey, field }),
      removeField: (fieldKey: string) => sendSSE('schema', { type: 'removeField', key: fieldKey }),
      addField: (field: any, afterKey?: string) => sendSSE('schema', { type: 'addField', field, afterKey }),
      showField: (fieldKey: string) => sendSSE('schema', { type: 'showField', key: fieldKey }),
      hideField: (fieldKey: string) => sendSSE('schema', { type: 'hideField', key: fieldKey }),
      getCurrentConfig: () => session.currentConfig,
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
      sendSSE('error', { message: e.message });
    }
  }

  return sendSuccess(c, { message: 'Change processed' });
};

export const SetPluginConfigHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { id, config } = body as { id?: string; config?: unknown };
  if (!id || !config) return sendError(c, 'Plugin id and config required');

  const pluginManager = getPluginManager();
  if (!pluginManager) return sendError(c, 'Plugin Manager not found');

  const plugin = pluginManager.getPluginInfo(id);
  if (!plugin) return sendError(c, 'Plugin not loaded');

  if (plugin.runtime.module?.plugin_set_config && plugin.runtime.context) {
    try {
      await plugin.runtime.module.plugin_set_config(plugin.runtime.context, config);
      return sendSuccess(c, { message: 'Config updated' });
    } catch (e: any) {
      return sendError(c, 'Error updating config: ' + e.message);
    }
  } else if (plugin.runtime.module?.plugin_config_schema || plugin.runtime.module?.plugin_config_ui || plugin.runtime.module?.plugin_config_controller) {
    try {
      const configPath = plugin.runtime.context?.configPath || pluginManager.getPluginConfigPath(id);

      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

      await pluginManager.reloadPlugin(id);

      return sendSuccess(c, { message: 'Config saved and plugin reloaded' });
    } catch (e: any) {
      return sendError(c, 'Error saving config: ' + e.message);
    }
  } else {
    return sendError(c, 'Plugin does not support config update');
  }
};

/**
 * 导入本地插件包（支持 .zip 文件）
 */
export const ImportLocalPluginHandler = async (c: Context) => {
  const pluginManager = getPluginManager();
  if (!pluginManager) {
    return sendError(c, 'Plugin Manager not found');
  }

  const body = await c.req.parseBody({ all: true });
  const file = body['plugin'] as File | undefined;
  if (!file || !(file instanceof File)) {
    return sendError(c, 'No file uploaded');
  }

  const PLUGINS_DIR = webUiPathWrapper.pluginPath;

  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR, { recursive: true });
  }

  const tempZipPath = path.join(PLUGINS_DIR, `_temp_${Date.now()}_${path.basename(file.name || 'plugin.zip')}`);
  const arrayBuffer = await file.arrayBuffer();
  fs.writeFileSync(tempZipPath, Buffer.from(arrayBuffer));

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
      const fileName = file.name || 'plugin.zip';
      if (fs.existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          pluginId = pkg.name || path.basename(fileName, '.zip');
        } catch {
          pluginId = path.basename(fileName, '.zip');
        }
      } else {
        pluginId = path.basename(fileName, '.zip');
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
      return sendError(c, 'Invalid plugin package structure');
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
      return sendSuccess(c, {
        message: 'Plugin imported and loaded successfully',
        pluginId,
        installPath: targetPluginDir,
      });
    } else {
      return sendSuccess(c, {
        message: 'Plugin imported but failed to load (check plugin structure)',
        pluginId,
        installPath: targetPluginDir,
      });
    }
  } catch (e: any) {
    if (fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }
    return sendError(c, 'Failed to import plugin: ' + e.message);
  }
};

/**
 * 获取插件图标
 */
export const GetPluginIconHandler = async (c: Context) => {
  const pluginId = c.req.param('pluginId');
  if (!pluginId) return sendError(c, 'Plugin ID is required');

  const pluginManager = getPluginManager();
  if (!pluginManager) return sendError(c, 'Plugin Manager not found');

  const plugin = pluginManager.getPluginInfo(pluginId);
  if (!plugin) return sendError(c, 'Plugin not found');

  const iconPath = findPluginIconPath(pluginId, plugin.pluginPath, plugin.packageJson?.icon);
  if (!iconPath) {
    return c.json({ code: -1, message: 'Icon not found' }, 404);
  }

  const content = fs.readFileSync(iconPath);
  const ext = path.extname(iconPath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  };
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  return new Response(content, {
    headers: { 'Content-Type': mimeType },
  });
};
