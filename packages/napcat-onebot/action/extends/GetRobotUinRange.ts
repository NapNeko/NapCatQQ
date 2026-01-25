import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const ReturnSchema = Type.Array(Type.Any(), { description: '机器人Uin范围列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetRobotUinRange extends OneBotAction<void, ReturnType> {
  override actionName = ActionName.GetRobotUinRange;
  override actionSummary = '获取机器人 UIN 范围';
  override actionTags = ['系统扩展'];
  override payloadExample = {};
  override returnExample = [
    { minUin: '12345678', maxUin: '87654321' }
  ];
  override payloadSchema = Type.Void();
  override returnSchema = ReturnSchema;

  async _handle () {
    return await this.core.apis.UserApi.getRobotUinRange();
  }
}
