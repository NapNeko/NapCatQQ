import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { ActionExamples } from '../examples';

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
  override actionDescription = '设置群备注';
  override actionTags = ['扩展接口'];
  override payloadExample = ActionExamples.SetGroupRemark.payload;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const ret = await this.core.apis.GroupApi.setGroupRemark(payload.group_id, payload.remark);
    if (ret.result !== 0) {
      throw new Error(`设置群备注失败, ${ret.result}:${ret.errMsg}`);
    }
    return null;
  }
}
