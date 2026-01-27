import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { ExtendsActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  words: Type.Array(Type.String(), { description: '待翻译单词列表' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  words: Type.Array(Type.String(), { description: '翻译结果列表' }),
}, { description: '翻译结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class TranslateEnWordToZn extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.TranslateEnWordToZn;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '英文单词翻译';
  override actionDescription = '将英文单词列表翻译为中文';
  override actionTags = ['扩展接口'];
  override payloadExample = ExtendsActionsExamples.TranslateEnWordToZn.payload;
  override returnExample = ExtendsActionsExamples.TranslateEnWordToZn.response;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const ret = await this.core.apis.SystemApi.translateEnWordToZn(payload.words);
    if (ret.result !== 0) {
      throw new Error('翻译失败');
    }
    return {
      words: ret.words
    };
  }
}
