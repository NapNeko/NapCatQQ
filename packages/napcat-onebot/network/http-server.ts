import { OB11EmitEventContent, OB11NetworkReloadType } from './index';
import express, { Express, NextFunction, Request, Response } from 'express';
import http, { IncomingMessage } from 'http';
import { OB11Response } from '@/napcat-onebot/action/OneBotAction';
import cors from 'cors';
import { HttpServerConfig } from '@/napcat-onebot/config/config';
import { IOB11NetworkAdapter } from '@/napcat-onebot/network/adapter';
import json5 from 'json5';
import { isFinished } from 'on-finished';
import typeis from 'type-is';
import { WebSocket, WebSocketServer, RawData } from 'ws';
import { URL } from 'url';
import { ActionName } from '@/napcat-onebot/action/router';
import { OB11HeartbeatEvent } from '@/napcat-onebot/event/meta/OB11HeartbeatEvent';
import { OB11LifeCycleEvent, LifeCycleSubType } from '@/napcat-onebot/event/meta/OB11LifeCycleEvent';
import { Mutex } from 'async-mutex';

export class OB11HttpServerAdapter extends IOB11NetworkAdapter<HttpServerConfig> {
  private app: Express | undefined;
  private server: http.Server | undefined;
  private wsServer?: WebSocketServer;
  private wsClients: WebSocket[] = [];
  private wsClientsMutex = new Mutex();
  private heartbeatIntervalId: NodeJS.Timeout | null = null;
  private wsClientWithEvent: WebSocket[] = [];

  override get isActive (): boolean {
    return this.isEnable && this.wsClientWithEvent.length > 0;
  }

  override async onEvent<T extends OB11EmitEventContent> (event: T) {
    // http server is passive, no need to emit event
    this.wsClientsMutex.runExclusive(async () => {
      const promises = this.wsClientWithEvent.map((wsClient) => {
        return new Promise<void>((resolve, reject) => {
          if (wsClient.readyState === WebSocket.OPEN) {
            wsClient.send(JSON.stringify(event));
            resolve();
          } else {
            reject(new Error('WebSocket is not open'));
          }
        });
      });
      await Promise.allSettled(promises);
    });
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
    await this.wsClientsMutex.runExclusive(async () => {
      this.wsClients.forEach((wsClient) => {
        wsClient.close();
      });
      this.wsClients = [];
      this.wsClientWithEvent = [];
    });
    this.wsServer?.close();
  }

