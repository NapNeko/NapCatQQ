import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
        start_index: { type: 'number' },
        file_count: { type: 'number' },
    },
    required: ['group_id', 'start_index', 'file_count'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupFileList extends BaseAction<Payload, { FileList: Array<any> }> {
    actionName = ActionName.GetGroupFileList;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQMsgApi = this.CoreContext.apis.MsgApi;
        const ret = await NTQQMsgApi.getGroupFileList(payload.group_id.toString(), {
            sortType: 1,
            fileCount: payload.file_count,
            startIndex: payload.start_index,
            sortOrder: 2,
            showOnlinedocFolder: 0,
        }).catch((e) => {
            return [];
        });
        return { FileList: ret };
    }
}
