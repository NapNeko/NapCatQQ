import { ChatType, GroupEssenceMsgRet, Peer } from '@/core';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/message-unique';
import crypto from 'crypto';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] }
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupEssence extends BaseAction<Payload, any> {
    actionName = ActionName.GoCQHTTP_GetEssenceMsg;
    payloadSchema = SchemaData;
    async msgSeqToMsgId(peer: Peer, msgSeq: string, msgRandom: string) {
        const NTQQMsgApi = this.core.apis.MsgApi;
        const replyMsgList = (await NTQQMsgApi.getMsgsBySeqAndCount(peer, msgSeq, 1, true, true)).msgList.find((msg) => msg.msgSeq === msgSeq && msg.msgRandom === msgRandom);
        if (!replyMsgList) {
            return 0;
        }
        return MessageUnique.createUniqueMsgId(peer, replyMsgList.msgId);
    }
    async _handle(payload: Payload) {
        const NTQQWebApi = this.core.apis.WebApi;
        const NTQQGroupApi = this.core.apis.GroupApi;
        //await NTQQGroupApi.fetchGroupEssenceList(payload.group_id.toString());
        let peer = {
            chatType: ChatType.KCHATTYPEGROUP,
            peerUid: payload.group_id.toString(),
        };

        const ret = await NTQQWebApi.getGroupEssenceMsg(payload.group_id.toString());
        if (!ret) {
            throw new Error('获取失败');
        }
        const Ob11Ret = await Promise.all(ret.data.msg_list.map(async (msg) => {
            let message_id = await this.msgSeqToMsgId(peer, msg.msg_seq.toString(), msg.msg_random.toString());
            if (message_id === 0) {
                const data = JSON.stringify({
                    msg_seq: msg.msg_seq.toString(),
                    msg_random: msg.msg_random.toString(),
                    group_id: payload.group_id.toString(),
                });
                const hash = crypto.createHash('md5').update(data).digest();
                //设置第一个bit为0 保证shortId为正数
                hash[0] &= 0x7f;
                const shortId = hash.readInt32BE(0);
                NTQQGroupApi.essenceLRU.set(shortId, data);
                message_id = shortId;
            }
            return {
                msg_seq: msg.msg_seq,
                msg_random: msg.msg_random,
                sender_id: +msg.sender_uin,
                sender_nick: msg.sender_nick,
                operator_id: +msg.add_digest_uin,
                operator_nick: msg.add_digest_nick,
                message_id: message_id,
                operator_time: msg.add_digest_time,
            };
        }));
        return Ob11Ret;
    }
}
