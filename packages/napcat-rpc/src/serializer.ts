import {
  SerializedValue,
  SerializedValueType,
  PROXY_META,
  type ProxyMeta,
} from './types.js';

/**
 * 回调注册器接口
 */
export interface CallbackRegistry {
  register (fn: Function): string;
  get (id: string): Function | undefined;
  remove (id: string): void;
}

/**
 * 简单的回调注册器实现
 */
export class SimpleCallbackRegistry implements CallbackRegistry {
  private callbacks = new Map<string, Function>();
  private counter = 0;

  register (fn: Function): string {
    const id = `cb_${++this.counter}_${Date.now()}`;
    this.callbacks.set(id, fn);
    return id;
  }

  get (id: string): Function | undefined {
    return this.callbacks.get(id);
  }

  remove (id: string): void {
    this.callbacks.delete(id);
  }

  clear (): void {
    this.callbacks.clear();
  }
}

/**
 * 序列化上下文
 */
export interface SerializeContext {
  /** 回调注册器 */
  callbackRegistry?: CallbackRegistry;
  /** 已序列化对象映射（用于循环引用检测） */
  seen?: WeakMap<object, SerializedValue>;
  /** 深度限制 */
  maxDepth?: number;
  /** 当前深度 */
  currentDepth?: number;
}

/**
 * 反序列化上下文
 */
export interface DeserializeContext {
  /** 回调解析器 */
  callbackResolver?: (id: string) => Function;
  /** 代理创建器 */
  proxyCreator?: (path: PropertyKey[]) => unknown;
}

/**
 * 将值序列化为可传输格式
 */
export function serialize (value: unknown, context: SerializeContext = {}): SerializedValue {
  const {
    callbackRegistry,
    seen = new WeakMap(),
    maxDepth = 50,
    currentDepth = 0,
  } = context;

  // 深度检查
  if (currentDepth > maxDepth) {
    return { type: SerializedValueType.STRING, value: '[Max depth exceeded]' };
  }

  // 基本类型处理
  if (value === undefined) {
    return { type: SerializedValueType.UNDEFINED };
  }

  if (value === null) {
    return { type: SerializedValueType.NULL };
  }

  const valueType = typeof value;

  if (valueType === 'boolean') {
    return { type: SerializedValueType.BOOLEAN, value };
  }

  if (valueType === 'number') {
    const numValue = value as number;
    if (Number.isNaN(numValue)) {
      return { type: SerializedValueType.NUMBER, value: 'NaN' };
    }
    if (!Number.isFinite(numValue)) {
      return { type: SerializedValueType.NUMBER, value: numValue > 0 ? 'Infinity' : '-Infinity' };
    }
    return { type: SerializedValueType.NUMBER, value };
  }

  if (valueType === 'bigint') {
    return { type: SerializedValueType.BIGINT, value: (value as bigint).toString() };
  }

  if (valueType === 'string') {
    return { type: SerializedValueType.STRING, value };
  }

  if (valueType === 'symbol') {
    return {
      type: SerializedValueType.SYMBOL,
      value: (value as symbol).description ?? '',
    };
  }

  if (valueType === 'function') {
    const fn = value as Function;
    if (callbackRegistry) {
      const callbackId = callbackRegistry.register(fn);
      return {
        type: SerializedValueType.FUNCTION,
        callbackId,
        className: fn.name || 'anonymous',
      };
    }
    return {
      type: SerializedValueType.FUNCTION,
      className: fn.name || 'anonymous',
    };
  }

  // 对象类型处理
  const obj = value as object;

  // 检查是否为代理对象
  if (PROXY_META in obj) {
    const meta = (obj as Record<symbol, ProxyMeta | undefined>)[PROXY_META];
    if (meta) {
      return {
        type: SerializedValueType.PROXY_REF,
        proxyPath: meta.path,
      };
    }
  }

  // 循环引用检测
  if (seen.has(obj)) {
    return seen.get(obj)!;
  }

  // Date
  if (obj instanceof Date) {
    return { type: SerializedValueType.DATE, value: obj.toISOString() };
  }

  // RegExp
  if (obj instanceof RegExp) {
    return {
      type: SerializedValueType.REGEXP,
      value: { source: obj.source, flags: obj.flags },
    };
  }

  // Error
  if (obj instanceof Error) {
    return {
      type: SerializedValueType.ERROR,
      value: obj.message,
      className: obj.constructor.name,
      properties: {
        stack: serialize(obj.stack, { ...context, seen, currentDepth: currentDepth + 1 }),
      },
    };
  }

  // Buffer / Uint8Array
  if (obj instanceof Uint8Array) {
    return {
      type: SerializedValueType.BUFFER,
      value: Array.from(obj as Uint8Array),
    };
  }

  // Node.js Buffer
  if (typeof globalThis !== 'undefined' && 'Buffer' in globalThis) {
    const BufferClass = (globalThis as unknown as { Buffer: { isBuffer (obj: unknown): boolean; }; }).Buffer;
    if (BufferClass.isBuffer(obj)) {
      return {
        type: SerializedValueType.BUFFER,
        value: Array.from(obj as unknown as Uint8Array),
      };
    }
  }

  // Map
  if (obj instanceof Map) {
    const entries: SerializedValue[] = [];
    const nextContext = { ...context, seen, currentDepth: currentDepth + 1 };
    for (const [k, v] of obj) {
      entries.push(serialize([k, v], nextContext));
    }
    return {
      type: SerializedValueType.MAP,
      elements: entries,
    };
  }

  // Set
  if (obj instanceof Set) {
    const elements: SerializedValue[] = [];
    const nextContext = { ...context, seen, currentDepth: currentDepth + 1 };
    for (const v of obj) {
      elements.push(serialize(v, nextContext));
    }
    return {
      type: SerializedValueType.SET,
      elements,
    };
  }

  // Promise
  if (obj instanceof Promise) {
    return { type: SerializedValueType.PROMISE };
  }

  // Array
  if (Array.isArray(obj)) {
    const result: SerializedValue = {
      type: SerializedValueType.ARRAY,
      elements: [],
    };
    seen.set(obj, result);
    const nextContext = { ...context, seen, currentDepth: currentDepth + 1 };
    result.elements = obj.map(item => serialize(item, nextContext));
    return result;
  }

  // 普通对象
  const result: SerializedValue = {
    type: SerializedValueType.OBJECT,
    className: obj.constructor?.name ?? 'Object',
    properties: {},
  };
  seen.set(obj, result);

  const nextContext = { ...context, seen, currentDepth: currentDepth + 1 };
  for (const key of Object.keys(obj)) {
    result.properties![key] = serialize((obj as Record<string, unknown>)[key], nextContext);
  }

  return result;
}

