import BaseAction from '../BaseAction';
import { OB11Message } from '@/onebot';
import { ActionName } from '../types';
import { ChatType, Peer, RawMessage } from '@/core/entities';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/message-unique';

interface Response {
    messages: OB11Message[];
}

const SchemaData = {
    type: 'object',
    properties: {
        user_id: { type: ['number', 'string'] },
        message_seq: { type: ['number', 'string'] },
        count: { type: ['number', 'string'] },
        reverseOrder: { type: ['boolean', 'string'] },
    },
    required: ['user_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class GetFriendMsgHistory extends BaseAction<Payload, Response> {
    actionName = ActionName.GetFriendMsgHistory;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<Response> {
        const NTQQUserApi = this.core.apis.UserApi;
        const NTQQMsgApi = this.core.apis.MsgApi;
        const NTQQFriendApi = this.core.apis.FriendApi;
        //处理参数
        const uid = await NTQQUserApi.getUidByUinV2(payload.user_id.toString());
        const MsgCount = +(payload.count ?? 20);
        const isReverseOrder = typeof payload.reverseOrder === 'string' ? payload.reverseOrder === 'true' : !!payload.reverseOrder;
        if (!uid) throw `记录${payload.user_id}不存在`;
        const friend = await NTQQFriendApi.isBuddy(uid);
        const peer = { chatType: friend ? ChatType.KCHATTYPEC2C : ChatType.KCHATTYPETEMPC2CFROMGROUP, peerUid: uid };
        const hasMessageSeq = !payload.message_seq ? !!payload.message_seq : !(payload.message_seq?.toString() === '' || payload.message_seq?.toString() === '0');
        //拉取消息
        const startMsgId = hasMessageSeq ? (MessageUnique.getMsgIdAndPeerByShortId(+payload.message_seq!)?.MsgId ?? payload.message_seq!.toString()) : '0';
        let msgList = hasMessageSeq ?
            (await NTQQMsgApi.getMsgHistory(peer, startMsgId, MsgCount)).msgList : (await NTQQMsgApi.getAioFirstViewLatestMsgs(peer, MsgCount)).msgList;
        if (msgList.length === 0) throw `消息${payload.message_seq}不存在`;
        //翻转消息
        if (isReverseOrder) msgList.reverse();
        //转换序号
        await Promise.all(msgList.map(async msg => {
            msg.id = MessageUnique.createMsg({ guildId: '', chatType: msg.chatType, peerUid: msg.peerUid }, msg.msgId);
        }));
        //烘焙消息
        const ob11MsgList = (await Promise.all(
            msgList.map(msg => this.obContext.apis.MsgApi.parseMessage(msg)))
        ).filter(msg => msg !== undefined);
        return { 'messages': ob11MsgList };
    }
}
