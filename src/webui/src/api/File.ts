import type { RequestHandler, Request } from 'express';
import { sendError, sendSuccess } from '../utils/response';
import fsProm from 'fs/promises';
import fs from 'fs';
import path from 'path';
import os from 'os';
import compressing from 'compressing';
import { PassThrough } from 'stream';
import multer from 'multer';
import { randomUUID } from 'crypto';

const isWindows = os.platform() === 'win32';

// 获取系统根目录列表（Windows返回盘符列表，其他系统返回['/']）
const getRootDirs = async (): Promise<string[]> => {
    if (!isWindows) return ['/'];

    // Windows 驱动器字母 (A-Z)
    const drives: string[] = [];
    for (let i = 65; i <= 90; i++) {
        const driveLetter = String.fromCharCode(i);
        try {
            await fsProm.access(`${driveLetter}:\\`);
            drives.push(`${driveLetter}:`);
        } catch {
            // 如果驱动器不存在或无法访问，跳过
            continue;
        }
    }
    return drives.length > 0 ? drives : ['C:'];
};

// 规范化路径
const normalizePath = (inputPath: string): string => {
    if (!inputPath) return isWindows ? 'C:\\' : '/';
    // 如果是Windows且输入为纯盘符（可能带或不带斜杠），统一返回 "X:\"
    if (isWindows && /^[A-Z]:[\\/]*$/i.test(inputPath)) {
        return inputPath.slice(0, 2) + '\\';
    }
    return path.normalize(inputPath);
};

interface FileInfo {
    name: string;
    isDirectory: boolean;
    size: number;
    mtime: Date;
}

// 添加系统文件黑名单
const SYSTEM_FILES = new Set(['pagefile.sys', 'swapfile.sys', 'hiberfil.sys', 'System Volume Information']);

// 检查同类型的文件或目录是否存在
const checkSameTypeExists = async (pathToCheck: string, isDirectory: boolean): Promise<boolean> => {
    try {
        const stat = await fsProm.stat(pathToCheck);
        // 只有当类型相同时才认为是冲突
        return stat.isDirectory() === isDirectory;
    } catch {
        return false;
    }
};

// 获取目录内容
export const ListFilesHandler: RequestHandler = async (req, res) => {
    try {
        const requestPath = (req.query['path'] as string) || (isWindows ? 'C:\\' : '/');
        const normalizedPath = normalizePath(requestPath);
        const onlyDirectory = req.query['onlyDirectory'] === 'true';

        // 如果是根路径且在Windows系统上，返回盘符列表
        if (isWindows && (!requestPath || requestPath === '/' || requestPath === '\\')) {
            const drives = await getRootDirs();
            const driveInfos: FileInfo[] = await Promise.all(
                drives.map(async (drive) => {
                    try {
                        const stat = await fsProm.stat(`${drive}\\`);
                        return {
                            name: drive,
                            isDirectory: true,
                            size: 0,
                            mtime: stat.mtime,
                        };
                    } catch {
                        return {
                            name: drive,
                            isDirectory: true,
                            size: 0,
                            mtime: new Date(),
                        };
                    }
                })
            );
            return sendSuccess(res, driveInfos);
        }

        const files = await fsProm.readdir(normalizedPath);
        let fileInfos: FileInfo[] = [];

        for (const file of files) {
            // 跳过系统文件
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
            } catch (error) {
                // 忽略无法访问的文件
                // console.warn(`无法访问文件 ${file}:`, error);
                continue;
            }
        }

        // 如果请求参数 onlyDirectory 为 true，则只返回目录信息
        if (onlyDirectory) {
            fileInfos = fileInfos.filter((info) => info.isDirectory);
        }

        return sendSuccess(res, fileInfos);
    } catch (error) {
        console.error('读取目录失败:', error);
        return sendError(res, '读取目录失败');
    }
};

