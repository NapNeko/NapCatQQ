import BaseAction from '@/onebot11/action/BaseAction';
import {
  OB11MessageCustomMusic,
  OB11MessageData,
  OB11MessageDataType,
  OB11MessageMixType,
  OB11MessageNode,
  OB11PostSendMsg
} from '@/onebot11/types';
import { ActionName, BaseCheckResult } from '@/onebot11/action/types';
import { getFriend, getGroup, getUidByUin, selfInfo } from '@/core/data';
import { dbUtil } from '@/core/utils/db';
import {
  ChatType,
  CustomMusicSignPostData,
  ElementType,
  Group,
  IdMusicSignPostData,
  NTQQMsgApi,
  Peer,
  RawMessage,
  SendArkElement,
  SendMessageElement,
  SendMsgElementConstructor
} from '@/core';
import fs from 'node:fs';
import { logDebug, logError } from '@/common/utils/log';
import { sleep } from '@/common/utils/helper';
import { ob11Config } from '@/onebot11/config';
import { RequestUtil } from '@/common/utils/request';
import { decodeCQCode } from '@/onebot11/cqcode';
import createSendElements from './create-send-elements';

const ALLOW_SEND_TEMP_MSG = false;

function checkSendMessage(sendMsgList: OB11MessageData[]) {
  function checkUri(uri: string): boolean {
    const pattern = /^(file:\/\/|http:\/\/|https:\/\/|base64:\/\/)/;
    return pattern.test(uri);
  }

  for (const msg of sendMsgList) {
    if (msg['type'] && msg['data']) {
      const type = msg['type'];
      const data = msg['data'];
      if (type === 'text' && !data['text']) {
        return 400;
      } else if (['image', 'voice', 'record'].includes(type)) {
        if (!data['file']) {
          return 400;
        } else {
          if (checkUri(data['file'])) {
            return 200;
          } else {
            return 400;
          }
        }

      } else if (type === 'at' && !data['qq']) {
        return 400;
      } else if (type === 'reply' && !data['id']) {
        return 400;
      }
    } else {
      return 400;
    }
  }
  return 200;
}

export interface ReturnDataType {
  message_id: number;
}

export function convertMessage2List(message: OB11MessageMixType, autoEscape = false) {
  if (typeof message === 'string') {
    if (autoEscape === true) {
      message = [{
        type: OB11MessageDataType.text,
        data: {
          text: message
        }
      }];
    } else {
      message = decodeCQCode(message.toString());
    }
  } else if (!Array.isArray(message)) {
    message = [message];
  }
  return message;
}

export async function sendMsg(peer: Peer, sendElements: SendMessageElement[], deleteAfterSentFiles: string[], waitComplete = true) {
  if (!sendElements.length) {
    throw ('消息体无法解析, 请检查是否发送了不支持的消息类型');
  }
  const returnMsg = await NTQQMsgApi.sendMsg(peer, sendElements, waitComplete, 20000);
  try {
    returnMsg.id = await dbUtil.addMsg(returnMsg, false);
  } catch (e: any) {
    logDebug('发送消息id获取失败', e);
    returnMsg.id = 0;
  }
  // log('消息发送结果', returnMsg);
  deleteAfterSentFiles.map(f => fs.unlink(f, () => {
  }));
  return returnMsg;
}

export class SendMsg extends BaseAction<OB11PostSendMsg, ReturnDataType> {
  actionName = ActionName.SendMsg;

  protected async check(payload: OB11PostSendMsg): Promise<BaseCheckResult> {
    const messages = convertMessage2List(payload.message);
    const fmNum = this.getSpecialMsgNum(payload, OB11MessageDataType.node);
    if (fmNum && fmNum != messages.length) {
      return {
        valid: false,
        message: '转发消息不能和普通消息混在一起发送,转发需要保证message只有type为node的元素'
      };
    }
    if (payload.message_type !== 'private' && payload.group_id && !(await getGroup(payload.group_id))) {
      return {
        valid: false,
        message: `群${payload.group_id}不存在`
      };
    }
    if (payload.user_id && payload.message_type !== 'group') {
      if (!(await getFriend(payload.user_id))) {
        if (!ALLOW_SEND_TEMP_MSG
          && !(await dbUtil.getUidByTempUin(payload.user_id.toString()))
        ) {
          return {
            valid: false,
            message: '不能发送临时消息'
          };
        }
      }
    }
    return {
      valid: true,
    };
  }

