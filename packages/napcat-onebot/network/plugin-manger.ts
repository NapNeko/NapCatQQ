import { ActionMap } from '../action';
import { NapCatCore } from 'napcat-core';
import { NapCatOneBot11Adapter, OB11Message } from '@/napcat-onebot/index';
import { OB11EmitEventContent, OB11NetworkReloadType } from './index';
import { IOB11NetworkAdapter } from '@/napcat-onebot/network/adapter';
import { PluginConfig } from '../config/config';
import fs from 'fs';
import path from 'path';

export interface PluginPackageJson {
  name?: string;
  plugin?: string;
  version?: string;
  main?: string;
  description?: string;
  author?: string;
}

export interface PluginConfigItem {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multi-select' | 'html' | 'text';
  label: string;
  description?: string;
  default?: any;
  options?: { label: string; value: string | number; }[];
  placeholder?: string;
}

export class NapCatConfig {
  static text (key: string, label: string, defaultValue?: string, description?: string): PluginConfigItem {
    return { key, type: 'string', label, default: defaultValue, description };
  }
  static number (key: string, label: string, defaultValue?: number, description?: string): PluginConfigItem {
    return { key, type: 'number', label, default: defaultValue, description };
  }
  static boolean (key: string, label: string, defaultValue?: boolean, description?: string): PluginConfigItem {
    return { key, type: 'boolean', label, default: defaultValue, description };
  }
  static select (key: string, label: string, options: { label: string; value: string | number; }[], defaultValue?: string | number, description?: string): PluginConfigItem {
    return { key, type: 'select', label, options, default: defaultValue, description };
  }
  static multiSelect (key: string, label: string, options: { label: string; value: string | number; }[], defaultValue?: (string | number)[], description?: string): PluginConfigItem {
    return { key, type: 'multi-select', label, options, default: defaultValue, description };
  }
  static html (content: string): PluginConfigItem {
    return { key: `_html_${Math.random().toString(36).slice(2)}`, type: 'html', label: '', default: content };
  }
  static plainText (content: string): PluginConfigItem {
    return { key: `_text_${Math.random().toString(36).slice(2)}`, type: 'text', label: '', default: content };
  }
  static combine (...items: PluginConfigItem[]): PluginConfigSchema {
    return items;
  }
}

export type PluginConfigSchema = PluginConfigItem[];

/**
 * 插件日志接口 - 简化的日志 API
 */
export interface PluginLogger {
  /** 普通日志 */
  log (...args: any[]): void;
  /** 调试日志 */
  debug (...args: any[]): void;
  /** 信息日志 */
  info (...args: any[]): void;
  /** 警告日志 */
  warn (...args: any[]): void;
  /** 错误日志 */
  error (...args: any[]): void;
}

export interface NapCatPluginContext {
  core: NapCatCore;
  oneBot: NapCatOneBot11Adapter;
  actions: ActionMap;
  pluginName: string;
  pluginPath: string;
  configPath: string;
  dataPath: string;
  NapCatConfig: typeof NapCatConfig;
  adapterName: string;
  pluginManager: OB11PluginMangerAdapter;
  /** 插件日志器 - 自动添加插件名称前缀 */
  logger: PluginLogger;
}

export interface PluginModule<T extends OB11EmitEventContent = OB11EmitEventContent> {
  plugin_init: (ctx: NapCatPluginContext) => void | Promise<void>;
  plugin_onmessage?: (
    ctx: NapCatPluginContext,
    event: OB11Message,
  ) => void | Promise<void>;
  plugin_onevent?: (
    ctx: NapCatPluginContext,
    event: T,
  ) => void | Promise<void>;
  plugin_cleanup?: (
    ctx: NapCatPluginContext
  ) => void | Promise<void>;
  plugin_config_schema?: PluginConfigSchema;
  plugin_config_ui?: PluginConfigSchema;
  plugin_get_config?: (ctx: NapCatPluginContext) => any | Promise<any>;
  plugin_set_config?: (ctx: NapCatPluginContext, config: any) => void | Promise<void>;
}

