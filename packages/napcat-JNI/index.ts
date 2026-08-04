import fs from 'fs';
import path from 'path';
import type { ActionMap } from 'napcat-types/napcat-onebot/action/index';
import type {
  PluginModule,
  PluginLogger,
  PluginConfigSchema,
  PluginConfigUIController,
  NapCatPluginContext,
} from 'napcat-types/napcat-onebot/network/plugin-manger';
import { JniBridge, DEFAULT_BRIDGE_JAR, DEFAULT_JAVA_PLUGIN_DIR } from './bridge';
import type { InitParams, InitResult, JavaPluginInfo } from './protocol';

// ==================== 配置类型 ====================

interface JniPluginConfig {
  /** 是否启用 Java 插件桥接 */
  enable: boolean;
  /** Java 可执行文件路径 */
  javaPath: string;
  /** JVM 启动参数 */
  jvmArgs: string[];
  /** 桥接 JAR 文件名（相对插件目录或绝对路径） */
  bridgeJar: string;
  /** Java 插件目录名（相对插件数据目录或绝对路径） */
  javaPluginDir: string;
  /** 额外 classpath */
  classpath: string[];
  /** 调用超时（毫秒） */
  callTimeout: number;
  [key: string]: unknown;
}

// ==================== 模块级状态 ====================

let logger: PluginLogger | null = null;
let ctxRef: NapCatPluginContext | null = null;
let bridge: JniBridge | null = null;
let currentConfig: JniPluginConfig = {
  enable: true,
  javaPath: 'java',
  jvmArgs: ['-Xmx256m'],
  bridgeJar: DEFAULT_BRIDGE_JAR,
  javaPluginDir: DEFAULT_JAVA_PLUGIN_DIR,
  classpath: [],
  callTimeout: 30_000,
};

/** 已发现的 Java 插件列表 */
let javaPlugins: JavaPluginInfo[] = [];

export let plugin_config_ui: PluginConfigSchema = [];

// ==================== 工具函数 ====================

/** 解析路径：相对路径基于插件目录 */
function resolvePath (base: string, p: string): string {
  if (!p) return base;
  return path.isAbsolute(p) ? p : path.join(base, p);
}

/** 加载配置文件 */
function loadConfig (configPath: string): void {
  try {
    if (fs.existsSync(configPath)) {
      const saved = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      currentConfig = { ...currentConfig, ...saved };
    }
  } catch (e) {
    logger?.warn('[JNI] Failed to load config:', e);
  }
}

/** 保存配置文件 */
function saveConfig (configPath: string, config: JniPluginConfig): void {
  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    logger?.error('[JNI] Failed to save config:', e);
  }
}

