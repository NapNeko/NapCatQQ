import fs from 'fs';
import path from 'path';
import { ActionMap } from '@/napcat-onebot/action';
import { NapCatCore } from 'napcat-core';
import { NapCatOneBot11Adapter, OB11Message } from '@/napcat-onebot/index';
import { OB11EmitEventContent, OB11NetworkReloadType } from '@/napcat-onebot/network/index';
import { IOB11NetworkAdapter } from '@/napcat-onebot/network/adapter';
import { PluginConfig } from '@/napcat-onebot/config/config';
import { NapCatConfig } from './config';
import { PluginLoader } from './loader';
import { PluginRouterRegistryImpl } from './router-registry';
import {
  PluginEntry,
  PluginLogger,
  PluginStatusConfig,
  NapCatPluginContext,
  IPluginManager,
} from './types';

export class OB11PluginManager extends IOB11NetworkAdapter<PluginConfig> implements IPluginManager {
  private readonly pluginPath: string;
  private readonly configPath: string;
  private readonly loader: PluginLoader;

  /** 插件注册表: ID -> 插件条目 */
  private plugins: Map<string, PluginEntry> = new Map();

  /** 插件路由注册表: pluginId -> PluginRouterRegistry */
  private pluginRouters: Map<string, PluginRouterRegistryImpl> = new Map();

  declare config: PluginConfig;
  public NapCatConfig = NapCatConfig;

  override get isActive (): boolean {
    return this.isEnable && this.getLoadedPlugins().length > 0;
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
    this.loader = new PluginLoader(this.pluginPath, this.configPath, this.logger);
  }

  // ==================== 插件状态配置 ====================

  public getPluginConfig (): PluginStatusConfig {
    return this.loader.loadPluginStatusConfig();
  }

  private savePluginConfig (config: PluginStatusConfig): void {
    this.loader.savePluginStatusConfig(config);
  }

  // ==================== 插件扫描与加载 ====================

  /**
   * 扫描并加载所有插件
   */
  private async scanAndLoadPlugins (): Promise<void> {
    // 扫描所有插件目录
    const entries = await this.loader.scanPlugins();

    // 清空现有注册表
    this.plugins.clear();

    // 注册所有插件条目
    for (const entry of entries) {
      this.plugins.set(entry.id, entry);
    }

    this.logger.log(`[PluginManager] Scanned ${this.plugins.size} plugins`);

    // 加载启用的插件
    for (const entry of this.plugins.values()) {
      if (entry.enable && entry.runtime.status !== 'error') {
        await this.loadPlugin(entry);
      }
    }

    const loadedCount = this.getLoadedPlugins().length;
    this.logger.log(`[PluginManager] Loaded ${loadedCount} plugins`);
  }

  /**
   * 加载单个插件
   */
  private async loadPlugin (entry: PluginEntry): Promise<boolean> {
    if (entry.loaded) {
      return true;
    }

    if (entry.runtime.status === 'error') {
      return false;
    }

    // 加载模块
    const module = await this.loader.loadPluginModule(entry);
    if (!module) {
      return false;
    }

    // 创建上下文
    const context = this.createPluginContext(entry);

    // 初始化插件
    try {
      await module.plugin_init(context);

      entry.loaded = true;
      entry.runtime = {
        status: 'loaded',
        module,
        context,
      };

      this.logger.log(`[PluginManager] Initialized plugin: ${entry.id}${entry.version ? ` v${entry.version}` : ''}`);
      return true;
    } catch (error: any) {
      entry.loaded = false;
      entry.runtime = {
        status: 'error',
        error: error.message || 'Initialization failed',
      };

      this.logger.logError(`[PluginManager] Error initializing plugin ${entry.id}:`, error);
      return false;
    }
  }

  /**
   * 卸载单个插件
   */
  private async unloadPlugin (entry: PluginEntry): Promise<void> {
    if (!entry.loaded || entry.runtime.status !== 'loaded') {
      return;
    }

    const { module, context } = entry.runtime;

    // 调用清理方法
    if (module && context && typeof module.plugin_cleanup === 'function') {
      try {
        await module.plugin_cleanup(context);
        this.logger.log(`[PluginManager] Cleaned up plugin: ${entry.id}`);
      } catch (error) {
        this.logger.logError(`[PluginManager] Error cleaning up plugin ${entry.id}:`, error);
      }
    }

    // 重置状态
    entry.loaded = false;
    entry.runtime = {
      status: 'unloaded',
    };

    this.logger.log(`[PluginManager] Unloaded plugin: ${entry.id}`);
  }