export interface LoadedPlugin {
  name: string;
  fileId: string; // 文件系统目录名，用于路径解析
  version?: string;
  pluginPath: string;
  entryPath: string;
  packageJson?: PluginPackageJson;
  module: PluginModule;
  context: NapCatPluginContext; // Store context
}

export interface PluginStatusConfig {
  [key: string]: boolean; // key: pluginName, value: enabled
}

export class OB11PluginMangerAdapter extends IOB11NetworkAdapter<PluginConfig> {
  private readonly pluginPath: string;
  private readonly configPath: string;
  /** 插件注册表: 包名(id) -> 插件数据 */
  private pluginRegistry: Map<string, LoadedPlugin> = new Map();
  /** 失败的插件: ID -> 错误信息 */
  private failedPlugins: Map<string, string> = new Map();
  declare config: PluginConfig;
  public NapCatConfig = NapCatConfig;

  override get isActive (): boolean {
    return this.isEnable && this.pluginRegistry.size > 0;
  }

  constructor (
    name: string,
    core: NapCatCore,
    obContext: NapCatOneBot11Adapter,
    actions: ActionMap
  ) {
    const config = {
      name,
      messagePostFormat: 'array',
      reportSelfMessage: true,
      enable: true,
      debug: true,
    };
    super(name, config, core, obContext, actions);
    this.pluginPath = this.core.context.pathWrapper.pluginPath;
    this.configPath = path.join(this.core.context.pathWrapper.configPath, 'plugins.json');
  }

  private loadPluginConfig (): PluginStatusConfig {
    if (fs.existsSync(this.configPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
      } catch (e) {
        this.logger.logWarn('[Plugin Adapter] Error parsing plugins.json', e);
      }
    }
    return {};
  }

  private savePluginConfig (config: PluginStatusConfig) {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (e) {
      this.logger.logError('[Plugin Adapter] Error saving plugins.json', e);
    }
  }