  protected async _handle(payload: OB11PostSendMsg): Promise<{ message_id: number }> {

    const peer: Peer = {
      chatType: ChatType.friend,
      peerUid: ''
    };
    let isTempMsg = false;
    let group: Group | undefined = undefined;
    const genGroupPeer = async () => {
      if (payload.group_id) {
        group = await getGroup(payload.group_id.toString());
        if (group) {
          peer.chatType = ChatType.group;
          // peer.name = group.name
          peer.peerUid = group.groupCode;
        }

      }
    };

    const genFriendPeer = async () => {
      if (!payload.user_id) {
        return;
      }
      const friend = await getFriend(payload.user_id.toString());
      if (friend) {
        // peer.name = friend.nickName
        peer.peerUid = friend.uid;
      } else {
        peer.chatType = ChatType.temp;
        const tempUserUid = getUidByUin(payload.user_id.toString());
        if (!tempUserUid) {
          throw (`找不到私聊对象${payload.user_id}`);
        }
        // peer.name = tempUser.nickName
        isTempMsg = true;
        peer.peerUid = tempUserUid;
      }
    };
    if (payload?.group_id && payload.message_type === 'group') {
      await genGroupPeer();

    } else if (payload?.user_id) {
      await genFriendPeer();
    } else if (payload.group_id) {
      await genGroupPeer();
    } else {
      throw ('发送消息参数错误, 请指定group_id或user_id');
    }
    const messages = convertMessage2List(payload.message, payload.auto_escape === true || payload.auto_escape === 'true');
    if (this.getSpecialMsgNum(payload, OB11MessageDataType.node)) {
      try {
        const returnMsg = await this.handleForwardNode(peer, messages as OB11MessageNode[], group);
        if (returnMsg) {
          const msgShortId = await dbUtil.addMsg(returnMsg!, false);
          return { message_id: msgShortId };
        } else {
          throw Error('发送转发消息失败');
        }
      } catch (e: any) {
        throw Error('发送转发消息失败 ' + e.toString());
      }
    } else {
      if (this.getSpecialMsgNum(payload, OB11MessageDataType.music)) {
        const music: OB11MessageCustomMusic = messages[0] as OB11MessageCustomMusic;
        // if (music) {
        // }
      }
    }
    // log("send msg:", peer, sendElements)
    const { sendElements, deleteAfterSentFiles } = await createSendElements(messages, group);
    const returnMsg = await sendMsg(peer, sendElements, deleteAfterSentFiles);
    deleteAfterSentFiles.map(f => fs.unlink(f, () => {
    }));

    const res = { message_id: returnMsg.id! };
    // console.log(res);
    return res;
  }


  private getSpecialMsgNum(payload: OB11PostSendMsg, msgType: OB11MessageDataType): number {
    if (Array.isArray(payload.message)) {
      return payload.message.filter(msg => msg.type == msgType).length;
    }
    return 0;
  }

  private async cloneMsg(msg: RawMessage): Promise<RawMessage | undefined> {
    logDebug('克隆的目标消息', msg);
    const sendElements: SendMessageElement[] = [];
    for (const ele of msg.elements) {
      sendElements.push(ele as SendMessageElement);
      // Object.keys(ele).forEach((eleKey) => {
      //     if (eleKey.endsWith("Element")) {
      //     }

    }
    if (sendElements.length === 0) {
      logDebug('需要clone的消息无法解析，将会忽略掉', msg);
    }
    logDebug('克隆消息', sendElements);
    try {
      const nodeMsg = await NTQQMsgApi.sendMsg({
        chatType: ChatType.friend,
        peerUid: selfInfo.uid
      }, sendElements, true);
      await sleep(500);
      return nodeMsg;
    } catch (e) {
      logError(e, '克隆转发消息失败,将忽略本条消息', msg);
    }

  }

