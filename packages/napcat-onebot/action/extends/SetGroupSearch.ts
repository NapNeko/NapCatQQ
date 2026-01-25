import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  no_code_finger_open: Type.Optional(Type.Number({ description: '未知' })),
  no_finger_open: Type.Optional(Type.Number({ description: '未知' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '返回结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupSearch extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupSearch;
  override actionSummary = '设置群搜索选项';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: 123456,
    is_searchable: true
  };
  override returnExample = {
    result: true
  };
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  async _handle (payload: PayloadType): Promise<ReturnType> {
    const ret = await this.core.apis.GroupApi.setGroupSearch(payload.group_id, {
      noCodeFingerOpenFlag: payload.no_code_finger_open,
      noFingerOpenFlag: payload.no_finger_open,
    });
    if (ret.result !== 0) {
      throw new Error(`设置群搜索失败, ${ret.result}:${ret.errMsg}`);
    }
    return null;
  }
}
