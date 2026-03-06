import type { Context } from 'hono';
import { sendError, sendSuccess } from '../utils/response';
import fsProm from 'fs/promises';
import fs from 'fs';
import path from 'path';
import os from 'os';
import compressing from 'compressing';
import { PassThrough } from 'stream';
import { WebUiConfig, getInitialWebUiToken, webUiPathWrapper } from '@/napcat-webui-backend/index';

const isWindows = os.platform() === 'win32';

// 安全地从查询参数中提取字符串值，防止类型混淆
const getQueryStringParam = (param: any): string => {
  if (Array.isArray(param)) {
    return String(param[0] || '');
  }
  return String(param || '');
};

// 获取系统根目录列表（Windows返回盘符列表，其他系统返回['/']）
const getRootDirs = async (): Promise<string[]> => {
  if (!isWindows) return ['/'];

  const drives: string[] = [];
  for (let i = 65; i <= 90; i++) {
    const driveLetter = String.fromCharCode(i);
    try {
      await fsProm.access(`${driveLetter}:\\`);
      drives.push(`${driveLetter}:`);
    } catch {
      continue;
    }
  }
  return drives.length > 0 ? drives : ['C:'];
};

// 规范化路径并进行安全验证
const normalizePath = (inputPath: string): string => {
  if (!inputPath) {
    return isWindows ? process.env['USERPROFILE'] || 'C:\\' : '/';
  }

  const cleanedPath = inputPath.replace(/[\x01-\x1f\x7f]/g, '');

  if (isWindows && /^[A-Z]:[\\/]*$/i.test(cleanedPath)) {
    return cleanedPath.slice(0, 2) + '\\';
  }

  if (containsPathTraversal(cleanedPath)) {
    throw new Error('Invalid path: path traversal detected');
  }

  const normalized = path.resolve(cleanedPath);

  if (containsPathTraversal(normalized)) {
    throw new Error('Invalid path: path traversal detected after normalization');
  }

  return normalized.replace(/[\\/]+/g, path.sep);
};

const containsPathTraversal = (inputPath: string): boolean => {
  let decodedPath = inputPath;
  try {
    decodedPath = decodeURIComponent(inputPath);
  } catch {
    // ignore
  }

  const normalizedForCheck = decodedPath.replace(/\\/g, '/');

  const dangerousPatterns = [
    /\.\.\//, /\/\.\./, /^\.\./, /\.\.$/, /\.\.\\/, /\\\.\./,
    /%2e%2e/i, /%252e%252e/i, /\.\.\x00/, /\0/,
  ];

  return dangerousPatterns.some(pattern => pattern.test(normalizedForCheck));
};

interface FileInfo {
  name: string;
  isDirectory: boolean;
  size: number;
  mtime: Date;
}

const SYSTEM_FILES = new Set(['pagefile.sys', 'swapfile.sys', 'hiberfil.sys', 'System Volume Information']);

const isWebUIConfigFile = (filePath: string): boolean => {
  if (!filePath.includes('webui.json')) return false;
  const webUIConfigPath = path.resolve(webUiPathWrapper.configPath, 'webui.json').replace(/\\/g, '/');
  const targetPath = path.resolve(filePath).replace(/\\/g, '/');
  return targetPath === webUIConfigPath;
};

const sanitizeWebUIConfig = (content: string): string => {
  try {
    const config = JSON.parse(content);
    if (config.token) config.token = '******';
    return JSON.stringify(config, null, 4);
  } catch {
    return content;
  }
};

const checkSameTypeExists = async (pathToCheck: string, isDirectory: boolean): Promise<boolean> => {
  try {
    const stat = await fsProm.stat(pathToCheck);
    return stat.isDirectory() === isDirectory;
  } catch {
    return false;
  }
};

const decodeFileName = (fileName: string): string => {
  try {
    return Buffer.from(fileName, 'binary').toString('utf8');
  } catch {
    return fileName;
  }
};

