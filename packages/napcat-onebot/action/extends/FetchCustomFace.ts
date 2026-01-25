import { Type, Static } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

const PayloadSchema = Type.Object({
  count: Type.Union([Type.Number(), Type.String()], { default: 48, description: '获取数量' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Array(Type.String(), { description: '表情URL列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class FetchCustomFace extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.FetchCustomFace;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    const ret = await this.core.apis.MsgApi.fetchFavEmojiList(+payload.count);
    return ret.emojiInfoList.map(e => e.url);
  }
}
