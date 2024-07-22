import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { log, logDebug, logError } from '../utils/log';
import { ob11Config } from '@/onebot11/config';

type RegisterHandler = (res: Response, payload: any) => Promise<any>

export abstract class HttpServerBase {
  name: string = 'NapCatQQ';
  private readonly expressAPP: Express;
  private _server: http.Server | null = null;

  public get server(): http.Server | null {
    return this._server;
  }

  private set server(value: http.Server | null) {
    this._server = value;
  }

  constructor() {
    this.expressAPP = express();
    this.expressAPP.use(cors());
    this.expressAPP.use(express.urlencoded({ extended: true, limit: '5000mb' }));
    this.expressAPP.use((req, res, next) => {
      // 兼容处理没有带content-type的请求
      // log("req.headers['content-type']", req.headers['content-type'])
      req.headers['content-type'] = 'application/json';
      const originalJson = express.json({ limit: '5000mb' });
      // 调用原始的express.json()处理器
      originalJson(req, res, (err) => {
        if (err) {
          logError('Error parsing JSON:', err);
          return res.status(400).send('Invalid JSON');
        }
        next();
      });
    });
  }

  authorize(req: Request, res: Response, next: () => void) {
    const serverToken = ob11Config.token;
    let clientToken = '';
    const authHeader = req.get('authorization');
    if (authHeader) {
      clientToken = authHeader.split('Bearer ').pop() || '';
      //logDebug('receive http header token', clientToken);
    } else if (req.query.access_token) {
      if (Array.isArray(req.query.access_token)) {
        clientToken = req.query.access_token[0].toString();
      } else {
        clientToken = req.query.access_token.toString();
      }
      //logDebug('receive http url token', clientToken);
    }

    if (serverToken && clientToken != serverToken) {
      return res.status(403).send(JSON.stringify({ message: 'token verify failed!' }));
    }
    next();
  }

  start(port: number, host: string) {
    try {
      this.expressAPP.get('/', (req: Request, res: Response) => {
        res.send(`${this.name}已启动`);
      });
      this.listen(port, host);
    } catch (e: any) {
      logError('HTTP服务启动失败', e.toString());
      // httpServerError = "HTTP服务启动失败, " + e.toString()
    }
  }

  stop() {
    // httpServerError = ""
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  restart(port: number, host: string) {
    this.stop();
    this.start(port, host);
  }

  abstract handleFailed(res: Response, payload: any, err: any): void

  registerRouter(method: 'post' | 'get' | string, url: string, handler: RegisterHandler) {
    if (!url.startsWith('/')) {
      url = '/' + url;
    }

    // @ts-expect-error wait fix
    if (!this.expressAPP[method]) {
      const err = `${this.name} register router failed，${method} not exist`;
      logError(err);
      throw err;
    }
    // @ts-expect-error wait fix
    this.expressAPP[method](url, this.authorize, async (req: Request, res: Response) => {
      let payload = req.body;
      if (method == 'get') {
        payload = req.query;
      } else if (req.query) {
        payload = { ...req.query, ...req.body };
      }
      logDebug('收到http请求', url, payload);
      try {
        res.send(await handler(res, payload));
      } catch (e: any) {
        this.handleFailed(res, payload, e.stack.toString());
      }
    });
  }

  protected listen(port: number, host: string = '0.0.0.0') {
    host = host || '0.0.0.0';
    try {
      this.server = this.expressAPP.listen(port, host, () => {
        const info = `${this.name} started ${host}:${port}`;
        log(info);
      }).on('error', (err) => {
        logError('HTTP服务启动失败', err.toString());
      });
    } catch (e: any) {
      logError('HTTP服务启动失败, 请检查监听的ip地址和端口', e.stack.toString());
    }
  }
}