  /**
   * 创建插件上下文
   */
  private createPluginContext (entry: PluginEntry): NapCatPluginContext {
    const dataPath = path.join(this.core.context.pathWrapper.configPath, 'plugins', entry.id);
    const configPath = path.join(dataPath, 'config.json');

    // 确保插件配置目录存在
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }

    // 创建插件专用日志器
    const pluginPrefix = `[Plugin: ${entry.id}]`;
    const coreLogger = this.logger;
    const pluginLogger: PluginLogger = {
      log: (...args: any[]) => coreLogger.log(pluginPrefix, ...args),
      debug: (...args: any[]) => coreLogger.logDebug(pluginPrefix, ...args),
      info: (...args: any[]) => coreLogger.log(pluginPrefix, ...args),
      warn: (...args: any[]) => coreLogger.logWarn(pluginPrefix, ...args),
      error: (...args: any[]) => coreLogger.logError(pluginPrefix, ...args),
    };

    // 创建或获取插件路由注册器
    let router = this.pluginRouters.get(entry.id);
    if (!router) {
      router = new PluginRouterRegistryImpl(entry.id, entry.pluginPath);
      this.pluginRouters.set(entry.id, router);
    }

    // 创建获取其他插件导出的方法
    const getPluginExports = <T = any> (pluginId: string): T | undefined => {
      const targetEntry = this.plugins.get(pluginId);
      if (!targetEntry || !targetEntry.loaded || targetEntry.runtime.status !== 'loaded') {
        return undefined;
      }
      return targetEntry.runtime.module as T;
    };

