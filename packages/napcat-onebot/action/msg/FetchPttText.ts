import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Static, Type } from '@sinclair/typebox';
import { PromiseTimer } from '@/napcat-common/src/helper';
import { ElementType } from '@/napcat-core';
import { MsgActionsExamples } from '@/napcat-onebot/action/msg/examples';

const PayloadSchema = Type.Object({
  message_id: Type.Union([Type.Number(), Type.String()], { description: '消息ID' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({ text: Type.String({ description: '得到的文本' }) });

type ReturnType = Static<typeof ReturnSchema>;

export class FetchPttText extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.FetchPttText;
  override actionSummary = '获取语音转文字结果';
  override actionTags = ['消息扩展'];
  override payloadExample = MsgActionsExamples.FetchPttText.payload;
  override returnExample = MsgActionsExamples.FetchPttText.response;

  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    if (!payload.message_id) {
      throw Error('参数message_id不能为空');
    }
    const MsgShortId = MessageUnique.getShortIdByMsgId(payload.message_id.toString());
    const msgIdWithPeer = MessageUnique.getMsgIdAndPeerByShortId(MsgShortId ?? +payload.message_id);
    if (!msgIdWithPeer) {
      throw new Error('消息不存在');
    }
    const peer = { guildId: '', peerUid: msgIdWithPeer?.Peer.peerUid, chatType: msgIdWithPeer.Peer.chatType };
    const getMsgTimeout = this.obContext.configLoader.configData.timeout.baseTimeout;
    const msgRes = await PromiseTimer(
      this.core.apis.MsgApi.getMsgsByMsgId(peer, [msgIdWithPeer?.MsgId || payload.message_id.toString()]),
      getMsgTimeout
    ).catch((e: unknown) => {
      if (e instanceof Error && e.message.startsWith('PromiseTimer:')) {
        throw new Error(`消息不存在或已被撤回: ${e.message || String(e)}`);
      }
      throw e;
    });
    const msg = msgRes.msgList[0];
    if (!msg) throw Error('消息不存在或已被撤回');
    const pttSegment = msg.elements.find((s) =>
      s.elementType === ElementType.PTT
    );
    if (!pttSegment) {
      throw Error('消息中不包含语音');
    }
    const getPttTextTimeout = this.obContext.configLoader.configData.timeout.baseTimeout;
    await PromiseTimer(
      this.core.context.session.getMsgService().translatePtt2Text(msgIdWithPeer.MsgId, msgIdWithPeer.Peer, pttSegment),
      getPttTextTimeout
    ).catch((e: unknown) => {
      if (e instanceof Error && e.message.startsWith('PromiseTimer:')) {
        throw new Error(`获取语音转文字结果失败: ${e.message || String(e)}`);
      }
      throw e;
    });
    const msgRes2 = await PromiseTimer(
      this.core.apis.MsgApi.getMsgsByMsgId(peer, [msgIdWithPeer?.MsgId || payload.message_id.toString()]),
      getMsgTimeout
    ).catch((e: unknown) => {
      if (e instanceof Error && e.message.startsWith('PromiseTimer:')) {
        throw new Error(`消息不存在或已被撤回: ${e.message || String(e)}`);
      }
      throw e;
    });
    const msg2 = msgRes2.msgList[0];
    if (!msg2) throw Error('消息不存在或已被撤回');
    for (const s of msg2.elements) {
      if (s.elementType === ElementType.PTT) {
        if (s.pttElement?.text) {
          return { text: s.pttElement?.text };
        }
      }
    }
    throw new Error('获取语音转文字结果失败');
  }
}
