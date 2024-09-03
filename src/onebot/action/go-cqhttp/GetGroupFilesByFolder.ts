import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { OB11Entities } from '@/onebot/entities';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
        folder_id: { type: 'string' },
        file_count: { type: ['string', 'number'] },
    },
    required: ['group_id', 'folder_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupFilesByFolder extends BaseAction<any, any> {
    actionName = ActionName.GoCQHTTP_GetGroupFilesByFolder;
    payloadSchema = SchemaData;
    async _handle(payload: Payload) {

        const ret = await this.core.apis.MsgApi.getGroupFileList(payload.group_id.toString(), {
            sortType: 1,
            fileCount: +(payload.file_count ?? 50),
            startIndex: 0,
            sortOrder: 2,
            showOnlinedocFolder: 0,
            folderId: payload.folder_id,
        }).catch(() => []);
        return {
            files: ret.filter(item => item.fileInfo)
                .map(item => OB11Entities.file(item.peerId, item.fileInfo!)),
            folders: [] as [],
        };
    }
}
