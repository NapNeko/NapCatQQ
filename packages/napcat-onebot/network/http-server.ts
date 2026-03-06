import { OB11EmitEventContent, OB11NetworkReloadType } from './index';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve, type HttpBindings, type ServerType } from '@hono/node-server';
import { createNodeWebSocket } from '@hono/node-ws';
import type { Context } from 'hono';
import type { WSContext } from 'hono/ws';
import { OB11Response } from '@/napcat-onebot/action/OneBotAction';
import { HttpServerConfig } from '@/napcat-onebot/config/config';
import { IOB11NetworkAdapter } from '@/napcat-onebot/network/adapter';
import json5 from 'json5';
import { ActionName } from '@/napcat-onebot/action/router';
import { OB11HeartbeatEvent } from '@/napcat-onebot/event/meta/OB11HeartbeatEvent';
import { OB11LifeCycleEvent, LifeCycleSubType } from '@/napcat-onebot/event/meta/OB11LifeCycleEvent';
import { stream } from 'hono/streaming';

type Env = { Bindings: HttpBindings; Variables: { parsedBody: any } };

export class OB11HttpServerAdapter extends IOB11NetworkAdapter<HttpServerConfig> {
  private app: Hono<Env> | undefined;
  private server: ServerType | undefined;
  private wsClients: WSContext[] = [];
  private heartbeatIntervalId: NodeJS.Timeout | null = null;
  private wsClientWithEvent: WSContext[] = [];
  private injectWebSocket: ((server: ServerType) => void) | undefined;

  override get isActive (): boolean {
    return this.isEnable && this.wsClientWithEvent.length > 0;
  }

  override async onEvent<T extends OB11EmitEventContent> (event: T) {
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
    try {
      if (this.isEnable) {
        this.core.context.logger.logError('Cannot open a closed HTTP server');
        return;
      }
      if (!this.isEnable) {
        this.initializeServer();
        this.isEnable = true;
      }
    } catch (e) {
      this.core.context.logger.logError(`[OneBot] [HTTP Server Adapter] Boot Error: ${e}`);
    }
  }

  async close () {
    this.isEnable = false;
    this.server?.close();
    this.app = undefined;
    this.stopHeartbeat();
    this.wsClients.forEach((wsClient) => wsClient.close());
    this.wsClients = [];
    this.wsClientWithEvent = [];
  }

  private initializeServer () {
    this.app = new Hono<Env>();

    if (this.config.enableWebsocket) {
      const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app: this.app });
      this.injectWebSocket = injectWebSocket;

