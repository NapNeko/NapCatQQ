import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        group_name: { type: 'string' },
    },
    required: ['group_id', 'group_name'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;
export default class SetGroupName extends OneBotAction<Payload, null> {
    actionName = ActionName.SetGroupName;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        let ret = await this.core.apis.GroupApi.setGroupName(payload.group_id.toString(), payload.group_name);
        if (ret.result !== 0) {
            throw new Error(`设置群名称失败 ErrCode: ${ret.result} ErrMsg: ${ret.errMsg}`);
        }
        return null;
    }
}
