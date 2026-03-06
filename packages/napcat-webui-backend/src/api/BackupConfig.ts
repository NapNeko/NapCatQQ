import type { Context } from 'hono';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { Readable as NodeReadable } from 'node:stream';
import { webUiPathWrapper } from '@/napcat-webui-backend/index';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import compressing from 'compressing';
import { Readable } from 'node:stream';

// 使用compressing库进行流式压缩导出
export const BackupExportConfigHandler = async (c: Context) => {
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (!isLogin) {
    return sendError(c, 'Not Login');
  }

  try {
    const configPath = webUiPathWrapper.configPath;

    if (!existsSync(configPath)) {
      return sendError(c, '配置目录不存在');
    }

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[:.]/g, '-');
    };
    const zipFileName = `config_backup_${formatDate(new Date())}.zip`;

    // 使用compressing的Stream API进行流式压缩
    const stream = new compressing.zip.Stream();

    // 添加目录下的所有文件到压缩流（单层平坦结构）
    const entries = readdirSync(configPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const entryPath = join(configPath, entry.name);
        stream.addEntry(entryPath, { relativePath: entry.name });
      }
    }

    const headers = {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipFileName}"`,
    };

    const webStream = NodeReadable.toWeb(stream as NodeReadable) as ReadableStream;
    return new Response(webStream, {
      headers,
      status: 200,
    });
  } catch (error) {
    const msg = (error as Error).message;
    console.error('导出配置失败:', error);
    return sendError(c, `导出配置失败: ${msg}`);
  }
};

// 从内存Buffer流式解压，返回文件名和内容的映射
async function extractZipToMemory (buffer: Buffer): Promise<Map<string, Buffer>> {
  return new Promise((resolve, reject) => {
    const files = new Map<string, Buffer>();
    const bufferStream = Readable.from(buffer);
    const uncompressStream = new compressing.zip.UncompressStream();

    uncompressStream.on('entry', (header, stream, next) => {
      // 只处理文件，忽略目录
      if (header.type === 'file') {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('end', () => {
          // 取文件名（忽略路径中的目录部分）
          const fileName = header.name.split('/').pop() || header.name;
          files.set(fileName, Buffer.concat(chunks));
          next();
        });
        stream.on('error', (err) => {
          console.error(`读取文件失败: ${header.name}`, err);
          next();
        });
      } else {
        stream.resume();
        next();
      }
    });

    uncompressStream.on('finish', () => resolve(files));
    uncompressStream.on('error', reject);

    bufferStream.pipe(uncompressStream);
  });
}

// 导入配置 - 流式处理，完全在内存中解压
export const BackupImportConfigHandler = async (c: Context) => {
  // 使用 c.req.parseBody() 获取上传的文件
  const body = await c.req.parseBody({ all: true });
  const file = body['configFile'] as File | undefined;

  if (!file || !(file instanceof File)) {
    return sendError(c, '请选择要导入的配置文件');
  }

  try {
    const configPath = webUiPathWrapper.configPath;

    // 从 File 对象读取为 buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 从内存中解压zip
    const extractedFiles = await extractZipToMemory(buffer);

    if (extractedFiles.size === 0) {
      return sendError(c, '配置文件为空或格式不正确');
    }

    // 备份当前配置到内存
    const backupFiles = new Map<string, Buffer>();
    if (existsSync(configPath)) {
      const currentFiles = readdirSync(configPath, { withFileTypes: true });
      for (const entry of currentFiles) {
        if (entry.isFile()) {
          const filePath = join(configPath, entry.name);
          backupFiles.set(entry.name, readFileSync(filePath));
        }
      }
    }

    // 写入新的配置文件
    for (const [fileName, content] of extractedFiles) {
      // 防止路径穿越攻击
      const destPath = join(configPath, fileName);
      const normalizedPath = normalize(destPath);
      if (!normalizedPath.startsWith(normalize(configPath))) {
        continue;
      }
      writeFileSync(destPath, content);
    }

    return sendSuccess(c, {
      message: '配置导入成功，重启后生效~',
      filesImported: extractedFiles.size,
      filesBackedUp: backupFiles.size,
    });
  } catch (error) {
    console.error('导入配置失败:', error);
    const msg = (error as Error).message;
    return sendError(c, `导入配置失败: ${msg}`);
  }
};
