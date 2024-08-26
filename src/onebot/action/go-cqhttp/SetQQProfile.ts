import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        nickname: { type: 'string' },
        personal_note: { type: 'string' },
        sex: { type: ['number', 'string'] },//传Sex值？建议传0
    },
    required: ['nickname'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetQQProfile extends BaseAction<Payload, any | null> {
    actionName = ActionName.SetQQProfile;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQUserApi = this.core.apis.UserApi;
        const self = this.core.selfInfo;
        const OldProfile = await NTQQUserApi.getUserDetailInfo(self.uid);
        const ret = await NTQQUserApi.modifySelfProfile({
            nick: payload.nickname,
            longNick: (payload?.personal_note ?? OldProfile?.longNick) || '',
            sex: parseInt(payload?.sex ? payload?.sex.toString() : OldProfile?.sex!.toString()),
            birthday: { birthday_year: OldProfile?.birthday_year!.toString(), birthday_month: OldProfile?.birthday_month!.toString(), birthday_day: OldProfile?.birthday_day!.toString() },
            location: undefined,
        });
        return ret;
    }
}
