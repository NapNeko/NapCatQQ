import {
  type RpcRequest,
  type RpcResponse,
  type RpcServerOptions,
  type SerializedValue,
  RpcOperationType,
} from './types.js';
import { serialize, deserialize, SimpleCallbackRegistry } from './serializer.js';

/**
 * RPC 服务端
 *
 * 处理来自客户端的 RPC 请求，在目标对象上执行操作
 */
export class RpcServer {
  private target: unknown;
  private callbackInvoker?: (callbackId: string, args: unknown[]) => Promise<unknown>;
  private localCallbacks = new SimpleCallbackRegistry();

  constructor (options: RpcServerOptions) {
    this.target = options.target;
    this.callbackInvoker = options.callbackInvoker;
  }

  /**
   * 处理 RPC 请求
   */
  async handleRequest (request: RpcRequest): Promise<RpcResponse> {
    try {
      switch (request.type) {
        case RpcOperationType.GET:
          return this.handleGet(request);

        case RpcOperationType.SET:
          return this.handleSet(request);

        case RpcOperationType.APPLY:
          return await this.handleApply(request);

        case RpcOperationType.CONSTRUCT:
          return await this.handleConstruct(request);

        case RpcOperationType.HAS:
          return this.handleHas(request);

        case RpcOperationType.OWNKEYS:
          return this.handleOwnKeys(request);

        case RpcOperationType.DELETE:
          return this.handleDelete(request);

        case RpcOperationType.GET_DESCRIPTOR:
          return this.handleGetDescriptor(request);

        case RpcOperationType.GET_PROTOTYPE:
          return this.handleGetPrototype(request);

        case RpcOperationType.RELEASE:
          return this.handleRelease(request);

        default:
          return {
            id: request.id,
            success: false,
            error: `Unknown operation type: ${request.type}`,
          };
      }
    } catch (error) {
      return this.createErrorResponse(request.id, error);
    }
  }

  /**
   * 解析路径获取目标值
   */
  private resolvePath (path: PropertyKey[]): { parent: unknown; key: PropertyKey | undefined; value: unknown; } {
    let current = this.target;
    let parent: unknown = null;
    let key: PropertyKey | undefined;

    for (let i = 0; i < path.length; i++) {
      parent = current;
      key = path[i];
      if (key === undefined) {
        throw new Error('Path contains undefined key');
      }
      if (current === null || current === undefined) {
        throw new Error(`Cannot access property '${String(key)}' of ${current}`);
      }
      current = (current as Record<PropertyKey, unknown>)[key];
    }

    return { parent, key, value: current };
  }

  /**
   * 处理 GET 操作
   */
  private handleGet (request: RpcRequest): RpcResponse {
    const { value } = this.resolvePath(request.path);
    const isProxyable = this.isProxyable(value);

    return {
      id: request.id,
      success: true,
      result: serialize(value, { callbackRegistry: this.localCallbacks }),
      isProxyable,
    };
  }

  /**
   * 处理 SET 操作
   */
  private handleSet (request: RpcRequest): RpcResponse {
    const path = request.path;
    if (path.length === 0) {
      throw new Error('Cannot set root object');
    }

    const parentPath = path.slice(0, -1);
    const key = path[path.length - 1]!;
    const { value: parent } = this.resolvePath(parentPath);

    if (parent === null || parent === undefined) {
      throw new Error(`Cannot set property '${String(key)}' of ${parent}`);
    }

    const newValue = request.args?.[0]
      ? deserialize(request.args[0], {
        callbackResolver: this.createCallbackResolver(request),
      })
      : undefined;

    (parent as Record<PropertyKey, unknown>)[key] = newValue;

    return {
      id: request.id,
      success: true,
    };
  }

  /**
   * 处理 APPLY 操作
   */
  private async handleApply (request: RpcRequest): Promise<RpcResponse> {
    const path = request.path;
    if (path.length === 0) {
      throw new Error('Cannot call root object');
    }

    const methodPath = path.slice(0, -1);
    const methodName = path[path.length - 1]!;
    const { value: parent } = this.resolvePath(methodPath);

    if (parent === null || parent === undefined) {
      throw new Error(`Cannot call method on ${parent}`);
    }

    const method = (parent as Record<PropertyKey, unknown>)[methodName];
    if (typeof method !== 'function') {
      throw new Error(`${String(methodName)} is not a function`);
    }

    const args = (request.args ?? []).map(arg =>
      deserialize(arg, {
        callbackResolver: this.createCallbackResolver(request),
      })
    );

    let result = method.call(parent, ...args);

    // 处理 Promise
    if (result instanceof Promise) {
      result = await result;
    }

    const isProxyable = this.isProxyable(result);

    return {
      id: request.id,
      success: true,
      result: serialize(result, { callbackRegistry: this.localCallbacks }),
      isProxyable,
    };
  }

