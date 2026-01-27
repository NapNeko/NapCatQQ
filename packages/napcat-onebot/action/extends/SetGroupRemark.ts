import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  remark: Type.String({ description: '备注' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '返回结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupRemark extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupRemark;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '设置群备注';
  override actionDescription = '设置群备注';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: '123456',
    remark: '测试群备注'
  };
  override returnExample = null;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const ret = await this.core.apis.GroupApi.setGroupRemark(payload.group_id, payload.remark);
    if (ret.result !== 0) {
      throw new Error(`设置群备注失败, ${ret.result}:${ret.errMsg}`);
    }
    return null;
  }
}
