import BaseAction from '../BaseAction';
import { OB11Message } from '../../types';
import { ActionName } from '../types';
import { ChatType, RawMessage } from '@/core/entities';
import { OB11Constructor } from '../../helper/data';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/utils/MessageUnique';

interface Response {
    messages: OB11Message[];
}

const SchemaData = {
    type: 'object',
    properties: {
        user_id: { type: ['number', 'string'] },
        message_seq: { type: 'number' },
        count: { type: 'number' },
        reverseOrder: { type: 'boolean' },
    },
    required: ['user_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class GetFriendMsgHistory extends BaseAction<Payload, Response> {
    actionName = ActionName.GetFriendMsgHistory;
    PayloadSchema = SchemaData;

    protected async _handle(payload: Payload): Promise<Response> {
        const NTQQUserApi = this.CoreContext.getApiContext().UserApi;
        const NTQQMsgApi = this.CoreContext.getApiContext().MsgApi;
        const NTQQFriendApi = this.CoreContext.getApiContext().FriendApi;
        //处理参数
        const uid = await NTQQUserApi.getUidByUin(payload.user_id.toString());
        const MsgCount = payload.count || 20;
        const isReverseOrder = payload.reverseOrder || true;
        if (!uid) throw `记录${payload.user_id}不存在`;
        const friend = await NTQQFriendApi.isBuddy(uid);
        const peer = { chatType: friend ? ChatType.friend : ChatType.temp, peerUid: uid };

        //拉取消息
        let msgList: RawMessage[];
        if (!payload.message_seq || payload.message_seq == 0) {
            msgList = (await NTQQMsgApi.getLastestMsgByUids(peer, MsgCount)).msgList;
        } else {
            const startMsgId = MessageUnique.getMsgIdAndPeerByShortId(payload.message_seq)?.MsgId;
            if (!startMsgId) throw `消息${payload.message_seq}不存在`;
            msgList = (await NTQQMsgApi.getMsgHistory(peer, startMsgId, MsgCount)).msgList;
        }
        if (isReverseOrder) msgList.reverse();
        await Promise.all(msgList.map(async msg => {
            msg.id = MessageUnique.createMsg({ guildId: '', chatType: msg.chatType, peerUid: msg.peerUid }, msg.msgId);
        }));
        //转换消息
        const ob11MsgList = await Promise.all(msgList.map(msg => OB11Constructor.message(this.CoreContext, msg, 'array')));
        return { 'messages': ob11MsgList };
    }
}
