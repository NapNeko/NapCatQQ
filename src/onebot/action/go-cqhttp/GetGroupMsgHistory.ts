import { OneBotAction } from '@/onebot/action/OneBotAction';
import { OB11Message } from '@/onebot';
import { ActionName } from '@/onebot/action/router';
import { ChatType, Peer } from '@/core/types';
import { MessageUnique } from '@/common/message-unique';
import { Static, Type } from '@sinclair/typebox';

interface Response {
    messages: OB11Message[];
}

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    message_seq: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    count: Type.Union([Type.Number(), Type.String()], { default: 20 }),
    reverseOrder: Type.Optional(Type.Union([Type.Boolean(), Type.String()]))
});


type Payload = Static<typeof SchemaData>;


export default class GoCQHTTPGetGroupMsgHistory extends OneBotAction<Payload, Response> {
    actionName = ActionName.GoCQHTTP_GetGroupMsgHistory;
    payloadSchema = SchemaData;

    async _handle(payload: Payload, adapter: string): Promise<Response> {
        //处理参数
        const isReverseOrder = typeof payload.reverseOrder === 'string' ? payload.reverseOrder === 'true' : !!payload.reverseOrder;
        const peer: Peer = { chatType: ChatType.KCHATTYPEGROUP, peerUid: payload.group_id.toString() };
        const hasMessageSeq = !payload.message_seq ? !!payload.message_seq : !(payload.message_seq?.toString() === '' || payload.message_seq?.toString() === '0');
        //拉取消息
        const startMsgId = hasMessageSeq ? (MessageUnique.getMsgIdAndPeerByShortId(+payload.message_seq!)?.MsgId ?? payload.message_seq!.toString()) : '0';
        const msgList = hasMessageSeq ?
            (await this.core.apis.MsgApi.getMsgHistory(peer, startMsgId, +payload.count)).msgList : (await this.core.apis.MsgApi.getAioFirstViewLatestMsgs(peer, +payload.count)).msgList;
        if (msgList.length === 0) throw new Error(`消息${payload.message_seq}不存在`);
        //翻转消息
        if (isReverseOrder) msgList.reverse();
        //转换序号
        await Promise.all(msgList.map(async msg => {
            msg.id = MessageUnique.createUniqueMsgId({ guildId: '', chatType: msg.chatType, peerUid: msg.peerUid }, msg.msgId);
        }));
        const network = Object.values(this.obContext.configLoader.configData.network);
        //烘焙消息
        const msgFormat = network.flat().find(e => e.name === adapter)?.messagePostFormat ?? 'array';
        const ob11MsgList = (await Promise.all(
            msgList.map(msg => this.obContext.apis.MsgApi.parseMessage(msg, msgFormat)))
        ).filter(msg => msg !== undefined);
        return { 'messages': ob11MsgList };
    }
}
