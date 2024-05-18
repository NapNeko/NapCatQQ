import BaseAction from '@/onebot11/action/BaseAction';
import {
  OB11MessageData,
  OB11MessageDataType,
  OB11MessageMixType,
  OB11MessageNode,
  OB11PostSendMsg
} from '@/onebot11/types';
import { ActionName, BaseCheckResult } from '@/onebot11/action/types';
import { getFriend, getGroup, getUidByUin } from '@/core/data';
import { dbUtil } from '@/core/utils/db';
import { ChatType, ElementType, Group, NTQQMsgApi, Peer, SendMessageElement, } from '@/core';
import fs from 'node:fs';
import { logDebug, logError } from '@/common/utils/log';
import { decodeCQCode } from '@/onebot11/cqcode';
import createSendElements from './create-send-elements';
import { handleForwardNode } from '@/onebot11/action/msg/SendMsg/handle-forward-node';

const ALLOW_SEND_TEMP_MSG = false;

export interface ReturnDataType {
  message_id: number;
}

// Normalizes a mixed type (CQCode/a single segment/segment array) into a segment array.
export function normalize(message: OB11MessageMixType, autoEscape = false): OB11MessageData[] {
  return typeof message === 'string' ? (
    autoEscape ?
      [{ type: OB11MessageDataType.text, data: { text: message } }] :
      decodeCQCode(message)
  ) : Array.isArray(message) ? message : [message];
}

export { createSendElements };

export async function sendMsg(peer: Peer, sendElements: SendMessageElement[], deleteAfterSentFiles: string[], waitComplete = true) {
  if (!sendElements.length) {
    throw ('消息体无法解析, 请检查是否发送了不支持的消息类型');
  }
  let totalSize = 0;
  let timeout = 5000;
  try {
    for (const fileElement of sendElements) {
      if (fileElement.elementType === ElementType.PTT) {
        totalSize += fs.statSync(fileElement.pttElement.filePath).size;
      }
      if (fileElement.elementType === ElementType.FILE) {
        totalSize += fs.statSync(fileElement.fileElement.filePath).size;
      }
      if (fileElement.elementType === ElementType.VIDEO) {
        totalSize += fs.statSync(fileElement.videoElement.filePath).size;
      }
      if (fileElement.elementType === ElementType.PIC) {
        totalSize += fs.statSync(fileElement.picElement.sourcePath).size
      }
    }
    //且 PredictTime ((totalSize / 1024 / 512) * 1000)不等于Nan
    let PredictTime = totalSize / 1024 / 512 * 1000;
    if (!Number.isNaN(PredictTime)) {
      timeout += PredictTime// 5S Basic Timeout + PredictTime( For File 512kb/s )
    }
  } catch (e) {
    logError("发送消息计算预计时间异常", e);
  }
  const returnMsg = await NTQQMsgApi.sendMsg(peer, sendElements, waitComplete, 20000);
  try {
    returnMsg.id = await dbUtil.addMsg(returnMsg, false);
  } catch (e: any) {
    logDebug('发送消息id获取失败', e);
    returnMsg.id = 0;
  }
  deleteAfterSentFiles.map(f => fs.unlink(f, () => {
  }));
  return returnMsg;
}

async function createContext(payload: OB11PostSendMsg): Promise<{
  peer: Peer, group?: Group
}> {
  // This function determines the type of message by the existence of user_id / group_id,
  // not message_type.
  // This redundant design of Ob11 here should be blamed.

  if (payload.group_id) { // take this as a group message
    const group = (await getGroup(payload.group_id))!; // checked before
    return {
      peer: {
        chatType: ChatType.group,
        peerUid: group.groupCode
      },
      group: group,
    };
  } else if (payload.user_id) { // take this as a private message
    const friend = await getFriend(payload.user_id.toString());
    if (!friend) {
      if (ALLOW_SEND_TEMP_MSG) {
        const tempUid = getUidByUin(payload.user_id.toString());
        if (tempUid) return {
          peer: {
            chatType: ChatType.temp,
            peerUid: tempUid
          },
        };
      }
      throw `找不到私聊对象 ${payload.user_id}`;
    }
    return {
      peer: {
        chatType: ChatType.friend,
        peerUid: friend.uid
      },
    };
  }
  throw '请指定 group_id 或 user_id';
}

function getSpecialMsgNum(payload: OB11PostSendMsg, msgType: OB11MessageDataType): number {
  if (Array.isArray(payload.message)) {
    return payload.message.filter(msg => msg.type == msgType).length;
  }
  return 0;
}

export class SendMsg extends BaseAction<OB11PostSendMsg, ReturnDataType> {
  actionName = ActionName.SendMsg;

  protected async check(payload: OB11PostSendMsg): Promise<BaseCheckResult> {
    const messages = normalize(payload.message);
    const nodeElementLength = getSpecialMsgNum(payload, OB11MessageDataType.node);
    if (nodeElementLength > 0 && nodeElementLength != messages.length) {
      return { valid: false, message: '转发消息不能和普通消息混在一起发送,转发需要保证message只有type为node的元素' };
    }
    if (payload.message_type !== 'private' && payload.group_id && !(await getGroup(payload.group_id))) {
      return { valid: false, message: `群${payload.group_id}不存在` };
    }
    if (payload.user_id && payload.message_type !== 'group') {
      if (!(await getFriend(payload.user_id))) {
        if (
          !ALLOW_SEND_TEMP_MSG &&
          !(await dbUtil.getUidByTempUin(payload.user_id))
        ) {
          return { valid: false, message: '不能发送临时消息' };
        }
      }
    }
    return { valid: true, };
  }

  protected async _handle(payload: OB11PostSendMsg): Promise<{ message_id: number }> {
    const { peer, group } = await createContext(payload);

    const messages = normalize(
      payload.message,
      payload.auto_escape === true || payload.auto_escape === 'true'
    );

    if (getSpecialMsgNum(payload, OB11MessageDataType.node)) {
      const returnMsg = await handleForwardNode(peer, messages as OB11MessageNode[], group);
      if (returnMsg) {
        const msgShortId = await dbUtil.addMsg(returnMsg!, false);
        return { message_id: msgShortId };
      } else {
        throw Error('发送转发消息失败');
      }
    } else {
      // if (getSpecialMsgNum(payload, OB11MessageDataType.music)) {
      //   const music: OB11MessageCustomMusic = messages[0] as OB11MessageCustomMusic;
      //   if (music) {
      //   }
      // }
    }
    // log("send msg:", peer, sendElements)
    const { sendElements, deleteAfterSentFiles } = await createSendElements(messages, group);
    const returnMsg = await sendMsg(peer, sendElements, deleteAfterSentFiles);
    deleteAfterSentFiles.forEach(f => fs.unlinkSync(f));

    return { message_id: returnMsg.id! };
  }
}

export default SendMsg;
