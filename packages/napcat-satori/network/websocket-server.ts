import { WebSocketServer, WebSocket } from 'ws';
import { createServer, Server, IncomingMessage } from 'http';
import { NapCatCore } from 'napcat-core';
import { NapCatSatoriAdapter } from '../index';
import { SatoriActionMap } from '../action';
import { SatoriWebSocketServerConfig } from '../config/config';
import {
  ISatoriNetworkAdapter,
  SatoriEmitEventContent,
  SatoriNetworkReloadType,
} from './adapter';
import {
  SatoriOpcode,
  SatoriSignal,
  SatoriIdentifyBody,
  SatoriReadyBody,
  SatoriLoginStatus,
} from '../types';

interface ClientInfo {
  ws: WebSocket;
  identified: boolean;
  sequence: number;
}

export class SatoriWebSocketServerAdapter extends ISatoriNetworkAdapter<SatoriWebSocketServerConfig> {
  private server: Server | null = null;
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, ClientInfo> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventSequence: number = 0;

  constructor (
    name: string,
    config: SatoriWebSocketServerConfig,
    core: NapCatCore,
    satoriContext: NapCatSatoriAdapter,
    actions: SatoriActionMap
  ) {
    super(name, config, core, satoriContext, actions);
  }

  async open (): Promise<void> {
    if (this.isEnable) return;

    try {
      this.server = createServer();
      this.wss = new WebSocketServer({
        server: this.server,
        path: this.config.path || '/v1/events',
      });

      this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
        this.handleConnection(ws, req);
      });

      this.wss.on('error', (error) => {
        this.logger.logError(`[Satori] WebSocket服务器错误: ${error.message}`);
      });

      await new Promise<void>((resolve, reject) => {
        this.server!.listen(this.config.port, this.config.host, () => {
          this.logger.log(`[Satori] WebSocket服务器已启动: ws://${this.config.host}:${this.config.port}${this.config.path}`);
          resolve();
        });
        this.server!.on('error', reject);
      });

      this.startHeartbeat();
      this.isEnable = true;
    } catch (error) {
      this.logger.logError(`[Satori] WebSocket服务器启动失败: ${error}`);
      throw error;
    }
  }

  async close (): Promise<void> {
    if (!this.isEnable) return;

    this.stopHeartbeat();

    for (const [ws] of this.clients) {
      ws.close(1000, 'Server shutting down');
    }
    this.clients.clear();

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
      this.server = null;
    }

    this.isEnable = false;
    this.logger.log(`[Satori] WebSocket服务器已关闭`);
  }

  async reload (config: SatoriWebSocketServerConfig): Promise<SatoriNetworkReloadType> {
    const needRestart =
      this.config.host !== config.host ||
      this.config.port !== config.port ||
      this.config.path !== config.path;

    this.config = structuredClone(config);

    if (!config.enable) {
      return SatoriNetworkReloadType.NetWorkClose;
    }

    if (needRestart && this.isEnable) {
      await this.close();
      await this.open();
    }

    return SatoriNetworkReloadType.Normal;
  }

  async onEvent<T extends SatoriEmitEventContent> (event: T): Promise<void> {
    if (!this.isEnable) return;

    this.eventSequence++;
    const signal: SatoriSignal<T> = {
      op: SatoriOpcode.EVENT,
      body: {
        ...event,
        id: this.eventSequence,
      } as T,
    };

    const message = JSON.stringify(signal);

    for (const [ws, clientInfo] of this.clients) {
      if (clientInfo.identified && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        clientInfo.sequence = this.eventSequence;
        if (this.config.debug) {
          this.logger.logDebug(`[Satori] 发送事件: ${event.type}`);
        }
      }
    }
  }

  private handleConnection (ws: WebSocket, req: IncomingMessage): void {
    const clientInfo: ClientInfo = {
      ws,
      identified: false,
      sequence: 0,
    };
    this.clients.set(ws, clientInfo);

    this.logger.log(`[Satori] 新客户端连接: ${req.socket.remoteAddress}`);

    ws.on('message', (data) => {
      this.handleMessage(ws, data.toString());
    });

    ws.on('close', () => {
      this.clients.delete(ws);
      this.logger.log(`[Satori] 客户端断开连接`);
    });

    ws.on('error', (error) => {
      this.logger.logError(`[Satori] 客户端错误: ${error.message}`);
    });
  }

  private handleMessage (ws: WebSocket, data: string): void {
    try {
      const signal: SatoriSignal = JSON.parse(data);
      const clientInfo = this.clients.get(ws);
      if (!clientInfo) return;

      switch (signal.op) {
        case SatoriOpcode.IDENTIFY:
          this.handleIdentify(ws, clientInfo, signal.body as SatoriIdentifyBody);
          break;
        case SatoriOpcode.PING:
          this.sendPong(ws);
          break;
        default:
          this.logger.logDebug(`[Satori] 收到未知信令: ${signal.op}`);
      }
    } catch (error) {
      this.logger.logError(`[Satori] 消息解析失败: ${error}`);
    }
  }

  private handleIdentify (ws: WebSocket, clientInfo: ClientInfo, body: SatoriIdentifyBody): void {
    // 验证 token
    if (this.config.token && body.token !== this.config.token) {
      ws.close(4001, 'Invalid token');
      return;
    }

    clientInfo.identified = true;
    if (body.sequence) {
      clientInfo.sequence = body.sequence;
    }

    // 发送 READY 信令
    const readyBody: SatoriReadyBody = {
      logins: [{
        user: {
          id: this.core.selfInfo.uin,
          name: this.core.selfInfo.nick,
          avatar: `https://q1.qlogo.cn/g?b=qq&nk=${this.core.selfInfo.uin}&s=640`,
        },
        self_id: this.core.selfInfo.uin,
        platform: this.satoriContext.configLoader.configData.platform,
        status: SatoriLoginStatus.ONLINE,
      }],
    };

    const readySignal: SatoriSignal<SatoriReadyBody> = {
      op: SatoriOpcode.READY,
      body: readyBody,
    };

    ws.send(JSON.stringify(readySignal));
    this.logger.log(`[Satori] 客户端认证成功`);
  }

  private sendPong (ws: WebSocket): void {
    const pongSignal: SatoriSignal = {
      op: SatoriOpcode.PONG,
    };
    ws.send(JSON.stringify(pongSignal));
  }

  private startHeartbeat (): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [ws, clientInfo] of this.clients) {
        if (ws.readyState === WebSocket.OPEN && clientInfo.identified) {
          // 检查客户端是否还活着
          if ((ws as any).isAlive === false) {
            ws.terminate();
            this.clients.delete(ws);
            continue;
          }
          (ws as any).isAlive = false;
          ws.ping();
        }
      }
    }, this.config.heartInterval || 10000);
  }

  private stopHeartbeat (): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
