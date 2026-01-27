import { ChatType, Peer } from 'napcat-core';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { MessageUnique } from 'napcat-common/src/message-unique';
import crypto from 'crypto';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';
import { OB11MessageData, OB11MessageDataType } from '@/napcat-onebot/types';

import { GroupActionsExamples } from '../example/GroupActionsExamples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Array(Type.Object({
  msg_seq: Type.Number({ description: '消息序号' }),
  msg_random: Type.Number({ description: '消息随机数' }),
  sender_id: Type.Number({ description: '发送者QQ' }),
  sender_nick: Type.String({ description: '发送者昵称' }),
  operator_id: Type.Number({ description: '操作者QQ' }),
  operator_nick: Type.String({ description: '操作者昵称' }),
  message_id: Type.Number({ description: '消息ID' }),
  operator_time: Type.Number({ description: '操作时间' }),
  content: Type.Array(Type.Any(), { description: '消息内容' }),
}), { description: '精华消息列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupEssence extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GoCQHTTP_GetEssenceMsg;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取群精华消息';
  override actionDescription = '获取指定群聊中的精华消息列表';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.GetGroupEssence.payload;
  override returnExample = GroupActionsExamples.GetGroupEssence.response;

  private async msgSeqToMsgId (peer: Peer, msgSeq: string, msgRandom: string) {
    const replyMsgList = (await this.core.apis.MsgApi.getMsgsBySeqAndCount(peer, msgSeq, 1, true, true)).msgList.find((msg) => msg.msgSeq === msgSeq && msg.msgRandom === msgRandom);
    if (!replyMsgList) {
      return undefined;
    }
    return {
      id: MessageUnique.createUniqueMsgId(peer, replyMsgList.msgId),
      msg: replyMsgList,
    };
  }

  async _handle (payload: PayloadType, _adapter: string, config: NetworkAdapterConfig): Promise<ReturnType> {
    const msglist = (await this.core.apis.WebApi.getGroupEssenceMsgAll(payload.group_id.toString()))
      .flatMap((e) => e?.data?.msg_list)
      // 在群精华回空的时候会出现[null]的情况~ https://github.com/NapNeko/NapCatQQ/issues/1334
      .filter(Boolean);
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
        const parsed = await this.obContext.apis.MsgApi.parseMessage(rawMessage, config.messagePostFormat);
        let content: OB11MessageData[] = [];
        if (parsed) {
          if (Array.isArray(parsed.message)) {
            content = parsed.message;
          } else {
            content = [{ type: OB11MessageDataType.text, data: { text: parsed.message } }];
          }
        }
        return {
          msg_seq: msg.msg_seq,
          msg_random: msg.msg_random,
          sender_id: +msg.sender_uin,
          sender_nick: msg.sender_nick,
          operator_id: +msg.add_digest_uin,
          operator_nick: msg.add_digest_nick,
          message_id,
          operator_time: msg.add_digest_time,
          content,
        };
      }
      const msgTempData = JSON.stringify({
        msg_seq: msg.msg_seq.toString(),
        msg_random: msg.msg_random.toString(),
        group_id: payload.group_id.toString(),
      });
      const hash = crypto.createHash('md5').update(msgTempData).digest();
      // 设置第一个bit为0 保证shortId为正数
      if (hash[0]) {
        hash[0] &= 0x7f;
      }
      const shortId = hash.readInt32BE(0);
      this.core.apis.GroupApi.essenceLRU.set(shortId, msgTempData);
      return {
        msg_seq: msg.msg_seq,
        msg_random: msg.msg_random,
        sender_id: +msg.sender_uin,
        sender_nick: msg.sender_nick,
        operator_id: +msg.add_digest_uin,
        operator_nick: msg.add_digest_nick,
        message_id: shortId,
        operator_time: msg.add_digest_time,
        content: msg.msg_content.map((msg): OB11MessageData | undefined => {
          if (msg.msg_type === 1) {
            return {
              type: OB11MessageDataType.text,
              data: {
                text: msg?.text ?? '',
              },
            };
          } else if (msg.msg_type === 3) {
            return {
              type: OB11MessageDataType.image,
              data: {
                file: '',
                url: msg?.image_url,
              },
            };
          }
          return undefined;
        }).filter((e): e is OB11MessageData => e !== undefined),
      };
    }));
  }
}
