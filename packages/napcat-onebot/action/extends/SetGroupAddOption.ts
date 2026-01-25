import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  add_type: Type.Number({ description: '加群方式' }),
  group_question: Type.Optional(Type.String({ description: '加群问题' })),
  group_answer: Type.Optional(Type.String({ description: '加群答案' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '返回结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupAddOption extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupAddOption;
  override actionSummary = '设置群加群选项';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: 123456,
    option: 1
  };
  override returnExample = {
    result: true
  };
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  async _handle (payload: PayloadType): Promise<ReturnType> {
    const ret = await this.core.apis.GroupApi.setGroupAddOption(payload.group_id, {
      addOption: payload.add_type,
      groupQuestion: payload.group_question,
      groupAnswer: payload.group_answer,
    });
    if (ret.result !== 0) {
      throw new Error(`设置群添加选项失败, ${ret.result}:${ret.errMsg}`);
    }
    return null;
  }
}
