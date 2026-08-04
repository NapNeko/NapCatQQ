/**
 * Java 插件桥接通信协议类型定义
 *
 * 通信方式：以换行符分隔的 JSON（NDJSON），每行一条消息
 * 协议基于 JSON-RPC 2.0，并扩展了双向通知（notification）以支持 Java 侧主动调用 NapCat 能力
 *
 * Node.js → Java  ：请求（request） / 通知（notification）
 * Java     → Node.js：响应（response） / 通知（notification，例如日志、调用 OneBot API）
 */

// ==================== 通用 JSON-RPC 消息 ====================

export interface JsonRpcRequest<P = unknown> {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: P;
}

export interface JsonRpcNotification<P = unknown> {
  jsonrpc: '2.0';
  method: string;
  params?: P;
}

export interface JsonRpcSuccessResult<R = unknown> {
  jsonrpc: '2.0';
  id: number | string;
  result: R;
}

export interface JsonRpcError {
  jsonrpc: '2.0';
  id: number | string | null;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export type JsonRpcResponse<R = unknown> = JsonRpcSuccessResult<R> | JsonRpcError;

export type JsonRpcMessage<P = unknown, R = unknown> =
  | JsonRpcRequest<P>
  | JsonRpcNotification<P>
  | JsonRpcResponse<R>;

// ==================== Node.js → Java 方法 ====================

/** 初始化 Java 桥接器 */
export interface InitParams {
  /** 插件数据目录（用于存放 Java 插件配置/数据） */
  dataPath: string;
  /** Java 插件目录（存放 .jar / .class） */
  javaPluginPath: string;
  /** 适配器名称 */
  adapterName: string;
  /** Java 可执行文件路径，默认 java */
  javaPath: string;
  /** JVM 启动参数 */
  jvmArgs: string[];
  /** 桥接 JAR 路径（Java 侧主程序） */
  bridgeJar: string;
  /** 额外 classpath（目录或 jar） */
  classpath: string[];
}

export interface InitResult {
  /** 桥接器版本 */
  version: string;
  /** 已发现的 Java 插件列表 */
  plugins: JavaPluginInfo[];
}

/** Java 插件信息 */
export interface JavaPluginInfo {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  entry: string;
  enabled: boolean;
}

/** 消息事件参数（OneBot 11 消息） */
export interface OnMessageParams {
  event: unknown;
}

/** 通用事件参数 */
export interface OnEventParams {
  event: unknown;
}

/** 加载指定 Java 插件 */
export interface LoadPluginParams {
  pluginId: string;
}

/** 卸载指定 Java 插件 */
export interface UnloadPluginParams {
  pluginId: string;
}

/** 配置 Schema 获取 */
export interface GetConfigSchemaResult {
  schema: unknown;
}

/** 获取配置 */
export interface GetConfigResult {
  config: unknown;
}

/** 设置配置 */
export interface SetConfigParams {
  config: unknown;
}

/** 清理 */
export interface CleanupParams {}

// ==================== Java → Node.js 通知方法 ====================

/** Java 侧日志通知 */
export interface LogNotificationParams {
  level: 'log' | 'debug' | 'info' | 'warn' | 'error';
  message: string;
  args?: unknown[];
}

/** Java 侧调用 OneBot Action */
export interface CallActionNotificationParams {
  /** 请求 ID（用于匹配响应） */
  requestId: number | string;
  action: string;
  params?: unknown;
}

/** Java 侧调用 Action 的响应返回（由 Node.js 通过此通知回传） */
export interface CallActionResultParams {
  requestId: number | string;
  ok: boolean;
  data?: unknown;
  error?: string;
}

/** Java 侧主动发送事件（例如由 Java 插件触发的自定义事件） */
export interface EmitEventNotificationParams {
  event: unknown;
}

// ==================== 错误码 ====================

export enum JniErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  /** Java 进程未启动 / 已退出 */
  BRIDGE_NOT_RUNNING = -32001,
  /** 调用超时 */
  CALL_TIMEOUT = -32002,
  /** Java 插件加载失败 */
  PLUGIN_LOAD_FAILED = -32003,
}

// ==================== 协议辅助 ====================

/** 判断消息是否为 JSON-RPC 请求 */
export function isRequest (msg: any): msg is JsonRpcRequest {
  return msg?.jsonrpc === '2.0' && typeof msg.method === 'string' && msg.id !== undefined && msg.id !== null;
}

/** 判断消息是否为 JSON-RPC 通知 */
export function isNotification (msg: any): msg is JsonRpcNotification {
  return msg?.jsonrpc === '2.0' && typeof msg.method === 'string' && (msg.id === undefined || msg.id === null);
}

/** 判断消息是否为 JSON-RPC 响应 */
export function isResponse (msg: any): msg is JsonRpcResponse {
  return msg?.jsonrpc === '2.0' && msg.id !== undefined && msg.id !== null && ('result' in msg || 'error' in msg);
}
