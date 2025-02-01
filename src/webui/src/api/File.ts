import type { RequestHandler } from 'express';
import { sendError, sendSuccess } from '../utils/response';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const isWindows = os.platform() === 'win32';

// 获取系统根目录列表（Windows返回盘符列表，其他系统返回['/']）
const getRootDirs = async (): Promise<string[]> => {
    if (!isWindows) return ['/'];

    // Windows 驱动器字母 (A-Z)
    const drives: string[] = [];
    for (let i = 65; i <= 90; i++) {
        const driveLetter = String.fromCharCode(i);
        try {
            await fs.access(`${driveLetter}:\\`);
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

// 检查文件或目录是否存在
const checkExists = async (pathToCheck: string): Promise<boolean> => {
    try {
        await fs.access(pathToCheck);
        return true;
    } catch {
        return false;
    }
};

// 检查同类型的文件或目录是否存在
const checkSameTypeExists = async (pathToCheck: string, isDirectory: boolean): Promise<boolean> => {
    try {
        const stat = await fs.stat(pathToCheck);
        // 只有当类型相同时才认为是冲突
        return stat.isDirectory() === isDirectory;
    } catch {
        return false;
    }
};

// 获取目录内容
export const ListFilesHandler: RequestHandler = async (req, res) => {
    try {
        const requestPath = (req.query.path as string) || (isWindows ? 'C:\\' : '/');
        const normalizedPath = normalizePath(requestPath);

        // 如果是根路径且在Windows系统上，返回盘符列表
        if (isWindows && (!requestPath || requestPath === '/' || requestPath === '\\')) {
            const drives = await getRootDirs();
            const driveInfos: FileInfo[] = await Promise.all(
                drives.map(async (drive) => {
                    try {
                        const stat = await fs.stat(`${drive}\\`);
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

        const files = await fs.readdir(normalizedPath);
        const fileInfos: FileInfo[] = [];

        for (const file of files) {
            // 跳过系统文件
            if (SYSTEM_FILES.has(file)) continue;

            try {
                const fullPath = path.join(normalizedPath, file);
                const stat = await fs.stat(fullPath);
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

        return sendSuccess(res, fileInfos);
    } catch (error) {
        // console.error('读取目录失败:', error);
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

        await fs.mkdir(normalizedPath, { recursive: true });
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
        const stat = await fs.stat(normalizedPath);
        if (stat.isDirectory()) {
            await fs.rm(normalizedPath, { recursive: true });
        } else {
            await fs.unlink(normalizedPath);
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
            const stat = await fs.stat(normalizedPath);
            if (stat.isDirectory()) {
                await fs.rm(normalizedPath, { recursive: true });
            } else {
                await fs.unlink(normalizedPath);
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
        const filePath = normalizePath(req.query.path as string);
        const content = await fs.readFile(filePath, 'utf-8');
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
        await fs.writeFile(normalizedPath, content, 'utf-8');
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

        await fs.writeFile(normalizedPath, '', 'utf-8');
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
        await fs.rename(normalizedOldPath, normalizedNewPath);
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
        await fs.rename(normalizedSourcePath, normalizedTargetPath);
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
            await fs.rename(normalizedSourcePath, normalizedTargetPath);
        }
        return sendSuccess(res, true);
    } catch (error) {
        return sendError(res, '批量移动失败');
    }
};
