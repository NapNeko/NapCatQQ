import { Type, Static } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { type NTQQMsgApi } from 'napcat-core/apis';

const SchemaData = Type.Object({
  message_id: Type.Union([Type.Number(), Type.String()]),
  emojiId: Type.Union([Type.Number(), Type.String()]),
  emojiType: Type.Union([Type.Number(), Type.String()])
});

type Payload = Static<typeof SchemaData>;

export class FetchEmojiLike extends OneBotAction<Payload, Awaited<ReturnType<NTQQMsgApi['getMsgEmojiLikesList']>>> {
  override actionName = ActionName.FetchEmojiLike;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    const msgIdPeer = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id);
    if (!msgIdPeer) throw new Error('消息不存在');
    const msg = (await this.core.apis.MsgApi.getMsgsByMsgId(msgIdPeer.Peer, [msgIdPeer.MsgId])).msgList[0];
    if (!msg) throw new Error('消息不存在');
    let cookie = '';
    let isLastPage = false;
    const allEmojiLikesList: any[] = [];
    let finalResult: any = null;
    const MAX_PAGES = 200;
    // 按3000人群计算
    let pages = 0;
    while (!isLastPage) {
      if (++pages > MAX_PAGES) {
        throw new Error('分页拉取超过上限，疑似出现循环 cookie');
      }
      const res = await this.core.apis.MsgApi.getMsgEmojiLikesList(
      msgIdPeer.Peer, msg.msgSeq, payload.emojiId.toString(), payload.emojiType.toString(), cookie,
    );
      if (!finalResult) finalResult = { ...res };
      if (Array.isArray(res.emojiLikesList)) allEmojiLikesList.push(...res.emojiLikesList);
      isLastPage = !!res.isLastPage;
      const nextCookie = res.cookie ?? '';
      if (!isLastPage && nextCookie !== '') cookie = nextCookie;
      else break;
    }
    finalResult.emojiLikesList = allEmojiLikesList;
    finalResult.isLastPage = true;
    finalResult.cookie = '';
    delete finalResult.cookie;
    delete finalResult.isLastPage;
    delete finalResult.isFirstPage;
    return finalResult;
  }
}
