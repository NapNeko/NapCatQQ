import {
  type DeepProxyOptions,
  type ProxyMeta,
  RpcOperationType,
  PROXY_META,
  type RpcRequest,
} from './types.js';
import {
  serialize,
  deserialize,
  SimpleCallbackRegistry,
  extractCallbackIds,
} from './serializer.js';

/**
 * 生成唯一请求 ID
 */
function generateRequestId (): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * 创建深层 RPC 代理
 *
 * 将所有属性访问、方法调用等操作转换为 RPC 请求
 */
export function createDeepProxy<T = unknown> (options: DeepProxyOptions): T {
  const {
    transport,
    rootPath = [],
    refId: rootRefId,
    // callbackTimeout 可供未来扩展使用
  } = options;
  void options.callbackTimeout;

  const callbackRegistry = new SimpleCallbackRegistry();

  // 注册回调处理器
  if (transport.onCallback) {
    transport.onCallback(async (callbackId, serializedArgs) => {
      const callback = callbackRegistry.get(callbackId);
      if (!callback) {
        throw new Error(`Callback not found: ${callbackId}`);
      }
      const args = serializedArgs.map(arg => deserialize(arg, {
        callbackResolver: (id) => {
          const cb = callbackRegistry.get(id);
          if (!cb) throw new Error(`Nested callback not found: ${id}`);
          return cb;
        },
        proxyCreator: (path, proxyRefId, cachedProps) => createProxyAtPath(path, proxyRefId, cachedProps),
      }));
      const result = await callback(...args);
      return serialize(result, { callbackRegistry });
    });
  }

  /**
   * 在指定路径创建代理
   * @param path 路径
   * @param refId 远程对象引用 ID
   * @param cachedProps 缓存的属性值（避免属性访问需要 RPC）
   */
  function createProxyAtPath (path: PropertyKey[], refId?: string, cachedProps?: Record<string, unknown>): unknown {
    const proxyMeta: ProxyMeta = {
      path: [...path],
      isProxy: true,
      refId,
    };

    // 创建一个函数目标，以支持 apply 和 construct
    const target = function () { } as unknown as Record<PropertyKey, unknown>;

    return new Proxy(target, {
      get (_target, prop) {
        // 返回代理元数据
        if (prop === PROXY_META) {
          return proxyMeta;
        }

        // then 方法特殊处理，使代理可以被 await
        if (prop === 'then') {
          return undefined;
        }

        // 检查缓存属性（仅顶层代理，即 path 为空时）
        if (path.length === 0 && cachedProps && typeof prop === 'string' && prop in cachedProps) {
          return cachedProps[prop];
        }

        // 返回新的子路径代理（继承 refId，不继承 cachedProps）
        return createProxyAtPath([...path, prop], refId);
      },

      set (_target, prop, value) {
        const request: RpcRequest = {
          id: generateRequestId(),
          type: RpcOperationType.SET,
          path: [...path, prop],
          args: [serialize(value, { callbackRegistry })],
          refId,
        };

        // 同步返回，但实际是异步操作
        transport.send(request).catch(() => { /* ignore */ });
        return true;
      },

      apply (_target, _thisArg, args) {
        const serializedArgs = args.map(arg => serialize(arg, { callbackRegistry }));
        const callbackIds = extractCallbackIds(serializedArgs);

        const request: RpcRequest = {
          id: generateRequestId(),
          type: RpcOperationType.APPLY,
          path,
          args: serializedArgs,
          callbackIds: Object.keys(callbackIds).length > 0 ? callbackIds : undefined,
          refId,
        };

        return createAsyncResultProxy(request);
      },

      construct (_target, args): object {
        const serializedArgs = args.map(arg => serialize(arg, { callbackRegistry }));
        const callbackIds = extractCallbackIds(serializedArgs);

        const request: RpcRequest = {
          id: generateRequestId(),
          type: RpcOperationType.CONSTRUCT,
          path,
          args: serializedArgs,
          callbackIds: Object.keys(callbackIds).length > 0 ? callbackIds : undefined,
          refId,
        };

        return createAsyncResultProxy(request) as object;
      },

      has (_target, prop) {
        // 检查是否为代理元数据符号
        if (prop === PROXY_META) {
          return true;
        }
        // 同步返回 true，实际检查通过异步完成
        return true;
      },

      ownKeys () {
        // 返回空数组，实际键需要通过异步获取
        return [];
      },

      getOwnPropertyDescriptor (_target, _prop) {
        return {
          configurable: true,
          enumerable: true,
          writable: true,
        };
      },

      deleteProperty (_target, prop) {
        const request: RpcRequest = {
          id: generateRequestId(),
          type: RpcOperationType.DELETE,
          path: [...path, prop],
          refId,
        };

        transport.send(request).catch(() => { /* ignore */ });
        return true;
      },

      getPrototypeOf () {
        return Object.prototype;
      },
    });
  }

  /**
   * 创建异步结果代理
   * 返回一个 Promise-like 对象，可以被 await，
   * 同时也可以继续链式访问属性
   */
  function createAsyncResultProxy (request: RpcRequest): unknown {
    let resultPromise: Promise<unknown> | null = null;

    const getResult = async (): Promise<unknown> => {
      if (!resultPromise) {
        resultPromise = (async () => {
          const response = await transport.send(request);

          if (!response.success) {
            const error = new Error(response.error ?? 'RPC call failed');
            if (response.stack) {
              error.stack = response.stack;
            }
            throw error;
          }

          if (response.result === undefined) {
            return undefined;
          }

          // 如果结果是可代理对象，返回代理
          if (response.isProxyable && response.result) {
            const deserialized = deserialize(response.result, {
              callbackResolver: (id) => {
                const cb = callbackRegistry.get(id);
                if (!cb) throw new Error(`Callback not found: ${id}`);
                return cb;
              },
              proxyCreator: (proxyPath, proxyRefId, cachedProps) => createProxyAtPath(proxyPath, proxyRefId, cachedProps),
            });
            return deserialized;
          }

          return deserialize(response.result, {
            callbackResolver: (id) => {
              const cb = callbackRegistry.get(id);
              if (!cb) throw new Error(`Callback not found: ${id}`);
              return cb;
            },
            proxyCreator: (proxyPath, proxyRefId, cachedProps) => createProxyAtPath(proxyPath, proxyRefId, cachedProps),
          });
        })();
      }
      return resultPromise;
    };

    // 创建一个可链式访问的代理
    const target = function () { } as unknown as Record<PropertyKey, unknown>;

    return new Proxy(target, {
      get (_target, prop) {
        if (prop === 'then') {
          return (resolve: (value: unknown) => void, reject: (error: unknown) => void) => {
            getResult().then(resolve, reject);
          };
        }

        if (prop === 'catch') {
          return (reject: (error: unknown) => void) => {
            getResult().catch(reject);
          };
        }

        if (prop === 'finally') {
          return (callback: () => void) => {
            getResult().finally(callback);
          };
        }

        if (prop === PROXY_META) {
          return undefined;
        }

        // 链式访问：等待结果后访问其属性
        return createChainedProxy(getResult(), [prop]);
      },

      apply (_target, _thisArg, args) {
        // 等待结果后调用
        return getResult().then(result => {
          if (typeof result === 'function') {
            return result(...args);
          }
          throw new Error('Result is not callable');
        });
      },
    });
  }

  /**
   * 创建链式代理
   * 用于处理 await result.prop.method() 这样的链式调用
   */
  function createChainedProxy (parentPromise: Promise<unknown>, path: PropertyKey[]): unknown {
    const target = function () { } as unknown as Record<PropertyKey, unknown>;

    return new Proxy(target, {
      get (_target, prop) {
        if (prop === 'then') {
          return (resolve: (value: unknown) => void, reject: (error: unknown) => void) => {
            parentPromise
              .then(parent => {
                let value: unknown = parent;
                for (const key of path) {
                  if (value === null || value === undefined) {
                    return undefined;
                  }
                  value = (value as Record<PropertyKey, unknown>)[key];
                }
                resolve(value);
              })
              .catch(reject);
          };
        }

        if (prop === 'catch') {
          return (reject: (error: unknown) => void) => {
            parentPromise.catch(reject);
          };
        }

        if (prop === 'finally') {
          return (callback: () => void) => {
            parentPromise.finally(callback);
          };
        }

        return createChainedProxy(parentPromise, [...path, prop]);
      },

      apply (_target, _thisArg, args) {
        return parentPromise.then(parent => {
          let value: unknown = parent;
          const pathToMethod = path.slice(0, -1);
          const methodName = path[path.length - 1];

          for (const key of pathToMethod) {
            if (value === null || value === undefined) {
              throw new Error(`Cannot access property '${String(key)}' of ${value}`);
            }
            value = (value as Record<PropertyKey, unknown>)[key];
          }

          const method = (value as Record<PropertyKey, unknown>)[methodName!];
          if (typeof method !== 'function') {
            throw new Error(`${String(methodName)} is not a function`);
          }

          return method.call(value, ...args);
        });
      },
    });
  }

  return createProxyAtPath(rootPath, rootRefId) as T;
}

/**
 * 获取代理的元数据
 */
export function getProxyMeta (proxy: unknown): ProxyMeta | undefined {
  if (proxy != null && (typeof proxy === 'object' || typeof proxy === 'function')) {
    try {
      // 直接访问 Symbol 属性，代理的 get 陷阱会返回元数据
      const meta = (proxy as Record<symbol, ProxyMeta | undefined>)[PROXY_META];
      if (meta && meta.isProxy === true) {
        return meta;
      }
    } catch {
      // 忽略访问错误
    }
  }
  return undefined;
}

/**
 * 检查是否为 RPC 代理
 */
export function isRpcProxy (value: unknown): boolean {
  return getProxyMeta(value) !== undefined;
}
