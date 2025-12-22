import { Router, Request, Response } from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { IncomingMessage } from 'http';
import { OB11Response } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { OB11LifeCycleEvent, LifeCycleSubType } from '@/napcat-onebot/event/meta/OB11LifeCycleEvent';

const router = Router();
const DEFAULT_ADAPTER_NAME = 'debug-primary';

/**
 * 统一的调试适配器
 * 用于注入到 OneBot NetworkManager，接收所有事件并转发给 WebSocket 客户端
 */
class DebugAdapter {
  name: string;
  isEnable: boolean = true;
  // 安全令牌
  readonly token: string;

  // 添加 config 属性，模拟 PluginConfig 结构
  config: {
    enable: boolean;
    name: string;
    messagePostFormat?: string;
    reportSelfMessage?: boolean;
    debug?: boolean;
    token?: string;
    heartInterval?: number;
  };
  wsClients: Set<WebSocket> = new Set();
  lastActivityTime: number = Date.now();
  inactivityTimer: NodeJS.Timeout | null = null;
  readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5分钟不活跃

  constructor (sessionId: string) {
    this.name = `debug-${sessionId}`;
    // 生成简单的随机 token
    this.token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    this.config = {
      enable: true,
      name: this.name,
      messagePostFormat: 'array',
      reportSelfMessage: true,
      debug: true,
      token: this.token,
      heartInterval: 30000
    };
    this.startInactivityCheck();
  }

  // 实现 IOB11NetworkAdapter 接口所需的抽象方法
  async open (): Promise<void> { }
  async close (): Promise<void> { this.cleanup(); }
  async reload (_config: any): Promise<any> { return 0; }

  /**
   * OneBot 事件回调 - 转发给所有 WebSocket 客户端 (原始流)
   */
  async onEvent (event: any) {
    this.updateActivity();

    const payload = JSON.stringify(event);

    if (this.wsClients.size === 0) {
      return;
    }

    this.wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
        } catch (error) {
          console.error('[Debug] 发送事件到 WebSocket 失败:', error);
        }
      }
    });
  }

  /**
   * 调用 OneBot API (HTTP 接口使用)
   */
  async callApi (actionName: string, params: any): Promise<any> {
    this.updateActivity();

    const oneBotContext = WebUiDataRuntime.getOneBotContext();
    if (!oneBotContext) {
      throw new Error('OneBot 未初始化');
    }

    const action = oneBotContext.actions.get(actionName);
    if (!action) {
      throw new Error(`不支持的 API: ${actionName}`);
    }

    return await action.handle(params, this.name, {
      name: this.name,
      enable: true,
      messagePostFormat: 'array',
      reportSelfMessage: true,
      debug: true,
    });
  }

  /**
   * 处理 WebSocket 消息 (OneBot 标准)
   */
  async handleWsMessage (ws: WebSocket, message: string | Buffer) {
    this.updateActivity();
    let receiveData: { action: typeof ActionName[keyof typeof ActionName], params?: any, echo?: any; } = { action: ActionName.Unknown, params: {} };
    let echo;

    try {
      receiveData = JSON.parse(message.toString());
      echo = receiveData.echo;
    } catch {
      this.sendWsResponse(ws, OB11Response.error('json解析失败,请检查数据格式', 1400, echo));
      return;
    }

    receiveData.params = (receiveData?.params) ? receiveData.params : {};

    // 兼容 WebUI 之前可能的一些非标准格式 (如果用户是旧前端)
    // 但既然用户说要"原始流"，我们优先支持标准格式

    const oneBotContext = WebUiDataRuntime.getOneBotContext();
    if (!oneBotContext) {
      this.sendWsResponse(ws, OB11Response.error('OneBot 未初始化', 1404, echo));
      return;
    }

    const action = oneBotContext.actions.get(receiveData.action as any);
    if (!action) {
      this.sendWsResponse(ws, OB11Response.error('不支持的API ' + receiveData.action, 1404, echo));
      return;
    }

    try {
      const retdata = await action.websocketHandle(receiveData.params, echo ?? '', this.name, this.config, {
        send: async (data: object) => {
          this.sendWsResponse(ws, OB11Response.ok(data, echo ?? '', true));
        },
      });
      this.sendWsResponse(ws, retdata);
    } catch (e: any) {
      this.sendWsResponse(ws, OB11Response.error(e.message || '内部错误', 1200, echo));
    }
  }

  sendWsResponse (ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  /**
   * 添加 WebSocket 客户端
   */
  addWsClient (ws: WebSocket) {
    this.wsClients.add(ws);
    this.updateActivity();

    // 发送生命周期事件 (Connect)
    const oneBotContext = WebUiDataRuntime.getOneBotContext();
    if (oneBotContext && oneBotContext.core) {
      try {
        const event = new OB11LifeCycleEvent(oneBotContext.core, LifeCycleSubType.CONNECT);
        ws.send(JSON.stringify(event));
      } catch (e) {
        console.error('[Debug] 发送生命周期事件失败', e);
      }
    }
  }

  /**
   * 移除 WebSocket 客户端
   */
  removeWsClient (ws: WebSocket) {
    this.wsClients.delete(ws);
  }

  updateActivity () {
    this.lastActivityTime = Date.now();
  }

  startInactivityCheck () {
    this.inactivityTimer = setInterval(() => {
      const inactive = Date.now() - this.lastActivityTime;
      // 如果没有 WebSocket 连接且超时，则自动清理
      if (inactive > this.INACTIVITY_TIMEOUT && this.wsClients.size === 0) {
        console.log(`[Debug] Adapter ${this.name} 不活跃，自动关闭`);
        this.cleanup();
      }
    }, 30000);
  }

  cleanup () {
    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer);
      this.inactivityTimer = null;
    }

    // 关闭所有 WebSocket 连接
    this.wsClients.forEach((client) => {
      try {
        client.close();
      } catch (error) {
        // ignore
      }
    });
    this.wsClients.clear();

    // 从 OneBot NetworkManager 移除
    const oneBotContext = WebUiDataRuntime.getOneBotContext();
    if (oneBotContext) {
      oneBotContext.networkManager.adapters.delete(this.name);
    }

    // 从管理器中移除
    debugAdapterManager.removeAdapter(this.name);
  }

  /**
   * 验证 Token
   */
  validateToken (inputToken: string): boolean {
    return this.token === inputToken;
  }
}

