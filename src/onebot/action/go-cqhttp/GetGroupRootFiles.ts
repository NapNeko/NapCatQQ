
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { OB11GroupFile, OB11GroupFileFolder } from '@/onebot';
import { OB11Construct } from '@/onebot/helper/data';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    file_count: Type.Union([Type.Number(), Type.String()], { default: 50 }),
});

type Payload = Static<typeof SchemaData>;

export class GetGroupRootFiles extends OneBotAction<Payload, {
    files: OB11GroupFile[],
    folders: OB11GroupFileFolder[],
}> {
    override actionName = ActionName.GoCQHTTP_GetGroupRootFiles;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        const ret = await this.core.apis.MsgApi.getGroupFileList(payload.group_id.toString(), {
            sortType: 1,
            fileCount: +payload.file_count,
            startIndex: 0,
            sortOrder: 2,
            showOnlinedocFolder: 0,
        });

        return {
            files: ret.filter(item => item.fileInfo)
                .map(item => OB11Construct.file(item.peerId, item.fileInfo!)),
            folders: ret.filter(item => item.folderInfo)
                .map(item => OB11Construct.folder(item.peerId, item.folderInfo!)),
        };
    }
}
