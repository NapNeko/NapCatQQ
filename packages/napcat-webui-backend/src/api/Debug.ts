import { Hono } from 'hono';
import type { Context } from 'hono';
import { WebSocket, WebSocketServer, RawData } from 'ws';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { IncomingMessage } from 'http';
import { OB11Response, OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { OB11LifeCycleEvent, LifeCycleSubType } from '@/napcat-onebot/event/meta/OB11LifeCycleEvent';
import { IOB11NetworkAdapter } from '@/napcat-onebot/network/adapter';
import { WebsocketServerConfig } from '@/napcat-onebot/config/config';
import { ActionMap } from '@/napcat-onebot/action';
import { NapCatCore } from '@/napcat-core/index';
import { NapCatOneBot11Adapter } from '@/napcat-onebot/index';
import { OB11EmitEventContent, OB11NetworkReloadType } from '@/napcat-onebot/network/index';

import json5 from 'json5';

type ActionNameType = typeof ActionName[keyof typeof ActionName];

const router = new Hono();
const DEFAULT_ADAPTER_NAME = 'debug-primary';

/**
 * 获取所有 Action 的 Schema 信息
 */
router.get('/schemas', async (c: Context) => {
  try {
    const obContext = WebUiDataRuntime.getOneBotContext();
    if (!obContext) {
      return sendError(c, 'OneBot 未初始化');
    }
    const schemas: Record<string, any> = {};

    for (const key in ActionName) {
      const actionName = (ActionName as any)[key];
      if (actionName === ActionName.Unknown) continue;

      const handler = obContext.actions.get(actionName);
      if (handler) {
        const action = handler as OneBotAction<unknown, unknown>;
        schemas[actionName] = {
          description: action.actionSummary || action.actionDescription,
          payload: action.payloadSchema,
          response: action.returnSchema,
          payloadExample: action.payloadExample,
          tags: action.actionTags,
        };
      }
    }

    return sendSuccess(c, schemas);
  } catch (error: unknown) {
    return sendError(c, (error as Error).message);
  }
});

/**
 * 统一的调试适配器
 * 用于注入到 OneBot NetworkManager，接收所有事件并转发给 WebSocket 客户端
 */
class DebugAdapter extends IOB11NetworkAdapter<WebsocketServerConfig> {
  readonly token: string;
  wsClients: WebSocket[] = [];
  wsClientWithEvent: WebSocket[] = [];
  lastActivityTime: number = Date.now();
  inactivityTimer: NodeJS.Timeout | null = null;
  readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000;

  override get isActive (): boolean {
    return this.isEnable && this.wsClientWithEvent.length > 0;
  }

  constructor (sessionId: string, core: NapCatCore, obContext: NapCatOneBot11Adapter, actions: ActionMap) {
    const config: WebsocketServerConfig = {
      enable: true,
      name: `debug-${sessionId}`,
      host: '127.0.0.1',
      port: 0,
      messagePostFormat: 'array',
      reportSelfMessage: true,
      token: '',
      enableForcePushEvent: true,
      debug: true,
      heartInterval: 0,
    };

    super(`debug-${sessionId}`, config, core, obContext, actions);
    this.token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    this.isEnable = false;
    this.startInactivityCheck();
  }

  async open (): Promise<void> {
    if (this.isEnable) {
      this.logger.logError('[Debug] Cannot open an already opened adapter');
      return;
    }
    this.logger.log('[Debug] Adapter opened:', this.name);
    this.isEnable = true;
  }

  async close (): Promise<void> {
    if (!this.isEnable) {
      return;
    }
    this.logger.log('[Debug] Adapter closing:', this.name);
    this.isEnable = false;

    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer);
      this.inactivityTimer = null;
    }

    this.wsClients.forEach((client) => {
      try {
        client.removeAllListeners();
        client.close();
      } catch (error) {
        this.logger.logError('[Debug] 关闭 WebSocket 失败:', error);
      }
    });
    this.wsClients = [];
    this.wsClientWithEvent = [];
  }

  async reload (_config: unknown): Promise<OB11NetworkReloadType> {
    return OB11NetworkReloadType.NetWorkReload;
  }

  async onEvent<T extends OB11EmitEventContent> (event: T): Promise<void> {
    this.updateActivity();

    const payload = JSON.stringify(event);
    this.wsClientWithEvent.forEach((wsClient) => {
      if (wsClient.readyState === WebSocket.OPEN) {
        try {
          wsClient.send(payload);
        } catch (error) {
          this.logger.logError('[Debug] 发送事件失败:', error);
        }
      }
    });
  }

  async callApi (actionName: ActionNameType, params: Record<string, unknown>): Promise<unknown> {
    this.updateActivity();

    const action = this.actions.get(actionName as Parameters<typeof this.actions.get>[0]);
    if (!action) {
      throw new Error(`不支持的 API: ${actionName}`);
    }

    type ActionHandler = { handle: (params: unknown, ...args: unknown[]) => Promise<unknown>; };
    return await (action as ActionHandler).handle(params, this.name, this.config);
  }

  private async handleMessage (wsClient: WebSocket, message: RawData): Promise<void> {
    this.updateActivity();
    let receiveData: { action: ActionNameType, params?: Record<string, unknown>, echo?: unknown; } = {
      action: ActionName.Unknown,
      params: {},
    };
    let echo: unknown;

    try {
      receiveData = json5.parse(message.toString());
      echo = receiveData.echo;
    } catch {
      this.sendToClient(wsClient, OB11Response.error('json解析失败,请检查数据格式', 1400, echo));
      return;
    }

    receiveData.params = receiveData?.params || {};

    const action = this.actions.get(receiveData.action as Parameters<typeof this.actions.get>[0]);
    if (!action) {
      this.logger.logError('[Debug] 不支持的API:', receiveData.action);
      this.sendToClient(wsClient, OB11Response.error('不支持的API ' + receiveData.action, 1404, echo));
      return;
    }

    try {
      type ActionHandler = { websocketHandle: (params: unknown, ...args: unknown[]) => Promise<unknown>; };
      const retdata = await (action as ActionHandler).websocketHandle(receiveData.params, echo ?? '', this.name, this.config, {
        send: async (data: object) => {
          this.sendToClient(wsClient, OB11Response.ok(data, echo ?? '', true));
        },
      });
      this.sendToClient(wsClient, retdata);
    } catch (e: unknown) {
      const error = e as Error;
      this.logger.logError('[Debug] 处理消息失败:', error);
      this.sendToClient(wsClient, OB11Response.error(error.message || '内部错误', 1200, echo));
    }
  }

  private sendToClient (wsClient: WebSocket, data: unknown): void {
    if (wsClient.readyState === WebSocket.OPEN) {
      try {
        wsClient.send(JSON.stringify(data));
      } catch (error) {
        this.logger.logError('[Debug] 发送消息失败:', error);
      }
    }
  }

  async addWsClient (ws: WebSocket): Promise<void> {
    this.wsClientWithEvent.push(ws);
    this.wsClients.push(ws);
    this.updateActivity();

    this.sendToClient(ws, new OB11LifeCycleEvent(this.core, LifeCycleSubType.CONNECT));

    ws.on('error', (err) => this.logger.log('[Debug] WebSocket Error:', err.message));
    ws.on('message', (message) => {
      this.handleMessage(ws, message).catch((e: unknown) => {
        this.logger.logError('[Debug] handleMessage error:', e);
      });
    });
    ws.on('ping', () => ws.pong());
    ws.once('close', () => this.removeWsClient(ws));
  }

  private removeWsClient (ws: WebSocket): void {
    const normalIndex = this.wsClients.indexOf(ws);
    if (normalIndex !== -1) {
      this.wsClients.splice(normalIndex, 1);
    }
    const eventIndex = this.wsClientWithEvent.indexOf(ws);
    if (eventIndex !== -1) {
      this.wsClientWithEvent.splice(eventIndex, 1);
    }
  }

  updateActivity (): void {
    this.lastActivityTime = Date.now();
  }

  startInactivityCheck (): void {
    this.inactivityTimer = setInterval(() => {
      const inactive = Date.now() - this.lastActivityTime;
      if (inactive > this.INACTIVITY_TIMEOUT && this.wsClients.length === 0) {
        this.logger.log(`[Debug] Adapter ${this.name} 不活跃，自动关闭`);
        const oneBotContext = WebUiDataRuntime.getOneBotContext();
        if (oneBotContext) {
          debugAdapterManager.removeAdapter(this.name);
          oneBotContext.networkManager.closeSomeAdapters([this]).catch((e: unknown) => {
            this.logger.logError('[Debug] 自动关闭适配器失败:', e);
          });
        }
      }
    }, 30000);
  }

  validateToken (inputToken: string): boolean {
    return this.token === inputToken;
  }
}

