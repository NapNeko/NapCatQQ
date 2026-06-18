/**
 * Official NapCat 2026 plugin API types.
 * Source: https://napneko.github.io/develop/plugin/api/type
 */

// ─── Plugin context (the object passed to every lifecycle function) ────────────

export interface NapCatPluginContext {
  core: unknown;
  oneBot: unknown;
  actions: ActionMap;
  pluginName: string;
  pluginPath: string;   // absolute path to the plugin directory
  configPath: string;   // absolute path to the plugin config directory
  dataPath: string;     // absolute path to the plugin data directory
  NapCatConfig: NapCatConfigClass;
  adapterName: string;
  pluginManager: IPluginManager;
  logger: PluginLogger;
  router: PluginRouterRegistry;
  getPluginExports: <T = PluginModule>(pluginId: string) => T | undefined;
}

// ─── Plugin module (exported interface from entry file) ───────────────────────

export interface PluginModule {
  plugin_init: (ctx: NapCatPluginContext) => void | Promise<void>;
  plugin_onmessage?: (ctx: NapCatPluginContext, event: OB11Message) => void | Promise<void>;
  plugin_onevent?: (ctx: NapCatPluginContext, event: OB11Event) => void | Promise<void>;
  plugin_cleanup?: (ctx: NapCatPluginContext) => void | Promise<void>;
  plugin_config_schema?: PluginConfigSchema;
  plugin_config_ui?: PluginConfigSchema;
  plugin_get_config?: (ctx: NapCatPluginContext) => unknown | Promise<unknown>;
  plugin_set_config?: (ctx: NapCatPluginContext, config: unknown) => void | Promise<void>;
  plugin_on_config_change?: (
    ctx: NapCatPluginContext,
    ui: PluginConfigUIController,
    key: string,
    value: unknown,
    currentConfig: Record<string, unknown>
  ) => void | Promise<void>;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export interface ActionMap {
  call(
    action: string,
    params: unknown,
    adapterName: string,
    config: NetworkAdapterConfig
  ): Promise<unknown>;
}

export interface NetworkAdapterConfig {
  [key: string]: unknown;
}

// ─── Logger ───────────────────────────────────────────────────────────────────

export interface PluginLogger {
  log(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'all';

export interface PluginRouterRegistry {
  // Authenticated routes → /api/Plugin/ext/<pluginId>/<path>
  api(method: HttpMethod, path: string, handler: PluginRequestHandler): void;
  get(path: string, handler: PluginRequestHandler): void;
  post(path: string, handler: PluginRequestHandler): void;
  put(path: string, handler: PluginRequestHandler): void;
  delete(path: string, handler: PluginRequestHandler): void;
  // Unauthenticated routes → /plugin/<pluginId>/api/<path>
  apiNoAuth(method: HttpMethod, path: string, handler: PluginRequestHandler): void;
  getNoAuth(path: string, handler: PluginRequestHandler): void;
  postNoAuth(path: string, handler: PluginRequestHandler): void;
  putNoAuth(path: string, handler: PluginRequestHandler): void;
  deleteNoAuth(path: string, handler: PluginRequestHandler): void;
  // Static files → /plugin/<pluginId>/files/<urlPath>/
  static(urlPath: string, localPath: string): void;
  staticOnMem(urlPath: string, files: MemoryStaticFile[]): void;
  // Pages → /plugin/<pluginId>/page/<path>
  page(page: PluginPageDefinition): void;
  pages(pages: PluginPageDefinition[]): void;
}

export interface PluginHttpRequest {
  path: string;
  method: string;
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
  params: Record<string, string>;
  raw: unknown;
}

export interface PluginHttpResponse {
  status(code: number): PluginHttpResponse;
  json(data: unknown): void;
  send(data: string | Buffer): void;
  setHeader(name: string, value: string): PluginHttpResponse;
  sendFile(filePath: string): void;
  redirect(url: string): void;
  raw: unknown;
}

export type PluginNextFunction = (err?: unknown) => void;
export type PluginRequestHandler = (
  req: PluginHttpRequest,
  res: PluginHttpResponse,
  next: PluginNextFunction
) => void | Promise<void>;

export interface PluginPageDefinition {
  path: string;
  title: string;
  icon?: string;
  htmlFile: string;
  description?: string;
}

export interface MemoryStaticFile {
  path: string;
  content: string | Buffer | (() => string | Buffer | Promise<string | Buffer>);
  contentType?: string;
}

// ─── Config UI ────────────────────────────────────────────────────────────────

export type PluginConfigSchema = PluginConfigItem[];

export interface PluginConfigItem {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multi-select' | 'html' | 'text';
  label: string;
  description?: string;
  default?: unknown;
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  reactive?: boolean;
  hidden?: boolean;
}

export interface PluginConfigUIController {
  updateSchema(schema: PluginConfigSchema): void;
  updateField(key: string, field: Partial<PluginConfigItem>): void;
  removeField(key: string): void;
  addField(field: PluginConfigItem, afterKey?: string): void;
  showField(key: string): void;
  hideField(key: string): void;
  getCurrentConfig(): Record<string, unknown>;
}

export interface NapCatConfigClass {
  text(key: string, label: string, defaultValue?: string, description?: string, reactive?: boolean): PluginConfigItem;
  number(key: string, label: string, defaultValue?: number, description?: string, reactive?: boolean): PluginConfigItem;
  boolean(key: string, label: string, defaultValue?: boolean, description?: string, reactive?: boolean): PluginConfigItem;
  select(key: string, label: string, options: { label: string; value: string | number }[], defaultValue?: string | number, description?: string, reactive?: boolean): PluginConfigItem;
  multiSelect(key: string, label: string, options: { label: string; value: string | number }[], defaultValue?: (string | number)[], description?: string, reactive?: boolean): PluginConfigItem;
  html(content: string): PluginConfigItem;
  plainText(content: string): PluginConfigItem;
  combine(...items: PluginConfigItem[]): PluginConfigSchema;
}

// ─── Plugin manager ───────────────────────────────────────────────────────────

export interface IPluginManager {
  readonly config: NetworkAdapterConfig;
  getPluginPath(): string;
  getAllPlugins(): PluginEntry[];
  getLoadedPlugins(): PluginEntry[];
  getPluginInfo(pluginId: string): PluginEntry | undefined;
  setPluginStatus(pluginId: string, enable: boolean): Promise<void>;
  loadPluginById(pluginId: string): Promise<boolean>;
  unregisterPlugin(pluginId: string): Promise<void>;
  reloadPlugin(pluginId: string): Promise<boolean>;
  loadDirectoryPlugin(dirname: string): Promise<void>;
  getPluginDataPath(pluginId: string): string;
  getPluginConfigPath(pluginId: string): string;
}

export interface PluginEntry {
  id: string;
  name?: string;
  version?: string;
  pluginPath: string;
  enable: boolean;
  loaded: boolean;
}

// ─── OB11 event types ─────────────────────────────────────────────────────────

export interface OB11BaseEvent {
  time: number;
  self_id: number;
  post_type: string;
}

export interface OB11Message extends OB11BaseEvent {
  post_type: 'message' | 'message_sent';
  message_type: 'private' | 'group';
  message_id: number;
  user_id: number;
  message: OB11MessageSegment[];
  raw_message: string;
  sender: OB11Sender;
  group_id?: number;
}

export interface OB11Sender {
  user_id: number;
  nickname: string;
  card?: string;
  role?: 'owner' | 'admin' | 'member';
}

export interface OB11MessageSegment {
  type: string;
  data: Record<string, unknown>;
}

export type OB11Event = OB11RequestEvent | OB11NoticeEvent;

export interface OB11RequestEvent extends OB11BaseEvent {
  post_type: 'request';
  request_type: 'group' | 'friend';
  sub_type?: string;
  group_id?: number;
  user_id: number;
  comment: string;
  flag: string;
}

export interface OB11NoticeEvent extends OB11BaseEvent {
  post_type: 'notice';
  notice_type: string;
  group_id?: number;
  user_id?: number;
  operator_id?: number;
  sub_type?: string;
}
