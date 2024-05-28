import { ChatType, ElementType, Group, NTQQMsgApi, Peer, RawMessage, SendMessageElement } from '@/core';
import { OB11MessageNode } from '@/onebot11/types';
import { selfInfo } from '@/core/data';
import { dbUtil } from '@/core/utils/db';
import createSendElements from '@/onebot11/action/msg/SendMsg/create-send-elements';
import { logDebug, logError } from '@/common/utils/log';
import { sleep } from '@/common/utils/helper';
import fs from 'node:fs';
import { normalize, sendMsg } from '@/onebot11/action/msg/SendMsg/index';

async function cloneMsg(msg: RawMessage): Promise<RawMessage | undefined> {
  const selfPeer = {
    chatType: ChatType.friend,
    peerUid: selfInfo.uid
  };

 // logDebug('克隆的目标消息', msg);

  const sendElements: SendMessageElement[] = [];

  for (const element of msg.elements) {
    sendElements.push(element as SendMessageElement);
  }

  if (sendElements.length === 0) {
    logDebug('需要clone的消息无法解析，将会忽略掉', msg);
  }

  //logDebug('克隆消息', sendElements);

  try {
    const nodeMsg = await NTQQMsgApi.sendMsg(selfPeer, sendElements, true);
    await sleep(500); // 防止风控
    return nodeMsg;
  } catch (e) {
    logError(e, '克隆转发消息失败,将忽略本条消息', msg);
  }
}

export async function handleForwardNode(destPeer: Peer, messageNodes: OB11MessageNode[], group: Group | undefined): Promise<RawMessage | null> {
  const selfPeer = {
    chatType: ChatType.friend,
    peerUid: selfInfo.uid
  };
  let nodeMsgIds: string[] = [];

  // 先判断一遍是不是id和自定义混用
  const needClone =
    messageNodes.filter(node => node.data.id).length &&
    messageNodes.filter(node => !node.data.id).length;

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
          // need cloning
          const clonedMsg = await cloneMsg(nodeMsg!);
          if (clonedMsg) {
            nodeMsgIds.push(clonedMsg.msgId);
          }
        }
      }
    } else {
      // 自定义的消息
      // 提取消息段，发给自己生成消息id
      try {
        const { sendElements } = await createSendElements(normalize(messageNode.data.content), group);
        //logDebug('开始生成转发节点', sendElements);
        const sendElementsSplit: SendMessageElement[][] = [];
        let splitIndex = 0;
        for (const sendElement of sendElements) {
          if (!sendElementsSplit[splitIndex]) {
            sendElementsSplit[splitIndex] = [];
          }

          if (sendElement.elementType === ElementType.FILE || sendElement.elementType === ElementType.VIDEO) {
            if (sendElementsSplit[splitIndex].length > 0) {
              splitIndex++;
            }
            sendElementsSplit[splitIndex] = [sendElement];
            splitIndex++;
          } else {
            sendElementsSplit[splitIndex].push(sendElement);
          }
          //logDebug(sendElementsSplit);
        }
        // log("分割后的转发节点", sendElementsSplit)
        const MsgNodeList: Promise<RawMessage>[] = [];
        for (const sendElementsSplitElement of sendElementsSplit) {
          MsgNodeList.push(sendMsg(selfPeer, sendElementsSplitElement, [], true));
          await sleep(Math.trunc(sendElementsSplit.length / 10) * 100);
          //await sleep(10);
        }
        for (const msgNode of MsgNodeList) {
          const result = await msgNode;
          nodeMsgIds.push(result.msgId);
          //logDebug('转发节点生成成功', result.msgId);
        }
      } catch (e) {
        logDebug('生成转发消息节点失败', e);
      }
    }
  }

  // 检查srcPeer是否一致，不一致则需要克隆成自己的消息, 让所有srcPeer都变成自己的，使其保持一致才能够转发
  const nodeMsgArray: Array<RawMessage> = [];
  let srcPeer: Peer | undefined = undefined;
  let needSendSelf = false;
  for (const msgId of nodeMsgIds) {
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
  //logDebug('nodeMsgArray', nodeMsgArray);
  nodeMsgIds = nodeMsgArray.map(msg => msg.msgId);
  if (needSendSelf) {
    //logDebug('需要克隆转发消息');
    for (const [index, msg] of nodeMsgArray.entries()) {
      if (msg.peerUid !== selfInfo.uid) {
        const clonedMsg = await cloneMsg(msg);
        if (clonedMsg) {
          nodeMsgIds[index] = clonedMsg.msgId;
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