class DebugAdapterManager {
  private currentAdapter: DebugAdapter | null = null;

  getOrCreateAdapter (): DebugAdapter {
    if (this.currentAdapter) {
      this.currentAdapter.updateActivity();
      return this.currentAdapter;
    }

    const oneBotContext = WebUiDataRuntime.getOneBotContext();
    if (!oneBotContext) {
      throw new Error('OneBot 未初始化，无法创建调试适配器');
    }

    const adapter = new DebugAdapter('primary', oneBotContext.core, oneBotContext, oneBotContext.actions);
    this.currentAdapter = adapter;

    oneBotContext.networkManager.registerAdapterAndOpen(adapter).catch((e: unknown) => {
      console.error('[Debug] 注册适配器失败:', e);
    });

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

router.post('/create', async (c: Context) => {
  try {
    const adapter = debugAdapterManager.getOrCreateAdapter();
    return sendSuccess(c, {
      adapterName: adapter.name,
      token: adapter.token,
      message: '调试适配器已就绪',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return sendError(c, err.message);
  }
});

const handleCallApi = async (c: Context) => {
  try {
    const adapterName = c.req.param('adapterName') || (await c.req.json().catch(() => ({})) as any)?.adapterName || DEFAULT_ADAPTER_NAME;

    let adapter = debugAdapterManager.getAdapter(adapterName);

    if (!adapter && adapterName === DEFAULT_ADAPTER_NAME) {
      adapter = debugAdapterManager.getOrCreateAdapter();
    }

    if (!adapter) {
      return sendError(c, '调试适配器不存在');
    }

    const body = await c.req.json().catch(() => ({}));
    const { action, params } = body as { action?: string; params?: Record<string, unknown> };
    const result = await adapter.callApi(action as ActionNameType, params || {});
    return sendSuccess(c, result);
  } catch (error: unknown) {
    const err = error as Error;
    return sendError(c, err.message);
  }
};

router.post('/call/:adapterName', handleCallApi);
router.post('/call', handleCallApi);

router.post('/close/:adapterName', async (c: Context) => {
  try {
    const adapterName = c.req.param('adapterName');
    if (!adapterName) {
      return sendError(c, '缺少 adapterName 参数');
    }

    const adapter = debugAdapterManager.getAdapter(adapterName);
    if (!adapter) {
      return sendError(c, '调试适配器不存在');
    }

    debugAdapterManager.removeAdapter(adapterName);

    const oneBotContext = WebUiDataRuntime.getOneBotContext();
    if (oneBotContext) {
      await oneBotContext.networkManager.closeSomeAdapters([adapter]);
    }

    return sendSuccess(c, { message: '调试适配器已关闭' });
  } catch (error: unknown) {
    const err = error as Error;
    return sendError(c, err.message);
  }
});

/**
 * WebSocket 连接处理
 * 路径: /api/Debug/ws?adapterName=xxx&token=xxx
 */
export function handleDebugWebSocket (request: IncomingMessage, socket: unknown, head: unknown) {
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  let adapterName = url.searchParams.get('adapterName');
  const token = url.searchParams.get('token') || url.searchParams.get('access_token');

  if (!adapterName) {
    adapterName = DEFAULT_ADAPTER_NAME;
  }

  if (!token) {
    console.log('[Debug] WebSocket 连接被拒绝: 缺少 Token');
    (socket as { write: (data: string) => void; destroy: () => void; }).write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    (socket as { destroy: () => void; }).destroy();
    return;
  }

  let adapter = debugAdapterManager.getAdapter(adapterName);

  if (!adapter && adapterName === DEFAULT_ADAPTER_NAME) {
    try {
      adapter = debugAdapterManager.getOrCreateAdapter();
    } catch (error) {
      console.log('[Debug] WebSocket 连接被拒绝: 无法创建适配器', error);
      (socket as { write: (data: string) => void; destroy: () => void; }).write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
      (socket as { destroy: () => void; }).destroy();
      return;
    }
  }

  if (!adapter) {
    console.log('[Debug] WebSocket 连接被拒绝: 适配器不存在');
    (socket as { write: (data: string) => void; destroy: () => void; }).write('HTTP/1.1 404 Not Found\r\n\r\n');
    (socket as { destroy: () => void; }).destroy();
    return;
  }

  if (!adapter.validateToken(token)) {
    console.log('[Debug] WebSocket 连接被拒绝: Token 无效');
    (socket as { write: (data: string) => void; destroy: () => void; }).write('HTTP/1.1 403 Forbidden\r\n\r\n');
    (socket as { destroy: () => void; }).destroy();
    return;
  }

  const wsServer = new WebSocketServer({ noServer: true });

  wsServer.handleUpgrade(request, socket as never, head as Buffer, (ws) => {
    adapter!.addWsClient(ws).catch((e: unknown) => {
      console.error('[Debug] 添加 WebSocket 客户端失败:', e);
      ws.close();
    });
  });
}

export default router;
