import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  words: Type.Array(Type.String(), { description: '待翻译单词列表' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Union([Type.Array(Type.Any()), Type.Undefined()], { description: '翻译结果列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class TranslateEnWordToZn extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.TranslateEnWordToZn;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const ret = await this.core.apis.SystemApi.translateEnWordToZn(payload.words);
    if (ret.result !== 0) {
      throw new Error('翻译失败');
    }
    return ret.words;
  }
}
