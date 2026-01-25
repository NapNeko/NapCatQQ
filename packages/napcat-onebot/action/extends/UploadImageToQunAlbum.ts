import { uriToLocalFile } from 'napcat-common/src/file';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  album_id: Type.String({ description: '相册ID' }),
  album_name: Type.String({ description: '相册名称' }),
  file: Type.String({ description: '图片路径、URL或Base64' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '上传结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class UploadImageToQunAlbum extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.UploadImageToQunAlbum;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
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
