import { ActionName } from '@/onebot/action/router';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { join } from 'node:path';
import { readdir, unlink } from 'node:fs/promises';

export class CleanStreamTempFile extends OneBotAction<void, void> {
  override actionName = ActionName.CleanStreamTempFile;

  async _handle (_payload: void): Promise<void> {
    try {
      // 获取临时文件夹路径
      const tempPath = this.core.NapCatTempPath;

      // 读取文件夹中的所有文件
      const files = await readdir(tempPath);

      // 删除每个文件
      const deletePromises = files.map(async (file) => {
        const filePath = join(tempPath, file);
        try {
          await unlink(filePath);
          this.core.context.logger.log(`已删除文件: ${filePath}`);
        } catch (err: unknown) {
          this.core.context.logger.log(`删除文件 ${filePath} 失败: ${(err as Error).message}`);
        }
      });
      await Promise.all(deletePromises);
    } catch (err: unknown) {
      this.core.context.logger.log(`清理流临时文件失败: ${(err as Error).message}`);
    }
  }
}