    return {
      core: this.core,
      oneBot: this.obContext,
      actions: this.actions,
      pluginName: entry.id,
      pluginPath: entry.pluginPath,
      dataPath,
      configPath,
      NapCatConfig,
      adapterName: this.name,
      pluginManager: this,
      logger: pluginLogger,
      router,
      getPluginExports,
    };
  }

  // ==================== 公共 API ====================

  /**
   * 获取插件目录路径
   */
  public getPluginPath (): string {
    return this.pluginPath;
  }

  /**
   * 获取所有插件条目
   */
  public getAllPlugins (): PluginEntry[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取已加载的插件列表
   */
  public getLoadedPlugins (): PluginEntry[] {
    return Array.from(this.plugins.values()).filter(p => p.loaded);
  }

  /**
   * 通过 ID 获取插件信息
   */
  public getPluginInfo (pluginId: string): PluginEntry | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 设置插件状态（启用/禁用）
   */
  public async setPluginStatus (pluginId: string, enable: boolean): Promise<void> {
    const config = this.getPluginConfig();
    config[pluginId] = enable;
    this.savePluginConfig(config);

    const entry = this.plugins.get(pluginId);
    if (entry) {
      entry.enable = enable;

      if (enable && !entry.loaded) {
        // 启用插件
        await this.loadPlugin(entry);
      } else if (!enable && entry.loaded) {
        // 禁用插件
        await this.unloadPlugin(entry);
      }
    }
  }

  /**
   * 通过 ID 加载插件
   */
  public async loadPluginById (pluginId: string): Promise<boolean> {
    let entry = this.plugins.get(pluginId);

    if (!entry) {
      // 尝试查找并扫描
      const dirname = this.loader.findPluginDirById(pluginId);
      if (!dirname) {
        this.logger.logWarn(`[PluginManager] Plugin ${pluginId} not found in filesystem`);
        return false;
      }

      const newEntry = this.loader.rescanPlugin(dirname);
      if (!newEntry) {
        return false;
      }

      this.plugins.set(newEntry.id, newEntry);
      entry = newEntry;
    }

    if (!entry.enable) {
      this.logger.log(`[PluginManager] Skipping loading disabled plugin: ${pluginId}`);
      return false;
    }

    return await this.loadPlugin(entry);
  }

  /**
   * 卸载插件（仅从内存卸载）
   */
  public async unregisterPlugin (pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (entry) {
      await this.unloadPlugin(entry);
    }
  }

  /**
   * 卸载并删除插件
   */
  public async uninstallPlugin (pluginId: string, cleanData: boolean = false): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const pluginPath = entry.pluginPath;
    const dataPath = path.join(this.core.context.pathWrapper.configPath, 'plugins', pluginId);

    // 先卸载插件
    await this.unloadPlugin(entry);

    // 从注册表移除
    this.plugins.delete(pluginId);

    // 删除插件目录
    if (fs.existsSync(pluginPath)) {
      fs.rmSync(pluginPath, { recursive: true, force: true });
    }

    // 清理插件配置数据
    if (cleanData && fs.existsSync(dataPath)) {
      fs.rmSync(dataPath, { recursive: true, force: true });
    }
  }

  /**
   * 重载指定插件
   */
  public async reloadPlugin (pluginId: string): Promise<boolean> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      this.logger.logWarn(`[PluginManager] Plugin ${pluginId} not found`);
      return false;
    }

    try {
      // 卸载插件
      await this.unloadPlugin(entry);

      // 重新扫描
      const newEntry = this.loader.rescanPlugin(entry.fileId);
      if (!newEntry) {
        return false;
      }

      // 更新注册表
      this.plugins.set(newEntry.id, newEntry);

      // 重新加载
      if (newEntry.enable) {
        await this.loadPlugin(newEntry);
      }

      this.logger.log(`[PluginManager] Plugin ${pluginId} reloaded successfully`);
      return true;
    } catch (error) {
      this.logger.logError(`[PluginManager] Error reloading plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * 加载目录插件（用于新安装的插件）
   */
  public async loadDirectoryPlugin (dirname: string): Promise<void> {
    const entry = this.loader.rescanPlugin(dirname);
    if (!entry) {
      return;
    }

    // 检查是否已存在
    if (this.plugins.has(entry.id)) {
      this.logger.logWarn(`[PluginManager] Plugin ${entry.id} already exists`);
      return;
    }

    this.plugins.set(entry.id, entry);

    if (entry.enable && entry.runtime.status !== 'error') {
      await this.loadPlugin(entry);
    }
  }

  /**
   * 获取插件数据目录路径
   */
  public getPluginDataPath (pluginId: string): string {
    return path.join(this.core.context.pathWrapper.configPath, 'plugins', pluginId);
  }

  /**
   * 获取插件配置文件路径
   */
  public getPluginConfigPath (pluginId: string): string {
    return path.join(this.getPluginDataPath(pluginId), 'config.json');
  }

  /**
   * 获取插件路由注册器
   */
  public getPluginRouter (pluginId: string): PluginRouterRegistryImpl | undefined {
    return this.pluginRouters.get(pluginId);
  }

  /**
   * 获取所有插件路由注册器
   */
  public getAllPluginRouters (): Map<string, PluginRouterRegistryImpl> {
    return this.pluginRouters;
  }

  // ==================== 事件处理 ====================

  async onEvent<T extends OB11EmitEventContent> (event: T): Promise<void> {
    if (!this.isEnable) {
      return;
    }

    try {
      await Promise.allSettled(
        this.getLoadedPlugins().map((entry) =>
          this.callPluginEventHandler(entry, event)
        )
      );
    } catch (error) {
      this.logger.logError('[PluginManager] Error handling event:', error);
    }
  }

  /**
   * 调用插件的事件处理方法
   */
  private async callPluginEventHandler (
    entry: PluginEntry,
    event: OB11EmitEventContent
  ): Promise<void> {
    if (entry.runtime.status !== 'loaded' || !entry.runtime.module || !entry.runtime.context) {
      return;
    }

    const { module, context } = entry.runtime;

    try {
      // 优先使用 plugin_onevent 方法
      if (typeof module.plugin_onevent === 'function') {
        await module.plugin_onevent(context, event);
      }

      // 如果是消息事件并且插件有 plugin_onmessage 方法，也调用
      if (
        (event as any).message_type &&
        typeof module.plugin_onmessage === 'function'
      ) {
        await module.plugin_onmessage(context, event as OB11Message);
      }
    } catch (error) {
      this.logger.logError(`[PluginManager] Error calling plugin ${entry.id} event handler:`, error);
    }
  }

  // ==================== 生命周期 ====================

  async open (): Promise<void> {
    if (this.isEnable) {
      return;
    }

    this.logger.log('[PluginManager] Opening plugin manager...');
    this.isEnable = true;

    // 扫描并加载所有插件
    await this.scanAndLoadPlugins();

    this.logger.log(`[PluginManager] Plugin manager opened with ${this.getLoadedPlugins().length} plugins loaded`);
  }

  async close (): Promise<void> {
    if (!this.isEnable) {
      return;
    }

    this.logger.log('[PluginManager] Closing plugin manager...');
    this.isEnable = false;

    // 卸载所有已加载的插件
    for (const entry of this.plugins.values()) {
      if (entry.loaded) {
        await this.unloadPlugin(entry);
      }
    }

    this.logger.log('[PluginManager] Plugin manager closed');
  }

  async reload (): Promise<OB11NetworkReloadType> {
    this.logger.log('[PluginManager] Reloading plugin manager...');

    // 先关闭然后重新打开
    await this.close();
    await this.open();

    this.logger.log('[PluginManager] Plugin manager reloaded');
    return OB11NetworkReloadType.Normal;
  }
}
