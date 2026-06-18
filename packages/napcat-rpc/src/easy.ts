/**
 * 简化版 RPC API
 *
 * 提供一键创建完全隔离的 client/server 对
 * 在 client 端操作就像直接操作 server 端的变量一样
 */

import { LocalTransport } from './transport.js';
import { createDeepProxy, getProxyMeta, isRpcProxy } from './client.js';
import { RpcServer } from './server.js';
import type { ProxyMeta } from './types.js';

/**
 * RPC 配对结果
 */
export interface RpcPair<T> {
  /** 客户端代理 - 在这里操作就像直接操作服务端的变量 */
  client: T;
  /** 服务端原始对象 */
  server: T;
  /** 关闭连接 */
  close (): void;
}

/**
 * 创建 RPC 配对
 *
 * 快速创建完全隔离的 client/server 对，client 端的所有操作都会通过 RPC 传递到 server 端执行
 *
 * @example
 * ```ts
 * const { client, server } = createRpcPair({
 *   name: 'test',
 *   greet: (msg: string) => `Hello, ${msg}!`,
 *   register: (handlers: { onSuccess: Function, onError: Function }) => {
 *     handlers.onSuccess('done');
 *   }
 * });
 *
 * // 在 client 端操作，就像直接操作 server 端的变量
 * await client.greet('world'); // 返回 'Hello, world!'
 *
 * // 支持包含多个回调的对象
 * await client.register({
 *   onSuccess: (result) => console.log(result),
 *   onError: (err) => console.error(err)
 * });
 * ```
 */
export function createRpcPair<T extends object> (target: T): RpcPair<T> {
  const transport = new LocalTransport(target);
  const client = createDeepProxy<T>({ transport });

  return {
    client,
    server: target,
    close: () => transport.close(),
  };
}

/**
 * 模拟远程变量
 *
 * 将一个本地变量包装成"看起来像远程变量"的代理，所有操作都通过 RPC 隔离
 *
 * @example
 * ```ts
 * const remoteApi = mockRemote({
 *   counter: 0,
 *   increment() { return ++this.counter; },
 *   async fetchData(id: number) { return { id, data: 'test' }; }
 * });
 *
 * // 所有操作都是异步的，通过 RPC 隔离
 * await remoteApi.increment(); // 1
 * await remoteApi.fetchData(123); // { id: 123, data: 'test' }
 * ```
 */
export function mockRemote<T extends object> (target: T): T {
  return createRpcPair(target).client;
}

/**
 * 创建 RPC 服务端
 *
 * @example
 * ```ts
 * const server = createServer({
 *   users: new Map(),
 *   addUser(id: string, name: string) {
 *     this.users.set(id, { name });
 *     return true;
 *   }
 * });
 *
 * // 获取传输层供客户端连接
 * const transport = server.getTransport();
 * ```
 */
export function createServer<T extends object> (target: T): {
  target: T;
  handler: RpcServer;
  getTransport (): LocalTransport;
} {
  const handler = new RpcServer({ target });
  return {
    target,
    handler,
    getTransport: () => new LocalTransport(target),
  };
}

/**
 * 创建指向服务端的客户端
 *
 * @example
 * ```ts
 * const server = createServer(myApi);
 * const client = createClient<typeof myApi>(server.getTransport());
 *
 * await client.someMethod();
 * ```
 */
export function createClient<T extends object> (transport: LocalTransport): T {
  return createDeepProxy<T>({ transport });
}

// 重新导出常用工具
export { getProxyMeta, isRpcProxy };
export type { ProxyMeta };
