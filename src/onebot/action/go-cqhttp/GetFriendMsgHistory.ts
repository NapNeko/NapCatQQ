import { OneBotAction } from '@/onebot/action/OneBotAction';
import { OB11Message } from '@/onebot';
import { ActionName } from '@/onebot/action/router';
import { ChatType } from '@/core/types';
import { MessageUnique } from '@/common/message-unique';

import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/onebot/config/config';

interface Response {
    messages: OB11Message[];
}
const SchemaData = Type.Object({
    user_id: Type.String(),
    message_seq: Type.Optional(Type.String()),
    count: Type.Number({ default: 20 }),
    reverseOrder: Type.Boolean({ default: false }),
    disable_get_url: Type.Boolean({ default: false }),
    parse_mult_msg: Type.Boolean({ default: true }),
    quick_reply: Type.Boolean({ default: false }),
});


type Payload = Static<typeof SchemaData>;

export default class GetFriendMsgHistory extends OneBotAction<Payload, Response> {
    override actionName = ActionName.GetFriendMsgHistory;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload, _adapter: string, config: NetworkAdapterConfig): Promise<Response> {
        //处理参数
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error(`记录${payload.user_id}不存在`);
        const friend = await this.core.apis.FriendApi.isBuddy(uid);
        const peer = { chatType: friend ? ChatType.KCHATTYPEC2C : ChatType.KCHATTYPETEMPC2CFROMGROUP, peerUid: uid };
        const hasMessageSeq = !payload.message_seq ? !!payload.message_seq : !(payload.message_seq?.toString() === '' || payload.message_seq?.toString() === '0');
        const startMsgId = hasMessageSeq ? (MessageUnique.getMsgIdAndPeerByShortId(+payload.message_seq!)?.MsgId ?? payload.message_seq!.toString()) : '0';
        const msgList = hasMessageSeq ?
            (await this.core.apis.MsgApi.getMsgHistory(peer, startMsgId, +payload.count, payload.reverseOrder)).msgList : (await this.core.apis.MsgApi.getAioFirstViewLatestMsgs(peer, +payload.count)).msgList;
        if (msgList.length === 0) throw new Error(`消息${payload.message_seq}不存在`);
        //转换序号
        await Promise.all(msgList.map(async msg => {
            msg.id = MessageUnique.createUniqueMsgId({ guildId: '', chatType: msg.chatType, peerUid: msg.peerUid }, msg.msgId);
        }));
        //烘焙消息
        const ob11MsgList = (await Promise.all(
            msgList.map(msg => this.obContext.apis.MsgApi.parseMessage(msg, config.messagePostFormat, payload.parse_mult_msg, payload.disable_get_url)))
        ).filter(msg => msg !== undefined);
        return { 'messages': ob11MsgList };
    }
}
