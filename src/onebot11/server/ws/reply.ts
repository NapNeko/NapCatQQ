import { WebSocket as WebSocketClass } from 'ws';
import { OB11Response } from '../../action/OB11Response';
import { PostEventType } from '../postOB11Event';
import { log, logDebug, logError } from '../../../common/utils/log';
import { isNull } from '../../../common/utils/helper';


export function wsReply(wsClient: WebSocketClass, data: OB11Response | PostEventType) {
  try {
    const packet = Object.assign({}, data);
    if (isNull(packet['echo'])) {
      delete packet['echo'];
    }
    wsClient.send(JSON.stringify(packet));
    logDebug('ws 消息上报', wsClient.url || '', data);
  } catch (e: any) {
    logError('websocket 回复失败', e.stack, data);
  }
}