export const ListFilesHandler = async (c: Context) => {
  try {
    const requestPath = getQueryStringParam(c.req.query('path')) || (isWindows ? process.env['USERPROFILE'] || 'C:\\' : '/');

    let normalizedPath: string;
    try {
      normalizedPath = normalizePath(requestPath);
    } catch (_pathError) {
      return sendError(c, '无效的文件路径');
    }

    const onlyDirectory = c.req.query('onlyDirectory') === 'true';

    if (isWindows && (!requestPath || requestPath === '/' || requestPath === '\\')) {
      const drives = await getRootDirs();
      const driveInfos: FileInfo[] = await Promise.all(
        drives.map(async (drive) => {
          try {
            const stat = await fsProm.stat(`${drive}\\`);
            return { name: drive, isDirectory: true, size: 0, mtime: stat.mtime };
          } catch {
            return { name: drive, isDirectory: true, size: 0, mtime: new Date() };
          }
        })
      );
      return sendSuccess(c, driveInfos);
    }

    const files = await fsProm.readdir(normalizedPath);
    let fileInfos: FileInfo[] = [];

    for (const file of files) {
      if (SYSTEM_FILES.has(file)) continue;
      try {
        const fullPath = path.join(normalizedPath, file);
        const stat = await fsProm.stat(fullPath);
        fileInfos.push({
          name: file,
          isDirectory: stat.isDirectory(),
          size: stat.size,
          mtime: stat.mtime,
        });
      } catch (_error) {
        continue;
      }
    }

    if (onlyDirectory) {
      fileInfos = fileInfos.filter((info) => info.isDirectory);
    }

    return sendSuccess(c, fileInfos);
  } catch (_error) {
    return sendError(c, '读取目录失败');
  }
};

export const CreateDirHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { path: dirPath } = body as { path?: string };

    let normalizedPath: string;
    try {
      normalizedPath = normalizePath(dirPath || '');
    } catch (_pathError) {
      return sendError(c, '无效的文件路径');
    }

    if (!path.isAbsolute(normalizedPath)) {
      return sendError(c, '路径必须是绝对路径');
    }

    if (await checkSameTypeExists(normalizedPath, true)) {
      return sendError(c, '同名目录已存在');
    }

    await fsProm.mkdir(normalizedPath, { recursive: true });
    return sendSuccess(c, true);
  } catch (_error) {
    return sendError(c, '创建目录失败');
  }
};

export const DeleteHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { path: targetPath } = body as { path?: string };

    let normalizedPath: string;
    try {
      normalizedPath = normalizePath(targetPath || '');
    } catch (_pathError) {
      return sendError(c, '无效的文件路径');
    }

    if (!path.isAbsolute(normalizedPath)) {
      return sendError(c, '路径必须是绝对路径');
    }

    const stat = await fsProm.stat(normalizedPath);
    if (stat.isDirectory()) {
      await fsProm.rm(normalizedPath, { recursive: true });
    } else {
      await fsProm.unlink(normalizedPath);
    }
    return sendSuccess(c, true);
  } catch (_error) {
    return sendError(c, '删除失败');
  }
};

export const BatchDeleteHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { paths } = body as { paths?: string[] };
    for (const targetPath of paths || []) {
      let normalizedPath: string;
      try {
        normalizedPath = normalizePath(targetPath);
      } catch (_pathError) {
        return sendError(c, '无效的文件路径');
      }

      if (!path.isAbsolute(normalizedPath)) {
        return sendError(c, '路径必须是绝对路径');
      }

      const stat = await fsProm.stat(normalizedPath);
      if (stat.isDirectory()) {
        await fsProm.rm(normalizedPath, { recursive: true });
      } else {
        await fsProm.unlink(normalizedPath);
      }
    }
    return sendSuccess(c, true);
  } catch (_error) {
    return sendError(c, '批量删除失败');
  }
};

export const ReadFileHandler = async (c: Context) => {
  try {
    let filePath: string;
    try {
      filePath = normalizePath(getQueryStringParam(c.req.query('path')));
    } catch (_pathError) {
      return sendError(c, '无效的文件路径');
    }

    if (!path.isAbsolute(filePath)) {
      return sendError(c, '路径必须是绝对路径');
    }

    let content = await fsProm.readFile(filePath, 'utf-8');

    if (isWebUIConfigFile(filePath)) {
      content = sanitizeWebUIConfig(content);
    }

    return sendSuccess(c, content);
  } catch (_error) {
    return sendError(c, '读取文件失败');
  }
};

export const WriteFileHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { path: filePath, content } = body as { path?: string; content?: string };

    let normalizedPath: string;
    try {
      normalizedPath = normalizePath(filePath || '');
    } catch (_pathError) {
      return sendError(c, '无效的文件路径');
    }

    if (!path.isAbsolute(normalizedPath)) {
      return sendError(c, '路径必须是绝对路径');
    }

    let finalContent = content;

    if (isWebUIConfigFile(normalizedPath)) {
      try {
        const configToWrite = JSON.parse(content ?? '{}');
        const memoryToken = getInitialWebUiToken();
        if (memoryToken) {
          configToWrite.token = memoryToken;
          finalContent = JSON.stringify(configToWrite, null, 4);
        }
      } catch (_e) {
        return sendError(c, '写入的WebUI配置文件内容格式错误，必须是合法的JSON');
      }
    }

    await fsProm.writeFile(normalizedPath, finalContent ?? '', 'utf-8');
    return sendSuccess(c, true);
  } catch (_error) {
    return sendError(c, '写入文件失败');
  }
};

