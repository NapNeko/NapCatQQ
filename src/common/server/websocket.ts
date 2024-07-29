import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';
import urlParse from 'url';
import { IncomingMessage } from 'node:http';
import { log } from '@/common/utils/log';

class WebsocketClientBase {
  private wsClient: WebSocket | undefined;

  constructor() {
  }

  send(msg: string) {
    if (this.wsClient && this.wsClient.readyState == WebSocket.OPEN) {
      this.wsClient.send(msg);
    }
  }

  onMessage(msg: string) {

  }
}

export class WebsocketServerBase {
  private ws: WebSocketServer | null = null;
  public token: string = '';

  constructor() {
  }

  start(port: number | http.Server, host: string = '') {
    if (port instanceof http.Server) {
      try {
        const wss = new WebSocketServer({
          noServer: true,
          maxPayload: 1024 * 1024 * 1024
        }).on('error', () => {
        });
        this.ws = wss;
        port.on('upgrade', function upgrade(request, socket, head) {
          wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
          });
        });
        log('ws服务启动成功, 绑定到HTTP服务');
      } catch (e: any) {
        throw Error('ws服务启动失败, 可能是绑定的HTTP服务异常' + e.toString());
      }
    } else {
      try {
        this.ws = new WebSocketServer({
          port,
          host: '',
          maxPayload: 1024 * 1024 * 1024
        }).on('error', () => {
        });
        log(`ws服务启动成功, ${host}:${port}`);
      } catch (e: any) {
        throw Error('ws服务启动失败, 请检查监听的ip和端口' + e.toString());
      }
    }
    this.ws.on('connection', (wsClient, req) => {
      const url: string = req.url!.split('?').shift() || '/';
      this.authorize(wsClient, req);
      this.onConnect(wsClient, url, req);
      wsClient.on('message', async (msg) => {
        this.onMessage(wsClient, url, msg.toString());
      });
    });
  }

  stop() {
    if (this.ws) {
      this.ws.close((err) => {
        if (err) log('ws server close failed!', err);
      });
      this.ws = null;
    }
  }

  restart(port: number) {
    this.stop();
    this.start(port);
  }

  authorize(wsClient: WebSocket, req: IncomingMessage) {
    const url = req.url!.split('?').shift();
    log('ws connect', url);
    let clientToken: string = '';
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      clientToken = authHeader.split('Bearer ').pop() || '';
      log('receive ws header token', clientToken);
    } else {
      const parsedUrl = urlParse.parse(req.url || '/', true);
      const urlToken = parsedUrl.query.access_token;
      if (urlToken) {
        if (Array.isArray(urlToken)) {
          clientToken = urlToken[0];
        } else {
          clientToken = urlToken;
        }
        log('receive ws url token', clientToken);
      }
    }
    if (this.token && clientToken != this.token) {
      this.authorizeFailed(wsClient);
      return wsClient.close();
    }
  }

  authorizeFailed(wsClient: WebSocket) {

  }

  onConnect(wsClient: WebSocket, url: string, req: IncomingMessage) {

  }

  onMessage(wsClient: WebSocket, url: string, msg: string) {

  }

  sendHeart() {

  }
}
