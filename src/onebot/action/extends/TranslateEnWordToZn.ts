import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        words: {
            type: 'array',
            items: { type: 'string' },
        },
    },
    required: ['words'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class TranslateEnWordToZn extends BaseAction<Payload, Array<any> | null> {
    actionName = ActionName.TranslateEnWordToZn;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQSystemApi = this.CoreContext.getApiContext().SystemApi;
        const ret = await NTQQSystemApi.translateEnWordToZn(payload.words);
        if (ret.result !== 0) {
            throw new Error('翻译失败');
        }
        return ret.words;
    }
}
