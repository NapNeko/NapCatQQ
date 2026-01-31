import { NapCatCore } from 'napcat-core';
import { NapCatOneBot11Adapter, OB11Message } from '@/napcat-onebot/index';
import { ActionMap } from '@/napcat-onebot/action';
import { OB11EmitEventContent } from '@/napcat-onebot/network/index';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';

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

// ==================== 插件路由相关类型（包装层，不直接依赖 express） ====================

/** HTTP 请求对象（包装类型） */
export interface PluginHttpRequest {
  /** 请求路径 */
  path: string;
  /** 请求方法 */
  method: string;
  /** 查询参数 */
  query: Record<string, string | string[] | undefined>;
  /** 请求体 */
  body: unknown;
  /** 请求头 */
  headers: Record<string, string | string[] | undefined>;
  /** 路由参数 */
  params: Record<string, string>;
  /** 原始请求对象（用于高级用法） */
  raw: unknown;
}

/** HTTP 响应对象（包装类型） */
export interface PluginHttpResponse {
  /** 设置状态码 */
  status (code: number): PluginHttpResponse;
  /** 发送 JSON 响应 */
  json (data: unknown): void;
  /** 发送文本响应 */
  send (data: string | Buffer): void;
  /** 设置响应头 */
  setHeader (name: string, value: string): PluginHttpResponse;
  /** 发送文件 */
  sendFile (filePath: string): void;
  /** 重定向 */
  redirect (url: string): void;
  /** 原始响应对象（用于高级用法） */
  raw: unknown;
}

/** 下一步函数类型 */
export type PluginNextFunction = (err?: unknown) => void;

/** 插件请求处理器类型 */
export type PluginRequestHandler = (
  req: PluginHttpRequest,
  res: PluginHttpResponse,
  next: PluginNextFunction
) => void | Promise<void>;

/** HTTP 方法类型 */
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'all';

/** 插件 API 路由定义 */
export interface PluginApiRouteDefinition {
  /** HTTP 方法 */
  method: HttpMethod;
  /** 路由路径（相对于插件路由前缀） */
  path: string;
  /** 请求处理器 */
  handler: PluginRequestHandler;
}

/** 插件页面定义 */
export interface PluginPageDefinition {
  /** 页面路径（用于路由，如 'settings'） */
  path: string;
  /** 页面标题（显示在 Tab 上） */
  title: string;
  /** 页面图标（可选，支持 emoji 或图标名） */
  icon?: string;
  /** 页面 HTML 文件路径（相对于插件目录） */
  htmlFile: string;
  /** 页面描述 */
  description?: string;
}

/** 插件路由注册器 */
export interface PluginRouterRegistry {
  // ==================== API 路由注册 ====================

  /** 
   * 注册单个 API 路由
   * @param method HTTP 方法
   * @param path 路由路径
   * @param handler 请求处理器
   */
  api (method: HttpMethod, path: string, handler: PluginRequestHandler): void;
  /** 注册 GET API */
  get (path: string, handler: PluginRequestHandler): void;
  /** 注册 POST API */
  post (path: string, handler: PluginRequestHandler): void;
  /** 注册 PUT API */
  put (path: string, handler: PluginRequestHandler): void;
  /** 注册 DELETE API */
  delete (path: string, handler: PluginRequestHandler): void;

  // ==================== 页面注册 ====================

  /**
   * 注册插件页面
   * @param page 页面定义
   */
  page (page: PluginPageDefinition): void;

  /**
   * 注册多个插件页面
   * @param pages 页面定义数组
   */
  pages (pages: PluginPageDefinition[]): void;

  // ==================== 静态资源 ====================

  /**
   * 提供静态文件服务
   * @param urlPath URL 路径
   * @param localPath 本地文件夹路径（相对于插件目录或绝对路径）
   */
  static (urlPath: string, localPath: string): void;
}

// ==================== 插件管理器接口 ====================

/** 插件管理器公共接口 */
export interface IPluginManager {
  readonly config: NetworkAdapterConfig;
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
  /** 
   * WebUI 路由注册器
   * 用于注册插件的 HTTP API 路由，路由将挂载到 /api/Plugin/ext/{pluginId}/
   */
  router: PluginRouterRegistry;
}

// ==================== 插件模块接口 ====================

export interface PluginModule<T extends OB11EmitEventContent = OB11EmitEventContent, C = unknown> {
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
  plugin_get_config?: (ctx: NapCatPluginContext) => C | Promise<C>;
  plugin_set_config?: (ctx: NapCatPluginContext, config: C) => void | Promise<void>;
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
