import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FileNapCatOneBotUUID } from '@/common/helper';
const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
        file_id: { type: 'string' },
    },
    required: ['group_id', 'file_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class DeleteGroupFile extends BaseAction<Payload, any> {
    actionName = ActionName.GOCQHTTP_DeleteGroupFile;
    payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        const data = FileNapCatOneBotUUID.decodeModelId(payload.file_id);
        if (!data) throw new Error('Invalid file_id');
        return await this.core.apis.GroupApi.DelGroupFile(payload.group_id.toString(), [data.fileId]);
    }
}
