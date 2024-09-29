import BaseAction from '../BaseAction';
import { OB11ForwardMessage, OB11Message, OB11MessageData, OB11MessageDataType, OB11MessageForward, OB11MessageNode as OriginalOB11MessageNode } from '@/onebot';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/message-unique';

type OB11MessageNode = OriginalOB11MessageNode & {
    data: {
        content?: Array<OB11MessageData>;
        message: Array<OB11MessageData>;
    };
};

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
                    newNode.data.message = await this.parseForward((msgdata as OB11MessageForward).data.content);

                    templateNode.data.message.push(newNode);
                } else {
                    templateNode.data.message.push(msgdata as OB11MessageData);
                }
            }
            retMsg.push(templateNode);
        }

        return retMsg;
    }

    async _handle(payload: Payload): Promise<any> {
        const msgId = payload.message_id || payload.id;
        if (!msgId) {
            throw new Error('message_id is required');
        }

        const rootMsgId = MessageUnique.getShortIdByMsgId(msgId);
        const rootMsg = MessageUnique.getMsgIdAndPeerByShortId(rootMsgId || parseInt(msgId));
        if (!rootMsg) {
            throw new Error('msg not found');
        }
        const data = await this.core.apis.MsgApi.getMsgsByMsgId(rootMsg.Peer, [rootMsg.MsgId]);

        if (!data || data.result !== 0) {
            throw new Error('找不到相关的聊天记录' + data?.errMsg);
        }

        const singleMsg = data.msgList[0];
        const resMsg = await this.obContext.apis.MsgApi.parseMessage(singleMsg);
        if (!resMsg) {
            throw new Error('找不到相关的聊天记录');
        }
        if (this.obContext.configLoader.configData.messagePostFormat === 'array') {
            //提取
            let realmsg = ((await this.parseForward([resMsg]))[0].data.message as OB11MessageNode[])[0].data.message;
            return { message: realmsg };
        }

        return { message: resMsg };
    }
}