/** 确保目录存在 */
function ensureDir (dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ==================== 插件生命周期 ====================

const plugin_init: PluginModule['plugin_init'] = async (ctx) => {
  ctxRef = ctx;
  logger = ctx.logger;
  logger.info('[JNI] Java 插件桥接器初始化中...');

  // 加载持久化配置
  loadConfig(ctx.configPath);

  // 构建配置 UI
  rebuildConfigUI(ctx);

  // 注册 WebUI 路由
  registerRoutes(ctx);

  // 确保数据目录存在
  ensureDir(ctx.dataPath);
  const javaPluginPath = resolvePath(ctx.dataPath, currentConfig.javaPluginDir);
  ensureDir(javaPluginPath);

  if (!currentConfig.enable) {
    logger.warn('[JNI] Java 插件桥接器未启用（配置 enable=false）');
    return;
  }

  // 启动 Java 桥接
  try {
    await startBridge(ctx, javaPluginPath);
    logger.info(`[JNI] Java 插件桥接器就绪，已加载 ${javaPlugins.length} 个 Java 插件`);
  } catch (e) {
    logger.error('[JNI] 启动 Java 桥接器失败:', e);
    logger.warn('[JNI] 请检查 javaPath / bridgeJar 是否正确，以及 JVM 是否可用');
  }
};

/** 启动 Java 桥接进程 */
async function startBridge (ctx: NapCatPluginContext, javaPluginPath: string): Promise<void> {
  if (bridge) {
    await bridge.stop().catch(() => void 0);
    bridge = null;
  }

  const bridgeJarPath = resolvePath(ctx.pluginPath, currentConfig.bridgeJar);

  const b = new JniBridge({
    javaPath: currentConfig.javaPath,
    jvmArgs: currentConfig.jvmArgs,
    bridgeJar: bridgeJarPath,
    classpath: currentConfig.classpath,
    callTimeout: currentConfig.callTimeout,
    logger: ctx.logger,
  });

  // 关键：在 init 之前注册事件监听器
  // Java 侧在 handleInit 期间会自动加载插件，插件 onInit 可能立即发起 Action 调用
  // 如果监听器在 init 之后才注册，这些 Action 通知会被丢弃，导致超时
  b.on('action', (params) => handleJavaAction(ctx, b, params));
  b.on('event', (event) => {
    try {
      ctx.oneBot.networkManager.emitEvent(event as any);
    } catch (e) {
      logger?.warn('[JNI] Failed to forward event from Java:', e);
    }
  });
  b.on('exit', (code, signal) => {
    logger?.warn(`[JNI] Java 桥接进程退出 (code=${code}, signal=${signal})`);
    if (bridge === b) bridge = null;
  });

  // 启动 Java 进程并等待 ready
  await b.start();

  // 发送 init 请求（期间插件可能已发起 Action 调用，监听器已就绪）
  const initParams: InitParams = {
    dataPath: ctx.dataPath,
    javaPluginPath,
    adapterName: ctx.adapterName,
    javaPath: currentConfig.javaPath,
    jvmArgs: currentConfig.jvmArgs,
    bridgeJar: bridgeJarPath,
    classpath: currentConfig.classpath,
  };
  const info = await b.call<InitResult>('init', initParams);

  bridge = b;
  javaPlugins = info.plugins ?? [];
}

/** 处理 Java 侧发起的 OneBot Action 调用 */
async function handleJavaAction (
  ctx: NapCatPluginContext,
  b: JniBridge,
  params: { requestId: number | string; action: string; params?: unknown }
): Promise<void> {
  const { requestId, action, params: actionParams } = params;
  try {
    const data = await callAction(ctx, action, actionParams);
    b.replyAction(requestId, true, data);
  } catch (e) {
    b.replyAction(requestId, false, undefined, (e as Error).message);
  }
}

/** 调用 OneBot Action */
async function callAction (
  ctx: NapCatPluginContext,
  action: string,
  params: unknown
): Promise<unknown> {
  return await (ctx.actions as ActionMap).call(
    action as any,
    params,
    ctx.adapterName,
    ctx.pluginManager.config,
  );
}

// ==================== 事件处理 ====================

const plugin_onmessage: PluginModule['plugin_onmessage'] = async (_ctx, event) => {
  if (!bridge || !currentConfig.enable) return;
  try {
    // 通知 Java 侧处理消息（不等待返回，避免阻塞事件流）
    bridge.notify('onMessage', { event });
  } catch (e) {
    logger?.warn('[JNI] Failed to forward message to Java:', e);
  }
};

const plugin_onevent: PluginModule['plugin_onevent'] = async (_ctx, event) => {
  if (!bridge || !currentConfig.enable) return;
  try {
    bridge.notify('onEvent', { event });
  } catch (e) {
    logger?.warn('[JNI] Failed to forward event to Java:', e);
  }
};

const plugin_cleanup: PluginModule['plugin_cleanup'] = async (_ctx) => {
  logger?.info('[JNI] 正在停止 Java 桥接器...');
  if (bridge) {
    try {
      await bridge.stop();
    } catch (e) {
      logger?.warn('[JNI] 停止 Java 桥接器时出错:', e);
    }
    bridge = null;
  }
  ctxRef = null;
};

// ==================== 配置接口 ====================

const plugin_get_config: PluginModule['plugin_get_config'] = async () => {
  return currentConfig;
};

const plugin_set_config: PluginModule['plugin_set_config'] = async (ctx, config) => {
  const newConfig = { ...currentConfig, ...(config as JniPluginConfig) };
  currentConfig = newConfig;
  saveConfig(ctx.configPath, newConfig);
  rebuildConfigUI(ctx);
};

const plugin_config_controller: PluginModule['plugin_config_controller'] = async (_ctx, _ui, _initialConfig) => {
  return () => {
    logger?.debug('[JNI] 配置界面已关闭');
  };
};

// ==================== 配置 UI ====================

function rebuildConfigUI (ctx: NapCatPluginContext): void {
  plugin_config_ui = ctx.NapCatConfig.combine(
    ctx.NapCatConfig.html(
      '<div style="padding: 10px; background: rgba(0,0,0,0.05); border-radius: 8px;">' +
      '<h3>☕ Java 插件桥接</h3>' +
      '<p>通过子进程加载并运行 Java 插件。需要本机安装 JRE/JDK，并提供桥接 JAR。</p>' +
      '</div>'
    ),
    ctx.NapCatConfig.boolean('enable', '启用桥接', true, '是否启动 Java 插件桥接进程'),
    ctx.NapCatConfig.text('javaPath', 'Java 路径', 'java', 'Java 可执行文件路径，例如 java 或 /usr/bin/java'),
    ctx.NapCatConfig.text('bridgeJar', '桥接 JAR', DEFAULT_BRIDGE_JAR, '桥接主程序 JAR 路径（相对插件目录或绝对路径）'),
    ctx.NapCatConfig.text('javaPluginDir', 'Java 插件目录', DEFAULT_JAVA_PLUGIN_DIR, 'Java 插件存放目录（相对数据目录或绝对路径）'),
    ctx.NapCatConfig.text('jvmArgs', 'JVM 参数', '-Xmx256m', 'JVM 启动参数，多个参数用空格分隔'),
    ctx.NapCatConfig.number('callTimeout', '调用超时(ms)', 30_000, '调用 Java 方法的超时时间'),
  );
}

// ==================== WebUI 路由 ====================

function registerRoutes (ctx: NapCatPluginContext): void {
  // 获取桥接器状态
  ctx.router.get('/status', (_req, res) => {
    res.json({
      code: 0,
      data: {
        running: bridge?.running ?? false,
        enable: currentConfig.enable,
        javaPath: currentConfig.javaPath,
        bridgeJar: currentConfig.bridgeJar,
        javaPluginDir: currentConfig.javaPluginDir,
        plugins: javaPlugins,
        pluginCount: javaPlugins.length,
      },
    });
  });

  // 列出 Java 插件
  ctx.router.get('/plugins', (_req, res) => {
    res.json({ code: 0, data: javaPlugins });
  });

  // 启动桥接器
  ctx.router.post('/start', async (_req, res) => {
    try {
      if (bridge?.running) {
        res.json({ code: 0, message: 'Bridge already running' });
        return;
      }
      const javaPluginPath = resolvePath(ctx.dataPath, currentConfig.javaPluginDir);
      await startBridge(ctx, javaPluginPath);
      res.json({ code: 0, data: { plugins: javaPlugins } });
    } catch (e: any) {
      res.status(500).json({ code: -1, message: e.message });
    }
  });

  // 停止桥接器
  ctx.router.post('/stop', async (_req, res) => {
    try {
      if (bridge) {
        await bridge.stop();
        bridge = null;
      }
      res.json({ code: 0, message: 'Bridge stopped' });
    } catch (e: any) {
      res.status(500).json({ code: -1, message: e.message });
    }
  });

  // 重启桥接器
  ctx.router.post('/restart', async (_req, res) => {
    try {
      if (bridge) {
        await bridge.stop();
        bridge = null;
      }
      const javaPluginPath = resolvePath(ctx.dataPath, currentConfig.javaPluginDir);
      await startBridge(ctx, javaPluginPath);
      res.json({ code: 0, data: { plugins: javaPlugins } });
    } catch (e: any) {
      res.status(500).json({ code: -1, message: e.message });
    }
  });

  // 加载指定 Java 插件
  ctx.router.post('/plugins/:pluginId/load', async (req, res) => {
    if (!bridge?.running) {
      res.status(400).json({ code: -1, message: 'Bridge not running' });
      return;
    }
    const pluginId = req.params.pluginId;
    try {
      const result = await bridge.call('loadPlugin', { pluginId });
      // 刷新插件列表
      const info = await bridge.call<InitResult>('listPlugins');
      javaPlugins = info.plugins ?? [];
      res.json({ code: 0, data: result });
    } catch (e: any) {
      res.status(500).json({ code: -1, message: e.message });
    }
  });

  // 卸载指定 Java 插件
  ctx.router.post('/plugins/:pluginId/unload', async (req, res) => {
    if (!bridge?.running) {
      res.status(400).json({ code: -1, message: 'Bridge not running' });
      return;
    }
    const pluginId = req.params.pluginId;
    try {
      const result = await bridge.call('unloadPlugin', { pluginId });
      const info = await bridge.call<InitResult>('listPlugins');
      javaPlugins = info.plugins ?? [];
      res.json({ code: 0, data: result });
    } catch (e: any) {
      res.status(500).json({ code: -1, message: e.message });
    }
  });

  // 健康检查（无认证）
  ctx.router.getNoAuth('/health', (_req, res) => {
    res.json({
      code: 0,
      data: {
        status: bridge?.running ? 'running' : 'stopped',
        timestamp: new Date().toISOString(),
      },
    });
  });

  logger?.info('[JNI] WebUI 路由已注册:');
  logger?.info(`  - 状态查询: /api/Plugin/ext/${ctx.pluginName}/status`);
  logger?.info(`  - 插件列表: /api/Plugin/ext/${ctx.pluginName}/plugins`);
  logger?.info(`  - 启动桥接: /api/Plugin/ext/${ctx.pluginName}/start`);
  logger?.info(`  - 停止桥接: /api/Plugin/ext/${ctx.pluginName}/stop`);
  logger?.info(`  - 健康检查: /plugin/${ctx.pluginName}/api/health`);
}

// ==================== 导出 ====================

export {
  plugin_init,
  plugin_onmessage,
  plugin_onevent,
  plugin_cleanup,
  plugin_get_config,
  plugin_set_config,
  plugin_config_controller,
};
