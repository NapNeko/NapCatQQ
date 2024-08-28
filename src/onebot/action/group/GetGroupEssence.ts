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
    async parseEssenceMsgImage(ele: any) {
        return {
            type: 'image',
            data: {
                url: ele?.image_url,
            }
        };
    }
    async parseEssenceMsgText(ele: any) {
        return {
            type: 'text',
            data: {
                text: ele?.text
            }
        };
    }
    async parseEssenceMsg(msgs: any) {
        let handledMsg: any[] = [];
        for (let msg of msgs) {
            switch (msg.msg_type) {
                case 2:
                    handledMsg.push(await this.parseEssenceMsgText(msg));
                    break;
                case 3:
                    handledMsg.push(await this.parseEssenceMsgImage(msg));
                    break;
            }
        }
        return handledMsg;
    }
    async msgSeqToMsgId(peer: Peer, msgSeq: string, msgRandom: string) {
        const NTQQMsgApi = this.core.apis.MsgApi;
        const replyMsgList = (await NTQQMsgApi.getMsgsBySeqAndCount(peer, msgSeq, 1, true, true)).msgList.find((msg) => msg.msgSeq === msgSeq && msg.msgRandom === msgRandom);
        if (!replyMsgList) {
            return undefined;
        }
        return {
            id: MessageUnique.createUniqueMsgId(peer, replyMsgList.msgId),
            msg: replyMsgList
        }
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
            let msgOriginData = await this.msgSeqToMsgId(peer, msg.msg_seq.toString(), msg.msg_random.toString());
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
                    content: await this.obContext.apis.MsgApi.parseMessage(rawMessage, 'array')
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
                content: await this.parseEssenceMsg(msg.msg_content)
            };
        }));
        return Ob11Ret;
    }
}
