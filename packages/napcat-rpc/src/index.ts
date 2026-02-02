/**
 * napcat-rpc
 *
 * 深层 RPC 代理库 - 将对象的所有层级操作转换为 RPC 调用
 */

// 简化 API（推荐使用）
export {
  createRpcPair,
  mockRemote,
  createServer,
  createClient,
} from './easy.js';

// 类型导出
export {
  RpcOperationType,
  SerializedValueType,
  PROXY_META,
  type RpcRequest,
  type RpcResponse,
  type SerializedValue,
  type RpcTransport,
  type RpcServerHandler,
  type RpcServerOptions,
  type DeepProxyOptions,
  type ProxyMeta,
} from './types.js';

// 序列化工具
export {
  serialize,
  deserialize,
  extractCallbackIds,
  SimpleCallbackRegistry,
  type CallbackRegistry,
  type SerializeContext,
  type DeserializeContext,
} from './serializer.js';

// 客户端代理
export {
  createDeepProxy,
  getProxyMeta,
  isRpcProxy,
} from './client.js';

// 服务端
export {
  RpcServer,
  createRpcServer,
} from './server.js';

// 传输层
export {
  LocalTransport,
  MessageTransport,
  createMessageServerHandler,
  type MessageTransportOptions,
} from './transport.js';
