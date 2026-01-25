import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type, Optional } from '@sinclair/typebox';
import path from 'node:path';

const richMediaList = [
  '.mp4', '.mov', '.avi', '.wmv', '.mpeg', '.mpg', '.flv', '.mkv',
  '.png', '.gif', '.jpg', '.jpeg', '.webp', '.bmp',
];

// 不全部使用json因为：一个文件解析Form-data会变字符串！！！  但是api文档就写List
const SchemaData = Type.Object({
  files: Type.Union([
    Type.Array(Type.String()),
    Type.String(),
  ]),
  name: Optional(Type.String()),
  thumb_path: Optional(Type.String()),
});
type Payload = Static<typeof SchemaData>;

export class CreateFlashTask extends OneBotAction<Payload, unknown> {
  override actionName = ActionName.CreateFlashTask;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    const fileList = Array.isArray(payload.files) ? payload.files : [payload.files];
    let thumbPath: string = '';

    if (fileList.length === 1) {
      // 我是真没hook到那种合并的缩略图是哪个方法产生的，暂时不实现(怀疑是js直接canvas渲染的！！) // 确认了猜想
      const filePath = fileList[0];
      if (filePath === undefined) {
        return {};
      }
      const ext = path.extname(filePath).toLowerCase();

      if (richMediaList.includes(ext)) {
        try {
          const res = await this.core.apis.FlashApi.createFileThumbnail(filePath);
          if (res && typeof res === 'object' && 'result' in res && res.result === 0) {
            thumbPath = res.targetPath as string;
          }
        } catch (_e) {
        }
      }
    }

    function toPlatformPath (inputPath: string) {
      const unifiedPath = inputPath.replace(/[\\/]/g, path.sep);
      return path.normalize(unifiedPath);
    }

    let normalPath: string;
    if (payload.thumb_path !== undefined) {
      normalPath = path.normalize(payload.thumb_path);
    } else {
      normalPath = toPlatformPath(thumbPath);
    }
    return await this.core.apis.FlashApi.createFlashTransferUploadTask(fileList, normalPath, payload.name || '');
  }
}
