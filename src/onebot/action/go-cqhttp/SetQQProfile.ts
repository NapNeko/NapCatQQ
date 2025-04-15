import { NTQQUserApi } from '@/core/apis';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    nickname: z.coerce.string(),
    personal_note: z.coerce.string().optional(),
    sex: z.coerce.string().optional(), // 传Sex值？建议传0
});

type Payload = z.infer<typeof SchemaData>;
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
