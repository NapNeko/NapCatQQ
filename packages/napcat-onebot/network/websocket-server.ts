import { OB11EmitEventContent, OB11NetworkReloadType } from './index';
import { Hono } from 'hono';
import { serve, type ServerType } from '@hono/node-server';
import { createNodeWebSocket } from '@hono/node-ws';
import type { Context } from 'hono';
import type { WSContext } from 'hono/ws';
import { OB11Response } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { NapCatCore } from 'napcat-core';
import { OB11HeartbeatEvent } from '@/napcat-onebot/event/meta/OB11HeartbeatEvent';
import { LifeCycleSubType, OB11LifeCycleEvent } from '@/napcat-onebot/event/meta/OB11LifeCycleEvent';
import { WebsocketServerConfig } from '@/napcat-onebot/config/config';
import { IOB11NetworkAdapter } from '@/napcat-onebot/network/adapter';
import json5 from 'json5';

export class OB11WebSocketServerAdapter extends IOB11NetworkAdapter<WebsocketServerConfig> {
  private server?: ServerType;
  wsClients: WSContext[] = [];
  private heartbeatIntervalId: NodeJS.Timeout | null = null;
  wsClientWithEvent: WSContext[] = [];

  override get isActive (): boolean {
    return this.isEnable && this.wsClientWithEvent.length > 0;
  }

  private createHonoApp () {
    const app = new Hono();
    const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

    app.get('/*', upgradeWebSocket((c) => {
      const paramUrl = new URL(c.req.url).pathname;
      const isApiConnect = paramUrl === '/api' || paramUrl === '/api/';

      return {
        onOpen: (_event, ws) => {
          if (!this.isEnable) {
            ws.close();
            return;
          }
          if (!this.authorizeWS(this.config.token, ws, c)) {
            return;
          }
          if (!isApiConnect) {
            this.connectEvent(this.core, ws);
            this.wsClientWithEvent.push(ws);
          }
          this.wsClients.push(ws);
          if (this.wsClientWithEvent.length > 0) {
            this.startHeartbeat();
          }
        },
        onMessage: (event, ws) => {
          this.handleMessage(ws, event.data).then().catch(e => this.logger.logError(e));
        },
        onClose: (_event, ws) => {
          const normalIndex = this.wsClients.indexOf(ws);
          if (normalIndex !== -1) {
            this.wsClients.splice(normalIndex, 1);
          }
          const eventIndex = this.wsClientWithEvent.indexOf(ws);
          if (eventIndex !== -1) {
            this.wsClientWithEvent.splice(eventIndex, 1);
          }
          if (this.wsClientWithEvent.length === 0) {
            this.stopHeartbeat();
          }
        },
        onError: (event) => {
          this.logger.log('[OneBot] [WebSocket Server] Client Error:', String(event));
        },
      };
    }));

    return { app, injectWebSocket };
  }

  connectEvent (core: NapCatCore, wsClient: WSContext) {
    try {
      wsClient.send(JSON.stringify(new OB11LifeCycleEvent(core, LifeCycleSubType.CONNECT)));
    } catch (e) {
      this.logger.logError('[OneBot] [WebSocket Server] 发送生命周期失败', e);
    }
  }

  async onEvent<T extends OB11EmitEventContent> (event: T) {
    const promises = this.wsClientWithEvent.map((wsClient) => {
      return new Promise<void>((resolve, reject) => {
        try {
          wsClient.send(JSON.stringify(event));
          resolve();
        } catch {
          reject(new Error('WebSocket is not open'));
        }
      });
    });
    await Promise.allSettled(promises);
  }

  open () {
    if (this.isEnable) {
      this.logger.logError('[OneBot] [WebSocket Server] Cannot open a opened WebSocket server');
      return;
    }
    this.startServer();
    this.isEnable = true;
  }

  private startServer () {
    const { app, injectWebSocket } = this.createHonoApp();
    this.server = serve({
      fetch: app.fetch,
      port: this.config.port,
      hostname: this.config.host === '0.0.0.0' ? '' : this.config.host,
    }) as ServerType;
    injectWebSocket(this.server);

    const addressInfo = this.server?.address();
    this.logger.log('[OneBot] [WebSocket Server] Server Started', typeof (addressInfo) === 'string' ? addressInfo : (addressInfo as any)?.address + ':' + (addressInfo as any)?.port);
  }

