import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FileNapCatOneBotUUID } from '@/common/helper';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
        start_index: { type: ['string', 'number'] },
        file_count: { type: ['string', 'number'] },
        folder_id: { type: ['string', 'number'] },
    },
    required: ['group_id', 'start_index', 'file_count'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupFileList extends BaseAction<Payload, { FileList: Array<any> }> {
    actionName = ActionName.GetGroupFileList;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQMsgApi = this.core.apis.MsgApi;
        let param = {};
        if (payload.folder_id) {
            param = {
                folderId: payload.folder_id.toString(),
            };
        }
        const ret = await NTQQMsgApi.getGroupFileList(payload.group_id.toString(), {
            sortType: 1,
            fileCount: +payload.file_count,
            startIndex: +payload.start_index,
            sortOrder: 2,
            showOnlinedocFolder: 0,
            ...param
        }).catch((e) => {
            return [];
        });
        ret.forEach((e) => {
            let fileModelId = e?.fileInfo?.fileModelId;
            if (fileModelId) {
                e.fileModelId = fileModelId;
            }
            e.fileId = FileNapCatOneBotUUID.encodeModelId({ chatType: 2, peerUid: payload.group_id.toString() }, fileModelId);
        });
        return { FileList: ret };
    }
}
