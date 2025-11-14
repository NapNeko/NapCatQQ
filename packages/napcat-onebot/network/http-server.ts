import { OB11EmitEventContent, OB11NetworkReloadType } from './index';
import express, { Express, NextFunction, Request, Response } from 'express';
import http from 'http';
import { OB11Response } from '@/napcat-onebot/action/OneBotAction';
import cors from 'cors';
import { HttpServerConfig } from '@/napcat-onebot/config/config';
import { IOB11NetworkAdapter } from '@/napcat-onebot/network/adapter';
import json5 from 'json5';
import { isFinished } from 'on-finished';
import typeis from 'type-is';

export class OB11HttpServerAdapter extends IOB11NetworkAdapter<HttpServerConfig> {
  private app: Express | undefined;
  private server: http.Server | undefined;

  override async onEvent<T extends OB11EmitEventContent> (_event: T) {
    // http server is passive, no need to emit event
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
  }

  private initializeServer () {
    this.app = express();
    this.server = http.createServer(this.app);

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
    this.config = newConfig;

    if (newConfig.enable && !wasEnabled) {
      this.open();
      return OB11NetworkReloadType.NetWorkOpen;
    } else if (!newConfig.enable && wasEnabled) {
      this.close();
      return OB11NetworkReloadType.NetWorkClose;
    }

    if (oldPort !== newConfig.port) {
      this.close();
      if (newConfig.enable) {
        this.open();
      }
      return OB11NetworkReloadType.NetWorkReload;
    }

    return OB11NetworkReloadType.Normal;
  }
}
