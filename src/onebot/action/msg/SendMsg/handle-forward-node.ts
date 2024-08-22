import { ChatType, ElementType, NapCatCore, Peer, RawMessage, SendMessageElement } from '@/core';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { OB11MessageDataType, OB11MessageNode } from '@/onebot/types';
import createSendElements from './create-send-elements';
import { normalize, sendMsg } from '../SendMsg/index';
import { NapCatOneBot11Adapter } from '@/onebot';

async function cloneMsg(coreContext: NapCatCore, msg: RawMessage): Promise<RawMessage | undefined> {
    const selfPeer = {
        chatType: ChatType.KCHATTYPEC2C,
        peerUid: coreContext.selfInfo.uid,
    };
    const logger = coreContext.context.logger;
    const NTQQMsgApi = coreContext.apis.MsgApi;
    //logDebug('克隆的目标消息', msg);

    const sendElements: SendMessageElement[] = [];

    for (const element of msg.elements) {
        sendElements.push(element as SendMessageElement);
    }

    if (sendElements.length === 0) {
        logger.logDebug('需要clone的消息无法解析，将会忽略掉', msg);
    }
    try {
        const nodeMsg = await NTQQMsgApi.sendMsg(selfPeer, sendElements, true);
        return nodeMsg;
    } catch (e) {
        logger.logError(e, '克隆转发消息失败,将忽略本条消息', msg);
    }
}

export async function handleForwardNode(coreContext: NapCatCore, obContext: NapCatOneBot11Adapter, destPeer: Peer, messageNodes: OB11MessageNode[]): Promise<RawMessage | null> {
    const NTQQMsgApi = coreContext.apis.MsgApi;
    const selfPeer = {
        chatType: ChatType.KCHATTYPEC2C,
        peerUid: coreContext.selfInfo.uid,
    };
    let nodeMsgIds: string[] = [];
    const logger = coreContext.context.logger;
    for (const messageNode of messageNodes) {
        const nodeId = messageNode.data.id;
        if (nodeId) {
            //对Mgsid和OB11ID混用情况兜底
            const nodeMsg = MessageUnique.getMsgIdAndPeerByShortId(parseInt(nodeId)) || MessageUnique.getPeerByMsgId(nodeId);
            if (!nodeMsg) {
                logger.logError('转发消息失败，未找到消息', nodeId);
                continue;
            }
            nodeMsgIds.push(nodeMsg.MsgId);
        } else {
            // 自定义的消息
            try {
                const OB11Data = normalize(messageNode.data.content);
                //筛选node消息
                const isNodeMsg = OB11Data.filter(e => e.type === OB11MessageDataType.node).length;//找到子转发消息
                if (isNodeMsg !== 0) {
                    if (isNodeMsg !== OB11Data.length) {
                        logger.logError('子消息中包含非node消息 跳过不合法部分');
                        continue;
                    }
                    const nodeMsg = await handleForwardNode(coreContext, obContext, selfPeer, OB11Data.filter(e => e.type === OB11MessageDataType.node));
                    if (nodeMsg) {
                        nodeMsgIds.push(nodeMsg.msgId);
                        MessageUnique.createMsg(selfPeer, nodeMsg.msgId);
                    }
                    //完成子卡片生成跳过后续
                    continue;
                }
                const { sendElements } = await createSendElements(coreContext, obContext, OB11Data, destPeer);
                //拆分消息
                const MixElement = sendElements.filter(element => element.elementType !== ElementType.FILE && element.elementType !== ElementType.VIDEO);
                const SingleElement = sendElements.filter(element => element.elementType === ElementType.FILE || element.elementType === ElementType.VIDEO).map(e => [e]);
                const AllElement: SendMessageElement[][] = [MixElement, ...SingleElement].filter(e => e !== undefined && e.length !== 0);
                const MsgNodeList: Promise<RawMessage | undefined>[] = [];
                for (const sendElementsSplitElement of AllElement) {
                    MsgNodeList.push(sendMsg(coreContext, selfPeer, sendElementsSplitElement, [], true).catch(e => new Promise((resolve, reject) => {
                        resolve(undefined);
                    })));
                }
                (await Promise.allSettled(MsgNodeList)).map((result) => {
                    if (result.status === 'fulfilled' && result.value) {
                        nodeMsgIds.push(result.value.msgId);
                        MessageUnique.createMsg(selfPeer, result.value.msgId);
                    }
                });
            } catch (e) {
                logger.logDebug('生成转发消息节点失败', e);
            }
        }
    }
    const nodeMsgArray: Array<RawMessage> = [];
    let srcPeer: Peer | undefined = undefined;
    let needSendSelf = false;
    //检测是否处于同一个Peer 不在同一个peer则全部消息由自身发送
    for (const msgId of nodeMsgIds) {
        const nodeMsgPeer = MessageUnique.getPeerByMsgId(msgId);
        if (!nodeMsgPeer) {
            logger.logError('转发消息失败，未找到消息', msgId);
            continue;
        }
        const nodeMsg = (await NTQQMsgApi.getMsgsByMsgId(nodeMsgPeer.Peer, [msgId])).msgList[0];
        srcPeer = srcPeer ?? { chatType: nodeMsg.chatType, peerUid: nodeMsg.peerUid };
        if (srcPeer.peerUid !== nodeMsg.peerUid) {
            needSendSelf = true;
        }
        nodeMsgArray.push(nodeMsg);
    }
    nodeMsgIds = nodeMsgArray.map(msg => msg.msgId);
    let retMsgIds: string[] = [];
    if (needSendSelf) {
        for (const [index, msg] of nodeMsgArray.entries()) {
            if (msg.peerUid === coreContext.selfInfo.uid) continue;
            const ClonedMsg = await cloneMsg(coreContext, msg);
            if (ClonedMsg) retMsgIds.push(ClonedMsg.msgId);
        }
    } else {
        retMsgIds = nodeMsgIds;
    }
    if (nodeMsgIds.length === 0) throw Error('转发消息失败，生成节点为空');
    try {
        logger.logDebug('开发转发', srcPeer, destPeer, nodeMsgIds);
        return await NTQQMsgApi.multiForwardMsg(srcPeer!, destPeer, nodeMsgIds);
    } catch (e) {
        logger.logError('forward failed', e);
        return null;
    }
}
