import fs from 'fs';
import path from 'path';
import { ActionMap } from '@/napcat-onebot/action';
import { NapCatCore } from 'napcat-core';
import { NapCatOneBot11Adapter, OB11Message } from '@/napcat-onebot/index';
import { OB11EmitEventContent, OB11NetworkReloadType } from '@/napcat-onebot/network/index';
import { IOB11NetworkAdapter } from '@/napcat-onebot/network/adapter';
import { PluginConfig } from '@/napcat-onebot/config/config';
import { NapCatConfig } from './plugin/config';
import { PluginLoader } from './plugin/loader';
import {
  PluginEntry,
  PluginLogger,
  PluginStatusConfig,
  NapCatPluginContext,
  IPluginManager,
} from './plugin/types';
import { PluginRouterRegistryImpl } from './plugin/router-registry';
import { PluginProcessRunner, type IsolatedPluginStatus } from './plugin/plugin-process';
import { PluginFileWatcher } from './plugin/plugin-watcher';

export { PluginPackageJson } from './plugin/types';
export { PluginConfigItem } from './plugin/types';
export { PluginConfigUIController } from './plugin/types';
export { NapCatConfig } from './plugin/config';
export { PluginConfigSchema } from './plugin/types';
export { PluginLogger } from './plugin/types';
export { NapCatPluginContext } from './plugin/types';
export { PluginModule } from './plugin/types';
export { PluginStatusConfig } from './plugin/types';
export { PluginRouterRegistry, PluginRequestHandler, PluginApiRouteDefinition, PluginPageDefinition, HttpMethod } from './plugin/types';
export { PluginHttpRequest, PluginHttpResponse, PluginNextFunction } from './plugin/types';
export { MemoryStaticFile, MemoryFileGenerator } from './plugin/types';
export { PluginRouterRegistryImpl } from './plugin/router-registry';
export { PluginProcessRunner } from './plugin/plugin-process';
export type { IsolatedPluginStatus, PluginProcessOptions } from './plugin/plugin-process';
export { PluginFileWatcher } from './plugin/plugin-watcher';
export type { FileChangeEvent, FileChangeAction } from './plugin/plugin-watcher';
export class OB11PluginMangerAdapter extends IOB11NetworkAdapter<PluginConfig> implements IPluginManager {
  private readonly pluginPath: string;
  private readonly configPath: string;
  private readonly loader: PluginLoader;

  /** 插件注册表: ID -> 插件条目 */
  private plugins: Map<string, PluginEntry> = new Map();

  /** 插件路由注册表: ID -> 路由注册器 */
  private pluginRouters: Map<string, PluginRouterRegistryImpl> = new Map();

  /** 隔离运行的插件进程: ID -> PluginProcessRunner */
  private isolatedPlugins: Map<string, PluginProcessRunner> = new Map();

  /** 插件文件监听器（用于 HMR） */
  private fileWatcher: PluginFileWatcher | null = null;

  /** 插件列表变更监听器 */
  private pluginListChangeListeners: Set<(reason: string) => void> = new Set();

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

    // 清理插件路由
    const routerRegistry = this.pluginRouters.get(entry.id);
    if (routerRegistry) {
      routerRegistry.clear();
      this.pluginRouters.delete(entry.id);
    }

    // 清理模块缓存
    this.loader.clearCache(entry.pluginPath);

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
    const dataPath = path.join(entry.pluginPath, 'data');
    const configPath = path.join(dataPath, 'config.json');

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

