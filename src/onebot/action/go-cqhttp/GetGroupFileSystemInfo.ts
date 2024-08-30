import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FileNapCatOneBotUUID } from '@/common/helper';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupFileSystemInfo extends BaseAction<Payload, {
    file_count: number,
    limit_count: number, // unimplemented
    used_space: number, // todo: unimplemented, but can be implemented later
    total_space: number, // unimplemented, 10 GB by default
}> {
    actionName = ActionName.GoCQHTTP_GetGroupFileSystemInfo;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return {
            file_count:
                (await this.core.apis.GroupApi
                    .getGroupFileCount([payload.group_id.toString()]))
                    .groupFileCounts[0],
            limit_count: 10000,
            used_space: 0,
            total_space: 10 * 1024 * 1024 * 1024,
        };
    }
}
