import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NapCatOneBot11Adapter, OB11GroupFile, OB11GroupFileFolder } from '@/onebot';
import { NapCatCore } from '@/core';
import { GetGroupFileCount } from '@/onebot/action/file/GetGroupFileCount';
import { OB11Entities } from '@/onebot/entities';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupRootFiles extends BaseAction<Payload, {
    files: OB11GroupFile[],
    folders: OB11GroupFileFolder[],
}> {
    actionName = ActionName.GoCQHTTP_GetGroupRootFiles;
    payloadSchema = SchemaData;

    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore,
                private ncGetGroupFileCountImpl: GetGroupFileCount) {
        super(obContext, core);
    }

    async _handle(payload: Payload) {
        const ret = await this.core.apis.MsgApi.getGroupFileList(payload.group_id.toString(), {
            sortType: 1,
            fileCount: (await this.ncGetGroupFileCountImpl._handle({ group_id: payload.group_id.toString() })).count,
            startIndex: 0,
            sortOrder: 2,
            showOnlinedocFolder: 0,
        }).catch(() => []);

        return {
            files: ret.filter(item => item.fileInfo)
                .map(item => OB11Entities.file(item.peerId, item.fileInfo!)),
            folders: ret.filter(item => item.folderInfo)
                .map(item => OB11Entities.folder(item.peerId, item.folderInfo!)),
        };
    }
}
