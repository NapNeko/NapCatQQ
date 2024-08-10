import BaseAction from '../BaseAction';
import { OB11Message } from '../../types';
import { ActionName } from '../types';
import { ChatType, Peer, RawMessage } from '@/core/entities';
import { OB11Constructor } from '../../helper/data';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/utils/MessageUnique';

interface Response {
    messages: OB11Message[];
}

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        message_seq: { type: 'number' },
        count: { type: 'number' },
        reverseOrder: { type: 'boolean' },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class GoCQHTTPGetGroupMsgHistory extends BaseAction<Payload, Response> {
    actionName = ActionName.GoCQHTTP_GetGroupMsgHistory;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<Response> {
        const NTQQMsgApi = this.CoreContext.getApiContext().MsgApi;
        //处理参数
        const isReverseOrder = payload.reverseOrder || true;
        const MsgCount = payload.count || 20;
        const peer: Peer = { chatType: ChatType.group, peerUid: payload.group_id.toString() };
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
