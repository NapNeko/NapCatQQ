import { WebSocket } from 'ws';
import { actionMap } from '../../action';
import { OB11Response } from '../../action/OB11Response';
import { postWsEvent, registerWsEventSender, unregisterWsEventSender } from '../postOB11Event';
import { ActionName } from '../../action/types';
import BaseAction from '../../action/BaseAction';
import { LifeCycleSubType, OB11LifeCycleEvent } from '../../event/meta/OB11LifeCycleEvent';
import { OB11HeartbeatEvent } from '../../event/meta/OB11HeartbeatEvent';
import { WebsocketServerBase } from '@/common/server/websocket';
import { IncomingMessage } from 'node:http';
import { wsReply } from './reply';
import { napCatCore } from '@/core';
import { log, logDebug, logError } from '../../../common/utils/log';
import { ob11Config } from '@/onebot11/config';
import { selfInfo } from '@/core/data';

const heartbeatRunning = false;

class OB11WebsocketServer extends WebsocketServerBase {

  public start(port: number, host: string) {
    this.token = ob11Config.token;
    super.start(port, host);
  }

  authorizeFailed(wsClient: WebSocket) {
    wsClient.send(JSON.stringify(OB11Response.res(null, 'failed', 1403, 'token验证失败')));
  }

  async handleAction(wsClient: WebSocket, actionName: string, params: any, echo?: any) {
    const action: BaseAction<any, any> | undefined = actionMap.get(actionName);
    if (!action) {
      return wsReply(wsClient, OB11Response.error('不支持的api ' + actionName, 1404, echo));
    }
    try {
      const handleResult = await action.websocketHandle(params, echo);
      wsReply(wsClient, handleResult);
    } catch (e: any) {
      wsReply(wsClient, OB11Response.error(`api处理出错:${e.stack}`, 1200, echo));
    }
  }

  onConnect(wsClient: WebSocket, url: string, req: IncomingMessage) {
    if (url == '/api' || url == '/api/' || url == '/') {
      wsClient.on('message', async (msg) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        let receiveData: { action: ActionName, params: any, echo?: any } = { action: '', params: {} };
        let echo = null;
        try {
          receiveData = JSON.parse(msg.toString());
          echo = receiveData.echo;
          logDebug('收到正向Websocket消息', receiveData);
        } catch (e) {
          return wsReply(wsClient, OB11Response.error('json解析失败，请检查数据格式', 1400, echo));
        }
        this.handleAction(wsClient, receiveData.action, receiveData.params, receiveData.echo).then();
      });
    }
    if (url == '/event' || url == '/event/' || url == '/') {
      registerWsEventSender(wsClient);

      logDebug('event上报ws客户端已连接');

      try {
        wsReply(wsClient, new OB11LifeCycleEvent(LifeCycleSubType.CONNECT));
      } catch (e) {
        logError('发送生命周期失败', e);
      }
      const { heartInterval } = ob11Config;
      const wsClientInterval = setInterval(() => {
        postWsEvent(new OB11HeartbeatEvent(!!selfInfo.online, true, heartInterval));
      }, heartInterval);  // 心跳包
      wsClient.on('close', () => {
        logError('event上报ws客户端已断开');
        clearInterval(wsClientInterval);
        unregisterWsEventSender(wsClient);
      });
    }
  }
}

export const ob11WebsocketServer = new OB11WebsocketServer();

