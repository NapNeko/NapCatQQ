import { ChatType, Peer } from '@/core';
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

    private async msgSeqToMsgId(peer: Peer, msgSeq: string, msgRandom: string) {
        const replyMsgList = (await this.core.apis.MsgApi.getMsgsBySeqAndCount(peer, msgSeq, 1, true, true)).msgList.find((msg) => msg.msgSeq === msgSeq && msg.msgRandom === msgRandom);
        if (!replyMsgList) {
            return undefined;
        }
        return {
            id: MessageUnique.createUniqueMsgId(peer, replyMsgList.msgId),
            msg: replyMsgList
        };
    }

    async _handle(payload: Payload) {
        const NTQQWebApi = this.core.apis.WebApi;
        const NTQQGroupApi = this.core.apis.GroupApi;
        const msglist = (await NTQQWebApi.getGroupEssenceMsgAll(payload.group_id.toString())).flatMap((e) => e.data.msg_list);
        if (!msglist) {
            throw new Error('获取失败');
        }
        return await Promise.all(msglist.map(async (msg) => {
            const msgOriginData = await this.msgSeqToMsgId({
                chatType: ChatType.KCHATTYPEGROUP,
                peerUid: payload.group_id.toString(),
            }, msg.msg_seq.toString(), msg.msg_random.toString());
            if (msgOriginData) {
                const { id: message_id, msg: rawMessage } = msgOriginData;
                return {
                    msg_seq: msg.msg_seq,
                    msg_random: msg.msg_random,
                    sender_id: +msg.sender_uin,
                    sender_nick: msg.sender_nick,
                    operator_id: +msg.add_digest_uin,
                    operator_nick: msg.add_digest_nick,
                    message_id: message_id,
                    operator_time: msg.add_digest_time,
                    content: (await this.obContext.apis.MsgApi.parseMessage(rawMessage, 'array'))?.message
                };
            }
            const msgTempData = JSON.stringify({
                msg_seq: msg.msg_seq.toString(),
                msg_random: msg.msg_random.toString(),
                group_id: payload.group_id.toString(),
            });
            const hash = crypto.createHash('md5').update(msgTempData).digest();
            //设置第一个bit为0 保证shortId为正数
            hash[0] &= 0x7f;
            const shortId = hash.readInt32BE(0);
            NTQQGroupApi.essenceLRU.set(shortId, msgTempData);
            return {
                msg_seq: msg.msg_seq,
                msg_random: msg.msg_random,
                sender_id: +msg.sender_uin,
                sender_nick: msg.sender_nick,
                operator_id: +msg.add_digest_uin,
                operator_nick: msg.add_digest_nick,
                message_id: shortId,
                operator_time: msg.add_digest_time,
                content: msg.msg_content.map((msg) => {
                    if (msg.msg_type === 1) {
                        return {
                            type: 'text',
                            data: {
                                text: msg?.text
                            }
                        };
                    } else if (msg.msg_type === 3) {
                        return {
                            type: 'image',
                            data: {
                                url: msg?.image_url,
                            }
                        };
                    }
                    return undefined;
                }).filter(e => e !== undefined),
            };
        }));
    }
}
