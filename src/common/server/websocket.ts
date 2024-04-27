import { WebSocket, WebSocketServer } from 'ws';
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

  start(port: number, host: string = '') {
    try {
      this.ws = new WebSocketServer({
        port ,
        host: '',
        maxPayload: 1024 * 1024 * 1024
      });
      log(`ws服务启动成功, ${host}:${port}`);
    } catch (e: any) {
      throw Error('ws服务启动失败, 请检查监听的ip和端口' + e.toString());
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
    this.ws && this.ws.close((err) => {
      log('ws server close failed!', err);
    });
    this.ws = null;
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
