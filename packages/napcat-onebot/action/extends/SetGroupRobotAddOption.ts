import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  robot_member_switch: Type.Optional(Type.Number({ description: '机器人成员开关' })),
  robot_member_examine: Type.Optional(Type.Number({ description: '机器人成员审核' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '返回结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupRobotAddOption extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupRobotAddOption;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  async _handle (payload: PayloadType): Promise<ReturnType> {
    const ret = await this.core.apis.GroupApi.setGroupRobotAddOption(
      payload.group_id,
      payload.robot_member_switch,
      payload.robot_member_examine
    );
    if (ret.result !== 0) {
      throw new Error(`设置群机器人添加选项失败, ${ret.result}:${ret.errMsg}`);
    }
    return null;
  }
}
