import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  group_name: Type.String({ description: '群名称' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupName extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupName;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType): Promise<null> {
    const ret = await this.core.apis.GroupApi.setGroupName(payload.group_id.toString(), payload.group_name);
    if (ret.result !== 0) {
      throw new Error(`设置群名称失败 ErrCode: ${ret.result} ErrMsg: ${ret.errMsg}`);
    }
    return null;
  }
}
