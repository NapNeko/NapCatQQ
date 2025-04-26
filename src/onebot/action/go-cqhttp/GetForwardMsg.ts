import { OneBotAction } from '@/onebot/action/OneBotAction';
import { OB11Message, OB11MessageData, OB11MessageDataType, OB11MessageForward, OB11MessageNodePlain as OB11MessageNode } from '@/onebot';
import { ActionName } from '@/onebot/action/router';
import { MessageUnique } from '@/common/message-unique';
import { Static, Type } from '@sinclair/typebox';
import { ChatType, ElementType, MsgSourceType, NTMsgType, RawMessage } from '@/core';
import { isNumeric } from '@/common/helper';

const SchemaData = Type.Object({
    message_id: Type.Optional(Type.String()),
    id: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;
export class GoCQHTTPGetForwardMsgAction extends OneBotAction<Payload, {
    messages: OB11Message[] | undefined;
}> {
    override actionName = ActionName.GoCQHTTP_GetForwardMsg;
    override payloadSchema = SchemaData;

    private createTemplateNode(message: OB11Message): OB11MessageNode {
        return {
            type: OB11MessageDataType.node,
            data: {
                user_id: message.user_id,
                nickname: message.sender.nickname,
                message: [],
                content: []
            }
        };
    }

    async parseForward(messages: OB11Message[]): Promise<OB11MessageNode[]> {
        const retMsg: OB11MessageNode[] = [];

        for (const message of messages) {
            const templateNode = this.createTemplateNode(message);

            for (const msgdata of message.message) {
                if ((msgdata as OB11MessageData).type === OB11MessageDataType.forward) {
                    const newNode = this.createTemplateNode(message);
                    newNode.data.message = await this.parseForward((msgdata as OB11MessageForward).data.content ?? []);

                    templateNode.data.message.push(newNode);
                } else {
                    templateNode.data.message.push(msgdata as OB11MessageData);
                }
            }
            retMsg.push(templateNode);
        }

        return retMsg;
    }

    async _handle(payload: Payload) {
        // 1. 检查消息ID是否存在
        const msgId = payload.message_id || payload.id;
        if (!msgId) {
            throw new Error('message_id is required');
        }

        // 2. 定义辅助函数 - 创建伪转发消息对象
        const createFakeForwardMsg = (resId: string): RawMessage => {
            return {
                chatType: ChatType.KCHATTYPEGROUP,
                elements: [{
                    elementType: ElementType.MULTIFORWARD,
                    elementId: '',
                    multiForwardMsgElement: {
                        resId: resId,
                        fileName: '',
                        xmlContent: '',
                    }
                }],
                guildId: '',
                isOnlineMsg: false,
                msgId: '',  // TODO: no necessary
                msgRandom: '0',
                msgSeq: '',
                msgTime: '',
                msgType: NTMsgType.KMSGTYPEMIX,
                parentMsgIdList: [],
                parentMsgPeer: {
                    chatType: ChatType.KCHATTYPEGROUP,
                    peerUid: '',
                },
                peerName: '',
                peerUid: '284840486',
                peerUin: '284840486',
                recallTime: '0',
                records: [],
                sendNickName: '',
                sendRemarkName: '',
                senderUid: '',
                senderUin: '1094950020',
                sourceType: MsgSourceType.K_DOWN_SOURCETYPE_UNKNOWN,
                subMsgType: 1,
            } as RawMessage;
        };

        // 3. 定义协议回退逻辑函数
        const protocolFallbackLogic = async (resId: string) => {
            const ob = (await this.obContext.apis.MsgApi.parseMessageV2(createFakeForwardMsg(resId)))?.arrayMsg;
            if (ob) {
                return {
                    messages: (ob?.message?.[0] as OB11MessageForward)?.data?.content
                };
            }
            throw new Error('protocolFallbackLogic: 找不到相关的聊天记录');
        };
        // 4. 尝试通过正常渠道获取消息
        // 如果是数字ID，优先使用getMsgsByMsgId获取
        if (!isNumeric(msgId)) {
            let ret = await protocolFallbackLogic(msgId);
            if (ret.messages) {
                return ret;
            }
            throw new Error('ResId无效: 找不到相关的聊天记录');
        }
        const rootMsgId = MessageUnique.getShortIdByMsgId(msgId.toString());
        const rootMsg = MessageUnique.getMsgIdAndPeerByShortId(rootMsgId ?? +msgId);

        if (rootMsg) {
            // 5. 获取消息内容
            const data = await this.core.apis.MsgApi.getMsgsByMsgId(rootMsg.Peer, [rootMsg.MsgId]);

            if (data && data.result === 0 && data.msgList.length > 0) {
                const singleMsg = data.msgList[0];
                if (!singleMsg) {
                    throw new Error('消息不存在或已过期');
                }
                // 6. 解析消息内容
                const resMsg = (await this.obContext.apis.MsgApi.parseMessageV2(singleMsg))?.arrayMsg;

                const forwardContent = (resMsg?.message?.[0] as OB11MessageForward)?.data?.content;
                if (forwardContent) {
                    return { messages: forwardContent };
                }
            }
        }
        // 说明消息已过期或者为内层消息 NapCat 一次返回不处理内层消息
        throw new Error('消息已过期或者为内层消息，无法获取转发消息');
    }
}
