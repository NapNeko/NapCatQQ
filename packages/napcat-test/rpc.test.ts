import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  // 简化 API
  createRpcPair,
  mockRemote,
  createServer,
  createClient,
  // 底层 API
  createDeepProxy,
  LocalTransport,
  serialize,
  deserialize,
  SerializedValueType,
  isRpcProxy,
  getProxyMeta,
  RpcServer,
  MessageTransport,
  createMessageServerHandler,
} from '@/napcat-rpc/src';

// 测试用目标对象
interface TestObject {
  name: string;
  count: number;
  nested: {
    value: string;
    deep: {
      level: number;
      getData (): { info: string; };
    };
  };
  items: string[];
  greet (name: string): string;
  asyncGreet (name: string): Promise<string>;
  add (a: number, b: number): number;
  multiply (a: number, b: number): number;
  withCallback (fn: (x: number) => number): number;
  asyncWithCallback (fn: (x: number) => Promise<number>): Promise<number>;
  multiCallback (
    onSuccess: (result: string) => void,
    onError: (error: Error) => void
  ): void;
  getObject (): { id: number; name: string; };
  createInstance: new (name: string) => { name: string; greet (): string; getName (): string; };
  getData (): Map<string, number>;
  getSet (): Set<string>;
  getDate (): Date;
  getBuffer (): Uint8Array;
  throwError (): never;
  asyncThrowError (): Promise<never>;
}

function createTestObject (): TestObject {
  return {
    name: 'test',
    count: 42,
    nested: {
      value: 'nested-value',
      deep: {
        level: 3,
        getData () {
          return { info: 'deep-info' };
        },
      },
    },
    items: ['a', 'b', 'c'],
    greet (name: string) {
      return `Hello, ${name}!`;
    },
    async asyncGreet (name: string) {
      await Promise.resolve();
      return `Async Hello, ${name}!`;
    },
    add (a: number, b: number) {
      return a + b;
    },
    multiply (a: number, b: number) {
      return a * b;
    },
    withCallback (fn: (x: number) => number) {
      return fn(10) * 2;
    },
    async asyncWithCallback (fn: (x: number) => Promise<number>) {
      const result = await fn(5);
      return result + 100;
    },
    multiCallback (
      onSuccess: (result: string) => void,
      onError: (error: Error) => void
    ) {
      try {
        onSuccess('Operation completed');
      } catch (e) {
        onError(e as Error);
      }
    },
    getObject () {
      return { id: 1, name: 'object-name' };
    },
    createInstance: class TestClass {
      constructor (public name: string) { }
      greet () {
        return `Instance: ${this.name}`;
      }
      getName () {
        return this.name;
      }
    } as unknown as new (name: string) => { name: string; greet (): string; getName (): string; },
    getData () {
      return new Map([['a', 1], ['b', 2]]);
    },
    getSet () {
      return new Set(['x', 'y', 'z']);
    },
    getDate () {
      return new Date('2024-01-15T10:30:00.000Z');
    },
    getBuffer () {
      return new Uint8Array([1, 2, 3, 4, 5]);
    },
    throwError () {
      throw new Error('Test error');
    },
    async asyncThrowError () {
      await Promise.resolve();
      throw new Error('Async test error');
    },
  };
}

