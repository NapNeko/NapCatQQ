import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import path from 'node:path';
import { DEFAULT_FLASH_VALIDITY_SECONDS } from '@/napcat-core/data/flash';

const richMediaList = [
  '.mp4', '.mov', '.avi', '.wmv', '.mpeg', '.mpg', '.flv', '.mkv',
  '.png', '.gif', '.jpg', '.jpeg', '.webp', '.bmp',
];

export const CreateFlashTaskPayloadSchema = Type.Object({
  files: Type.Union([
    Type.Array(Type.String()),
    Type.String(),
  ], { description: '文件列表或单个文件路径' }),
  name: Type.Optional(Type.String({ description: '任务名称' })),
  thumb_path: Type.Optional(Type.String({ description: '缩略图路径' })),
  validitySeconds: Type.Optional(Type.Number({ description: '文件集有效期（秒），可选 14 天 1209600 / 90 天 7776000 / 180 天 15552000，默认 1209600' })),
});
export type CreateFlashTaskPayload = Static<typeof CreateFlashTaskPayloadSchema>;

export class CreateFlashTask extends OneBotAction<CreateFlashTaskPayload, any> {
  override actionName = ActionName.CreateFlashTask;
  override payloadSchema = CreateFlashTaskPayloadSchema;
  override returnSchema = Type.Any({ description: '任务创建结果' });
  override actionSummary = '创建闪传任务';
  override actionTags = ['文件扩展'];
  override payloadExample = {
    files: 'C:\\test.jpg',
    name: 'test_task',
    validitySeconds: DEFAULT_FLASH_VALIDITY_SECONDS,
  };

  override returnExample = {
    task_id: 'task_123',
  };

  async _handle (payload: CreateFlashTaskPayload) {
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
    const validitySeconds = payload.validitySeconds ?? DEFAULT_FLASH_VALIDITY_SECONDS;
    return await this.core.apis.FlashApi.createFlashTransferUploadTask(fileList, normalPath, payload.name || '', validitySeconds);
  }
}