  // 返回一个合并转发的消息id
  private async handleForwardNode(destPeer: Peer, messageNodes: OB11MessageNode[], group: Group | undefined): Promise<RawMessage | null> {

    const selfPeer = {
      chatType: ChatType.friend,
      peerUid: selfInfo.uid
    };
    let nodeMsgIds: string[] = [];
    // 先判断一遍是不是id和自定义混用
    const needClone = messageNodes.filter(node => node.data.id).length && messageNodes.filter(node => !node.data.id).length;
    for (const messageNode of messageNodes) {
      // 一个node表示一个人的消息
      const nodeId = messageNode.data.id;
      // 有nodeId表示一个子转发消息卡片
      if (nodeId) {
        const nodeMsg = await dbUtil.getMsgByShortId(parseInt(nodeId));
        if (!needClone) {
          nodeMsgIds.push(nodeMsg!.msgId);
        } else {
          if (nodeMsg!.peerUid !== selfInfo.uid) {
            const cloneMsg = await this.cloneMsg(nodeMsg!);
            if (cloneMsg) {
              nodeMsgIds.push(cloneMsg.msgId);
            }
          }
        }
      } else {
        // 自定义的消息
        // 提取消息段，发给自己生成消息id
        try {
          const {
            sendElements,
            deleteAfterSentFiles
          } = await createSendElements(convertMessage2List(messageNode.data.content), group);
          logDebug('开始生成转发节点', sendElements);
          const sendElementsSplit: SendMessageElement[][] = [];
          let splitIndex = 0;
          for (const ele of sendElements) {
            if (!sendElementsSplit[splitIndex]) {
              sendElementsSplit[splitIndex] = [];
            }

            if (ele.elementType === ElementType.FILE || ele.elementType === ElementType.VIDEO) {
              if (sendElementsSplit[splitIndex].length > 0) {
                splitIndex++;
              }
              sendElementsSplit[splitIndex] = [ele];
              splitIndex++;
            } else {
              sendElementsSplit[splitIndex].push(ele);
            }
            logDebug(sendElementsSplit);
          }
          // log("分割后的转发节点", sendElementsSplit)
          const MsgNodeList: Promise<RawMessage>[] = [];
          for (const eles of sendElementsSplit) {
            MsgNodeList.push(sendMsg(selfPeer, eles, [], true));
            await sleep(Math.trunc(sendElementsSplit.length / 10) * 100);
            //await sleep(10);
          }
          for (const msgNode of MsgNodeList) {
            const result = await msgNode;
            nodeMsgIds.push(result.msgId);
            logDebug('转发节点生成成功', result.msgId);
          }
          deleteAfterSentFiles.map(f => fs.unlink(f, () => {
          }));

        } catch (e) {
          logDebug('生成转发消息节点失败', e);
        }
      }
    }

    // 检查srcPeer是否一致，不一致则需要克隆成自己的消息, 让所有srcPeer都变成自己的，使其保持一致才能够转发
    const nodeMsgArray: Array<RawMessage> = [];
    let srcPeer: Peer | undefined = undefined;
    let needSendSelf = false;
    for (const [index, msgId] of nodeMsgIds.entries()) {
      const nodeMsg = await dbUtil.getMsgByLongId(msgId);
      if (nodeMsg) {
        nodeMsgArray.push(nodeMsg);
        if (!srcPeer) {
          srcPeer = { chatType: nodeMsg.chatType, peerUid: nodeMsg.peerUid };
        } else if (srcPeer.peerUid !== nodeMsg.peerUid) {
          needSendSelf = true;
          srcPeer = selfPeer;
        }
      }
    }
    logDebug('nodeMsgArray', nodeMsgArray);
    nodeMsgIds = nodeMsgArray.map(msg => msg.msgId);
    if (needSendSelf) {
      logDebug('需要克隆转发消息');
      for (const [index, msg] of nodeMsgArray.entries()) {
        if (msg.peerUid !== selfInfo.uid) {
          const cloneMsg = await this.cloneMsg(msg);
          if (cloneMsg) {
            nodeMsgIds[index] = cloneMsg.msgId;
          }
        }
      }
    }
    // elements之间用换行符分隔
    // let _sendForwardElements: SendMessageElement[] = []
    // for(let i = 0; i < sendForwardElements.length; i++){
    //     _sendForwardElements.push(sendForwardElements[i])
    //     _sendForwardElements.push(SendMsgElementConstructor.text("\n\n"))
    // }
    // const nodeMsg = await NTQQApi.sendMsg(selfPeer, _sendForwardElements, true);
    // nodeIds.push(nodeMsg.msgId)
    // await sleep(500);
    // 开发转发
    if (nodeMsgIds.length === 0) {
      throw Error('转发消息失败，生成节点为空');
    }
    try {
      logDebug('开发转发', srcPeer, destPeer, nodeMsgIds);
      return await NTQQMsgApi.multiForwardMsg(srcPeer!, destPeer, nodeMsgIds);
    } catch (e) {
      logError('forward failed', e);
      return null;
    }
  }


}

export default SendMsg;