  /**
   * 扫描并加载插件
   */
  private async loadPlugins (): Promise<void> {
    try {
      // 确保插件目录存在
      if (!fs.existsSync(this.pluginPath)) {
        this.logger.logWarn(
          `[Plugin Adapter] Plugin directory does not exist: ${this.pluginPath}`
        );
        fs.mkdirSync(this.pluginPath, { recursive: true });
        return;
      }

      const items = fs.readdirSync(this.pluginPath, { withFileTypes: true });
      const pluginConfig = this.loadPluginConfig();

      // 扫描文件和目录 (Only support directories as plugins now)
      for (const item of items) {
        if (!item.isDirectory()) {
          continue;
        }

        // 先读取 package.json 获取包名(id)
        const packageJsonPath = path.join(this.pluginPath, item.name, 'package.json');
        let pluginId = item.name; // 默认使用目录名
        if (fs.existsSync(packageJsonPath)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            if (pkg.name) {
              pluginId = pkg.name;
            }
          } catch (e) { }
        }

        // Check if plugin is disabled in config (by id)
        if (pluginConfig[pluginId] === false) {
          this.logger.log(`[Plugin Adapter] Plugin ${pluginId} is disabled in config, skipping`);
          continue;
        }

        // 处理目录插件
        await this.loadDirectoryPlugin(item.name);
      }

      this.logger.log(
        `[Plugin Adapter] Loaded ${this.pluginRegistry.size} plugins`
      );
    } catch (error) {
      this.logger.logError('[Plugin Adapter] Error loading plugins:', error);
    }
  }

  // loadFilePlugin removed

  /**
   * 加载目录插件
   */
  public async loadDirectoryPlugin (dirname: string): Promise<void> {
    const pluginDir = path.join(this.pluginPath, dirname);

    try {
      // 尝试读取 package.json
      let packageJson: PluginPackageJson | undefined;
      const packageJsonPath = path.join(pluginDir, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageContent = fs.readFileSync(packageJsonPath, 'utf-8');
          packageJson = JSON.parse(packageContent);
        } catch (error) {
          this.logger.logWarn(
            `[Plugin Adapter] Invalid package.json in ${dirname}:`,
            error
          );
        }
      }

      // 获取插件 id（包名）
      const pluginId = packageJson?.name || dirname;

      // 检查插件是否被禁用 (by id)
      const pluginConfig = this.loadPluginConfig();
      if (pluginConfig[pluginId] === false) {
        this.logger.log(`[Plugin Adapter] Plugin ${pluginId} is disabled by user`);
        return;
      }

      // 确定入口文件
      const entryFile = this.findEntryFile(pluginDir, packageJson);
      if (!entryFile) {
        this.logger.logWarn(
          `[Plugin Adapter] No valid entry file found for plugin directory: ${dirname}`
        );
        return;
      }

      const entryPath = path.join(pluginDir, entryFile);
      const module = await this.importModule(entryPath);

      if (!this.isValidPluginModule(module)) {
        this.logger.logWarn(
          `[Plugin Adapter] Directory ${dirname} does not contain a valid plugin`
        );
        return;
      }

      const plugin: LoadedPlugin = {
        name: pluginId, // 使用包名作为 id
        fileId: dirname, // 保留目录名用于路径解析
        version: packageJson?.version,
        pluginPath: pluginDir,
        entryPath,
        packageJson,
        module,
        context: {} as NapCatPluginContext // Will be populated in registerPlugin
      };

      await this.registerPlugin(plugin);
    } catch (error) {
      this.logger.logError(
        `[Plugin Adapter] Error loading directory plugin ${dirname}:`,
        error
      );
    }
  }

  /**
   * 查找插件目录的入口文件
   */
  private findEntryFile (
    pluginDir: string,
    packageJson?: PluginPackageJson
  ): string | null {
    // 优先级：package.json main > 默认文件名
    const possibleEntries = [
      packageJson?.main,
      'index.mjs',
      'index.js',
      'main.mjs',
      'main.js',
    ].filter(Boolean) as string[];

    for (const entry of possibleEntries) {
      const entryPath = path.join(pluginDir, entry);
      if (fs.existsSync(entryPath) && fs.statSync(entryPath).isFile()) {
        return entry;
      }
    }

    return null;
  }



  /**
   * 动态导入模块
   */
  private async importModule (filePath: string): Promise<any> {
    const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;
    // Add timestamp to force reload cache if supported or just import
    // Note: dynamic import caching is tricky in ESM. Adding query param might help?
    const fileUrlWithQuery = `${fileUrl}?t=${Date.now()}`;
    return await import(fileUrlWithQuery);
  }

  /**
   * 检查模块是否为有效的插件模块
   */
  private isValidPluginModule (module: any): module is PluginModule {
    return module && typeof module.plugin_init === 'function';
  }

  /**
   * 注册插件
   */
  private async registerPlugin (plugin: LoadedPlugin): Promise<void> {
    // 检查名称冲突
    if (this.pluginRegistry.has(plugin.name)) {
      this.logger.logWarn(
        `[Plugin Adapter] Plugin name conflict: ${plugin.name}, skipping...`
      );
      return;
    }

    // Create Context
    const dataPath = path.join(plugin.pluginPath, 'data');
    const configPath = path.join(dataPath, 'config.json');

    // Create plugin-specific logger with prefix
    const pluginPrefix = `[Plugin: ${plugin.name}]`;
    const coreLogger = this.logger;
    const pluginLogger: PluginLogger = {
      log: (...args: any[]) => coreLogger.log(pluginPrefix, ...args),
      debug: (...args: any[]) => coreLogger.logDebug(pluginPrefix, ...args),
      info: (...args: any[]) => coreLogger.log(pluginPrefix, ...args),
      warn: (...args: any[]) => coreLogger.logWarn(pluginPrefix, ...args),
      error: (...args: any[]) => coreLogger.logError(pluginPrefix, ...args),
    };

    const context: NapCatPluginContext = {
      core: this.core,
      oneBot: this.obContext,
      actions: this.actions,
      pluginName: plugin.name, // Use package name for identification
      pluginPath: plugin.pluginPath,
      dataPath: dataPath,
      configPath: configPath,
      NapCatConfig: NapCatConfig,
      adapterName: this.name,
      pluginManager: this,
      logger: pluginLogger
    };

    plugin.context = context; // Store context on plugin object

    // 注册到映射表
    this.pluginRegistry.set(plugin.name, plugin);

    this.logger.log(
      `[Plugin Adapter] Registered plugin: ${plugin.name}${plugin.version ? ` v${plugin.version}` : ''
      }`
    );

    // 调用插件初始化方法（必须存在）
    try {
      await plugin.module.plugin_init(context);
      this.logger.log(`[Plugin Adapter] Initialized plugin: ${plugin.name}`);
    } catch (error: any) {
      this.logger.logError(
        `[Plugin Adapter] Error initializing plugin ${plugin.name}:`,
        error
      );
      // Mark as failed
      this.failedPlugins.set(plugin.name, error.message || 'Initialization failed');
      this.pluginRegistry.delete(plugin.name);
    }
  }

  /**
   * 卸载插件
   */
  private async unloadPlugin (pluginName: string): Promise<void> {
    const plugin = this.pluginRegistry.get(pluginName);
    if (!plugin) {
      return;
    }

    // 调用插件清理方法
    if (typeof plugin.module.plugin_cleanup === 'function') {
      try {
        await plugin.module.plugin_cleanup(plugin.context);
        this.logger.log(`[Plugin Adapter] Cleaned up plugin: ${pluginName}`);
      } catch (error) {
        this.logger.logError(
          `[Plugin Adapter] Error cleaning up plugin ${pluginName}:`,
          error
        );
      }
    }

    // 从映射表中移除
    this.pluginRegistry.delete(pluginName);
    this.logger.log(`[Plugin Adapter] Unloaded plugin: ${pluginName}`);
  }

  public async unregisterPlugin (pluginName: string): Promise<void> {
    return this.unloadPlugin(pluginName);
  }

  public getPluginPath (): string {
    return this.pluginPath;
  }

  public getPluginConfig (): PluginStatusConfig {
    return this.loadPluginConfig();
  }

  /**
   * 设置插件状态（启用/禁用）
   * @param pluginId 插件包名(id)
   * @param enable 是否启用
   */
  public setPluginStatus (pluginId: string, enable: boolean): void {
    const config = this.loadPluginConfig();
    config[pluginId] = enable;
    this.savePluginConfig(config);

    // 如果禁用且插件已加载，则卸载
    if (!enable) {
      const plugin = this.pluginRegistry.get(pluginId);
      if (plugin) {
        this.unloadPlugin(pluginId).catch(e => this.logger.logError('Error unloading', e));
      }
    }
  }

  async onEvent<T extends OB11EmitEventContent> (event: T) {
    if (!this.isEnable) {
      return;
    }

    try {
      await Promise.allSettled(
        Array.from(this.pluginRegistry.values()).map((plugin) =>
          this.callPluginEventHandler(plugin, event)
        )
      );
    } catch (error) {
      this.logger.logError('[Plugin Adapter] Error handling event:', error);
    }
  }

  /**
   * 调用插件的事件处理方法
   */
  private async callPluginEventHandler (
    plugin: LoadedPlugin,
    event: OB11EmitEventContent
  ): Promise<void> {
    try {
      // 优先使用 plugin_onevent 方法
      if (typeof plugin.module.plugin_onevent === 'function') {
        await plugin.module.plugin_onevent(
          plugin.context,
          event
        );
      }

      // 如果是消息事件并且插件有 plugin_onmessage 方法，也调用
      if (
        (event as any).message_type &&
        typeof plugin.module.plugin_onmessage === 'function'
      ) {
        await plugin.module.plugin_onmessage(
          plugin.context,
          event as OB11Message
        );
      }
    } catch (error) {
      this.logger.logError(
        `[Plugin Adapter] Error calling plugin ${plugin.name} event handler:`,
        error
      );
    }
  }

  async open () {
    if (this.isEnable) {
      return;
    }

    this.logger.log('[Plugin Adapter] Opening plugin adapter...');
    this.isEnable = true;

    // 加载所有插件
    await this.loadPlugins();

    this.logger.log(
      `[Plugin Adapter] Plugin adapter opened with ${this.pluginRegistry.size} plugins loaded`
    );
  }

  async close () {
    if (!this.isEnable) {
      return;
    }

    this.logger.log('[Plugin Adapter] Closing plugin adapter...');
    this.isEnable = false;

    // 卸载所有插件
    const pluginNames = Array.from(this.pluginRegistry.keys());
    for (const pluginName of pluginNames) {
      await this.unloadPlugin(pluginName);
    }

    this.logger.log('[Plugin Adapter] Plugin adapter closed');
  }

  async reload () {
    this.logger.log('[Plugin Adapter] Reloading plugin adapter...');

    // 先关闭然后重新打开
    await this.close();
    await this.open();

    this.logger.log('[Plugin Adapter] Plugin adapter reloaded');
    return OB11NetworkReloadType.Normal;
  }

  /**
   * 获取已加载的插件列表
   */
  public getLoadedPlugins (): LoadedPlugin[] {
    return Array.from(this.pluginRegistry.values());
  }

  /**
   * 通过包名(id)获取插件信息
   */
  public getPluginInfo (pluginId: string): LoadedPlugin | undefined {
    return this.pluginRegistry.get(pluginId);
  }

  /**
   * 通过 id 加载插件
   */
  public async loadPluginById (id: string): Promise<boolean> {
    // 扫描文件系统查找 fileId
    if (!fs.existsSync(this.pluginPath)) {
      this.logger.logWarn(`[Plugin Adapter] Plugin ${id} not found in filesystem`);
      return false;
    }

    const items = fs.readdirSync(this.pluginPath, { withFileTypes: true });
    for (const item of items) {
      if (!item.isDirectory()) continue;

      const packageJsonPath = path.join(this.pluginPath, item.name, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          if (pkg.name === id) {
            await this.loadDirectoryPlugin(item.name);
            return this.pluginRegistry.has(id);
          }
        } catch (e) { }
      }
    }

    this.logger.logWarn(`[Plugin Adapter] Plugin ${id} not found in filesystem`);
    return false;
  }

  /**
   * 卸载并删除插件
   */
  public async uninstallPlugin (id: string, cleanData: boolean = false): Promise<void> {
    const plugin = this.pluginRegistry.get(id);
    if (!plugin) {
      throw new Error(`Plugin ${id} not found or not loaded`);
    }

    const pluginPath = plugin.context.pluginPath;
    const dataPath = plugin.context.dataPath;

    // 先卸载插件
    await this.unloadPlugin(id);

    // 删除插件目录
    if (fs.existsSync(pluginPath)) {
      fs.rmSync(pluginPath, { recursive: true, force: true });
    }

    // 清理数据
    if (cleanData && fs.existsSync(dataPath)) {
      fs.rmSync(dataPath, { recursive: true, force: true });
    }
  }

  /**
   * 重载指定插件
   */
  public async reloadPlugin (pluginId: string): Promise<boolean> {
    const plugin = this.pluginRegistry.get(pluginId);
    if (!plugin) {
      this.logger.logWarn(`[Plugin Adapter] Plugin ${pluginId} not found`);
      return false;
    }

    const dirname = path.basename(plugin.pluginPath);

    try {
      // 卸载插件
      await this.unloadPlugin(pluginId);

      // 重新加载插件
      await this.loadDirectoryPlugin(dirname);

      this.logger.log(
        `[Plugin Adapter] Plugin ${pluginId} reloaded successfully`
      );
      return true;
    } catch (error) {
      this.logger.logError(
        `[Plugin Adapter] Error reloading plugin ${pluginId}:`,
        error
      );
      return false;
    }
  }

  /**
   * 获取插件数据目录路径
   */
  public getPluginDataPath (pluginId: string): string {
    const plugin = this.pluginRegistry.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    return plugin.context.dataPath;
  }

  /**
   * 获取插件配置文件路径
   */
  public getPluginConfigPath (pluginId: string): string {
    return path.join(this.getPluginDataPath(pluginId), 'config.json');
  }
}