  /**
   * 处理 CONSTRUCT 操作
   */
  private async handleConstruct (request: RpcRequest): Promise<RpcResponse> {
    const { value: Constructor } = this.resolvePath(request.path);

    if (typeof Constructor !== 'function') {
      throw new Error('Target is not a constructor');
    }

    const args = (request.args ?? []).map(arg =>
      deserialize(arg, {
        callbackResolver: this.createCallbackResolver(request),
      })
    );

    const instance = new (Constructor as new (...args: unknown[]) => unknown)(...args);
    const isProxyable = this.isProxyable(instance);

    return {
      id: request.id,
      success: true,
      result: serialize(instance, { callbackRegistry: this.localCallbacks }),
      isProxyable,
    };
  }

  /**
   * 处理 HAS 操作
   */
  private handleHas (request: RpcRequest): RpcResponse {
    const path = request.path;
    if (path.length === 0) {
      return {
        id: request.id,
        success: true,
        result: serialize(true),
      };
    }

    const parentPath = path.slice(0, -1);
    const key = path[path.length - 1]!;
    const { value: parent } = this.resolvePath(parentPath);

    const has = parent !== null && parent !== undefined && key in (parent as object);

    return {
      id: request.id,
      success: true,
      result: serialize(has),
    };
  }

  /**
   * 处理 OWNKEYS 操作
   */
  private handleOwnKeys (request: RpcRequest): RpcResponse {
    const { value } = this.resolvePath(request.path);

    if (value === null || value === undefined) {
      return {
        id: request.id,
        success: true,
        result: serialize([]),
      };
    }

    const keys = Reflect.ownKeys(value as object);

    return {
      id: request.id,
      success: true,
      result: serialize(keys.map(k => (typeof k === 'symbol' ? k.description ?? '' : String(k)))),
    };
  }

  /**
   * 处理 DELETE 操作
   */
  private handleDelete (request: RpcRequest): RpcResponse {
    const path = request.path;
    if (path.length === 0) {
      throw new Error('Cannot delete root object');
    }

    const parentPath = path.slice(0, -1);
    const key = path[path.length - 1]!;
    const { value: parent } = this.resolvePath(parentPath);

    if (parent === null || parent === undefined) {
      throw new Error(`Cannot delete property from ${parent}`);
    }

    const deleted = delete (parent as Record<PropertyKey, unknown>)[key];

    return {
      id: request.id,
      success: true,
      result: serialize(deleted),
    };
  }

  /**
   * 处理 GET_DESCRIPTOR 操作
   */
  private handleGetDescriptor (request: RpcRequest): RpcResponse {
    const path = request.path;
    if (path.length === 0) {
      return {
        id: request.id,
        success: true,
        result: serialize(undefined),
      };
    }

    const parentPath = path.slice(0, -1);
    const key = path[path.length - 1]!;
    const { value: parent } = this.resolvePath(parentPath);

    if (parent === null || parent === undefined) {
      return {
        id: request.id,
        success: true,
        result: serialize(undefined),
      };
    }

    const descriptor = Object.getOwnPropertyDescriptor(parent as object, key);

    if (!descriptor) {
      return {
        id: request.id,
        success: true,
        result: serialize(undefined),
      };
    }

    // 序列化描述符（排除 value 和 get/set 函数）
    return {
      id: request.id,
      success: true,
      result: serialize({
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        writable: descriptor.writable,
      }),
    };
  }

  /**
   * 处理 GET_PROTOTYPE 操作
   */
  private handleGetPrototype (request: RpcRequest): RpcResponse {
    const { value } = this.resolvePath(request.path);

    if (value === null || value === undefined) {
      return {
        id: request.id,
        success: true,
        result: serialize(null),
      };
    }

    const proto = Object.getPrototypeOf(value);
    const name = proto?.constructor?.name ?? 'Object';

    return {
      id: request.id,
      success: true,
      result: serialize({ name }),
    };
  }

  /**
   * 处理 RELEASE 操作
   */
  private handleRelease (request: RpcRequest): RpcResponse {
    // 清理与该路径相关的资源（如果有）
    return {
      id: request.id,
      success: true,
    };
  }

  /**
   * 创建回调解析器
   */
  private createCallbackResolver (_request: RpcRequest): (id: string) => Function {
    return (callbackId: string) => {
      // 创建一个代理函数，调用时会通过 callbackInvoker 发送回客户端
      return async (...args: unknown[]) => {
        if (!this.callbackInvoker) {
          throw new Error('Callback invoker not configured');
        }
        return this.callbackInvoker(callbackId, args);
      };
    };
  }

  /**
   * 判断值是否应该返回代理引用
   */
  private isProxyable (value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    const type = typeof value;
    return type === 'object' || type === 'function';
  }

  /**
   * 创建错误响应
   */
  private createErrorResponse (requestId: string, error: unknown): RpcResponse {
    if (error instanceof Error) {
      return {
        id: requestId,
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
    return {
      id: requestId,
      success: false,
      error: String(error),
    };
  }

  /**
   * 调用客户端回调
   */
  async invokeCallback (callbackId: string, args: unknown[]): Promise<SerializedValue> {
    if (!this.callbackInvoker) {
      throw new Error('Callback invoker not configured');
    }
    const result = await this.callbackInvoker(callbackId, args);
    return serialize(result, { callbackRegistry: this.localCallbacks });
  }
}

/**
 * 创建 RPC 服务端
 */
export function createRpcServer (options: RpcServerOptions): RpcServer {
  return new RpcServer(options);
}
