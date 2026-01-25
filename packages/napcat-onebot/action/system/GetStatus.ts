import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

export const GetStatusReturnSchema = Type.Object({
  online: Type.Boolean({ description: '是否在线' }),
  good: Type.Boolean({ description: '状态是否良好' }),
  stat: Type.Unknown({ description: '统计信息' }),
});

export type GetStatusReturnType = Static<typeof GetStatusReturnSchema>;

export default class GetStatus extends OneBotAction<void, GetStatusReturnType> {
  override actionName = ActionName.GetStatus;
  override payloadSchema = Type.Object({});
  override returnSchema = GetStatusReturnSchema;

  async _handle (): Promise<GetStatusReturnType> {
    return {
      online: !!this.core.selfInfo.online,
      good: true,
      stat: {},
    };
  }
}
