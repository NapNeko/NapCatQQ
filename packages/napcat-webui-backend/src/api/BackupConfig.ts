import { RequestHandler } from 'express';
import { existsSync, createReadStream, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { join, normalize } from 'node:path';
import os from 'node:os';
import { webUiPathWrapper } from '@/napcat-webui-backend/index';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import compressing from 'compressing';
import unzipper from 'unzipper';

// 使用compressing库进行压缩
export const BackupExportConfigHandler: RequestHandler = async (_req, res) => {
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (!isLogin) {
    return sendError(res, 'Not Login');
  }

  try {
    const configPath = webUiPathWrapper.configPath;

    if (!existsSync(configPath)) {
      return sendError(res, '配置目录不存在');
    }

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[:.]/g, '-');
    };
    const zipFileName = `config_backup_${formatDate(new Date())}.zip`;

    // 设置响应头
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

    // 使用compressing的Stream API[1](@ref)
    const stream = new compressing.zip.Stream();

    // 添加目录下的所有内容到压缩流
    const entries = readdirSync(configPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = join(configPath, entry.name);
      stream.addEntry(entryPath, { relativePath: entry.name });
    }

    // 管道传输到响应
    stream.pipe(res);

    // 处理流错误
    stream.on('error', (err) => {
      console.error('压缩流错误:', err);
      if (!res.headersSent) {
        sendError(res, '流式压缩失败');
      }
    });

  } catch (error) {
    const msg = (error as Error).message;
    console.error('导出配置失败:', error);
    if (!res.headersSent) {
      return sendError(res, `导出配置失败: ${msg}`);
    }
  }
};

// 导入配置，将上传的zip文件解压到工作目录下的tmp目录，然后覆盖到config文件夹
export const BackupImportConfigHandler: RequestHandler = async (req, res) => {
  // 检查是否有文件上传
  if (!req.file) {
    return sendError(res, '请选择要导入的配置文件');
  }

  try {
    const configPath = webUiPathWrapper.configPath;
    const tmpPath = join(os.tmpdir(), 'napcat-upload', 'tmp');
    const backupRootPath = join(os.tmpdir(), 'napcat-upload', 'backup');
    let extractPath = join(tmpPath, 'imported_config');
    const uploadedFilePath = req.file.path;

    // 确保临时目录和备份目录存在
    mkdirSync(tmpPath, { recursive: true });
    mkdirSync(backupRootPath, { recursive: true });
    mkdirSync(extractPath, { recursive: true });

    // 解压上传的zip文件
    await createReadStream(uploadedFilePath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    // 检查解压后的文件
    let extractedFiles = readdirSync(extractPath);
    if (extractedFiles.length === 0) {
      rmSync(extractPath, { recursive: true, force: true });
      rmSync(uploadedFilePath, { force: true });
      return sendError(res, '配置文件为空或格式不正确');
    }

    // 检查是否有嵌套的config目录
    if (extractedFiles.length === 1) {
      const nestedDirName = extractedFiles[0];
      if (nestedDirName) {
        const nestedPath = join(extractPath, nestedDirName);
        if (existsSync(nestedPath) && !existsSync(join(nestedPath, '.git'))) {
          const nestedFiles = readdirSync(nestedPath);
          if (nestedFiles.length > 0) {
            // 如果只有一个目录，且目录不为空且不是.git目录，使用该目录作为解压路径
            extractPath = nestedPath;
            extractedFiles = nestedFiles;
          }
        }
      }
    }

    // 备份当前配置到专门的backup文件夹
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[:.]/g, '-');
    };
    const backupPath = join(backupRootPath, `config_${formatDate(new Date())}`);
    if (existsSync(configPath)) {
      mkdirSync(backupPath, { recursive: true });
      // 递归复制所有文件和文件夹
      const copyRecursive = (src: string, dest: string) => {
        const entries = readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = join(src, entry.name);
          const destPath = join(dest, entry.name);

          // 防止路径穿越攻击
          const normalizedDestPath = normalize(destPath);
          const normalizedDestDir = normalize(dest);
          if (!normalizedDestPath.startsWith(normalizedDestDir)) {
            continue;
          }

          if (entry.isDirectory()) {
            mkdirSync(destPath, { recursive: true });
            copyRecursive(srcPath, destPath);
          } else {
            cpSync(srcPath, destPath);
          }
        }
      };
      copyRecursive(configPath, backupPath);
    }

    // 覆盖配置文件和文件夹
    const copyRecursive = (src: string, dest: string) => {
      const entries = readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);

        // 防止路径穿越攻击
        const normalizedDestPath = normalize(destPath);
        const normalizedDestDir = normalize(dest);
        if (!normalizedDestPath.startsWith(normalizedDestDir)) {
          continue;
        }

        if (entry.isDirectory()) {
          mkdirSync(destPath, { recursive: true });
          copyRecursive(srcPath, destPath);
        } else {
          cpSync(srcPath, destPath);
        }
      }
    };
    copyRecursive(extractPath, configPath);

    return sendSuccess(res, {
      message: '配置导入成功，重启后生效~',
      backupPath: backupPath
    });

  } catch (error) {
    console.error('导入配置失败:', error);
    const msg = (error as Error).message;
    return sendError(res, `导入配置失败: ${msg}`);
  }
};