      this.app.get('/*', upgradeWebSocket((c) => {
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
            this.handleWSMessage(ws, event.data).then().catch(e => this.logger.logError(e));
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
            this.logger.log('[OneBot] [HTTP WebSocket] Client Error:', String(event));
          },
        };
      }));
    }

    this.app.use('*', cors());

    this.app.use('*', async (c, next) => {
      if (c.req.header('upgrade') === 'websocket') {
        return next();
      }
      const contentType = c.req.header('content-type');
      const method = c.req.method.toUpperCase();
      if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
          const text = await c.req.text();
          try {
            c.set('parsedBody', json5.parse(text || '{}'));
          } catch {
            return c.text('Invalid JSON', 400);
          }
        } else {
          const text = await c.req.text();
          try {
            c.set('parsedBody', json5.parse(text || '{}'));
          } catch {
            return c.text('Invalid JSON', 400);
          }
        }
      }
      return next();
    });

    this.app.use('*', async (c, next) => {
      if (c.req.header('upgrade') === 'websocket') {
        return next();
      }
      return this.authorize(this.config.token, c, next);
    });

    this.app.all('/*', async (c) => {
      return this.handleRequest(c);
    });

    this.server = serve({
      fetch: this.app.fetch,
      port: this.config.port,
      hostname: this.config.host,
    }) as ServerType;

    if (this.config.enableWebsocket && this.injectWebSocket) {
      this.injectWebSocket(this.server!);
    }

    this.core.context.logger.log(`[OneBot] [HTTP Server Adapter] Start On ${this.config.host}:${this.config.port}`);
  }

  private authorize (token: string | undefined, c: Context<Env>, next: () => Promise<void>) {
    if (!token || token.length === 0) return next();
    const HeaderClientToken = c.req.header('authorization')?.split('Bearer ').pop() || '';
    const QueryClientToken = c.req.query('access_token');
    const ClientToken = typeof (QueryClientToken) === 'string' && QueryClientToken !== '' ? QueryClientToken : HeaderClientToken;
    if (ClientToken === token) {
      return next();
    } else {
      return c.text(JSON.stringify({ message: 'token verify failed!' }), 403);
    }
  }

  connectEvent (core: any, wsClient: WSContext) {
    try {
      this.checkStateAndReply<unknown>(new OB11LifeCycleEvent(core, LifeCycleSubType.CONNECT), wsClient);
    } catch (e) {
      this.logger.logError('[OneBot] [HTTP WebSocket] 发送生命周期失败', e);
    }
  }

  private startHeartbeat () {
    if (this.heartbeatIntervalId) return;
    this.heartbeatIntervalId = setInterval(() => {
      this.wsClientWithEvent.forEach((wsClient) => {
        try {
          wsClient.send(JSON.stringify(new OB11HeartbeatEvent(this.core, 30000, this.core.selfInfo.online ?? true, true)));
        } catch { /* ignore closed connections */ }
      });
    }, 30000);
  }

  private stopHeartbeat () {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  private authorizeWS (token: string | undefined, ws: WSContext, c: Context<Env>) {
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

  private async handleWSMessage (wsClient: WSContext, message: string | ArrayBuffer) {
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
      this.logger.logError('[OneBot] [HTTP WebSocket] 发生错误', '不支持的API ' + receiveData.action);
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

  async httpApiRequest (c: Context<Env>, request_sse: boolean = false): Promise<Response> {
    let payload = c.get('parsedBody') || {};
    const method = c.req.method.toUpperCase();
    const queries = c.req.queries('') ? Object.fromEntries(new URL(c.req.url).searchParams.entries()) : {};

    if (method === 'GET') {
      payload = queries;
    } else if (Object.keys(queries).length > 0) {
      payload = { ...payload, ...queries };
    }

    const path = new URL(c.req.url).pathname;
    if (path === '' || path === '/') {
      const hello = OB11Response.ok({});
      hello.message = 'NapCat4 Is Running';
      return c.json(hello);
    }
    const actionName = path.split('/')[1];
    const payload_echo = payload['echo'];
    const real_echo = payload_echo ?? Math.random().toString(36).substring(2, 15);

    const action = this.actions.get(actionName as any);
    if (action) {
      const useStream = action.useStream;
      try {
        if (useStream && !request_sse) {
          return stream(c, async (s) => {
            const result = await action.handle(payload, this.name, this.config, {
              send: async (data: object) => {
                await s.write(JSON.stringify({ ...OB11Response.ok(data, real_echo, true) }) + '\r\n\r\n');
              },
            }, real_echo);
            await s.write(JSON.stringify({ ...result }) + '\r\n\r\n');
          });
        }

        const result = await action.handle(payload, this.name, this.config, {
          send: request_sse
            ? async (data: object) => {
              await this.onEvent({ ...OB11Response.ok(data, real_echo, true) } as unknown as OB11EmitEventContent);
            }
            : async () => { },
        }, real_echo);
        return c.json(result);
      } catch (error: unknown) {
        return c.json(OB11Response.error((error as Error)?.stack?.toString() || (error as Error)?.message || 'Error Handle', 200, real_echo));
      }
    } else {
      return c.json(OB11Response.error('不支持的Api ' + actionName, 200, real_echo));
    }
  }

  async handleRequest (c: Context<Env>): Promise<Response> {
    if (!this.isEnable) {
      this.core.context.logger.log('[OneBot] [HTTP Server Adapter] Server is closed');
      return c.json(OB11Response.error('Server is closed', 200));
    }
    return this.httpApiRequest(c);
  }

  async reload (newConfig: HttpServerConfig) {
    const wasEnabled = this.isEnable;
    const oldPort = this.config.port;
    const oldEnableWebsocket = this.config.enableWebsocket;
    this.config = newConfig;

    if (newConfig.enable && !wasEnabled) {
      this.open();
      return OB11NetworkReloadType.NetWorkOpen;
    } else if (!newConfig.enable && wasEnabled) {
      this.close();
      return OB11NetworkReloadType.NetWorkClose;
    }

    if (oldPort !== newConfig.port || oldEnableWebsocket !== newConfig.enableWebsocket) {
      this.close();
      if (newConfig.enable) {
        this.open();
      }
      return OB11NetworkReloadType.NetWorkReload;
    }

    return OB11NetworkReloadType.Normal;
  }
}
