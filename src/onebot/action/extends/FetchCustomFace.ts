import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

const SchemaData = {
    type: 'object',
    properties: {
        count: { type: ['number', 'string'] },
    },
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class FetchCustomFace extends BaseAction<Payload, string[]> {
    actionName = ActionName.FetchCustomFace;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload) {
        //48 可能正好是QQ需要的一个页面的数量 Tagged Mlikiowa
        const ret = await this.CoreContext.apis.MsgApi.fetchFavEmojiList(parseInt((payload.count || '0').toString()) || 48);
        return ret.emojiInfoList.map(e => e.url);
    }
}