/**
 * 将序列化数据还原为值
 */
export function deserialize (data: SerializedValue, context: DeserializeContext = {}): unknown {
  const { callbackResolver, proxyCreator } = context;

  switch (data.type) {
    case SerializedValueType.UNDEFINED:
      return undefined;

    case SerializedValueType.NULL:
      return null;

    case SerializedValueType.BOOLEAN:
      return data.value;

    case SerializedValueType.NUMBER:
      if (data.value === 'NaN') return NaN;
      if (data.value === 'Infinity') return Infinity;
      if (data.value === '-Infinity') return -Infinity;
      return data.value;

    case SerializedValueType.BIGINT:
      return BigInt(data.value as string);

    case SerializedValueType.STRING:
      return data.value;

    case SerializedValueType.SYMBOL:
      return Symbol(data.value as string);

    case SerializedValueType.FUNCTION:
      if (data.callbackId && callbackResolver) {
        return callbackResolver(data.callbackId);
      }
      // 返回一个占位函数
      return function placeholder () {
        throw new Error('Remote function cannot be called without callback resolver');
      };

    case SerializedValueType.DATE:
      return new Date(data.value as string);

    case SerializedValueType.REGEXP: {
      const { source, flags } = data.value as { source: string; flags: string; };
      return new RegExp(source, flags);
    }

    case SerializedValueType.ERROR: {
      const error = new Error(data.value as string);
      if (data.properties?.['stack']) {
        error.stack = deserialize(data.properties['stack'], context) as string;
      }
      return error;
    }

    case SerializedValueType.BUFFER: {
      const arr = data.value as number[];
      if (typeof globalThis !== 'undefined' && 'Buffer' in globalThis) {
        const BufferClass = (globalThis as unknown as { Buffer: { from (arr: number[]): Uint8Array; }; }).Buffer;
        return BufferClass.from(arr);
      }
      return new Uint8Array(arr);
    }

    case SerializedValueType.MAP: {
      const map = new Map();
      if (data.elements) {
        for (const element of data.elements) {
          const [k, v] = deserialize(element, context) as [unknown, unknown];
          map.set(k, v);
        }
      }
      return map;
    }

    case SerializedValueType.SET: {
      const set = new Set();
      if (data.elements) {
        for (const element of data.elements) {
          set.add(deserialize(element, context));
        }
      }
      return set;
    }

    case SerializedValueType.PROMISE:
      return Promise.resolve(undefined);

    case SerializedValueType.ARRAY:
      return (data.elements ?? []).map(elem => deserialize(elem, context));

    case SerializedValueType.PROXY_REF:
      if (data.proxyPath && proxyCreator) {
        return proxyCreator(data.proxyPath);
      }
      return {};

    case SerializedValueType.OBJECT: {
      const obj: Record<string, unknown> = {};
      if (data.properties) {
        for (const [key, val] of Object.entries(data.properties)) {
          obj[key] = deserialize(val, context);
        }
      }
      return obj;
    }

    default:
      return undefined;
  }
}

/**
 * 提取序列化参数中的回调ID映射
 */
export function extractCallbackIds (args: SerializedValue[]): Record<number, string> {
  const result: Record<number, string> = {};
  args.forEach((arg, index) => {
    if (arg.type === SerializedValueType.FUNCTION && arg.callbackId) {
      result[index] = arg.callbackId;
    }
  });
  return result;
}
