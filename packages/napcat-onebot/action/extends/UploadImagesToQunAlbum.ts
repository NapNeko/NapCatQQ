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
  files: Type.Array(Type.String(), { description: '图片路径、URL或Base64 数组，一次上传多张' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '上传结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class UploadImagesToQunAlbum extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.UploadImagesToQunAlbum;
  override actionSummary = '上传多张图片到群相册';
  override actionDescription = '一次上传多张图片，这些图片在群相册里显示为同一条上传';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: '123456',
    album_id: 'album_id_1',
    album_name: '相册1',
    files: ['/path/to/1.jpg', '/path/to/2.jpg'],
  };

  override returnExample = {
    result: null,
  };

  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    if (!payload.files.length) throw new Error('files 不能为空');
    const localPaths: string[] = [];
    const tempPaths: string[] = [];
    try {
      for (const file of payload.files) {
        const downloadResult = await uriToLocalFile(this.core.NapCatTempPath, file);
        localPaths.push(downloadResult.path);
        if (!downloadResult.isLocal && downloadResult.path) {
          tempPaths.push(downloadResult.path);
        }
      }
      return await this.core.apis.WebApi.uploadImagesToQunAlbum(
        payload.group_id,
        payload.album_id,
        payload.album_name,
        localPaths
      );
    } finally {
      for (const path of tempPaths) {
        if (existsSync(path)) {
          await unlink(path);
        }
      }
    }
  }
}