export const CreateFileHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { path: filePath } = body as { path?: string };

    let normalizedPath: string;
    try {
      normalizedPath = normalizePath(filePath || '');
    } catch (_pathError) {
      return sendError(c, '无效的文件路径');
    }

    if (!path.isAbsolute(normalizedPath)) {
      return sendError(c, '路径必须是绝对路径');
    }

    if (await checkSameTypeExists(normalizedPath, false)) {
      return sendError(c, '同名文件已存在');
    }

    await fsProm.writeFile(normalizedPath, '', 'utf-8');
    return sendSuccess(c, true);
  } catch (_error) {
    return sendError(c, '创建文件失败');
  }
};

export const RenameHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { oldPath, newPath } = body as { oldPath?: string; newPath?: string };

    let normalizedOldPath: string;
    let normalizedNewPath: string;
    try {
      normalizedOldPath = normalizePath(oldPath || '');
      normalizedNewPath = normalizePath(newPath || '');
    } catch (_pathError) {
      return sendError(c, '无效的文件路径');
    }

    if (!path.isAbsolute(normalizedOldPath) || !path.isAbsolute(normalizedNewPath)) {
      return sendError(c, '路径必须是绝对路径');
    }

    await fsProm.rename(normalizedOldPath, normalizedNewPath);
    return sendSuccess(c, true);
  } catch (_error) {
    return sendError(c, '重命名失败');
  }
};

export const MoveHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { sourcePath, targetPath } = body as { sourcePath?: string; targetPath?: string };

    let normalizedSourcePath: string;
    let normalizedTargetPath: string;
    try {
      normalizedSourcePath = normalizePath(sourcePath || '');
      normalizedTargetPath = normalizePath(targetPath || '');
    } catch (_pathError) {
      return sendError(c, '无效的文件路径');
    }

    if (!path.isAbsolute(normalizedSourcePath) || !path.isAbsolute(normalizedTargetPath)) {
      return sendError(c, '路径必须是绝对路径');
    }

    await fsProm.rename(normalizedSourcePath, normalizedTargetPath);
    return sendSuccess(c, true);
  } catch (_error) {
    return sendError(c, '移动失败');
  }
};

export const BatchMoveHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { items } = body as { items?: Array<{ sourcePath?: string; targetPath?: string }> };
    for (const { sourcePath, targetPath } of items || []) {
      let normalizedSourcePath: string;
      let normalizedTargetPath: string;
      try {
        normalizedSourcePath = normalizePath(sourcePath || '');
        normalizedTargetPath = normalizePath(targetPath || '');
      } catch (_pathError) {
        return sendError(c, '无效的文件路径');
      }

      if (!path.isAbsolute(normalizedSourcePath) || !path.isAbsolute(normalizedTargetPath)) {
        return sendError(c, '路径必须是绝对路径');
      }

      await fsProm.rename(normalizedSourcePath, normalizedTargetPath);
    }
    return sendSuccess(c, true);
  } catch (_error) {
    return sendError(c, '批量移动失败');
  }
};

export const DownloadHandler = async (c: Context) => {
  try {
    let filePath: string;
    try {
      filePath = normalizePath(getQueryStringParam(c.req.query('path')));
    } catch (_pathError) {
      return sendError(c, '无效的文件路径');
    }

    if (!filePath) {
      return sendError(c, '参数错误');
    }

    if (!path.isAbsolute(filePath)) {
      return sendError(c, '路径必须是绝对路径');
    }

    const stat = await fsProm.stat(filePath);

    let filename = path.basename(filePath);
    if (stat.isDirectory()) {
      filename = path.basename(filePath) + '.zip';
      const zipStream = new PassThrough();
      compressing.zip.compressDir(filePath, zipStream as unknown as fs.WriteStream).catch((err) => {
        console.error('压缩目录失败:', err);
      });
      const { Readable } = await import('node:stream');
      const readable = Readable.toWeb(zipStream as any) as ReadableStream;
      return new Response(readable, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        },
      });
    }

    const stream = fs.createReadStream(filePath);
    const { Readable } = await import('node:stream');
    const readable = Readable.toWeb(stream) as ReadableStream;
    return new Response(readable, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(stat.size),
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (_error) {
    return sendError(c, '下载失败');
  }
};

export const BatchDownloadHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { paths } = body as { paths?: string[] };
    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return sendError(c, '参数错误');
    }

    const zipStream = new compressing.zip.Stream();
    for (const filePath of paths) {
      let normalizedPath: string;
      try {
        normalizedPath = normalizePath(filePath);
      } catch (_pathError) {
        return sendError(c, '无效的文件路径');
      }

      if (!path.isAbsolute(normalizedPath)) {
        return sendError(c, '路径必须是绝对路径');
      }

      const stat = await fsProm.stat(normalizedPath);
      if (stat.isDirectory()) {
        zipStream.addEntry(normalizedPath, { relativePath: '' });
      } else {
        const safeName = path.basename(normalizedPath);
        zipStream.addEntry(normalizedPath, { relativePath: safeName });
      }
    }

    const { Readable } = await import('node:stream');
    const webStream = Readable.toWeb(zipStream as any) as ReadableStream;
    return new Response(webStream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename=files.zip',
      },
    });
  } catch (_error) {
    return sendError(c, '下载失败');
  }
};