  private initializeServer () {
    this.app = express();
    this.server = http.createServer(this.app);
    if (this.config.enableWebsocket) {
      this.wsServer = new WebSocketServer({ server: this.server });
      this.createWSServer(this.wsServer);
    }

    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: true, limit: '5000mb' }));

    this.app.use((req, res, next) => {
      if (isFinished(req)) {
        next();
        return;
      }
      if (!typeis.hasBody(req)) {
        next();
        return;
      }
      // 兼容处理没有带content-type的请求
      req.headers['content-type'] = 'application/json';
      let rawData = '';
      req.on('data', (chunk) => {
        rawData += chunk;
      });
      req.on('end', () => {
        try {
          req.body = { ...json5.parse(rawData || '{}'), ...req.body };
          next();
        } catch {
          res.status(400).send('Invalid JSON');
        }
      });
      req.on('error', () => {
        return res.status(400).send('Invalid JSON');
      });
    });
    this.app.use((req, res, next) => this.authorize(this.config.token, req, res, next));
    this.app.use(async (req, res) => {
      await this.handleRequest(req, res);
    });
    this.server.listen(this.config.port, this.config.host, () => {
      this.core.context.logger.log(`[OneBot] [HTTP Server Adapter] Start On ${this.config.host}:${this.config.port}`);
    });
  }

  private authorize (token: string | undefined, req: Request, res: Response, next: NextFunction) {
    if (!token || token.length === 0) return next();// 客户端未设置密钥
    const HeaderClientToken = req.headers.authorization?.split('Bearer ').pop() || '';
    const QueryClientToken = req.query['access_token'];
    const ClientToken = typeof (QueryClientToken) === 'string' && QueryClientToken !== '' ? QueryClientToken : HeaderClientToken;
    if (ClientToken === token) {
      return next();
    } else {
      return res.status(403).send(JSON.stringify({ message: 'token verify failed!' }));
    }
  }

  createWSServer (newServer: WebSocketServer) {
    newServer.on('connection', async (wsClient, wsReq) => {
      if (!this.isEnable) {
        wsClient.close();
        return;
      }
      if (!this.authorizeWS(this.config.token, wsClient, wsReq)) {
        return;
      }
      const paramUrl = wsReq.url?.indexOf('?') !== -1 ? wsReq.url?.substring(0, wsReq.url?.indexOf('?')) : wsReq.url;
      const isApiConnect = paramUrl === '/api' || paramUrl === '/api/';
      if (!isApiConnect) {
        this.connectEvent(this.core, wsClient);
      }

      wsClient.on('error', (err) => this.logger.log('[OneBot] [HTTP WebSocket] Client Error:', err.message));
      wsClient.on('message', (message) => {
        this.handleWSMessage(wsClient, message).then().catch(e => this.logger.logError(e));
      });
      wsClient.on('ping', () => {
        wsClient.pong();
      });
      wsClient.on('pong', () => {
        // this.logger.logDebug('[OneBot] [HTTP WebSocket] Pong received');
      });
      wsClient.once('close', () => {
        this.wsClientsMutex.runExclusive(async () => {
          const NormolIndex = this.wsClients.indexOf(wsClient);
          if (NormolIndex !== -1) {
            this.wsClients.splice(NormolIndex, 1);
          }
          const EventIndex = this.wsClientWithEvent.indexOf(wsClient);
          if (EventIndex !== -1) {
            this.wsClientWithEvent.splice(EventIndex, 1);
          }
          if (this.wsClientWithEvent.length === 0) {
            this.stopHeartbeat();
          }
        });
      });
      await this.wsClientsMutex.runExclusive(async () => {
        if (!isApiConnect) {
          this.wsClientWithEvent.push(wsClient);
        }
        this.wsClients.push(wsClient);
        if (this.wsClientWithEvent.length > 0) {
          this.startHeartbeat();
        }
      });
    }).on('error', (err) => this.logger.log('[OneBot] [HTTP WebSocket] Server Error:', err.message));
  }

  connectEvent (core: any, wsClient: WebSocket) {
    try {
      this.checkStateAndReply<unknown>(new OB11LifeCycleEvent(core, LifeCycleSubType.CONNECT), wsClient).catch(e => this.logger.logError('[OneBot] [HTTP WebSocket] 发送生命周期失败', e));
    } catch (e) {
      this.logger.logError('[OneBot] [HTTP WebSocket] 发送生命周期失败', e);
    }
  }

  private startHeartbeat () {
    if (this.heartbeatIntervalId) return;
    this.heartbeatIntervalId = setInterval(() => {
      this.wsClientsMutex.runExclusive(async () => {
        this.wsClientWithEvent.forEach((wsClient) => {
          if (wsClient.readyState === WebSocket.OPEN) {
            wsClient.send(JSON.stringify(new OB11HeartbeatEvent(this.core, 30000, this.core.selfInfo.online ?? true, true)));
          }
        });
      });
    }, 30000);
  }

  private stopHeartbeat () {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  private authorizeWS (token: string | undefined, wsClient: WebSocket, wsReq: IncomingMessage) {
    if (!token || token.length === 0) return true;
    const url = new URL(wsReq?.url || '', `http://${wsReq.headers.host}`);
    const QueryClientToken = url.searchParams.get('access_token');
    const HeaderClientToken = wsReq.headers.authorization?.split('Bearer ').pop() || '';
    const ClientToken = typeof (QueryClientToken) === 'string' && QueryClientToken !== '' ? QueryClientToken : HeaderClientToken;
    if (ClientToken === token) {
      return true;
    }
    wsClient.send(JSON.stringify(OB11Response.res(null, 'failed', 1403, 'token验证失败')));
    wsClient.close();
    return false;
  }

  private async checkStateAndReply<T> (data: T, wsClient: WebSocket) {
    return await new Promise<void>((resolve, reject) => {
      if (wsClient.readyState === WebSocket.OPEN) {
        wsClient.send(JSON.stringify(data));
        resolve();
      } else {
        reject(new Error('WebSocket is not open'));
      }
    });
  }

  private async handleWSMessage (wsClient: WebSocket, message: RawData) {
    let receiveData: { action: typeof ActionName[keyof typeof ActionName], params?: any, echo?: any; } = { action: ActionName.Unknown, params: {} };
    let echo;
    try {
      receiveData = json5.parse(message.toString());
      echo = receiveData.echo;
    } catch {
      await this.checkStateAndReply<unknown>(OB11Response.error('json解析失败,请检查数据格式', 1400, echo), wsClient);
      return;
    }
    receiveData.params = (receiveData?.params) ? receiveData.params : {};

    const action = this.actions.get(receiveData.action as any);
    if (!action) {
      this.logger.logError('[OneBot] [HTTP WebSocket] 发生错误', '不支持的API ' + receiveData.action);
      await this.checkStateAndReply<unknown>(OB11Response.error('不支持的API ' + receiveData.action, 1404, echo), wsClient);
      return;
    }
    const retdata = await action.websocketHandle(receiveData.params, echo ?? '', this.name, this.config, {
      send: async (data: object) => {
        await this.checkStateAndReply<unknown>({ ...OB11Response.ok(data, echo ?? '', true) }, wsClient);
      },
    });
    await this.checkStateAndReply<unknown>({ ...retdata }, wsClient);
  }

  async httpApiRequest (req: Request, res: Response, request_sse: boolean = false) {
    let payload = req.body;
    if (req.method === 'get') {
      payload = req.query;
    } else if (req.query) {
      payload = { ...req.body, ...req.query };
    }
    if (req.path === '' || req.path === '/') {
      const hello = OB11Response.ok({});
      hello.message = 'NapCat4 Is Running';
      return res.json(hello);
    }
    const actionName = req.path.split('/')[1];
    const payload_echo = payload['echo'];
    const real_echo = payload_echo ?? Math.random().toString(36).substring(2, 15);

    const action = this.actions.get(actionName as any);
    if (action) {
      const useStream = action.useStream;
      try {
        const result = await action.handle(payload, this.name, this.config, {
          send: request_sse
            ? async (data: object) => {
              await this.onEvent({ ...OB11Response.ok(data, real_echo, true) } as unknown as OB11EmitEventContent);
            }
            : async (data: object) => {
              const newPromise = new Promise<void>((resolve, _reject) => {
                res.write(JSON.stringify({ ...OB11Response.ok(data, real_echo, true) }) + '\r\n\r\n', () => {
                  resolve();
                });
              });
              return newPromise;
            },
        }, real_echo);
        if (useStream) {
          res.write(JSON.stringify({ ...result }) + '\r\n\r\n');
          return res.end();
        }
        return res.json(result);
      } catch (error: unknown) {
        return res.json(OB11Response.error((error as Error)?.stack?.toString() || (error as Error)?.message || 'Error Handle', 200, real_echo));
      }
    } else {
      return res.json(OB11Response.error('不支持的Api ' + actionName, 200, real_echo));
    }
  }

  async handleRequest (req: Request, res: Response) {
    if (!this.isEnable) {
      this.core.context.logger.log('[OneBot] [HTTP Server Adapter] Server is closed');
      res.json(OB11Response.error('Server is closed', 200));
      return;
    }
    this.httpApiRequest(req, res);
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
