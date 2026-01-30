import { NapCatCore } from 'napcat-core';
import { NapCatOneBot11Adapter, OB11Message } from '@/napcat-onebot/index';
import { ActionMap } from '@/napcat-onebot/action';
import { OB11EmitEventContent } from '@/napcat-onebot/network/index';

// ==================== 插件包信息 ====================

export interface PluginPackageJson {
  name?: string;
  plugin?: string;
  version?: string;
  main?: string;
  description?: string;
  author?: string;
}

// ==================== 插件配置 Schema ====================

export interface PluginConfigItem {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multi-select' | 'html' | 'text';
  label: string;
  description?: string;
  default?: unknown;
  options?: { label: string; value: string | number; }[];
  placeholder?: string;
  /** 标记此字段为响应式：值变化时触发 schema 刷新 */
  reactive?: boolean;
  /** 是否隐藏此字段 */
  hidden?: boolean;
}

export type PluginConfigSchema = PluginConfigItem[];

// ==================== NapCatConfig 静态接口 ====================

/** NapCatConfig 类的静态方法接口（用于 typeof NapCatConfig） */
export interface INapCatConfigStatic {
  text (key: string, label: string, defaultValue?: string, description?: string, reactive?: boolean): PluginConfigItem;
  number (key: string, label: string, defaultValue?: number, description?: string, reactive?: boolean): PluginConfigItem;
  boolean (key: string, label: string, defaultValue?: boolean, description?: string, reactive?: boolean): PluginConfigItem;
  select (key: string, label: string, options: { label: string; value: string | number; }[], defaultValue?: string | number, description?: string, reactive?: boolean): PluginConfigItem;
  multiSelect (key: string, label: string, options: { label: string; value: string | number; }[], defaultValue?: (string | number)[], description?: string, reactive?: boolean): PluginConfigItem;
  html (content: string): PluginConfigItem;
  plainText (content: string): PluginConfigItem;
  combine (...items: PluginConfigItem[]): PluginConfigSchema;
}

/** NapCatConfig 类型（包含静态方法） */
export type NapCatConfigClass = INapCatConfigStatic;

// ==================== 插件管理器接口 ====================

/** 插件管理器公共接口 */
export interface IPluginManager {
  readonly config: unknown;
  getPluginPath (): string;
  getPluginConfig (): PluginStatusConfig;
  getAllPlugins (): PluginEntry[];
  getLoadedPlugins (): PluginEntry[];
  getPluginInfo (pluginId: string): PluginEntry | undefined;
  setPluginStatus (pluginId: string, enable: boolean): Promise<void>;
  loadPluginById (pluginId: string): Promise<boolean>;
  unregisterPlugin (pluginId: string): Promise<void>;
  uninstallPlugin (pluginId: string, cleanData?: boolean): Promise<void>;
  reloadPlugin (pluginId: string): Promise<boolean>;
  loadDirectoryPlugin (dirname: string): Promise<void>;
  getPluginDataPath (pluginId: string): string;
  getPluginConfigPath (pluginId: string): string;
}

// ==================== 插件配置 UI 控制器 ====================

/** 插件配置 UI 控制器 - 用于动态控制配置界面 */
export interface PluginConfigUIController {
  /** 更新整个 schema */
  updateSchema: (schema: PluginConfigSchema) => void;
  /** 更新单个字段 */
  updateField: (key: string, field: Partial<PluginConfigItem>) => void;
  /** 移除字段 */
  removeField: (key: string) => void;
  /** 添加字段 */
  addField: (field: PluginConfigItem, afterKey?: string) => void;
  /** 显示字段 */
  showField: (key: string) => void;
  /** 隐藏字段 */
  hideField: (key: string) => void;
  /** 获取当前配置值 */
  getCurrentConfig: () => Record<string, unknown>;
}

// ==================== 插件日志接口 ====================

/**
 * 插件日志接口 - 简化的日志 API
 */
export interface PluginLogger {
  /** 普通日志 */
  log (...args: unknown[]): void;
  /** 调试日志 */
  debug (...args: unknown[]): void;
  /** 信息日志 */
  info (...args: unknown[]): void;
  /** 警告日志 */
  warn (...args: unknown[]): void;
  /** 错误日志 */
  error (...args: unknown[]): void;
}

// ==================== 插件上下文 ====================

export interface NapCatPluginContext {
  core: NapCatCore;
  oneBot: NapCatOneBot11Adapter;
  actions: ActionMap;
  pluginName: string;
  pluginPath: string;
  configPath: string;
  dataPath: string;
  /** NapCatConfig 配置构建器 */
  NapCatConfig: NapCatConfigClass;
  adapterName: string;
  /** 插件管理器实例 */
  pluginManager: IPluginManager;
  /** 插件日志器 - 自动添加插件名称前缀 */
  logger: PluginLogger;
}

// ==================== 插件模块接口 ====================

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
  plugin_get_config?: (ctx: NapCatPluginContext) => unknown | Promise<unknown>;
  plugin_set_config?: (ctx: NapCatPluginContext, config: unknown) => void | Promise<void>;
  /** 
   * 配置界面控制器 - 当配置界面打开时调用
   * 返回清理函数，在界面关闭时调用
   */
  plugin_config_controller?: (
    ctx: NapCatPluginContext,
    ui: PluginConfigUIController,
    initialConfig: Record<string, unknown>
  ) => void | (() => void) | Promise<void | (() => void)>;
  /**
   * 响应式字段变化回调 - 当标记为 reactive 的字段值变化时调用
   */
  plugin_on_config_change?: (
    ctx: NapCatPluginContext,
    ui: PluginConfigUIController,
    key: string,
    value: unknown,
    currentConfig: Record<string, unknown>
  ) => void | Promise<void>;
}

// ==================== 插件运行时状态 ====================

export type PluginRuntimeStatus = 'loaded' | 'error' | 'unloaded';

export interface PluginRuntime {
  /** 运行时状态 */
  status: PluginRuntimeStatus;
  /** 错误信息（当 status 为 'error' 时） */
  error?: string;
  /** 插件模块（当 status 为 'loaded' 时） */
  module?: PluginModule;
  /** 插件上下文（当 status 为 'loaded' 时） */
  context?: NapCatPluginContext;
}

// ==================== 插件条目（统一管理所有插件） ====================

export interface PluginEntry {
  // ===== 基础信息 =====
  /** 插件 ID（包名或目录名） */
  id: string;
  /** 文件系统目录名 */
  fileId: string;
  /** 显示名称 */
  name?: string;
  /** 版本号 */
  version?: string;
  /** 描述 */
  description?: string;
  /** 作者 */
  author?: string;
  /** 插件目录路径 */
  pluginPath: string;
  /** 入口文件路径 */
  entryPath?: string;
  /** package.json 内容 */
  packageJson?: PluginPackageJson;

  // ===== 状态 =====
  /** 是否启用（用户配置） */
  enable: boolean;
  /** 运行时是否已加载 */
  loaded: boolean;

  // ===== 运行时 =====
  /** 运行时信息 */
  runtime: PluginRuntime;
}

// ==================== 插件状态配置（持久化） ====================

export interface PluginStatusConfig {
  [key: string]: boolean; // key: pluginId, value: enabled
}
