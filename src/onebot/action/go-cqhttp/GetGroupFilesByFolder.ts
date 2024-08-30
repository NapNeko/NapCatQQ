import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NapCatOneBot11Adapter, OB11GroupFile } from '@/onebot';
import { NapCatCore } from '@/core';
import { GetGroupRootFiles } from '@/onebot/action/go-cqhttp/GetGroupRootFiles';
import { OB11Entities } from '@/onebot/entities';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
        folder_id: { type: 'string' },
    },
    required: ['group_id', 'folder_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupFilesByFolder extends BaseAction<Payload, {
    files: OB11GroupFile[],
    folders: [] // QQ does not allow nested folders
}> {
    actionName = ActionName.GoCQHTTP_GetGroupFilesByFolder;
    payloadSchema = SchemaData;

    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore,
                private getGroupRootFilesImpl: GetGroupRootFiles) {
        super(obContext, core);
    }

    async _handle(payload: Payload) {
        const folder = (await this.getGroupRootFilesImpl._handle({ group_id: payload.group_id }))
            .folders.find(folder => folder.folder_id === payload.folder_id);
        if (!folder) {
            throw new Error('Folder not found');
        }
        const ret = await this.core.apis.MsgApi.getGroupFileList(payload.group_id.toString(), {
            sortType: 1,
            fileCount: folder.total_file_count,
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
