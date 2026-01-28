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

export interface PluginModule<T extends OB11EmitEventContent = OB11EmitEventContent> {
  plugin_init: (
    core: NapCatCore,
    obContext: NapCatOneBot11Adapter,
    actions: ActionMap,
    instance: OB11PluginMangerAdapter
  ) => void | Promise<void>;
  plugin_onmessage?: (
    adapter: string,
    core: NapCatCore,
    obCtx: NapCatOneBot11Adapter,
    event: OB11Message,
    actions: ActionMap,
    instance: OB11PluginMangerAdapter
  ) => void | Promise<void>;
  plugin_onevent?: (
    adapter: string,
    core: NapCatCore,
    obCtx: NapCatOneBot11Adapter,
    event: T,
    actions: ActionMap,
    instance: OB11PluginMangerAdapter
  ) => void | Promise<void>;
  plugin_cleanup?: (
    core: NapCatCore,
    obContext: NapCatOneBot11Adapter,
    actions: ActionMap,
    instance: OB11PluginMangerAdapter
  ) => void | Promise<void>;
  plugin_config_schema?: PluginConfigSchema;
  plugin_config_ui?: PluginConfigSchema;
  plugin_get_config?: () => any | Promise<any>;
  plugin_set_config?: (config: any) => void | Promise<void>;
}

export interface LoadedPlugin {
  name: string;
  version?: string;
  pluginPath: string;
  entryPath: string;
  packageJson?: PluginPackageJson;
  module: PluginModule;
}

export interface PluginStatusConfig {
  [key: string]: boolean; // key: pluginName, value: enabled
}

export class OB11PluginMangerAdapter extends IOB11NetworkAdapter<PluginConfig> {
  private readonly pluginPath: string;
  private readonly configPath: string;
  private loadedPlugins: Map<string, LoadedPlugin> = new Map();
  declare config: PluginConfig;
  public NapCatConfig = NapCatConfig;

  override get isActive (): boolean {
    return this.isEnable && this.loadedPlugins.size > 0;
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

        const pluginId = item.name;

        // Check if plugin is disabled in config
        if (pluginConfig[pluginId] === false) {
          this.logger.log(`[Plugin Adapter] Plugin ${pluginId} is disabled in config, skipping`);
          continue;
        }

        // 处理目录插件
        await this.loadDirectoryPlugin(item.name);
      }

      this.logger.log(
        `[Plugin Adapter] Loaded ${this.loadedPlugins.size} plugins`
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
    const pluginConfig = this.loadPluginConfig();
    const pluginId = dirname; // Use directory name as unique ID

    if (pluginConfig[pluginId] === false) {
      this.logger.log(`[Plugin Adapter] Plugin ${pluginId} is disabled by user`);
      return;
    }

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
        name: pluginId, // Use Directory Name as Internal Plugin Name/ID
        version: packageJson?.version,
        pluginPath: pluginDir,
        entryPath,
        packageJson,
        module,
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
    if (this.loadedPlugins.has(plugin.name)) {
      this.logger.logWarn(
        `[Plugin Adapter] Plugin name conflict: ${plugin.name}, skipping...`
      );
      return;
    }

    this.loadedPlugins.set(plugin.name, plugin);
    this.logger.log(
      `[Plugin Adapter] Registered plugin: ${plugin.name}${plugin.version ? ` v${plugin.version}` : ''
      }`
    );

    // 调用插件初始化方法（必须存在）
    try {
      await plugin.module.plugin_init(
        this.core,
        this.obContext,
        this.actions,
        this
      );
      this.logger.log(`[Plugin Adapter] Initialized plugin: ${plugin.name}`);
    } catch (error) {
      this.logger.logError(
        `[Plugin Adapter] Error initializing plugin ${plugin.name}:`,
        error
      );
    }
  }

