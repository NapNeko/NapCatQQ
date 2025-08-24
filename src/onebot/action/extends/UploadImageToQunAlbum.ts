import { uriToLocalFile } from '@/common/file';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';

const SchemaData = Type.Object({
    group_id: Type.String(),
    album_id: Type.String(),
    album_name: Type.String(),
    file: Type.String()
});

type Payload = Static<typeof SchemaData>;

export class UploadImageToQunAlbum extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.UploadImageToQunAlbum;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const downloadResult = await uriToLocalFile(this.core.NapCatTempPath, payload.file);
        try {
            return await this.core.apis.WebApi.uploadImageToQunAlbum(payload.group_id, payload.album_id, payload.album_name, downloadResult.path);
        } finally {
            if (downloadResult.path && existsSync(downloadResult.path)) {
                await unlink(downloadResult.path);
            }
        }
    }
}
