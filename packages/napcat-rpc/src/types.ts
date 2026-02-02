/**
 * RPC 操作类型
 */
export enum RpcOperationType {
  /** 获取属性 */
  GET = 'get',
  /** 设置属性 */
  SET = 'set',
  /** 调用方法 */
  APPLY = 'apply',
  /** 构造函数调用 */
  CONSTRUCT = 'construct',
  /** 检查属性是否存在 */
  HAS = 'has',
  /** 获取所有键 */
  OWNKEYS = 'ownKeys',
  /** 删除属性 */
  DELETE = 'deleteProperty',
  /** 获取属性描述符 */
  GET_DESCRIPTOR = 'getOwnPropertyDescriptor',
  /** 获取原型 */
  GET_PROTOTYPE = 'getPrototypeOf',
  /** 回调调用 */
  CALLBACK = 'callback',
  /** 释放资源 */
  RELEASE = 'release',
}

/**
 * RPC 请求消息
 */
export interface RpcRequest {
  /** 请求 ID */
  id: string;
  /** 操作类型 */
  type: RpcOperationType;
  /** 访问路径 (从根对象开始) */
  path: PropertyKey[];
  /** 参数 (用于 set, apply, construct) */
  args?: SerializedValue[];
  /** 回调 ID 映射 (参数索引 -> 回调 ID) */
  callbackIds?: Record<number, string>;
  /** 远程对象引用 ID（用于对引用对象的操作） */
  refId?: string;
}

/**
 * RPC 响应消息
 */
export interface RpcResponse {
  /** 请求 ID */
  id: string;
  /** 是否成功 */
  success: boolean;
  /** 返回值 */
  result?: SerializedValue;
  /** 错误信息 */
  error?: string;
  /** 错误堆栈 */
  stack?: string;
  /** 结果是否为可代理对象 */
  isProxyable?: boolean;
  /** 远程对象引用 ID（用于深层对象代理） */
  refId?: string;
}

/**
 * 序列化后的值
 */
export interface SerializedValue {
  /** 值类型 */
  type: SerializedValueType;
  /** 原始值（用于基本类型） */
  value?: unknown;
  /** 对象类型名称 */
  className?: string;
  /** 回调 ID（用于函数） */
  callbackId?: string;
  /** 代理路径（用于可代理对象） */
  proxyPath?: PropertyKey[];
  /** 数组元素或对象属性 */
  properties?: Record<string, SerializedValue>;
  /** 数组元素 */
  elements?: SerializedValue[];
  /** 远程对象引用 ID（用于保持代理能力） */
  refId?: string;
}

/**
 * 序列化值类型
 */
export enum SerializedValueType {
  UNDEFINED = 'undefined',
  NULL = 'null',
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  BIGINT = 'bigint',
  STRING = 'string',
  SYMBOL = 'symbol',
  FUNCTION = 'function',
  OBJECT = 'object',
  ARRAY = 'array',
  DATE = 'date',
  REGEXP = 'regexp',
  ERROR = 'error',
  PROMISE = 'promise',
  PROXY_REF = 'proxyRef',
  BUFFER = 'buffer',
  MAP = 'map',
  SET = 'set',
  /** 远程对象引用 - 保持代理能力 */
  OBJECT_REF = 'objectRef',
}

/**
 * 对象引用信息
 */
export interface ObjectRef {
  /** 引用 ID */
  refId: string;
  /** 对象类型名称 */
  className?: string;
}

/**
 * RPC 传输层接口
 */
export interface RpcTransport {
  /** 发送请求并等待响应 */
  send (request: RpcRequest): Promise<RpcResponse>;
  /** 注册回调处理器 */
  onCallback?(handler: (callbackId: string, args: SerializedValue[]) => Promise<SerializedValue>): void;
  /** 关闭连接 */
  close?(): void;
}

/**
 * RPC 服务端处理器接口
 */
export interface RpcServerHandler {
  /** 处理请求 */
  handleRequest (request: RpcRequest): Promise<RpcResponse>;
  /** 调用客户端回调 */
  invokeCallback?(callbackId: string, args: unknown[]): Promise<unknown>;
}

/**
 * 深层代理选项
 */
export interface DeepProxyOptions {
  /** 传输层 */
  transport: RpcTransport;
  /** 根路径 */
  rootPath?: PropertyKey[];
  /** 是否缓存属性 */
  cacheProperties?: boolean;
  /** 回调超时时间 (ms) */
  callbackTimeout?: number;
  /** 远程对象引用 ID（用于引用对象的代理） */
  refId?: string;
}

/**
 * RPC 服务端选项
 */
export interface RpcServerOptions {
  /** 目标对象 */
  target: unknown;
  /** 回调调用器 */
  callbackInvoker?: (callbackId: string, args: unknown[]) => Promise<unknown>;
  /**
   * 判断返回值是否应保持代理引用（而非完全序列化）
   * 默认对 class 实例和包含方法的对象返回 true
   */
  shouldProxyResult?: (value: unknown) => boolean;
}

/**
 * 代理元数据符号
 */
export const PROXY_META = Symbol('PROXY_META');

/**
 * 代理元数据
 */
export interface ProxyMeta {
  /** 访问路径 */
  path: PropertyKey[];
  /** 是否为代理 */
  isProxy: true;
  /** 远程对象引用 ID */
  refId?: string;
}
