import { ChatType, ElementType, Group, NTQQMsgApi, Peer, RawMessage, SendMessageElement } from '@/core';
import { OB11MessageDataType, OB11MessageNode } from '@/onebot11/types';
import { selfInfo } from '@/core/data';
import createSendElements from '@/onebot11/action/msg/SendMsg/create-send-elements';
import { logDebug, logError } from '@/common/utils/log';
import { sleep } from '@/common/utils/helper';
import { normalize, sendMsg } from '@/onebot11/action/msg/SendMsg/index';
import { MessageUnique } from '@/common/utils/MessageUnique';

async function cloneMsg(msg: RawMessage): Promise<RawMessage | undefined> {
  const selfPeer = {
    chatType: ChatType.friend,
    peerUid: selfInfo.uid
  };

  //logDebug('克隆的目标消息', msg);

  const sendElements: SendMessageElement[] = [];

  for (const element of msg.elements) {
    sendElements.push(element as SendMessageElement);
  }

  if (sendElements.length === 0) {
    logDebug('需要clone的消息无法解析，将会忽略掉', msg);
  }
  try {
    const nodeMsg = await NTQQMsgApi.sendMsg(selfPeer, sendElements, true);
    return nodeMsg;
  } catch (e) {
    logError(e, '克隆转发消息失败,将忽略本条消息', msg);
  }
}

export async function handleForwardNode(destPeer: Peer, messageNodes: OB11MessageNode[], inputPeer: Peer): Promise<RawMessage | null> {
  const selfPeer = {
    chatType: ChatType.friend,
    peerUid: selfInfo.uid
  };
  let nodeMsgIds: string[] = [];
  for (const messageNode of messageNodes) {
    const nodeId = messageNode.data.id;
    if (nodeId) {
      //对Mgsid和OB11ID混用情况兜底
      const nodeMsg = MessageUnique.getMsgIdAndPeerByShortId(parseInt(nodeId)) || MessageUnique.getPeerByMsgId(nodeId);
      if (!nodeMsg) {
        logError('转发消息失败，未找到消息', nodeId);
        continue;
      }
      nodeMsgIds.push(nodeMsg.MsgId);
    } else {
      // 自定义的消息
      try {
        let OB11Data = normalize(messageNode.data.content);
        //筛选node消息
        let isNodeMsg = OB11Data.filter(e => e.type === OB11MessageDataType.node).length;//找到子转发消息
        if (isNodeMsg !== 0) {
          if (isNodeMsg !== OB11Data.length) { logError('子消息中包含非node消息 跳过不合法部分'); continue; }
          const nodeMsg = await handleForwardNode(destPeer, OB11Data.filter(e => e.type === OB11MessageDataType.node), inputPeer);
          if (nodeMsg) nodeMsgIds.push(nodeMsg.msgId);
          //完成子卡片生成跳过后续
          continue;
        }
        const { sendElements } = await createSendElements(OB11Data, inputPeer);
        //拆分消息
        let MixElement = sendElements.filter(element => element.elementType !== ElementType.FILE && element.elementType !== ElementType.VIDEO);
        let SingleElement = sendElements.filter(element => element.elementType === ElementType.FILE || element.elementType === ElementType.VIDEO).map(e => [e]);
        let AllElement: SendMessageElement[][] = [MixElement, ...SingleElement];
        const MsgNodeList: Promise<RawMessage | undefined>[] = [];
        for (const sendElementsSplitElement of AllElement) {
          MsgNodeList.push(sendMsg(selfPeer, sendElementsSplitElement, [], true).catch(e => new Promise((resolve, reject) => { resolve(undefined) })));
          await sleep(10);
        }
        (await Promise.allSettled(MsgNodeList)).map((result) => {
          if (result.status === 'fulfilled' && result.value) {
            nodeMsgIds.push(result.value.msgId);
          }
        });
      } catch (e) {
        logDebug('生成转发消息节点失败', e);
      }
    }
  }
  const nodeMsgArray: Array<RawMessage> = [];

  let srcPeer: Peer | undefined = undefined;
  let needSendSelf = false;
  //检测是否处于同一个Peer 不在同一个peer则全部消息由自身发送
  for (let msgId of nodeMsgIds) {
    const nodeMsgPeer = MessageUnique.getPeerByMsgId(msgId);
    const nodeMsg = (await NTQQMsgApi.getMsgsByMsgId(nodeMsgPeer?.Peer!, [msgId])).msgList[0];
    srcPeer = srcPeer ?? { chatType: nodeMsg.chatType, peerUid: nodeMsg.peerUid };
    if (srcPeer.peerUid !== nodeMsg.peerUid) {
      needSendSelf = true;
    }
    nodeMsgArray.push(nodeMsg);
  }
  nodeMsgIds = nodeMsgArray.map(msg => msg.msgId);
  if (needSendSelf) {
    for (const [index, msg] of nodeMsgArray.entries()) {
      if (msg.peerUid === selfInfo.uid) continue;
      const clonedMsg = await cloneMsg(msg);
      nodeMsgIds[index] = clonedMsg?.msgId || "";
    }
  }
  if (nodeMsgIds.length === 0) throw Error('转发消息失败，生成节点为空');
  try {
    logDebug('开发转发', srcPeer, destPeer, nodeMsgIds);
    return await NTQQMsgApi.multiForwardMsg(srcPeer!, destPeer, nodeMsgIds);
  } catch (e) {
    logError('forward failed', e);
    return null;
  }
}