    // 创建插件路由注册器
    const routerRegistry = new PluginRouterRegistryImpl(entry.id, entry.pluginPath);
    // 保存到路由注册表
    this.pluginRouters.set(entry.id, routerRegistry);

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
      router: routerRegistry,
      getPluginExports,
    };
  }

  // ==================== 公共 API ====================

  // ==================== 插件列表变更通知 ====================

  /**
   * 注册插件列表变更监听器
   * 当插件被加载/卸载/重载/新增/删除时触发回调
   */
  public onPluginListChange (listener: (reason: string) => void): () => void {
    this.pluginListChangeListeners.add(listener);
    return () => {
      this.pluginListChangeListeners.delete(listener);
    };
  }

  /**
   * 通知所有监听器插件列表已变更
   */
  private notifyPluginListChange (reason: string): void {
    for (const listener of this.pluginListChangeListeners) {
      try {
        listener(reason);
      } catch {
        // 忽略监听器错误
      }
    }
  }

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

      this.notifyPluginListChange(`status_changed:${pluginId}`);
    }
  }

  /**
   * 通过 ID 加载插件
   */
  public async loadPluginById (pluginId: string): Promise<boolean> {
    // 始终重新扫描以获取最新的 package.json 数据（版本号、描述等）
    const existingEntry = this.plugins.get(pluginId);
    const dirname = existingEntry?.fileId ?? this.loader.findPluginDirById(pluginId);

    if (!dirname) {
      this.logger.logWarn(`[PluginManager] Plugin ${pluginId} not found in filesystem`);
      return false;
    }

    const newEntry = this.loader.rescanPlugin(dirname);
    if (!newEntry) {
      return false;
    }

    // 更新注册表（覆盖旧的 entry，确保版本号等元数据为最新）
    this.plugins.set(newEntry.id, newEntry);

    if (!newEntry.enable) {
      this.logger.log(`[PluginManager] Skipping loading disabled plugin: ${pluginId}`);
      return false;
    }

    const result = await this.loadPlugin(newEntry);
    if (result) {
      this.notifyPluginListChange(`loaded:${pluginId}`);
    }
    return result;
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
   * 从注册表中移除插件条目（不触发卸载逻辑）
   * 用于导入新版本前清理旧条目，确保后续 loadPluginById 会重新扫描
   */
  public removePluginEntry (pluginId: string): void {
    this.plugins.delete(pluginId);
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
    const dataPath = path.join(pluginPath, 'data');

    if (entry.loaded) {
      await this.unloadPlugin(entry);
    }

    // 从注册表移除
    this.plugins.delete(pluginId);

    // 删除插件目录
    if (fs.existsSync(pluginPath)) {
      fs.rmSync(pluginPath, { recursive: true, force: true });
    }

    // 清理数据
    if (cleanData && fs.existsSync(dataPath)) {
      fs.rmSync(dataPath, { recursive: true, force: true });
    }

    this.notifyPluginListChange(`uninstalled:${pluginId}`);
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
      this.notifyPluginListChange(`reloaded:${pluginId}`);
      return true;
    } catch (error) {
      this.logger.logError(`[PluginManager] Error reloading plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * 加载目录插件（用于新安装的插件）
   * 如果插件已存在，将重新扫描并更新元数据
   */
  public async loadDirectoryPlugin (dirname: string): Promise<void> {
    const entry = this.loader.rescanPlugin(dirname);
    if (!entry) {
      return;
    }

    // 如果已存在且已加载，先卸载再更新
    const existingEntry = this.plugins.get(entry.id);
    if (existingEntry && existingEntry.loaded) {
      await this.unloadPlugin(existingEntry);
    }

    // 始终更新注册表（确保版本号等元数据为最新）
    this.plugins.set(entry.id, entry);

    if (entry.enable && entry.runtime.status !== 'error') {
      await this.loadPlugin(entry);
    }

    this.notifyPluginListChange(`directory_loaded:${entry.id}`);
  }

  /**
   * 刷新插件列表 — 扫描文件系统中新增/删除的插件目录
   * 不影响已加载的插件，仅更新注册表中的条目
   */
  public refreshPluginList (): void {
    if (!fs.existsSync(this.pluginPath)) {
      return;
    }

    const items = fs.readdirSync(this.pluginPath, { withFileTypes: true });
    const currentDirNames = new Set<string>();
    let hasChanges = false;

    for (const item of items) {
      if (!item.isDirectory()) continue;
      currentDirNames.add(item.name);

      // 检查该目录是否已在注册表中
      const existingEntry = this.findPluginByFileId(item.name);
      if (!existingEntry) {
        // 新插件目录，扫描并注册
        const newEntry = this.loader.rescanPlugin(item.name);
        if (newEntry && newEntry.entryPath) {
          this.plugins.set(newEntry.id, newEntry);
          this.logger.log(`[PluginManager] Discovered new plugin: ${newEntry.id}`);
          hasChanges = true;
        }
      } else {
        // 已存在的插件，更新其 package.json 元数据（版本号等）
        // 只更新未加载的插件的元信息，避免影响运行时状态
        if (!existingEntry.loaded) {
          const refreshedEntry = this.loader.rescanPlugin(item.name);
          if (refreshedEntry) {
            this.plugins.set(refreshedEntry.id, refreshedEntry);
          }
        } else {
          // 即使已加载，也刷新 package.json 中的只读元数据
          this.refreshPluginMetadata(existingEntry);
        }
      }
    }

    // 清理已不存在于文件系统的插件
    for (const [id, entry] of this.plugins) {
      if (!currentDirNames.has(entry.fileId)) {
        if (!entry.loaded) {
          this.plugins.delete(id);
          this.logger.log(`[PluginManager] Removed stale plugin: ${id}`);
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      this.notifyPluginListChange('refresh');
    }
  }

  /**
   * 通过 fileId（目录名）查找插件
   */
  private findPluginByFileId (fileId: string): PluginEntry | undefined {
    for (const entry of this.plugins.values()) {
      if (entry.fileId === fileId) {
        return entry;
      }
    }
    return undefined;
  }

  /**
   * 刷新已加载插件的只读元数据（版本号、描述等）
   * 不影响运行时状态和模块引用
   */
  private refreshPluginMetadata (entry: PluginEntry): void {
    try {
      const packageJsonPath = path.join(entry.pluginPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        entry.version = packageJson.version;
        entry.description = packageJson.description;
        entry.author = packageJson.author;
        entry.name = packageJson.name;
        entry.packageJson = packageJson;
      }
    } catch {
      // 忽略读取错误
    }
  }

  /**
   * 获取插件数据目录路径
   */
  public getPluginDataPath (pluginId: string): string {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    return path.join(entry.pluginPath, 'data');
  }

  /**
   * 获取插件配置文件路径
   */
  public getPluginConfigPath (pluginId: string): string {
    return path.join(this.getPluginDataPath(pluginId), 'config.json');
  }

  // ==================== 进程隔离插件管理 ====================

  /**
   * 以进程隔离模式加载插件
   *
   * 插件运行在独立的 worker_thread 中，通过 napcat-rpc 通信。
   * 热重载时直接终止 worker 并重新创建，彻底清除所有状态。
   *
   * @param pluginId 插件 ID
   * @param autoRestart 崩溃后是否自动重启
   * @returns 是否成功启动
   */
  public async loadPluginIsolated (pluginId: string, autoRestart = true): Promise<boolean> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      this.logger.logWarn(`[PluginManager] Plugin ${pluginId} not found for isolated loading`);
      return false;
    }

    if (!entry.entryPath) {
      this.logger.logWarn(`[PluginManager] Plugin ${pluginId} has no entry path`);
      return false;
    }

    // 如果已有隔离实例在运行，先停止
    const existing = this.isolatedPlugins.get(pluginId);
    if (existing && existing.status !== 'stopped') {
      await existing.stop();
    }

    // 创建进程隔离运行器
    const runner = new PluginProcessRunner({
      entry,
      logger: this.logger,
      autoRestart,
      maxRestartCount: 3,
      heartbeatInterval: 60000,
      heartbeatTimeout: 10000,
      contextData: {
        pluginName: entry.id,
        pluginPath: entry.pluginPath,
        configPath: path.join(entry.pluginPath, 'data', 'config.json'),
        dataPath: path.join(entry.pluginPath, 'data'),
        adapterName: this.name,
      },
    });

    // 监听运行器事件
    runner.on('crashed', () => {
      this.logger.logWarn(`[PluginManager] Isolated plugin ${pluginId} crashed`);
      entry.runtime = { status: 'error', error: 'Plugin worker crashed' };
      entry.loaded = false;
    });

    runner.on('started', () => {
      entry.loaded = true;
      entry.runtime = { status: 'loaded' };
    });

    runner.on('stopped', () => {
      entry.loaded = false;
      entry.runtime = { status: 'unloaded' };
    });

    try {
      await runner.start();
      this.isolatedPlugins.set(pluginId, runner);

      this.logger.log(`[PluginManager] Plugin ${pluginId} loaded in isolated mode`);
      this.notifyPluginListChange(`isolated_loaded:${pluginId}`);
      return true;
    } catch (error) {
      this.logger.logError(`[PluginManager] Failed to load plugin ${pluginId} in isolated mode:`, error);
      return false;
    }
  }

  /**
   * 热重载隔离插件
   *
   * 核心方法 — 参考 Karin 的 HMR 机制但使用进程隔离：
   * - Karin: chokidar 监听 → pkgRemoveModule → pkgLoadModule → pkgCache
   * - NapCat: 终止旧 worker → 启动新 worker → RPC 初始化
   *
   * 优势：
   * 1. 无需手动清除 require.cache
   * 2. 无需 ?t=timestamp hack
   * 3. 完全清除旧插件的内存和状态
   * 4. 插件间互不影响
   */
  public async reloadPluginIsolated (pluginId: string): Promise<boolean> {
    const runner = this.isolatedPlugins.get(pluginId);
    if (!runner) {
      // 如果没有隔离运行中，作为新的隔离插件加载
      this.logger.log(`[PluginManager] No isolated runner found for ${pluginId}, starting new one`);
      return this.loadPluginIsolated(pluginId);
    }

    try {
      // 重新扫描插件信息（可能有版本更新等）
      const entry = this.plugins.get(pluginId);
      if (entry) {
        const newEntry = this.loader.rescanPlugin(entry.fileId);
        if (newEntry) {
          this.plugins.set(newEntry.id, newEntry);
        }
      }

      // 调用 runner.restart() — 内部会终止旧 worker 并创建新 worker
      await runner.restart();

      this.logger.log(`[PluginManager] Plugin ${pluginId} hot-reloaded successfully (isolated)`);
      this.notifyPluginListChange(`isolated_reloaded:${pluginId}`);
      return true;
    } catch (error) {
      this.logger.logError(`[PluginManager] Failed to hot-reload plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * 停止隔离运行的插件
   */
  public async stopIsolatedPlugin (pluginId: string): Promise<void> {
    const runner = this.isolatedPlugins.get(pluginId);
    if (runner) {
      await runner.stop();
      this.isolatedPlugins.delete(pluginId);
    }
  }

  /**
   * 获取隔离插件状态
   */
  public getIsolatedPluginStatus (pluginId: string): IsolatedPluginStatus | null {
    return this.isolatedPlugins.get(pluginId)?.status ?? null;
  }

  /**
   * 获取所有隔离运行的插件 ID 和状态
   */
  public getAllIsolatedPlugins (): Map<string, IsolatedPluginStatus> {
    const result = new Map<string, IsolatedPluginStatus>();
    for (const [id, runner] of this.isolatedPlugins) {
      result.set(id, runner.status);
    }
    return result;
  }

  /**
   * 对隔离插件进行健康检查
   */
  public async healthCheckIsolatedPlugin (pluginId: string): Promise<boolean> {
    const runner = this.isolatedPlugins.get(pluginId);
    if (!runner) return false;
    return runner.healthCheck();
  }

  // ==================== 文件监听热重载 (HMR) ====================

  /**
   * 启动文件监听热重载
   *
   * 参考 Karin 的 initPluginHmr()，监听插件目录变化并自动重载。
   * 与 Karin 不同的是，NapCat 可以选择两种重载方式：
   * - 同进程重载（现有的 reloadPlugin）
   * - 进程隔离重载（reloadPluginIsolated）
   *
   * @param useIsolation 是否使用进程隔离模式重载
   */
  public startHotReload (useIsolation = false): void {
    if (this.fileWatcher?.isWatching) {
      this.logger.logWarn('[PluginManager] HMR is already running');
      return;
    }

    this.fileWatcher = new PluginFileWatcher({
      pluginPath: this.pluginPath,
      logger: this.logger,
      debounceDelay: 500,
      onPluginChange: async (event) => {
        const pluginId = event.pluginId ?? event.pluginDirName;

        this.logger.log(
          `[HMR] Detected ${event.action} in ${pluginId}: ${path.basename(event.filePath)}`
        );

        // 处理新插件目录添加
        if (event.action === 'add') {
          const entry = this.plugins.get(pluginId);
          if (!entry) {
            // 新插件 — 扫描并注册（但不自动加载，需手动启用）
            this.logger.log(`[HMR] New plugin detected: ${pluginId}, scanning...`);
            this.refreshPluginList();
            return;
          }
        }

        const entry = this.plugins.get(pluginId);
        if (!entry || !entry.enable) {
          this.logger.logDebug(`[HMR] Skipping disabled/unknown plugin: ${pluginId}`);
          return;
        }

        if (event.action === 'unlink') {
          // 文件删除 — 不自动卸载，只记录日志
          this.logger.logWarn(`[HMR] File deleted in ${pluginId}, manual reload may be needed`);
          return;
        }

        // 文件变更或新增 — 触发热重载
        try {
          if (useIsolation || this.isolatedPlugins.has(pluginId)) {
            await this.reloadPluginIsolated(pluginId);
          } else {
            await this.reloadPlugin(pluginId);
          }
          this.logger.log(`[HMR] Plugin ${pluginId} reloaded successfully`);
        } catch (error) {
          this.logger.logError(`[HMR] Failed to reload plugin ${pluginId}:`, error);
        }
      },
    });

    this.fileWatcher.start();
    this.logger.log(`[PluginManager] HMR started (isolation: ${useIsolation})`);
  }

  /**
   * 停止文件监听热重载
   */
  public stopHotReload (): void {
    if (this.fileWatcher) {
      this.fileWatcher.stop();
      this.fileWatcher = null;
      this.logger.log('[PluginManager] HMR stopped');
    }
  }

  // ==================== 事件处理 ====================

  async onEvent<T extends OB11EmitEventContent> (event: T): Promise<void> {
    if (!this.isEnable) {
      return;
    }

    try {
      // 分发给同进程插件
      await Promise.allSettled(
        this.getLoadedPlugins().map((entry) =>
          this.callPluginEventHandler(entry, event)
        )
      );

      // 分发给隔离进程插件
      await Promise.allSettled(
        Array.from(this.isolatedPlugins.entries()).map(async ([pluginId, runner]) => {
          try {
            if ((event as any).message_type) {
              await runner.dispatchMessage(event);
            } else {
              await runner.dispatchEvent(event);
            }
          } catch (error) {
            this.logger.logError(
              `[PluginManager] Error dispatching event to isolated plugin ${pluginId}:`, error
            );
          }
        })
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

    // 停止文件监听
    this.stopHotReload();

    // 停止所有隔离插件
    for (const [pluginId, runner] of this.isolatedPlugins) {
      try {
        await runner.stop();
      } catch (error) {
        this.logger.logError(`[PluginManager] Error stopping isolated plugin ${pluginId}:`, error);
      }
    }
    this.isolatedPlugins.clear();

    // 卸载所有已加载的同进程插件
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
