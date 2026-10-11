import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface MigrationLogger {
  log: (message: string) => void;
  logError: (message: string, error?: unknown) => void;
}

/**
 * 旧版 NapCat 在 Linux 上把 global 目录放在 `<dataPath>/nt_qq/global`,
 * 新版对齐 QQ 官方 Linux 客户端改为 `<dataPath>/global`。
 *
 * 仅当新目录不存在、且旧目录存在时搬运一次：
 *  - 服务器仅跑 NapCat 的用户通常只有 `nt_qq/`, 迁移后即可复用原有登录凭据,
 *    避免重新扫码以及出现两套 login.db / 两个 GUID;
 *  - 若 `QQ/global` 已存在（例如用户同时装了自用 QQ），则保持原样, 不覆盖也不改动,
 *    避免覆盖两份不同的设备身份, 同时天然保证重复启动时不会二次迁移;
 *  - 两者都不存在时什么都不做, QQ 会在新路径自行重建。
 *
 * @param platform 目标平台, 便于测试注入
 * @returns 是否执行了迁移
 */
export function migrateLegacyGlobalPath (
  dataPath: string,
  dataPathGlobal: string,
  logger: MigrationLogger,
  platform: NodeJS.Platform = os.platform()
): boolean {
  if (platform !== 'linux') return false;
  const legacyGlobalPath = path.resolve(dataPath, './nt_qq/global');
  if (legacyGlobalPath === dataPathGlobal) return false;
  // 新目录已存在: 不覆盖、不合并
  if (fs.existsSync(dataPathGlobal)) return false;
  // 没有旧数据: QQ 启动时会自行重建
  if (!fs.existsSync(legacyGlobalPath)) return false;

  try {
    fs.mkdirSync(path.dirname(dataPathGlobal), { recursive: true });
    try {
      fs.renameSync(legacyGlobalPath, dataPathGlobal);
    } catch {
      // 跨文件系统时 rename 会失败, 退化为递归复制后删除旧目录
      fs.cpSync(legacyGlobalPath, dataPathGlobal, { recursive: true });
      fs.rmSync(legacyGlobalPath, { recursive: true, force: true });
    }
    logger.log(`[NapCat] [Core] 已迁移 Linux global 目录: ${legacyGlobalPath} -> ${dataPathGlobal}`);
    return true;
  } catch (e) {
    logger.logError('[NapCat] [Core] 迁移 Linux global 目录失败, 将在新路径重建设备信息:', e);
    return false;
  }
}