  /**
   * 卸载插件
   */
  private async unloadPlugin (pluginName: string): Promise<void> {
    const plugin = this.loadedPlugins.get(pluginName);
    if (!plugin) {
      return;
    }

    // 调用插件清理方法
    if (typeof plugin.module.plugin_cleanup === 'function') {
      try {
        await plugin.module.plugin_cleanup(
          this.core,
          this.obContext,
          this.actions,
          this
        );
        this.logger.log(`[Plugin Adapter] Cleaned up plugin: ${pluginName}`);
      } catch (error) {
        this.logger.logError(
          `[Plugin Adapter] Error cleaning up plugin ${pluginName}:`,
          error
        );
      }
    }

    this.loadedPlugins.delete(pluginName);
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

  public setPluginStatus (pluginName: string, enable: boolean): void {
    const config = this.loadPluginConfig();
    config[pluginName] = enable;
    this.savePluginConfig(config);

    // If disabling, unload immediately if loaded
    if (!enable) {
      // Note: pluginName passed here might be the package name or the filename/dirname
      // But our registerPlugin uses plugin.name which comes from package.json or dirname.
      // This mismatch is tricky. 
      // Ideally, we should use a consistent ID. 
      // Let's assume pluginName passed here effectively matches the ID used in loadedPlugins.
      // But wait, loadDirectoryPlugin logic: name = packageJson.name || dirname.
      // config key = dirname.
      // If packageJson.name != dirname, we have a problem.
      // To fix this properly: 
      // 1. We need to know which LoadedPlugin corresponds to the enabled/disabled item.
      // 2. Or we iterate loadedPlugins and find match.

      for (const [_, loaded] of this.loadedPlugins.entries()) {
        const dirOrFile = path.basename(loaded.pluginPath === this.pluginPath ? loaded.entryPath : loaded.pluginPath);
        const ext = path.extname(dirOrFile);
        const simpleName = ext ? path.parse(dirOrFile).name : dirOrFile; // filename without ext

        // But wait, config key is the FILENAME (with ext for files?). 
        // In Scan loop: 
        // pluginName = path.parse(item.name).name (for file)
        // pluginName = item.name (for dir)
        // config[pluginName] check.

        // So if file is "test.js", pluginName is "test". Config key "test".
        // If dir is "test-plugin", pluginName is "test-plugin". Config key "test-plugin".

        // loadedPlugin.name might be distinct.
        // So we need to match loadedPlugin back to its fs source to unload it?

        // loadedPlugin.entryPath or pluginPath helps.
        // If it's a file plugin: loaded.entryPath ends with pluginName + ext.
        // If it's a dir plugin: loaded.pluginPath ends with pluginName.

        if (pluginName === simpleName) {
          this.unloadPlugin(loaded.name).catch(e => this.logger.logError('Error unloading', e));
        }
      }
    }
    // If enabling, we need to load it. 
    // But we can just rely on the API handler to call loadFile/DirectoryPlugin which now checks config.
    // Wait, if I call loadFilePlugin("test.js") and config says enable=true, it loads.
    // API handler needs to change to pass filename/dirname.
  }

  async onEvent<T extends OB11EmitEventContent> (event: T) {
    if (!this.isEnable) {
      return;
    }

    // 遍历所有已加载的插件，调用它们的事件处理方法
    try {
      await Promise.allSettled(
        Array.from(this.loadedPlugins.values()).map((plugin) =>
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
          this.name,
          this.core,
          this.obContext,
          event,
          this.actions,
          this
        );
      }

      // 如果是消息事件并且插件有 plugin_onmessage 方法，也调用
      if (
        (event as any).message_type &&
        typeof plugin.module.plugin_onmessage === 'function'
      ) {
        await plugin.module.plugin_onmessage(
          this.name,
          this.core,
          this.obContext,
          event as OB11Message,
          this.actions,
          this
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
      `[Plugin Adapter] Plugin adapter opened with ${this.loadedPlugins.size} plugins loaded`
    );
  }

  async close () {
    if (!this.isEnable) {
      return;
    }

    this.logger.log('[Plugin Adapter] Closing plugin adapter...');
    this.isEnable = false;

    // 卸载所有插件
    const pluginNames = Array.from(this.loadedPlugins.keys());
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
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * 获取插件信息
   */
  public getPluginInfo (pluginName: string): LoadedPlugin | undefined {
    return this.loadedPlugins.get(pluginName);
  }

  /**
   * 重载指定插件
   */
  public async reloadPlugin (pluginName: string): Promise<boolean> {
    const plugin = this.loadedPlugins.get(pluginName);
    if (!plugin) {
      this.logger.logWarn(`[Plugin Adapter] Plugin ${pluginName} not found`);
      return false;
    }

    try {
      // 卸载插件
      await this.unloadPlugin(pluginName);

      // 重新加载插件
      // We assume pluginName IS the directory name (the ID)
      await this.loadDirectoryPlugin(pluginName);

      this.logger.log(
        `[Plugin Adapter] Plugin ${pluginName} reloaded successfully`
      );
      return true;
    } catch (error) {
      this.logger.logError(
        `[Plugin Adapter] Error reloading plugin ${pluginName}:`,
        error
      );
      return false;
    }
  }
  public getPluginDataPath (pluginName: string): string {
    return path.join(this.pluginPath, pluginName, 'data');
  }

  public getPluginConfigPath (pluginName: string): string {
    return path.join(this.getPluginDataPath(pluginName), 'config.json');
  }
}