// 创建目录
export const CreateDirHandler: RequestHandler = async (req, res) => {
    try {
        const { path: dirPath } = req.body;
        const normalizedPath = normalizePath(dirPath);

        // 检查是否已存在同类型（目录）
        if (await checkSameTypeExists(normalizedPath, true)) {
            return sendError(res, '同名目录已存在');
        }

        await fsProm.mkdir(normalizedPath, { recursive: true });
        return sendSuccess(res, true);
    } catch (error) {
        return sendError(res, '创建目录失败');
    }
};

// 删除文件/目录
export const DeleteHandler: RequestHandler = async (req, res) => {
    try {
        const { path: targetPath } = req.body;
        const normalizedPath = normalizePath(targetPath);
        const stat = await fsProm.stat(normalizedPath);
        if (stat.isDirectory()) {
            await fsProm.rm(normalizedPath, { recursive: true });
        } else {
            await fsProm.unlink(normalizedPath);
        }
        return sendSuccess(res, true);
    } catch (error) {
        return sendError(res, '删除失败');
    }
};

// 批量删除文件/目录
export const BatchDeleteHandler: RequestHandler = async (req, res) => {
    try {
        const { paths } = req.body;
        for (const targetPath of paths) {
            const normalizedPath = normalizePath(targetPath);
            const stat = await fsProm.stat(normalizedPath);
            if (stat.isDirectory()) {
                await fsProm.rm(normalizedPath, { recursive: true });
            } else {
                await fsProm.unlink(normalizedPath);
            }
        }
        return sendSuccess(res, true);
    } catch (error) {
        return sendError(res, '批量删除失败');
    }
};

// 读取文件内容
export const ReadFileHandler: RequestHandler = async (req, res) => {
    try {
        const filePath = normalizePath(req.query['path'] as string);
        const content = await fsProm.readFile(filePath, 'utf-8');
        return sendSuccess(res, content);
    } catch (error) {
        return sendError(res, '读取文件失败');
    }
};

// 写入文件内容
export const WriteFileHandler: RequestHandler = async (req, res) => {
    try {
        const { path: filePath, content } = req.body;
        const normalizedPath = normalizePath(filePath);
        await fsProm.writeFile(normalizedPath, content, 'utf-8');
        return sendSuccess(res, true);
    } catch (error) {
        return sendError(res, '写入文件失败');
    }
};

// 创建新文件
export const CreateFileHandler: RequestHandler = async (req, res) => {
    try {
        const { path: filePath } = req.body;
        const normalizedPath = normalizePath(filePath);

        // 检查是否已存在同类型（文件）
        if (await checkSameTypeExists(normalizedPath, false)) {
            return sendError(res, '同名文件已存在');
        }

        await fsProm.writeFile(normalizedPath, '', 'utf-8');
        return sendSuccess(res, true);
    } catch (error) {
        return sendError(res, '创建文件失败');
    }
};

// 重命名文件/目录
export const RenameHandler: RequestHandler = async (req, res) => {
    try {
        const { oldPath, newPath } = req.body;
        const normalizedOldPath = normalizePath(oldPath);
        const normalizedNewPath = normalizePath(newPath);
        await fsProm.rename(normalizedOldPath, normalizedNewPath);
        return sendSuccess(res, true);
    } catch (error) {
        return sendError(res, '重命名失败');
    }
};

// 移动文件/目录
export const MoveHandler: RequestHandler = async (req, res) => {
    try {
        const { sourcePath, targetPath } = req.body;
        const normalizedSourcePath = normalizePath(sourcePath);
        const normalizedTargetPath = normalizePath(targetPath);
        await fsProm.rename(normalizedSourcePath, normalizedTargetPath);
        return sendSuccess(res, true);
    } catch (error) {
        return sendError(res, '移动失败');
    }
};

// 批量移动
export const BatchMoveHandler: RequestHandler = async (req, res) => {
    try {
        const { items } = req.body;
        for (const { sourcePath, targetPath } of items) {
            const normalizedSourcePath = normalizePath(sourcePath);
            const normalizedTargetPath = normalizePath(targetPath);
            await fsProm.rename(normalizedSourcePath, normalizedTargetPath);
        }
        return sendSuccess(res, true);
    } catch (error) {
        return sendError(res, '批量移动失败');
    }
};

