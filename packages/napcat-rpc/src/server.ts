import {
  type RpcRequest,
  type RpcResponse,
  type RpcServerOptions,
  type SerializedValue,
  RpcOperationType,
  SerializedValueType,
} from './types.js';
import { serialize, deserialize, SimpleCallbackRegistry } from './serializer.js';

/**
 * 生成唯一引用 ID
 */
function generateRefId (): string {
  return `ref_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * 默认的代理判断函数
 * 判断返回值是否应该保持代理引用（而非完全序列化）
 * 策略：class 实例和有方法的对象保持代理，普通对象直接序列化
 */
function defaultShouldProxyResult (value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value !== 'object' && typeof value !== 'function') {
    return false;
  }
  // 函数保持代理
  if (typeof value === 'function') {
    return true;
  }
  // 可安全序列化的内置类型不代理
  if (value instanceof Date || value instanceof RegExp || value instanceof Error) {
    return false;
  }
  if (value instanceof Map || value instanceof Set) {
    return false;
  }
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    return false;
  }
  // 数组不代理
  if (Array.isArray(value)) {
    return false;
  }
  // 检查对象原型是否为 Object.prototype（普通对象）
  const proto = Object.getPrototypeOf(value);
  if (proto === Object.prototype || proto === null) {
    // 普通对象检查是否有方法
    const hasMethod = Object.values(value as object).some(v => typeof v === 'function');
    return hasMethod;
  }
  // 非普通对象（class 实例）- 保持代理
  return true;
}

/**
 * RPC 服务端
 *
 * 处理来自客户端的 RPC 请求，在目标对象上执行操作
 */
export class RpcServer {
  private target: unknown;
  private callbackInvoker?: (callbackId: string, args: unknown[]) => Promise<unknown>;
  private localCallbacks = new SimpleCallbackRegistry();
  /** 对象引用存储 */
  private objectRefs = new Map<string, unknown>();
  /** 代理判断函数 */
  private shouldProxyResult: (value: unknown) => boolean;

  constructor (options: RpcServerOptions) {
    this.target = options.target;
    this.callbackInvoker = options.callbackInvoker;
    this.shouldProxyResult = options.shouldProxyResult ?? defaultShouldProxyResult;
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
   * 解析路径获取目标值，支持 refId
   */
  private resolvePath (path: PropertyKey[], refId?: string): { parent: unknown; key: PropertyKey | undefined; value: unknown; } {
    // 如果有 refId，从引用存储中获取根对象
    let current = refId ? this.objectRefs.get(refId) : this.target;

    if (refId && current === undefined) {
      throw new Error(`Object reference not found: ${refId}`);
    }

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
   * 存储对象引用并返回序列化的引用
   */
  private storeObjectRef (value: unknown): SerializedValue {
    const refId = generateRefId();
    this.objectRefs.set(refId, value);
    const className = value?.constructor?.name;
    return {
      type: SerializedValueType.OBJECT_REF,
      refId,
      className: className !== 'Object' ? className : undefined,
    };
  }

  /**
   * 序列化结果值，如果需要代理则存储引用
   */
  private serializeResult (value: unknown): { result: SerializedValue; isProxyable: boolean; refId?: string; } {
    const shouldProxy = this.shouldProxyResult(value);

    if (shouldProxy) {
      const ref = this.storeObjectRef(value);
      return {
        result: ref,
        isProxyable: true,
        refId: ref.refId,
      };
    }

    return {
      result: serialize(value, { callbackRegistry: this.localCallbacks }),
      isProxyable: false,
    };
  }

  /**
   * 处理 GET 操作
   */
  private handleGet (request: RpcRequest): RpcResponse {
    const { value } = this.resolvePath(request.path, request.refId);
    const { result, isProxyable, refId } = this.serializeResult(value);

    return {
      id: request.id,
      success: true,
      result,
      isProxyable,
      refId,
    };
  }

  /**
   * 处理 SET 操作
   */
  private handleSet (request: RpcRequest): RpcResponse {
    const path = request.path;
    if (path.length === 0 && !request.refId) {
      throw new Error('Cannot set root object');
    }

    const parentPath = path.slice(0, -1);
    const key = path[path.length - 1]!;
    const { value: parent } = this.resolvePath(parentPath, request.refId);

    if (parent === null || parent === undefined) {
      throw new Error(`Cannot set property '${String(key)}' of ${parent}`);
    }

    const newValue = request.args?.[0]
      ? deserialize(request.args[0], {
        callbackResolver: this.createCallbackResolver(request),
        refResolver: (refId) => this.objectRefs.get(refId),
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

    // 如果有 refId 且 path 为空，说明引用对象本身是函数
    if (path.length === 0 && request.refId) {
      const func = this.objectRefs.get(request.refId);
      if (typeof func !== 'function') {
        throw new Error('Referenced object is not callable');
      }

      const args = (request.args ?? []).map(arg =>
        deserialize(arg, {
          callbackResolver: this.createCallbackResolver(request),
          refResolver: (refId) => this.objectRefs.get(refId),
        })
      );

      let result = func(...args);
      if (result instanceof Promise) {
        result = await result;
      }

      const { result: serializedResult, isProxyable, refId } = this.serializeResult(result);
      return {
        id: request.id,
        success: true,
        result: serializedResult,
        isProxyable,
        refId,
      };
    }

    if (path.length === 0) {
      throw new Error('Cannot call root object');
    }

    const methodPath = path.slice(0, -1);
    const methodName = path[path.length - 1]!;
    const { value: parent } = this.resolvePath(methodPath, request.refId);

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
        refResolver: (refId) => this.objectRefs.get(refId),
      })
    );

    let result = method.call(parent, ...args);

    // 处理 Promise
    if (result instanceof Promise) {
      result = await result;
    }

    const { result: serializedResult, isProxyable, refId } = this.serializeResult(result);

    return {
      id: request.id,
      success: true,
      result: serializedResult,
      isProxyable,
      refId,
    };
  }

  /**
   * 处理 CONSTRUCT 操作
   */
  private async handleConstruct (request: RpcRequest): Promise<RpcResponse> {
    const { value: Constructor } = this.resolvePath(request.path, request.refId);

    if (typeof Constructor !== 'function') {
      throw new Error('Target is not a constructor');
    }

    const args = (request.args ?? []).map(arg =>
      deserialize(arg, {
        callbackResolver: this.createCallbackResolver(request),
        refResolver: (refId) => this.objectRefs.get(refId),
      })
    );

    const instance = new (Constructor as new (...args: unknown[]) => unknown)(...args);
    const { result, isProxyable, refId } = this.serializeResult(instance);

    return {
      id: request.id,
      success: true,
      result,
      isProxyable,
      refId,
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
    const { value: parent } = this.resolvePath(parentPath, request.refId);

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
    const { value } = this.resolvePath(request.path, request.refId);

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
    if (path.length === 0 && !request.refId) {
      throw new Error('Cannot delete root object');
    }

    const parentPath = path.slice(0, -1);
    const key = path[path.length - 1]!;
    const { value: parent } = this.resolvePath(parentPath, request.refId);

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
    const { value: parent } = this.resolvePath(parentPath, request.refId);

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
    const { value } = this.resolvePath(request.path, request.refId);

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
    // 如果有 refId，释放该引用
    if (request.refId) {
      this.objectRefs.delete(request.refId);
    }
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
