import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Static, Type } from '@sinclair/typebox';
import { PromiseTimer } from '@/napcat-common/src/helper';
import { ElementType, type RawMessage } from '@/napcat-core';
import { GeneralCallResultStatus } from '@/napcat-core/services/common';
import { MsgActionsExamples } from '@/napcat-onebot/action/msg/examples';

/** 等待「文本写回消息元素」事件的超时时间 */
const PTT_TEXT_EVENT_TIMEOUT_MS = 3000;

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
    const targetMsgId = msgIdWithPeer?.MsgId || payload.message_id.toString();
    const readMsg = async () => {
      const msgRes = await PromiseTimer(
        this.core.apis.MsgApi.getMsgsByMsgId(peer, [targetMsgId]),
        getMsgTimeout
      ).catch((e: unknown) => {
        if (e instanceof Error && e.message.startsWith('PromiseTimer:')) {
          throw new Error(`消息不存在或已被撤回: ${e.message || String(e)}`);
        }
        throw e;
      });
      const msg = msgRes.msgList[0];
      if (!msg) throw Error('消息不存在或已被撤回');
      return msg;
    };
    const readPttText = async (): Promise<string | undefined> => {
      const msg = await readMsg();
      for (const s of msg.elements) {
        if (s.elementType === ElementType.PTT && s.pttElement?.text) {
          return s.pttElement.text;
        }
      }
      return undefined;
    };
    const msg = await readMsg();
    const pttSegment = msg.elements.find((s) =>
      s.elementType === ElementType.PTT
    );
    if (!pttSegment) {
      throw Error('消息中不包含语音');
    }
    // 已转写过（或重试调用）直接返回缓存文本，无需再次触发转写
    if (pttSegment.pttElement?.text) {
      return { text: pttSegment.pttElement.text };
    }
    // 先注册消息更新监听：文本写回消息元素时 QQ 会推送 onMsgInfoListUpdate
    const extractText = (msgList: RawMessage[]) => {
      const hit = msgList.find((m) => m.msgId === targetMsgId);
      const ptt = hit?.elements.find((e) => e.elementType === ElementType.PTT);
      return ptt?.pttElement?.text || null;
    };
    const textReadyEvent = this.core.eventWrapper
      .registerListen(
        'NodeIKernelMsgListener/onMsgInfoListUpdate',
        (msgList: RawMessage[]) => !!extractText(msgList),
        1,
        PTT_TEXT_EVENT_TIMEOUT_MS
      )
      .then(
        ([msgList]) => extractText(msgList),
        () => null
      );

    const translateRes = await PromiseTimer(
      this.core.context.session.getMsgService().translatePtt2Text(msgIdWithPeer.MsgId, msgIdWithPeer.Peer, pttSegment),
      getMsgTimeout
    ).catch((e: unknown) => {
      if (e instanceof Error && e.message.startsWith('PromiseTimer:')) {
        throw new Error(`获取语音转文字结果失败:  ${e.message || String(e)}`);
      }
      throw e;
    });
    // translatePtt2Text 仅代表转写请求完成，文本由 QQ 异步写回消息元素
    const text = await readPttText();
    if (text) {
      return { text };
    }
    // 事件参数里已带写回的文本，直接取用，避免消息库快照滞后
    const eventText = await textReadyEvent;
    if (eventText) {
      return { text: eventText };
    }
    if (translateRes.result !== GeneralCallResultStatus.OK) {
      throw new Error(`获取语音转文字结果失败: ${translateRes.errMsg || '转写服务返回错误'}`);
    }
    throw new Error('获取语音转文字结果失败');
  }
}
