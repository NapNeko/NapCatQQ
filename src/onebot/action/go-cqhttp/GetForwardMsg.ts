import { OneBotAction } from '@/onebot/action/OneBotAction';
import { OB11Message, OB11MessageData, OB11MessageDataType, OB11MessageForward, OB11MessageNodePlain as OB11MessageNode } from '@/onebot';
import { ActionName } from '@/onebot/action/router';
import { MessageUnique } from '@/common/message-unique';
import { Static, Type } from '@sinclair/typebox';
import { ChatType, ElementType, MsgSourceType, NTMsgType, RawMessage } from '@/core';

const SchemaData = Type.Object({
    message_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
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
        const msgId = payload.message_id || payload.id;
        if (!msgId) {
            throw new Error('message_id is required');
        }

        const fakeForwardMsg = (res_id: string) => {
            return {
                chatType: ChatType.KCHATTYPEGROUP,
                elements: [{
                    elementType: ElementType.MULTIFORWARD,
                    elementId: '',
                    multiForwardMsgElement: {
                        resId: res_id,
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

        const protocolFallbackLogic = async (res_id: string) => {
            const ob = (await this.obContext.apis.MsgApi.parseMessageV2(fakeForwardMsg(res_id)))?.arrayMsg;
            if (ob) {
                return {
                    messages: (ob?.message?.[0] as OB11MessageForward)?.data?.content
                };
            }
            throw new Error('protocolFallbackLogic: 找不到相关的聊天记录');
        };

        const rootMsgId = MessageUnique.getShortIdByMsgId(msgId.toString());
        const rootMsg = MessageUnique.getMsgIdAndPeerByShortId(rootMsgId ?? +msgId);
        if (!rootMsg) {
            return await protocolFallbackLogic(msgId.toString());
        }
        const data = await this.core.apis.MsgApi.getMsgsByMsgId(rootMsg.Peer, [rootMsg.MsgId]);

        if (!data || data.result !== 0) {
            return await protocolFallbackLogic(msgId.toString());
        }

        const singleMsg = data.msgList[0];
        if (!singleMsg) {
            return await protocolFallbackLogic(msgId.toString());
        }
        const resMsg = (await this.obContext.apis.MsgApi.parseMessageV2(singleMsg))?.arrayMsg;//强制array 以便处理
        if (!(resMsg?.message?.[0] as OB11MessageForward)?.data?.content) {
            return await protocolFallbackLogic(msgId.toString());
        }
        return {
            messages: (resMsg?.message?.[0] as OB11MessageForward)?.data?.content
        };
        //}

        // return { message: resMsg };
    }
}
