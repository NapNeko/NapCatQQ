import { OneBotAction } from '@/onebot/action/OneBotAction';
import { OB11Message, OB11MessageData, OB11MessageDataType, OB11MessageForward, OB11MessageNodePlain as OB11MessageNode } from '@/onebot';
import { ActionName } from '@/onebot/action/router';
import { MessageUnique } from '@/common/message-unique';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    message_id: Type.Union([Type.Number(), Type.String()]),
    id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

export class GoCQHTTPGetForwardMsgAction extends OneBotAction<Payload, any> {
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

    async _handle(payload: Payload): Promise<any> {
        const msgId = payload.message_id || payload.id;
        if (!msgId) {
            throw new Error('message_id is required');
        }

        const rootMsgId = MessageUnique.getShortIdByMsgId(msgId.toString());
        const rootMsg = MessageUnique.getMsgIdAndPeerByShortId(rootMsgId ?? +msgId);
        if (!rootMsg) {
            throw new Error('msg not found');
        }
        const data = await this.core.apis.MsgApi.getMsgsByMsgId(rootMsg.Peer, [rootMsg.MsgId]);

        if (!data || data.result !== 0) {
            throw new Error('找不到相关的聊天记录' + data?.errMsg);
        }

        const singleMsg = data.msgList[0];
        const resMsg = (await this.obContext.apis.MsgApi.parseMessageV2(singleMsg))?.arrayMsg;//强制array 以便处理
        if (!(resMsg?.message?.[0] as OB11MessageForward)?.data?.content) {
            throw new Error('找不到相关的聊天记录');
        }
        return {
            messages: (resMsg?.message?.[0] as OB11MessageForward)?.data?.content
        };
        //}

        // return { message: resMsg };
    }
}