  async close () {
    this.isEnable = false;
    this.server?.close((err) => {
      if (err) {
        this.logger.logError('[OneBot] [WebSocket Server] Error closing server:', err.message);
      } else {
        this.logger.log('[OneBot] [WebSocket Server] Server Closed');
      }
    });
    this.stopHeartbeat();
    this.wsClients.forEach((wsClient) => wsClient.close());
    this.wsClients = [];
    this.wsClientWithEvent = [];
  }

  private startHeartbeat () {
    if (this.heartbeatIntervalId || this.config.heartInterval <= 0) return;
    this.heartbeatIntervalId = setInterval(() => {
      this.wsClientWithEvent.forEach((wsClient) => {
        try {
          wsClient.send(JSON.stringify(new OB11HeartbeatEvent(this.core, this.config.heartInterval, this.core.selfInfo.online ?? true, true)));
        } catch { /* ignore closed connections */ }
      });
    }, this.config.heartInterval);
  }

  private stopHeartbeat () {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  private authorizeWS (token: string | undefined, ws: WSContext, c: Context) {
    if (!token || token.length === 0) return true;
    const url = new URL(c.req.url);
    const QueryClientToken = url.searchParams.get('access_token');
    const HeaderClientToken = c.req.header('authorization')?.split('Bearer ').pop() || '';
    const ClientToken = typeof (QueryClientToken) === 'string' && QueryClientToken !== '' ? QueryClientToken : HeaderClientToken;
    if (ClientToken === token) {
      return true;
    }
    ws.send(JSON.stringify(OB11Response.res(null, 'failed', 1403, 'token验证失败')));
    ws.close();
    return false;
  }

  private checkStateAndReply<T> (data: T, wsClient: WSContext) {
    try {
      wsClient.send(JSON.stringify(data));
    } catch {
      // connection may be closed
    }
  }

  private async handleMessage (wsClient: WSContext, message: string | ArrayBuffer) {
    let receiveData: { action: typeof ActionName[keyof typeof ActionName], params?: any, echo?: any; } = { action: ActionName.Unknown, params: {} };
    let echo;
    try {
      const msgStr = typeof message === 'string' ? message : new TextDecoder().decode(message);
      receiveData = json5.parse(msgStr);
      echo = receiveData.echo;
    } catch {
      this.checkStateAndReply<unknown>(OB11Response.error('json解析失败,请检查数据格式', 1400, echo), wsClient);
      return;
    }
    receiveData.params = (receiveData?.params) ? receiveData.params : {};

    const action = this.actions.get(receiveData.action as any);
    if (!action) {
      this.logger.logError('[OneBot] [WebSocket Server] 发生错误', '不支持的API ' + receiveData.action);
      this.checkStateAndReply<unknown>(OB11Response.error('不支持的API ' + receiveData.action, 1404, echo), wsClient);
      return;
    }
    const retdata = await action.websocketHandle(receiveData.params, echo ?? '', this.name, this.config, {
      send: async (data: object) => {
        this.checkStateAndReply<unknown>({ ...OB11Response.ok(data, echo ?? '', true) }, wsClient);
      },
    });
    this.checkStateAndReply<unknown>({ ...retdata }, wsClient);
  }

  async reload (newConfig: WebsocketServerConfig) {
    const wasEnabled = this.isEnable;
    const oldPort = this.config.port;
    const oldHost = this.config.host;
    const oldHeartbeatInterval = this.config.heartInterval;
    this.config = newConfig;

    if (newConfig.enable && !wasEnabled) {
      this.open();
      return OB11NetworkReloadType.NetWorkOpen;
    } else if (!newConfig.enable && wasEnabled) {
      this.close();
      return OB11NetworkReloadType.NetWorkClose;
    }

    if (oldPort !== newConfig.port || oldHost !== newConfig.host) {
      await this.close();
      if (newConfig.enable) {
        this.open();
      }
      return OB11NetworkReloadType.NetWorkReload;
    }

    if (oldHeartbeatInterval !== newConfig.heartInterval) {
      this.stopHeartbeat();
      if (newConfig.heartInterval > 0 && this.isEnable && this.wsClientWithEvent.length > 0) {
        this.startHeartbeat();
      }
      return OB11NetworkReloadType.NetWorkReload;
    }

    return OB11NetworkReloadType.Normal;
  }
}
