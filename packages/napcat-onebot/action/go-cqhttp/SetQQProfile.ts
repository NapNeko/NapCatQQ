import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from './examples';

export const SetQQProfilePayloadSchema = Type.Object({
  nickname: Type.String({ description: '昵称' }),
  personal_note: Type.Optional(Type.String({ description: '个性签名' })),
  sex: Type.Optional(Type.Union([Type.Number(), Type.String()], { description: '性别 (0: 未知, 1: 男, 2: 女)' })), // 传Sex值？建议传0
});

export type SetQQProfilePayload = Static<typeof SetQQProfilePayloadSchema>;
export class SetQQProfile extends OneBotAction<SetQQProfilePayload, any> {
  override actionName = ActionName.SetQQProfile;
  override payloadSchema = SetQQProfilePayloadSchema;
  override returnSchema = Type.Any({ description: '设置结果' });
  override actionSummary = '设置QQ资料';
  override actionDescription = '修改当前账号的昵称、个性签名等资料';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.SetQQProfile.payload;
  override returnExample = GoCQHTTPActionsExamples.SetQQProfile.response;

  async _handle (payload: SetQQProfilePayload) {
    const self = this.core.selfInfo;
    const OldProfile = await this.core.apis.UserApi.getUserDetailInfo(self.uid);
    return await this.core.apis.UserApi.modifySelfProfile({
      nick: payload.nickname,
      longNick: (payload?.personal_note ?? OldProfile?.longNick) || '',
      sex: parseInt(payload?.sex ? payload?.sex.toString() : OldProfile?.sex!.toString()),
      birthday: {
        birthday_year: OldProfile?.birthday_year!.toString(),
        birthday_month: OldProfile?.birthday_month!.toString(),
        birthday_day: OldProfile?.birthday_day!.toString(),
      },
      location: undefined,
    });
  }
}
