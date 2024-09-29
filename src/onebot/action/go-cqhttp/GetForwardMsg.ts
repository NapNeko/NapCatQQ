import BaseAction from '../BaseAction';
import { OB11ForwardMessage, OB11Message, OB11MessageData, OB11MessageDataType, OB11MessageNode } from '@/onebot';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/message-unique';

const SchemaData = {
    type: 'object',
    properties: {
        message_id: { type: 'string' },
        id: { type: 'string' },
    },
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GoCQHTTPGetForwardMsgAction extends BaseAction<Payload, any> {
    actionName = ActionName.GoCQHTTP_GetForwardMsg;
    payloadSchema = SchemaData;
    async parseForward(msg: OB11Message[]) {
        let retMsg: Array<OB11MessageNode & {
            data: { message: Array<OB11MessageData> }
        }> = [];

        for (let message of msg) {
            let templateNode: OB11MessageNode & {
                data: { message: Array<OB11MessageData> }
            } = {
                type: OB11MessageDataType.node,
                data: {
                    user_id: 10001,
                    nickname: "QQ用户",
                    message: [],
                    content: []
                }
            };

            templateNode.data.nickname = message.sender.nickname;
            templateNode.data.user_id = message.user_id;

            for (let msgdata of message.message) {
                if (typeof msgdata !== 'string' && msgdata.type === OB11MessageDataType.forward) {
                    templateNode.data.message.push(...(await this.parseForward(msgdata.data.content)));
                }
                if (typeof msgdata !== 'string') {
                    templateNode.data.message.push(msgdata);
                }
            }
            retMsg.push(templateNode);
        }
        return retMsg;

    }
    async _handle(payload: Payload): Promise<any> {
        const msgId = payload.message_id || payload.id;
        if (!msgId) {
            throw Error('message_id is required');
        }
        const rootMsgId = MessageUnique.getShortIdByMsgId(msgId);
        const rootMsg = MessageUnique.getMsgIdAndPeerByShortId(rootMsgId || parseInt(msgId));
        if (!rootMsg) {
            throw Error('msg not found');
        }
        const data = await this.core.apis.MsgApi.getMultiMsg(rootMsg.Peer, rootMsg.MsgId, rootMsg.MsgId);
        if (!data || data.result !== 0) {
            throw Error('找不到相关的聊天记录' + data?.errMsg);
        }
        const msgList = data.msgList;
        const messages = (await Promise.all(msgList.map(async msg => {
            const resMsg = await this.obContext.apis.MsgApi
                .parseMessage(msg);
            if (!resMsg) return;
            resMsg.message_id = MessageUnique.createUniqueMsgId({
                guildId: '',
                chatType: msg.chatType,
                peerUid: msg.peerUid,
            }, msg.msgId)!;
            return resMsg;
        }))).filter(msg => !!msg);
        messages.map(msg => {
            (<OB11ForwardMessage>msg).content = msg.message;
            delete (<any>msg).message;
        });
        //遍历合并的所有消息
        if (this.obContext.configLoader.configData.messagePostFormat == 'array') {
            return await this.parseForward(messages);
        }

        return { messages };
    }
}
