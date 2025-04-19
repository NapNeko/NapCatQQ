import { OneBotAction } from '@/onebot/action/OneBotAction';
import { OB11Message } from '@/onebot';
import { ActionName } from '@/onebot/action/router';
import { ChatType, Peer } from '@/core/types';
import { MessageUnique } from '@/common/message-unique';
import { z } from 'zod';
import { NetworkAdapterConfig } from '@/onebot/config/config';

interface Response {
    messages: OB11Message[];
}

const SchemaData = z.object({
    group_id: z.union([z.number(), z.string()]),
    message_seq: z.union([z.number(), z.string()]).optional(),
    count: z.union([z.number(), z.string()]).default(20),
    reverseOrder: z.union([z.boolean(), z.string()]).optional()
});


type Payload = z.infer<typeof SchemaData>;


export default class GoCQHTTPGetGroupMsgHistory extends OneBotAction<Payload, Response> {
    override actionName = ActionName.GoCQHTTP_GetGroupMsgHistory;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload, _adapter: string, config: NetworkAdapterConfig): Promise<Response> {
        //处理参数
        const isReverseOrder = typeof payload.reverseOrder === 'string' ? payload.reverseOrder === 'true' : !!payload.reverseOrder;
        const peer: Peer = { chatType: ChatType.KCHATTYPEGROUP, peerUid: payload.group_id.toString() };
        const hasMessageSeq = !payload.message_seq ? !!payload.message_seq : !(payload.message_seq?.toString() === '' || payload.message_seq?.toString() === '0');
        //拉取消息
        const startMsgId = hasMessageSeq ? (MessageUnique.getMsgIdAndPeerByShortId(+payload.message_seq!)?.MsgId ?? payload.message_seq!.toString()) : '0';
        const msgList = hasMessageSeq ?
            (await this.core.apis.MsgApi.getMsgHistory(peer, startMsgId, +payload.count, isReverseOrder)).msgList : (await this.core.apis.MsgApi.getAioFirstViewLatestMsgs(peer, +payload.count)).msgList;
        if (msgList.length === 0) throw new Error(`消息${payload.message_seq}不存在`);
        //翻转消息
        if (isReverseOrder) msgList.reverse();
        //转换序号
        await Promise.all(msgList.map(async msg => {
            msg.id = MessageUnique.createUniqueMsgId({ guildId: '', chatType: msg.chatType, peerUid: msg.peerUid }, msg.msgId);
        }));
        //烘焙消息
        const ob11MsgList = (await Promise.all(
            msgList.map(msg => this.obContext.apis.MsgApi.parseMessage(msg, config.messagePostFormat)))
        ).filter(msg => msg !== undefined);
        return { 'messages': ob11MsgList };
    }
}
