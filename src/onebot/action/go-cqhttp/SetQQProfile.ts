import { NTQQUserApi } from '@/core/apis';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    nickname: Type.String(),
    personal_note: Type.Optional(Type.String()),
    sex: Type.Optional(Type.Union([Type.Number(), Type.String()])), // 传Sex值？建议传0
});

type Payload = Static<typeof SchemaData>;
export class SetQQProfile extends OneBotAction<Payload, Awaited<ReturnType<NTQQUserApi['modifySelfProfile']>> | null> {
    override actionName = ActionName.SetQQProfile;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
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