/**
 * 调试适配器管理器（单例管理）
 */
class DebugAdapterManager {
  private currentAdapter: DebugAdapter | null = null;

  getOrCreateAdapter (): DebugAdapter {
    // 如果已存在且活跃，直接返回
    if (this.currentAdapter) {
      this.currentAdapter.updateActivity();
      return this.currentAdapter;
    }

    // 创建新实例
    const adapter = new DebugAdapter('primary');
    this.currentAdapter = adapter;

    // 注册到 OneBot NetworkManager
    const oneBotContext = WebUiDataRuntime.getOneBotContext();
    if (oneBotContext) {
      oneBotContext.networkManager.adapters.set(adapter.name, adapter as any);
    } else {
      console.warn('[Debug] OneBot 未初始化，无法注册适配器');
    }

    return adapter;
  }

  getAdapter (name: string): DebugAdapter | undefined {
    if (this.currentAdapter && this.currentAdapter.name === name) {
      return this.currentAdapter;
    }
    return undefined;
  }

  removeAdapter (name: string) {
    if (this.currentAdapter && this.currentAdapter.name === name) {
      this.currentAdapter = null;
    }
  }
}

const debugAdapterManager = new DebugAdapterManager();

/**
 * 获取或创建调试会话
 */
router.post('/create', async (_req: Request, res: Response) => {
  try {
    const adapter = debugAdapterManager.getOrCreateAdapter();
    sendSuccess(res, {
      adapterName: adapter.name,
      token: adapter.token,
      message: '调试适配器已就绪',
    });
  } catch (error: any) {
    sendError(res, error.message);
  }
});

/**
 * HTTP 调用 OneBot API (支持默认 adapter)
 */
const handleCallApi = async (req: Request, res: Response) => {
  try {
    let adapterName = req.params['adapterName'] || req.body.adapterName || DEFAULT_ADAPTER_NAME;

    let adapter = debugAdapterManager.getAdapter(adapterName);

    // 如果是默认 adapter 且不存在，尝试创建
    if (!adapter && adapterName === DEFAULT_ADAPTER_NAME) {
      adapter = debugAdapterManager.getOrCreateAdapter();
    }

    if (!adapter) {
      return sendError(res, '调试适配器不存在');
    }

    const { action, params } = req.body;
    const result = await adapter.callApi(action, params || {});
    sendSuccess(res, result);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

router.post('/call/:adapterName', handleCallApi);
router.post('/call', handleCallApi);

/**
 * 关闭调试适配器
 */
router.post('/close/:adapterName', async (req: Request, res: Response) => {
  try {
    const { adapterName } = req.params;
    if (!adapterName) {
      return sendError(res, '缺少 adapterName 参数');
    }
    debugAdapterManager.removeAdapter(adapterName);
    sendSuccess(res, { message: '调试适配器已关闭' });
  } catch (error: any) {
    sendError(res, error.message);
  }
});

/**
 * WebSocket 连接处理
 * 路径: /api/Debug/ws?adapterName=xxx&token=xxx
 */
export function handleDebugWebSocket (request: IncomingMessage, socket: any, head: any) {
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  let adapterName = url.searchParams.get('adapterName');
  const token = url.searchParams.get('token') || url.searchParams.get('access_token');

  // 默认 adapterName
  if (!adapterName) {
    adapterName = DEFAULT_ADAPTER_NAME;
  }

  // Debug session should provide token
  if (!token) {
    console.log('[Debug] WebSocket 连接被拒绝: 缺少 Token');
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  let adapter = debugAdapterManager.getAdapter(adapterName);

  // 如果是默认 adapter 且不存在，尝试创建
  if (!adapter && adapterName === DEFAULT_ADAPTER_NAME) {
    adapter = debugAdapterManager.getOrCreateAdapter();
  }

  if (!adapter) {
    console.log('[Debug] WebSocket 连接被拒绝: 适配器不存在');
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
    return;
  }

  if (!adapter.validateToken(token)) {
    console.log('[Debug] WebSocket 连接被拒绝: Token 无效');
    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    socket.destroy();
    return;
  }

  // 创建 WebSocket 服务器
  const wsServer = new WebSocketServer({ noServer: true });

  wsServer.handleUpgrade(request, socket, head, (ws) => {
    adapter.addWsClient(ws);

    ws.on('message', async (data) => {
      try {
        await adapter.handleWsMessage(ws, data as any);
      } catch (error: any) {
        console.error('[Debug] handleWsMessage error', error);
      }
    });

    ws.on('close', () => {
      adapter.removeWsClient(ws);
    });

    ws.on('error', () => {
      adapter.removeWsClient(ws);
    });
  });
}

export default router;
