
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        nick: { type: 'string' },
        longNick: { type: 'string' },
        sex: { type: 'number' }//传Sex值？建议传0 
    },
    required: ['nick', 'longNick', 'sex',],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetSelfProfile extends BaseAction<Payload, any | null> {
    actionName = ActionName.SetSelfProfile;
    PayloadSchema = SchemaData;
    protected async _handle(payload: Payload) {
        let ret = await NTQQUserApi.modifySelfProfile({
            nick: payload.nick,
            longNick: payload.longNick,
            sex: payload.sex,
            birthday: { birthday_year: '', birthday_month: '', birthday_day: '' },
            location: undefined
        });
        return ret;
    }
}
