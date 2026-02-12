import {
  type RpcTransport,
  type RpcRequest,
  type RpcResponse,
  type SerializedValue,
} from './types.js';
import { RpcServer } from './server.js';
import { serialize, deserialize, SimpleCallbackRegistry } from './serializer.js';

/**
 * 本地传输层
 *
 * 用于在同一进程内进行 RPC 调用，主要用于测试
 */
export class LocalTransport implements RpcTransport {
  private server: RpcServer;
  private callbackHandler?: (callbackId: string, args: SerializedValue[]) => Promise<SerializedValue>;
  private clientCallbacks = new SimpleCallbackRegistry();

  constructor (target: unknown) {
    this.server = new RpcServer({
      target,
      callbackInvoker: async (callbackId, args) => {
        if (!this.callbackHandler) {
          throw new Error('Callback handler not registered');
        }
        const serializedArgs = args.map(arg => serialize(arg, { callbackRegistry: this.clientCallbacks }));
        const result = await this.callbackHandler(callbackId, serializedArgs);
        return deserialize(result);
      },
    });
  }

  async send (request: RpcRequest): Promise<RpcResponse> {
    // 模拟网络延迟（可选）
    // await new Promise(resolve => setTimeout(resolve, 0));

    return this.server.handleRequest(request);
  }

  onCallback (handler: (callbackId: string, args: SerializedValue[]) => Promise<SerializedValue>): void {
    this.callbackHandler = handler;
  }

  close (): void {
    this.clientCallbacks.clear();
  }
}

/**
 * 消息传输层接口
 */
export interface MessageTransportOptions {
  /** 发送消息 */
  sendMessage: (message: string) => void | Promise<void>;
  /** 接收消息时的回调 */
  onMessage: (handler: (message: string) => void) => void;
}

/**
 * 基于消息的传输层
 *
 * 可用于跨进程/网络通信
 */
export class MessageTransport implements RpcTransport {
  private pendingRequests = new Map<string, {
    resolve: (response: RpcResponse) => void;
    reject: (error: Error) => void;
  }>();

  private callbackHandler?: (callbackId: string, args: SerializedValue[]) => Promise<SerializedValue>;
  private sendMessage: (message: string) => void | Promise<void>;

  constructor (options: MessageTransportOptions) {
    this.sendMessage = options.sendMessage;

    options.onMessage(async (message) => {
      const data = JSON.parse(message) as {
        type: 'response' | 'callback' | 'callback_response';
        id: string;
        response?: RpcResponse;
        callbackId?: string;
        args?: SerializedValue[];
        result?: SerializedValue;
        error?: string;
      };

      if (data.type === 'response') {
        const pending = this.pendingRequests.get(data.id);
        if (pending && data.response) {
          this.pendingRequests.delete(data.id);
          pending.resolve(data.response);
        }
      } else if (data.type === 'callback') {
        // 处理来自服务端的回调调用
        if (this.callbackHandler && data.callbackId && data.args) {
          try {
            const result = await this.callbackHandler(data.callbackId, data.args);
            await this.sendMessage(JSON.stringify({
              type: 'callback_response',
              id: data.id,
              result,
            }));
          } catch (error) {
            await this.sendMessage(JSON.stringify({
              type: 'callback_response',
              id: data.id,
              error: error instanceof Error ? error.message : String(error),
            }));
          }
        }
      }
    });
  }

  async send (request: RpcRequest): Promise<RpcResponse> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(request.id, { resolve, reject });

      const message = JSON.stringify({
        type: 'request',
        request,
      });

      Promise.resolve(this.sendMessage(message)).catch(reject);
    });
  }

  onCallback (handler: (callbackId: string, args: SerializedValue[]) => Promise<SerializedValue>): void {
    this.callbackHandler = handler;
  }

  close (): void {
    for (const [, pending] of this.pendingRequests) {
      pending.reject(new Error('Transport closed'));
    }
    this.pendingRequests.clear();
  }
}

/**
 * 创建消息传输层的服务端处理器
 */
export function createMessageServerHandler (target: unknown, options: {
  sendMessage: (message: string) => void | Promise<void>;
  onMessage: (handler: (message: string) => void) => void;
}): void {
  const pendingCallbacks = new Map<string, {
    resolve: (result: SerializedValue) => void;
    reject: (error: Error) => void;
  }>();

  let callbackIdCounter = 0;

  const server = new RpcServer({
    target,
    callbackInvoker: async (callbackId, args) => {
      const id = `cb_call_${++callbackIdCounter}`;
      const serializedArgs = args.map(arg => serialize(arg));

      return new Promise<unknown>((resolve, reject) => {
        pendingCallbacks.set(id, {
          resolve: (result) => resolve(deserialize(result)),
          reject,
        });

        options.sendMessage(JSON.stringify({
          type: 'callback',
          id,
          callbackId,
          args: serializedArgs,
        }));
      });
    },
  });

  options.onMessage(async (message) => {
    const data = JSON.parse(message) as {
      type: 'request' | 'callback_response';
      id: string;
      request?: RpcRequest;
      result?: SerializedValue;
      error?: string;
    };

    if (data.type === 'request' && data.request) {
      const response = await server.handleRequest(data.request);
      await options.sendMessage(JSON.stringify({
        type: 'response',
        id: data.request.id,
        response,
      }));
    } else if (data.type === 'callback_response') {
      const pending = pendingCallbacks.get(data.id);
      if (pending) {
        pendingCallbacks.delete(data.id);
        if (data.error) {
          pending.reject(new Error(data.error));
        } else if (data.result) {
          pending.resolve(data.result);
        }
      }
    }
  });
}