const MAX_FILE_SIZE = 100 * 1024 * 1024, MAX_FILES = 20;

export const UploadHandler = async (c: Context) => {
  try {
    const uploadPath = getQueryStringParam(c.req.query('path'));
    if (!uploadPath && isWindows) {
      return sendError(c, '上传路径不能为空');
    }
    if (isWindows && uploadPath === '\\') {
      return sendError(c, '根目录不允许上传文件');
    }

    const body = await c.req.parseBody({ all: true });
    const filesInput = body['files'];
    const files: File[] = Array.isArray(filesInput)
      ? filesInput.filter((f): f is File => f instanceof File)
      : (filesInput instanceof File ? [filesInput] : []);

    if (files.length === 0) {
      return sendError(c, 'No file uploaded');
    }
    if (files.length > MAX_FILES) {
      return sendError(c, '文件数量超过限制（最多20个文件）');
    }

    const destPath = uploadPath ? uploadPath : (isWindows ? process.env['USERPROFILE'] || 'C:\\' : '/');
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return sendError(c, '文件大小超过限制（最大100MB）');
      }
      const decodedName = decodeFileName(file.name || '');
      const fullPath = decodedName.includes('/') || decodedName.includes('\\')
        ? path.join(destPath, path.dirname(decodedName))
        : destPath;
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      const fileName = path.basename(decodedName);
      let targetPath = path.join(fullPath, decodedName);
      if (fs.existsSync(targetPath)) {
        const ext = path.extname(fileName);
        const name = path.basename(fileName, ext);
        targetPath = path.join(fullPath, `${name}-${Date.now()}${ext}`);
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(targetPath, buffer);
    }

    return sendSuccess(c, true, '文件上传成功');
  } catch (_error) {
    let errorMessage = '文件上传失败';
    if (_error instanceof Error) {
      errorMessage = _error.message;
    }
    return sendError(c, errorMessage);
  }
};

const SUPPORTED_FONT_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.otf'];

export const UploadWebUIFontHandler = async (c: Context) => {
  try {
    const body = await c.req.parseBody({ all: true });
    const file = body['file'] as File | undefined;

    if (!file || !(file instanceof File)) {
      return sendError(c, 'No font file uploaded');
    }
    if (file.size > 40 * 1024 * 1024) {
      return sendError(c, '字体文件大小超过限制（40MB）');
    }

    const ext = path.extname(file.name || '').toLowerCase();
    if (!SUPPORTED_FONT_EXTENSIONS.includes(ext)) {
      return sendError(c, '只支持 WOFF/WOFF2/TTF/OTF 格式的字体文件');
    }

    const fontsPath = path.dirname(WebUiConfig.GetWebUIFontPathSync());
    if (!fs.existsSync(fontsPath)) {
      fs.mkdirSync(fontsPath, { recursive: true });
    }

    const oldFiles = fs.existsSync(fontsPath) ? fs.readdirSync(fontsPath) : [];
    for (const f of oldFiles) {
      const ext = path.extname(f).toLowerCase();
      const name = path.basename(f, ext);
      if (SUPPORTED_FONT_EXTENSIONS.includes(ext) && (name === 'webui' || name === 'CustomFont')) {
        try { fs.unlinkSync(path.join(fontsPath, f)); } catch (_e) { }
      }
    }

    const targetPath = path.join(fontsPath, `CustomFont${ext}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(targetPath, buffer);

    return sendSuccess(c, true, '字体文件上传成功');
  } catch (error) {
    let errorMessage = '字体文件上传失败';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return sendError(c, errorMessage);
  }
};

export const DeleteWebUIFontHandler = async (c: Context) => {
  try {
    const fontPath = await WebUiConfig.GetWebUIFontPath();
    const exists = await WebUiConfig.CheckWebUIFontExist();

    if (!exists || !fontPath) {
      return sendSuccess(c, true);
    }

    await fsProm.unlink(fontPath);
    return sendSuccess(c, true);
  } catch (_error) {
    return sendError(c, '删除字体文件失败');
  }
};

export const CheckWebUIFontExistHandler = async (c: Context) => {
  try {
    const exists = await WebUiConfig.CheckWebUIFontExist();
    return sendSuccess(c, exists);
  } catch (_error) {
    return sendError(c, '检查字体文件失败');
  }
};