describe('napcat-rpc RPC', () => {
  describe('serialize / deserialize', () => {
    it('should serialize and deserialize primitive types', () => {
      // undefined
      expect(deserialize(serialize(undefined))).toBeUndefined();

      // null
      expect(deserialize(serialize(null))).toBeNull();

      // boolean
      expect(deserialize(serialize(true))).toBe(true);
      expect(deserialize(serialize(false))).toBe(false);

      // number
      expect(deserialize(serialize(42))).toBe(42);
      expect(deserialize(serialize(3.14))).toBe(3.14);
      expect(deserialize(serialize(NaN))).toBeNaN();
      expect(deserialize(serialize(Infinity))).toBe(Infinity);
      expect(deserialize(serialize(-Infinity))).toBe(-Infinity);

      // bigint
      expect(deserialize(serialize(BigInt('9007199254740993')))).toBe(BigInt('9007199254740993'));

      // string
      expect(deserialize(serialize('hello'))).toBe('hello');
      expect(deserialize(serialize(''))).toBe('');
    });

    it('should serialize and deserialize Date', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const result = deserialize(serialize(date)) as Date;
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe(date.toISOString());
    });

    it('should serialize and deserialize RegExp', () => {
      const regex = /test\d+/gi;
      const result = deserialize(serialize(regex)) as RegExp;
      expect(result).toBeInstanceOf(RegExp);
      expect(result.source).toBe(regex.source);
      expect(result.flags).toBe(regex.flags);
    });

    it('should serialize and deserialize Error', () => {
      const error = new Error('test error');
      const result = deserialize(serialize(error)) as Error;
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('test error');
    });

    it('should serialize and deserialize arrays', () => {
      const arr = [1, 'two', { three: 3 }, [4, 5]];
      const result = deserialize(serialize(arr));
      expect(result).toEqual(arr);
    });

    it('should serialize and deserialize objects', () => {
      const obj = {
        name: 'test',
        count: 42,
        nested: {
          value: 'nested',
        },
      };
      const result = deserialize(serialize(obj));
      expect(result).toEqual(obj);
    });

    it('should serialize and deserialize Map', () => {
      const map = new Map<string, number>([['a', 1], ['b', 2]]);
      const result = deserialize(serialize(map)) as Map<string, number>;
      expect(result).toBeInstanceOf(Map);
      expect(result.get('a')).toBe(1);
      expect(result.get('b')).toBe(2);
    });

    it('should serialize and deserialize Set', () => {
      const set = new Set(['x', 'y', 'z']);
      const result = deserialize(serialize(set)) as Set<string>;
      expect(result).toBeInstanceOf(Set);
      expect(result.has('x')).toBe(true);
      expect(result.has('y')).toBe(true);
      expect(result.has('z')).toBe(true);
    });

    it('should serialize and deserialize Uint8Array', () => {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);
      const result = deserialize(serialize(buffer)) as Uint8Array;
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle circular references gracefully', () => {
      const obj: { self?: unknown; } = {};
      obj.self = obj;
      // 应该不抛出错误
      const serialized = serialize(obj);
      expect(serialized.type).toBe(SerializedValueType.OBJECT);
    });
  });

  describe('LocalTransport + createDeepProxy', () => {
    let target: TestObject;
    let transport: LocalTransport;
    let proxy: TestObject;

    beforeEach(() => {
      target = createTestObject();
      transport = new LocalTransport(target);
      proxy = createDeepProxy<TestObject>({ transport });
    });

    it('should identify RPC proxy', () => {
      expect(isRpcProxy(proxy)).toBe(true);
      expect(isRpcProxy({})).toBe(false);
      expect(isRpcProxy(null)).toBe(false);
    });

    it('should get proxy metadata', () => {
      const meta = getProxyMeta(proxy);
      expect(meta).toBeDefined();
      expect(meta?.isProxy).toBe(true);
      expect(meta?.path).toEqual([]);

      const nestedMeta = getProxyMeta(proxy.nested);
      expect(nestedMeta?.path).toEqual(['nested']);
    });

    describe('property access', () => {
      it('should access nested properties through method call', async () => {
        // 通过方法调用获取嵌套属性
        const result = await proxy.nested.deep.getData();
        expect(result).toEqual({ info: 'deep-info' });
      });
    });

    describe('method calls', () => {
      it('should call synchronous methods', async () => {
        const result = await proxy.greet('World');
        expect(result).toBe('Hello, World!');
      });

      it('should call methods with multiple arguments', async () => {
        const sum = await proxy.add(5, 3);
        expect(sum).toBe(8);

        const product = await proxy.multiply(4, 7);
        expect(product).toBe(28);
      });

      it('should call async methods', async () => {
        const result = await proxy.asyncGreet('Async');
        expect(result).toBe('Async Hello, Async!');
      });

      it('should call deeply nested methods', async () => {
        const result = await proxy.nested.deep.getData();
        expect(result).toEqual({ info: 'deep-info' });
      });
    });

    describe('callback proxying', () => {
      it('should proxy callbacks to remote (async pattern)', async () => {
        // RPC 回调本质上是异步的，因此服务端必须 await 回调结果
        // 测试 asyncWithCallback 场景（服务端已经 await 回调）
        const callback = vi.fn(async (x: number) => x * 3);
        const result = await proxy.asyncWithCallback(callback);

        expect(callback).toHaveBeenCalledWith(5);
        expect(result).toBe(115); // (5 * 3) + 100
      });

      it('should proxy async callbacks', async () => {
        const callback = vi.fn(async (x: number) => {
          await Promise.resolve();
          return x * 4;
        });
        const result = await proxy.asyncWithCallback(callback);

        expect(callback).toHaveBeenCalledWith(5);
        expect(result).toBe(120); // (5 * 4) + 100
      });

      it('should handle multiple callbacks', async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        await proxy.multiCallback(onSuccess, onError);

        expect(onSuccess).toHaveBeenCalledWith('Operation completed');
        expect(onError).not.toHaveBeenCalled();
      });
    });

    describe('return value types', () => {
      it('should handle object return values', async () => {
        const result = await proxy.getObject();
        expect(result).toEqual({ id: 1, name: 'object-name' });
      });

      it('should handle Map return values', async () => {
        const result = await proxy.getData();
        expect(result).toBeInstanceOf(Map);
        expect((result as Map<string, number>).get('a')).toBe(1);
      });

      it('should handle Set return values', async () => {
        const result = await proxy.getSet();
        expect(result).toBeInstanceOf(Set);
        expect((result as Set<string>).has('x')).toBe(true);
      });

      it('should handle Date return values', async () => {
        const result = await proxy.getDate();
        expect(result).toBeInstanceOf(Date);
        expect((result as Date).toISOString()).toBe('2024-01-15T10:30:00.000Z');
      });

      it('should handle Uint8Array return values', async () => {
        const result = await proxy.getBuffer();
        expect(result).toBeInstanceOf(Uint8Array);
        expect(Array.from(result as Uint8Array)).toEqual([1, 2, 3, 4, 5]);
      });
    });

    describe('error handling', () => {
      it('should propagate sync errors', async () => {
        await expect(proxy.throwError()).rejects.toThrow('Test error');
      });

      it('should propagate async errors', async () => {
        await expect(proxy.asyncThrowError()).rejects.toThrow('Async test error');
      });
    });

    describe('constructor proxying', () => {
      it('should proxy constructor calls', async () => {
        const Constructor = proxy.createInstance;
        const instance = await new Constructor('TestInstance');
        // 返回的是代理对象，需要 await 获取属性值
        expect(await instance.getName()).toBe('TestInstance');
      });
    });

    describe('property modification', () => {
      it('should set properties through proxy', async () => {
        proxy.count = 100;
        // 等待一下让异步操作完成
        await new Promise(resolve => setTimeout(resolve, 10));
        expect(target.count).toBe(100);
      });

      it('should set nested properties', async () => {
        proxy.nested.value = 'modified';
        await new Promise(resolve => setTimeout(resolve, 10));
        expect(target.nested.value).toBe('modified');
      });
    });

    describe('delete property', () => {
      it('should delete properties through proxy', async () => {
        (target as { deletable?: string; }).deletable = 'will be deleted';
        delete (proxy as { deletable?: string; }).deletable;
        await new Promise(resolve => setTimeout(resolve, 10));
        expect((target as { deletable?: string; }).deletable).toBeUndefined();
      });
    });
  });

  describe('RpcServer', () => {
    it('should handle GET requests', async () => {
      const target = { name: 'test', nested: { value: 123 } };
      const server = new RpcServer({ target });

      const response = await server.handleRequest({
        id: 'req1',
        type: 'get' as never,
        path: ['name'],
      });

      expect(response.success).toBe(true);
      expect(deserialize(response.result!)).toBe('test');
    });

    it('should handle SET requests', async () => {
      const target = { name: 'test' };
      const server = new RpcServer({ target });

      const response = await server.handleRequest({
        id: 'req1',
        type: 'set' as never,
        path: ['name'],
        args: [serialize('modified')],
      });

      expect(response.success).toBe(true);
      expect(target.name).toBe('modified');
    });

    it('should handle APPLY requests', async () => {
      const target = {
        add: (a: number, b: number) => a + b,
      };
      const server = new RpcServer({ target });

      const response = await server.handleRequest({
        id: 'req1',
        type: 'apply' as never,
        path: ['add'],
        args: [serialize(3), serialize(4)],
      });

      expect(response.success).toBe(true);
      expect(deserialize(response.result!)).toBe(7);
    });

    it('should handle errors gracefully', async () => {
      const target = {
        fail: () => {
          throw new Error('Intentional failure');
        },
      };
      const server = new RpcServer({ target });

      const response = await server.handleRequest({
        id: 'req1',
        type: 'apply' as never,
        path: ['fail'],
        args: [],
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Intentional failure');
    });
  });

  describe('MessageTransport', () => {
    it('should communicate via message channel', async () => {
      const target = {
        echo: (msg: string) => `Echo: ${msg}`,
        add: (a: number, b: number) => a + b,
      };

      // 模拟消息通道
      type MessageHandler = (message: string) => void;
      let clientHandler: MessageHandler = () => { };
      let serverHandler: MessageHandler = () => { };

      // 创建服务端处理器
      createMessageServerHandler(target, {
        sendMessage: (msg) => {
          setTimeout(() => clientHandler(msg), 0);
        },
        onMessage: (handler) => {
          serverHandler = handler;
        },
      });

      // 创建客户端传输层
      const transport = new MessageTransport({
        sendMessage: (msg) => {
          setTimeout(() => serverHandler(msg), 0);
        },
        onMessage: (handler) => {
          clientHandler = handler;
        },
      });

      const proxy = createDeepProxy<typeof target>({ transport });

      // 测试调用
      const echoResult = await proxy.echo('Hello');
      expect(echoResult).toBe('Echo: Hello');

      const addResult = await proxy.add(10, 20);
      expect(addResult).toBe(30);

      transport.close();
    });
  });

  describe('complex scenarios', () => {
    it('should handle chained method calls with await', async () => {
      const target = {
        calculator: {
          add: (a: number, b: number) => a + b,
          multiply: (a: number, b: number) => a * b,
        },
      };

      const transport = new LocalTransport(target);
      const proxy = createDeepProxy<typeof target>({ transport });

      // RPC 场景中，可以通过嵌套路径直接调用方法
      const sum = await proxy.calculator.add(5, 3);
      expect(sum).toBe(8);

      const product = await proxy.calculator.multiply(4, 5);
      expect(product).toBe(20);
    });

    it('should handle arrays with objects', async () => {
      const target = {
        getUsers: () => [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      };

      const transport = new LocalTransport(target);
      const proxy = createDeepProxy<typeof target>({ transport });

      const users = await proxy.getUsers();
      expect(users).toHaveLength(2);
      expect(users[0]).toEqual({ id: 1, name: 'Alice' });
      expect(users[1]).toEqual({ id: 2, name: 'Bob' });
    });

    it('should handle async callbacks that return objects', async () => {
      const target = {
        transformAsync: async (items: number[], fn: (item: number) => Promise<{ doubled: number; }>) => {
          const results: { doubled: number; }[] = [];
          for (const item of items) {
            results.push(await fn(item));
          }
          return results;
        },
      };

      const transport = new LocalTransport(target);
      const proxy = createDeepProxy<typeof target>({ transport });

      const callback = vi.fn(async (x: number) => ({ doubled: x * 2 }));
      const result = await proxy.transformAsync([1, 2, 3], callback);

      expect(callback).toHaveBeenCalledTimes(3);
      expect(result).toEqual([
        { doubled: 2 },
        { doubled: 4 },
        { doubled: 6 },
      ]);
    });

    it('should handle nested callback with Promise', async () => {
      const target = {
        processWithCallback: async (
          value: number,
          processor: (x: number) => Promise<number>
        ): Promise<number> => {
          const result = await processor(value);
          return result * 2;
        },
      };

      const transport = new LocalTransport(target);
      const proxy = createDeepProxy<typeof target>({ transport });

      const callback = vi.fn(async (x: number) => x + 10);
      const result = await proxy.processWithCallback(5, callback);

      expect(callback).toHaveBeenCalledWith(5);
      expect(result).toBe(30); // (5 + 10) * 2
    });

    it('should handle Promise-returning callbacks', async () => {
      const target = {
        processAsync: async (
          data: number[],
          processor: (item: number) => Promise<number>
        ): Promise<number[]> => {
          const results: number[] = [];
          for (const item of data) {
            results.push(await processor(item));
          }
          return results;
        },
      };

      const transport = new LocalTransport(target);
      const proxy = createDeepProxy<typeof target>({ transport });

      const processor = vi.fn(async (x: number) => {
        await new Promise(r => setTimeout(r, 1));
        return x * 10;
      });

      const result = await proxy.processAsync([1, 2, 3], processor);
      // 数组返回代理，需 await 获取元素
      expect(await result[0]).toBe(10);
      expect(await result[1]).toBe(20);
      expect(await result[2]).toBe(30);
      expect(processor).toHaveBeenCalledTimes(3);
    });

    it('should maintain this context in methods', async () => {
      const target = {
        value: 100,
        getValue () {
          return this.value;
        },
        double () {
          return this.value * 2;
        },
      };

      const transport = new LocalTransport(target);
      const proxy = createDeepProxy<typeof target>({ transport });

      expect(await proxy.getValue()).toBe(100);
      expect(await proxy.double()).toBe(200);
    });

    it('should handle Symbol properties', async () => {
      const sym = Symbol('test');
      const target = {
        [sym]: 'symbol-value',
        getSymbolValue () {
          return this[sym];
        },
      };

      const transport = new LocalTransport(target);
      const proxy = createDeepProxy<typeof target>({ transport });

      const result = await proxy.getSymbolValue();
      expect(result).toBe('symbol-value');
    });
  });

  // ========== 简化 API 测试 ==========
  describe('Easy API - createRpcPair', () => {
    it('should create isolated client/server pair', async () => {
      const { client, server } = createRpcPair({
        counter: 0,
        increment () {
          return ++this.counter;
        },
        getCounter () {
          return this.counter;
        },
      });

      // client 端操作会影响 server 端
      expect(await client.increment()).toBe(1);
      expect(await client.increment()).toBe(2);
      expect(server.counter).toBe(2);
      expect(await client.getCounter()).toBe(2);
    });

    it('should support nested objects', async () => {
      const { client } = createRpcPair({
        user: {
          profile: {
            name: 'Alice',
            age: 25,
            getInfo () {
              return `${this.name}, ${this.age}`;
            },
          },
        },
      });

      const info = await client.user.profile.getInfo();
      expect(info).toBe('Alice, 25');
    });

    it('should support .register({ cb1, cb2 }) pattern', async () => {
      const results: string[] = [];

      const { client } = createRpcPair({
        async register (handlers: {
          onConnect: () => Promise<void>;
          onMessage: (msg: string) => Promise<void>;
          onDisconnect: (reason: string) => Promise<void>;
        }) {
          await handlers.onConnect();
          await handlers.onMessage('Hello');
          await handlers.onMessage('World');
          await handlers.onDisconnect('bye');
          return 'registered';
        },
      });

      const result = await client.register({
        onConnect: async () => {
          results.push('connected');
        },
        onMessage: async (msg) => {
          results.push(`msg:${msg}`);
        },
        onDisconnect: async (reason) => {
          results.push(`disconnected:${reason}`);
        },
      });

      expect(result).toBe('registered');
      expect(results).toEqual([
        'connected',
        'msg:Hello',
        'msg:World',
        'disconnected:bye',
      ]);
    });

    it('should support complex callback objects with return values', async () => {
      const { client } = createRpcPair({
        async process (handlers: {
          transform: (x: number) => Promise<number>;
          validate: (x: number) => Promise<boolean>;
          format: (x: number) => Promise<string>;
        }) {
          const values: string[] = [];
          for (const num of [1, 2, 3, 4, 5]) {
            const transformed = await handlers.transform(num);
            if (await handlers.validate(transformed)) {
              values.push(await handlers.format(transformed));
            }
          }
          return values;
        },
      });

      const result = await client.process({
        transform: async (x) => x * 2,
        validate: async (x) => x > 5,
        format: async (x) => `value:${x}`,
      });

      // 数组返回代理
      expect(await result[0]).toBe('value:6');
      expect(await result[1]).toBe('value:8');
      expect(await result[2]).toBe('value:10');
    });
  });

  describe('Easy API - mockRemote', () => {
    it('should create remote-like proxy easily', async () => {
      const api = mockRemote({
        add: (a: number, b: number) => a + b,
        multiply: (a: number, b: number) => a * b,
      });

      expect(await api.add(2, 3)).toBe(5);
      expect(await api.multiply(4, 5)).toBe(20);
    });

    it('should handle async methods', async () => {
      const api = mockRemote({
        async fetchUser (id: number) {
          return { id, name: `User${id}` };
        },
        async delay (ms: number) {
          await new Promise(r => setTimeout(r, ms));
          return 'done';
        },
      });

      const user = await api.fetchUser(123);
      // 对象返回代理
      expect(await user.id).toBe(123);
      expect(await user.name).toBe('User123');
    });
  });

  describe('Easy API - createServer/createClient', () => {
    it('should create server and connect clients', async () => {
      const server = createServer({
        data: [] as string[],
        add (item: string) {
          this.data.push(item);
          return this.data.length;
        },
        getAll () {
          return [...this.data];
        },
      });

      const client1 = createClient<typeof server.target>(server.getTransport());
      const client2 = createClient<typeof server.target>(server.getTransport());

      await client1.add('from-client1');
      await client2.add('from-client2');

      // 数组返回代理
      const list1 = await client1.getAll();
      const list2 = await client2.getAll();
      expect(await list1[0]).toBe('from-client1');
      expect(await list1[1]).toBe('from-client2');
      expect(await list2[0]).toBe('from-client1');
      expect(await list2[1]).toBe('from-client2');
    });
  });

  // ========== 多层调用场景 ==========
  describe('Multi-level deep proxy operations', () => {
    it('should handle 5+ levels of nesting', async () => {
      const { client } = createRpcPair({
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  getValue () {
                    return 'deep-value';
                  },
                  async getAsyncValue () {
                    return 'async-deep-value';
                  },
                },
              },
            },
          },
        },
      });

      expect(await client.level1.level2.level3.level4.level5.getValue()).toBe('deep-value');
      expect(await client.level1.level2.level3.level4.level5.getAsyncValue()).toBe('async-deep-value');
    });

    it('should handle array of objects with data', async () => {
      const { client } = createRpcPair({
        getItems () {
          return [
            { id: 1, name: 'Item1', active: true },
            { id: 2, name: 'Item2', active: false },
            { id: 3, name: 'Item3', active: true },
          ];
        },
        getItemById (id: number) {
          const items = [
            { id: 1, name: 'Item1' },
            { id: 2, name: 'Item2' },
          ];
          return items.find(item => item.id === id);
        },
      });

      const items = await client.getItems();
      // 数组返回代理
      const item0 = await items[0];
      const item1 = await items[1];
      expect(await item0!.id).toBe(1);
      expect(await item0!.name).toBe('Item1');
      expect(await item1!.id).toBe(2);

      const item = await client.getItemById(2);
      expect(await item!.id).toBe(2);
      expect(await item!.name).toBe('Item2');
    });

    it('should handle Map and Set in nested structures', async () => {
      const { client } = createRpcPair({
        storage: {
          getMap () {
            return new Map([
              ['key1', { value: 1 }],
              ['key2', { value: 2 }],
            ]);
          },
          getSet () {
            return new Set([1, 2, 3, 4, 5]);
          },
        },
      });

      const map = await client.storage.getMap();
      expect(map).toBeInstanceOf(Map);
      expect(map.get('key1')).toEqual({ value: 1 });

      const set = await client.storage.getSet();
      expect(set).toBeInstanceOf(Set);
      expect(set.has(3)).toBe(true);
    });

    it('should handle event emitter pattern', async () => {
      const events: string[] = [];

      const { client } = createRpcPair({
        eventEmitter: {
          async on (event: string, handler: (data: string) => Promise<void>) {
            // 模拟事件触发
            await handler(`${event}:data1`);
            await handler(`${event}:data2`);
            return () => { /* unsubscribe */ };
          },
        },
      });

      await client.eventEmitter.on('message', async (data) => {
        events.push(data);
      });

      expect(events).toEqual(['message:data1', 'message:data2']);
    });

    it('should handle Promise chain in callbacks', async () => {
      const { client } = createRpcPair({
        async pipeline (
          input: number,
          stages: {
            step1: (x: number) => Promise<number>;
            step2: (x: number) => Promise<number>;
            step3: (x: number) => Promise<string>;
          }
        ) {
          const r1 = await stages.step1(input);
          const r2 = await stages.step2(r1);
          const r3 = await stages.step3(r2);
          return r3;
        },
      });

      const result = await client.pipeline(5, {
        step1: async (x) => x * 2,      // 10
        step2: async (x) => x + 3,      // 13
        step3: async (x) => `result:${x}`,  // 'result:13'
      });

      expect(result).toBe('result:13');
    });

    it('should handle mixed sync/async handlers in object', async () => {
      const logs: string[] = [];

      const { client } = createRpcPair({
        async execute (handlers: {
          beforeStart: () => Promise<void>;
          onProgress: (percent: number) => Promise<void>;
          afterComplete: () => Promise<string>;
        }) {
          await handlers.beforeStart();
          await handlers.onProgress(25);
          await handlers.onProgress(50);
          await handlers.onProgress(75);
          await handlers.onProgress(100);
          return await handlers.afterComplete();
        },
      });

      const result = await client.execute({
        beforeStart: async () => {
          logs.push('started');
        },
        onProgress: async (percent) => {
          logs.push(`progress:${percent}%`);
        },
        afterComplete: async () => {
          logs.push('completed');
          return 'success';
        },
      });

      expect(result).toBe('success');
      expect(logs).toEqual([
        'started',
        'progress:25%',
        'progress:50%',
        'progress:75%',
        'progress:100%',
        'completed',
      ]);
    });
  });

  // ========== 边界情况 ==========
  describe('Edge cases', () => {
    it('should handle undefined and null in callbacks', async () => {
      const { client } = createRpcPair({
        async process (handler: (val: unknown) => Promise<unknown>) {
          const results: unknown[] = [];
          results.push(await handler(undefined));
          results.push(await handler(null));
          results.push(await handler(0));
          results.push(await handler(''));
          results.push(await handler(false));
          return results;
        },
      });

      const result = await client.process(async (val) => {
        if (val === undefined) return 'undefined';
        if (val === null) return 'null';
        if (val === 0) return 'zero';
        if (val === '') return 'empty';
        if (val === false) return 'false';
        return 'other';
      });

      // 数组返回代理
      expect(await result[0]).toBe('undefined');
      expect(await result[1]).toBe('null');
      expect(await result[2]).toBe('zero');
      expect(await result[3]).toBe('empty');
      expect(await result[4]).toBe('false');
    });

    it('should handle errors in callbacks', async () => {
      const { client } = createRpcPair({
        async executeWithErrorHandler (
          action: () => Promise<string>,
          onError: (err: Error) => Promise<string>
        ) {
          try {
            return await action();
          } catch (e) {
            return await onError(e as Error);
          }
        },
      });

      const result = await client.executeWithErrorHandler(
        async () => {
          throw new Error('action failed');
        },
        async (err) => {
          return `caught: ${err.message}`;
        }
      );

      expect(result).toBe('caught: action failed');
    });

    it('should handle large data transfer', async () => {
      const { client } = createRpcPair({
        processLargeArray (arr: number[]) {
          return arr.reduce((a, b) => a + b, 0);
        },
      });

      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      const sum = await client.processLargeArray(largeArray);
      expect(sum).toBe(49995000); // sum of 0 to 9999
    });
  });

  describe('Deep return value proxying (class instances)', () => {
    it('should keep class instance as proxy and call methods remotely', async () => {
      class User {
        constructor (public name: string, public age: number) { }

        greet () {
          return `Hi, I am ${this.name}`;
        }

        getInfo () {
          return { name: this.name, age: this.age };
        }

        updateAge (newAge: number) {
          this.age = newAge;
          return this.age;
        }
      }

      const { client } = createRpcPair({
        createUser (name: string, age: number) {
          return new User(name, age);
        },
      });

      const user = await client.createUser('Alice', 25);

      // user 应该是代理，调用方法时发送 RPC 请求
      const greeting = await user.greet();
      expect(greeting).toBe('Hi, I am Alice');

      const info = await user.getInfo();
      // 对象返回代理
      expect(await info.name).toBe('Alice');
      expect(await info.age).toBe(25);

      // 更新远程对象状态
      const newAge = await user.updateAge(30);
      expect(newAge).toBe(30);

      // 验证状态被更新
      const updatedInfo = await user.getInfo();
      expect(await updatedInfo.age).toBe(30);
    });

    it('should support chained method calls on returned class instance', async () => {
      class Counter {
        value = 0;

        increment () {
          this.value++;
          return this;
        }

        decrement () {
          this.value--;
          return this;
        }

        getValue () {
          return this.value;
        }
      }

      const { client } = createRpcPair({
        createCounter () {
          return new Counter();
        },
      });

      const counter = await client.createCounter();

      // 链式调用
      await counter.increment();
      await counter.increment();
      await counter.increment();
      await counter.decrement();

      const value = await counter.getValue();
      expect(value).toBe(2);
    });

    it('should handle nested class instances', async () => {
      class Address {
        constructor (public city: string, public country: string) { }

        getFullAddress () {
          return `${this.city}, ${this.country}`;
        }
      }

      class Person {
        constructor (public name: string, public address: Address) { }

        getAddress () {
          return this.address;
        }

        getFormattedInfo () {
          return `${this.name} lives in ${this.address.city}`;
        }
      }

      const { client } = createRpcPair({
        createPerson (name: string, city: string, country: string) {
          return new Person(name, new Address(city, country));
        },
      });

      const person = await client.createPerson('Bob', 'Tokyo', 'Japan');

      const info = await person.getFormattedInfo();
      expect(info).toBe('Bob lives in Tokyo');

      // 获取嵌套对象（如果 Address 也是类实例，也应该是代理）
      const address = await person.getAddress();
      const fullAddress = await address.getFullAddress();
      expect(fullAddress).toBe('Tokyo, Japan');
    });

    it('should handle objects with methods (not class instances)', async () => {
      // 这种对象有方法，应该也返回代理
      const { client } = createRpcPair({
        createApi () {
          let data = 'initial';
          return {
            getData () {
              return data;
            },
            setData (newData: string) {
              data = newData;
            },
            processData (transformer: (d: string) => string) {
              data = transformer(data);
              return data;
            },
          };
        },
      });

      const api = await client.createApi();

      const initial = await api.getData();
      expect(initial).toBe('initial');

      await api.setData('updated');
      const updated = await api.getData();
      expect(updated).toBe('updated');

      // 测试回调
      const result = await api.processData((d: string) => d.toUpperCase());
      expect(result).toBe('UPDATED');
    });

    it('should proxy simple objects and allow property access', async () => {
      // 现在所有对象都返回代理，访问属性需要通过 RPC
      const { client } = createRpcPair({
        getSimpleData () {
          return { id: 1, name: 'test', active: true };
        },
      });

      const data = await client.getSimpleData();
      // 对象现在也是代理，访问属性返回代理，await 后获取值
      expect(await data.id).toBe(1);
      expect(await data.name).toBe('test');
      expect(await data.active).toBe(true);
    });

    it('should handle async methods in returned class', async () => {
      class AsyncService {
        private value = 0;

        async fetchAndAdd (amount: number) {
          await new Promise(resolve => setTimeout(resolve, 10));
          this.value += amount;
          return this.value;
        }

        async getValue () {
          await new Promise(resolve => setTimeout(resolve, 5));
          return this.value;
        }
      }

      const { client } = createRpcPair({
        createService () {
          return new AsyncService();
        },
      });

      const service = await client.createService();

      const first = await service.fetchAndAdd(10);
      expect(first).toBe(10);

      const second = await service.fetchAndAdd(5);
      expect(second).toBe(15);

      const current = await service.getValue();
      expect(current).toBe(15);
    });

    it('should handle constructor on returned proxy', async () => {
      class Factory {
        create (name: string): { name: string; } {
          return { name };
        }

        Widget = class Widget {
          constructor (public id: number) { }
          getId () {
            return this.id;
          }
        };
      }

      const { client } = createRpcPair({
        getFactory () {
          return new Factory();
        },
      });

      const factory = await client.getFactory();

      // 调用返回代理上的方法
      const obj = await factory.create('widget1');
      expect(await obj.name).toBe('widget1');

      // 在返回代理上调用构造函数
      const Widget = await factory.Widget;
      const widget = await new Widget(123);
      const id = await widget.getId();
      expect(id).toBe(123);
    });

    it('should support getService().method({fn: callback}) pattern', async () => {
      // 核心场景：链式调用 + 回调
      const { client } = createRpcPair({
        getService () {
          return {
            execute (options: { onProgress: (p: number) => void; onComplete: (r: string) => void; }) {
              options.onProgress(25);
              options.onProgress(50);
              options.onProgress(100);
              options.onComplete('done');
              return 'success';
            },
            process (data: { transformer: (x: number) => number; }) {
              return data.transformer(10);
            },
          };
        },
      });

      const service = await client.getService();

      const progressValues: number[] = [];
      let completedWith = '';

      const result = await service.execute({
        onProgress: (p: number) => {
          progressValues.push(p);
        },
        onComplete: (r: string) => {
          completedWith = r;
        },
      });

      expect(result).toBe('success');
      expect(progressValues).toEqual([25, 50, 100]);
      expect(completedWith).toBe('done');

      // 测试返回值的回调
      const transformed = await service.process({
        transformer: (x: number) => x * 3,
      });
      expect(transformed).toBe(30);
    });

    it('should support deep chain call with callbacks at any level', async () => {
      const { client } = createRpcPair({
        getApi () {
          return {
            getModule () {
              return {
                getHandler () {
                  return {
                    handle (input: number, callbacks: { onSuccess: (r: number) => void; onError: (e: string) => void; }) {
                      if (input > 0) {
                        callbacks.onSuccess(input * 2);
                      } else {
                        callbacks.onError('negative input');
                      }
                      return input > 0;
                    },
                  };
                },
              };
            },
          };
        },
      });

      const api = await client.getApi();
      const module = await api.getModule();
      const handler = await module.getHandler();

      let successResult = 0;
      const isSuccess = await handler.handle(5, {
        onSuccess: (r: number) => { successResult = r; },
        onError: () => { },
      });

      expect(isSuccess).toBe(true);
      expect(successResult).toBe(10);

      let errorMsg = '';
      const isFailed = await handler.handle(-1, {
        onSuccess: () => { },
        onError: (e: string) => { errorMsg = e; },
      });

      expect(isFailed).toBe(false);
      expect(errorMsg).toBe('negative input');
    });

    it('should support register pattern with multiple callbacks', async () => {
      const { client } = createRpcPair({
        createEventEmitter () {
          const listeners: Map<string, Array<(...args: unknown[]) => void>> = new Map();
          return {
            register (events: Record<string, (...args: unknown[]) => void>) {
              for (const [name, handler] of Object.entries(events)) {
                if (!listeners.has(name)) listeners.set(name, []);
                listeners.get(name)!.push(handler);
              }
            },
            emit (name: string, ...args: unknown[]) {
              const handlers = listeners.get(name) ?? [];
              handlers.forEach(h => h(...args));
            },
          };
        },
      });

      const emitter = await client.createEventEmitter();

      const events: Array<{ type: string; data: unknown; }> = [];

      await emitter.register({
        data: (value: unknown) => events.push({ type: 'data', data: value }),
        error: (err: unknown) => events.push({ type: 'error', data: err }),
        complete: () => events.push({ type: 'complete', data: null }),
      });

      await emitter.emit('data', 'hello');
      await emitter.emit('data', 'world');
      await emitter.emit('error', 'oops');
      await emitter.emit('complete');

      expect(events).toEqual([
        { type: 'data', data: 'hello' },
        { type: 'data', data: 'world' },
        { type: 'error', data: 'oops' },
        { type: 'complete', data: null },
      ]);
    });

    it('should handle array return values with proxy', async () => {
      // 通过 getService 返回的类实例来测试数组代理
      class ItemService {
        getItems () {
          return [
            { id: 1, name: 'item1' },
            { id: 2, name: 'item2' },
          ];
        }
        getItem (index: number) {
          return { id: index, getValue: () => `item${index}` };
        }
      }
      const { client } = createRpcPair({
        getItemService () {
          return new ItemService();
        },
      });

      const service = await client.getItemService();

      // 通过代理的 service 调用方法获取数组
      const items = await service.getItems();
      expect(items).toEqual([
        { id: 1, name: 'item1' },
        { id: 2, name: 'item2' },
      ]);

      // 获取单个 item 作为代理（因为它有方法）
      const item = await service.getItem(3);
      expect(await item.getValue()).toBe('item3');
    });
  });
});
