import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { unlink, readdir } from 'fs/promises';
import path, { join } from 'path';

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
            let basic_path = path.join(this.core.dataPath, this.core.selfInfo.uin || '10001', 'nt_qq', 'nt_data');

            // 需要清理的目录列表
            const dirsToClean = ['Pic', 'Ptt', 'Video', 'File', 'log'];

            // 清理每个指定目录
            for (const dir of dirsToClean) {
                const dirPath = path.join(basic_path, dir);
                try {
                    // 检查目录是否存在
                    const files = await readdir(dirPath).catch(() => null);
                    if (files) {
                        // 删除目录下的所有文件
                        const dirDeletePromises = files.map(async (file) => {
                            const filePath = path.join(dirPath, file);
                            try {
                                await unlink(filePath);
                                this.core.context.logger.log(`已删除文件: ${filePath}`);
                            } catch (err: unknown) {
                                this.core.context.logger.log(`删除文件 ${filePath} 失败: ${(err as Error).message}`);
                            }
                        });

                        await Promise.all(dirDeletePromises);
                        this.core.context.logger.log(`目录清理完成: ${dirPath}`);
                    }
                } catch (err: unknown) {
                    this.core.context.logger.log(`清理目录 ${dirPath} 失败: ${(err as Error).message}`);
                }
            }


            this.core.context.logger.log(`临时文件夹清理完成: ${tempPath}`);
        } catch (err: unknown) {
            this.core.context.logger.log(`清理缓存失败: ${(err as Error).message}`);
            throw err;
        }
    }
}