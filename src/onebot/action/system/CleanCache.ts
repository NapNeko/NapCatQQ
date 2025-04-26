import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { unlink, readdir } from 'fs/promises';
import { join } from 'path';

export class CleanCache extends OneBotAction<void, void> {
    override actionName = ActionName.CleanCache;

    async _handle() {
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

            // 等待所有删除操作完成
            await Promise.all(deletePromises);

            this.core.context.logger.log(`临时文件夹清理完成: ${tempPath}`);
        } catch (err: unknown) {
            this.core.context.logger.log(`清理缓存失败: ${(err as Error).message}`);
            throw err;
        }
    }
}