// 新增：文件下载处理方法（注意流式传输，不将整个文件读入内存）
export const DownloadHandler: RequestHandler = async (req, res) => {
    try {
        const filePath = normalizePath(req.query['path'] as string);
        const stat = await fsProm.stat(filePath);

        res.setHeader('Content-Type', 'application/octet-stream');
        let filename = path.basename(filePath);
        if (stat.isDirectory()) {
            filename = path.basename(filePath) + '.zip';
            res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
            const zipStream = new PassThrough();
            compressing.zip.compressDir(filePath, zipStream as unknown as fs.WriteStream).catch((err) => {
                console.error('压缩目录失败:', err);
                res.end();
            });
            zipStream.pipe(res);
            return;
        }
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    } catch (error) {
        return sendError(res, '下载失败');
    }
};

// 批量下载：将多个文件/目录打包为 zip 文件下载
export const BatchDownloadHandler: RequestHandler = async (req, res) => {
    try {
        const { paths } = req.body as { paths: string[] };
        if (!paths || !Array.isArray(paths) || paths.length === 0) {
            return sendError(res, '参数错误');
        }
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename=files.zip');

        const zipStream = new compressing.zip.Stream();
        // 修改：根据文件类型设置 relativePath
        for (const filePath of paths) {
            const normalizedPath = normalizePath(filePath);
            const stat = await fsProm.stat(normalizedPath);
            if (stat.isDirectory()) {
                zipStream.addEntry(normalizedPath, { relativePath: '' });
            } else {
                zipStream.addEntry(normalizedPath, { relativePath: path.basename(normalizedPath) });
            }
        }
        zipStream.pipe(res);
        res.on('finish', () => {
            zipStream.destroy();
        });
    } catch (error) {
        return sendError(res, '下载失败');
    }
};

// 修改：使用 Buffer 转码文件名，解决文件上传时乱码问题
const decodeFileName = (fileName: string): string => {
    try {
        return Buffer.from(fileName, 'binary').toString('utf8');
    } catch {
        return fileName;
    }
};

// 修改上传处理方法
export const UploadHandler: RequestHandler = (req, res) => {
    const uploadPath = (req.query['path'] || '') as string;

    const storage = multer.diskStorage({
        destination: (
            _: Request,
            file: Express.Multer.File,
            cb: (error: Error | null, destination: string) => void
        ) => {
            try {
                const decodedName = decodeFileName(file.originalname);

                if (!uploadPath) {
                    return cb(new Error('上传路径不能为空'), '');
                }

                if (isWindows && uploadPath === '\\') {
                    return cb(new Error('根目录不允许上传文件'), '');
                }

                // 处理文件夹上传的情况
                if (decodedName.includes('/') || decodedName.includes('\\')) {
                    const fullPath = path.join(uploadPath, path.dirname(decodedName));
                    fs.mkdirSync(fullPath, { recursive: true });
                    cb(null, fullPath);
                } else {
                    cb(null, uploadPath);
                }
            } catch (error) {
                cb(error as Error, '');
            }
        },
        filename: (_: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
            try {
                const decodedName = decodeFileName(file.originalname);
                const fileName = path.basename(decodedName);

                // 检查文件是否存在
                const fullPath = path.join(uploadPath, decodedName);
                if (fs.existsSync(fullPath)) {
                    const ext = path.extname(fileName);
                    const name = path.basename(fileName, ext);
                    cb(null, `${name}-${randomUUID()}${ext}`);
                } else {
                    cb(null, fileName);
                }
            } catch (error) {
                cb(error as Error, '');
            }
        },
    });

    const upload = multer({ storage }).array('files');

    upload(req, res, (err: any) => {
        if (err) {
            return sendError(res, err.message || '文件上传失败');
        }
        return sendSuccess(res, true);
    });
};
