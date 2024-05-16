import { LifeCycleSubType, OB11LifeCycleEvent } from '../../event/meta/OB11LifeCycleEvent';
import { ActionName } from '../../action/types';
import { OB11Response } from '../../action/OB11Response';
import BaseAction from '../../action/BaseAction';
import { actionMap } from '../../action';
import { postWsEvent, registerWsEventSender, unregisterWsEventSender } from '../postOB11Event';
import { wsReply } from './reply';
import { WebSocket as WebSocketClass } from 'ws';
import { OB11HeartbeatEvent } from '../../event/meta/OB11HeartbeatEvent';
import { log, logDebug, logError } from '../../../common/utils/log';
import { ob11Config } from '@/onebot11/config';
import { napCatCore } from '@/core';
import { selfInfo } from '@/core/data';

export const rwsList: ReverseWebsocket[] = [];

export class ReverseWebsocket {
  public websocket: WebSocketClass | undefined;
  public url: string;
  private running: boolean = false;

  public constructor(url: string) {
    this.url = url;
    this.running = true;
    this.connect();
  }

  public stop() {
    this.running = false;
    this.websocket!.close();
  }

  public onopen() {
    wsReply(this.websocket!, new OB11LifeCycleEvent(LifeCycleSubType.CONNECT));
  }

  public async onmessage(msg: string) {
    let receiveData: { action: ActionName | undefined, params: any, echo?: any } = { action: undefined, params: {} };
    let echo = null;
    try {
      receiveData = JSON.parse(msg.toString());
      echo = receiveData.echo;
      logDebug('收到反向Websocket消息', receiveData);
    } catch (e) {
      return wsReply(this.websocket!, OB11Response.error('json解析失败，请检查数据格式', 1400, echo));
    }
    const action: BaseAction<any, any> | undefined = actionMap.get(receiveData.action!);
    if (!action) {
      return wsReply(this.websocket!, OB11Response.error('不支持的api ' + receiveData.action, 1404, echo));
    }
    try {
      const handleResult = await action.websocketHandle(receiveData.params, echo);
      wsReply(this.websocket!, handleResult);
    } catch (e) {
      wsReply(this.websocket!, OB11Response.error(`api处理出错:${e}`, 1200, echo));
    }
  }

  public onclose = () => {
    logError('反向ws断开', this.url);
    unregisterWsEventSender(this.websocket!);
    if (this.running) {
      this.reconnect();
    }
  };

  public send(msg: string) {
    if (this.websocket && this.websocket.readyState == WebSocket.OPEN) {
      this.websocket.send(msg);
    }
  }

  private reconnect() {
    setTimeout(() => {
      this.connect();
    }, 3000);  // TODO: 重连间隔在配置文件中实现
  }

  private connect() {
    const { token, heartInterval } = ob11Config;
    this.websocket = new WebSocketClass(this.url, {
      maxPayload: 1024 * 1024 * 1024,
      handshakeTimeout: 2000,
      perMessageDeflate: false,
      headers: {
        'X-Self-ID': selfInfo.uin,
        'Authorization': `Bearer ${token}`,
        'x-client-role': 'Universal',  // koishi-adapter-onebot 需要这个字段
      }
    });
    registerWsEventSender(this.websocket);
    logDebug('Trying to connect to the websocket server: ' + this.url);


    this.websocket.on('open', () => {
      logDebug('Connected to the websocket server: ' + this.url);
      this.onopen();
    });

    this.websocket.on('message', async (data) => {
      await this.onmessage(data.toString());
    });

    this.websocket.on('error', log);

    const wsClientInterval = setInterval(() => {
      wsReply(this.websocket!, new OB11HeartbeatEvent(!!selfInfo.online, true, heartInterval));
    }, heartInterval);  // 心跳包
    this.websocket.on('close', () => {
      clearInterval(wsClientInterval);
      logDebug('The websocket connection: ' + this.url + ' closed, trying reconnecting...');
      this.onclose();
    });
  }
}

class OB11ReverseWebsockets {
  start() {
    for (const url of ob11Config.reverseWs.urls) {
      log('开始连接反向ws', url);
      new Promise(() => {
        try {
          rwsList.push(new ReverseWebsocket(url));
        } catch (e: any) {
          logError(e.stack);
        }
      }).then();
    }
  }

  stop() {
    for (const rws of rwsList) {
      rws.stop();
    }
  }

  restart() {
    this.stop();
    this.start();
  }
}

export const ob11ReverseWebsockets = new OB11ReverseWebsockets();

