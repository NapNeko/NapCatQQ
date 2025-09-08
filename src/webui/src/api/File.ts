import type { RequestHandler } from 'express';
import { sendError, sendSuccess } from '../utils/response';
import fsProm from 'fs/promises';
import fs from 'fs';
import path from 'path';
import os from 'os';
import compressing from 'compressing';
import { PassThrough } from 'stream';
import multer from 'multer';
import webUIFontUploader from '../uploader/webui_font';
import diskUploader from '../uploader/disk';
import { WebUiConfig, getInitialWebUiToken, webUiPathWrapper } from '@/webui';

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

// 规范化路径并进行安全验证
const normalizePath = (inputPath: string): string => {
    if (!inputPath) {
        // 对于空路径，Windows返回用户主目录，其他系统返回根目录
        return isWindows ? process.env['USERPROFILE'] || 'C:\\' : '/';
    }
    
    // 如果是Windows且输入为纯盘符（可能带或不带斜杠），统一返回 "X:\"
    if (isWindows && /^[A-Z]:[\\/]*$/i.test(inputPath)) {
        return inputPath.slice(0, 2) + '\\';
    }
    
    // 安全验证：检查是否包含危险的路径遍历模式（在规范化之前）
    if (containsPathTraversal(inputPath)) {
        throw new Error('Invalid path: path traversal detected');
    }
    
    // 进行路径规范化
    const normalized = path.resolve(inputPath);
    
    // 再次检查规范化后的路径，确保没有绕过安全检查
    if (containsPathTraversal(normalized)) {
        throw new Error('Invalid path: path traversal detected after normalization');
    }
    
    return normalized;
};

// 检查路径是否包含路径遍历攻击模式
const containsPathTraversal = (inputPath: string): boolean => {
    // 将路径统一为正斜杠格式进行检查
    const normalizedForCheck = inputPath.replace(/\\/g, '/');
    
    // 检查危险模式
    const dangerousPatterns = [
        /\.\.\//, // ../ 模式
        /\/\.\./, // /.. 模式
        /^\.\./, // 以.. 开头
        /\.\.$/, // 以.. 结尾
    ];
    
    return dangerousPatterns.some(pattern => pattern.test(normalizedForCheck));
};

interface FileInfo {
    name: string;
    isDirectory: boolean;
    size: number;
    mtime: Date;
}

// 添加系统文件黑名单
const SYSTEM_FILES = new Set(['pagefile.sys', 'swapfile.sys', 'hiberfil.sys', 'System Volume Information']);

// 检查是否为WebUI配置文件
const isWebUIConfigFile = (filePath: string): boolean => {
    // 先用字符串快速筛选
    if (!filePath.includes('webui.json')) {
        return false;
    }
    
    // 进入更严格的路径判断 - 统一路径分隔符为 /
    const webUIConfigPath = path.resolve(webUiPathWrapper.configPath, 'webui.json').replace(/\\/g, '/');
    const targetPath = path.resolve(filePath).replace(/\\/g, '/');
    
    // 统一分隔符后进行路径比较
    return targetPath === webUIConfigPath;
};

// WebUI配置文件脱敏处理
const sanitizeWebUIConfig = (content: string): string => {
    try {
        const config = JSON.parse(content);
        if (config.token) {
            config.token = '******';
        }
        return JSON.stringify(config, null, 4);
    } catch {
        // 如果解析失败，返回原内容
        return content;
    }
};

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
    const webuiToken = await WebUiConfig.GetWebUIConfig();
    if (webuiToken.defaultToken) {
        return sendError(res, '默认密码禁止使用');
    }
    try {
        const requestPath = getQueryStringParam(req.query['path']) || (isWindows ? process.env['USERPROFILE'] || 'C:\\' : '/');
        
        let normalizedPath: string;
        try {
            normalizedPath = normalizePath(requestPath);
        } catch (pathError) {
            return sendError(res, '无效的文件路径');
        }
        
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
        
        let normalizedPath: string;
        try {
            normalizedPath = normalizePath(dirPath);
        } catch (pathError) {
            return sendError(res, '无效的文件路径');
        }

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
        
        let normalizedPath: string;
        try {
            normalizedPath = normalizePath(targetPath);
        } catch (pathError) {
            return sendError(res, '无效的文件路径');
        }
        
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
            let normalizedPath: string;
            try {
                normalizedPath = normalizePath(targetPath);
            } catch (pathError) {
                return sendError(res, '无效的文件路径');
            }
            
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
        let filePath: string;
        try {
            filePath = normalizePath(getQueryStringParam(req.query['path']));
        } catch (pathError) {
            return sendError(res, '无效的文件路径');
        }
        
        let content = await fsProm.readFile(filePath, 'utf-8');
        
        // 如果是WebUI配置文件，对token进行脱敏处理
        if (isWebUIConfigFile(filePath)) {
            content = sanitizeWebUIConfig(content);
        }
        
        return sendSuccess(res, content);
    } catch (error) {
        return sendError(res, '读取文件失败');
    }
};

// 写入文件内容
export const WriteFileHandler: RequestHandler = async (req, res) => {
    try {
        const { path: filePath, content } = req.body;
        
        // 安全的路径规范化，如果检测到路径遍历攻击会抛出异常
        let normalizedPath: string;
        try {
            normalizedPath = normalizePath(filePath);
        } catch (pathError) {
            return sendError(res, '无效的文件路径');
        }
        
        let finalContent = content;
        
        // 检查是否为WebUI配置文件
        if (isWebUIConfigFile(normalizedPath)) {
            try {
                // 解析要写入的配置
                const configToWrite = JSON.parse(content);
                // 获取内存中的token，覆盖前端传来的token
                const memoryToken = getInitialWebUiToken();
                if (memoryToken) {
                    configToWrite.token = memoryToken;
                    finalContent = JSON.stringify(configToWrite, null, 4);
                }
            } catch (e) {
                // 如果解析失败 说明不符合json格式 不允许写入
                return sendError(res, '写入的WebUI配置文件内容格式错误，必须是合法的JSON');
            }
        }
        
        await fsProm.writeFile(normalizedPath, finalContent, 'utf-8');
        return sendSuccess(res, true);
    } catch (error) {
        return sendError(res, '写入文件失败');
    }
};

// 创建新文件
export const CreateFileHandler: RequestHandler = async (req, res) => {
    try {
        const { path: filePath } = req.body;
        
        let normalizedPath: string;
        try {
            normalizedPath = normalizePath(filePath);
        } catch (pathError) {
            return sendError(res, '无效的文件路径');
        }

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
        
        let normalizedOldPath: string;
        let normalizedNewPath: string;
        try {
            normalizedOldPath = normalizePath(oldPath);
            normalizedNewPath = normalizePath(newPath);
        } catch (pathError) {
            return sendError(res, '无效的文件路径');
        }
        
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
        
        let normalizedSourcePath: string;
        let normalizedTargetPath: string;
        try {
            normalizedSourcePath = normalizePath(sourcePath);
            normalizedTargetPath = normalizePath(targetPath);
        } catch (pathError) {
            return sendError(res, '无效的文件路径');
        }
        
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
            let normalizedSourcePath: string;
            let normalizedTargetPath: string;
            try {
                normalizedSourcePath = normalizePath(sourcePath);
                normalizedTargetPath = normalizePath(targetPath);
            } catch (pathError) {
                return sendError(res, '无效的文件路径');
            }
            
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
        let filePath: string;
        try {
            filePath = normalizePath(getQueryStringParam(req.query['path']));
        } catch (pathError) {
            return sendError(res, '无效的文件路径');
        }
        
        if (!filePath) {
            return sendError(res, '参数错误');
        }

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
            let normalizedPath: string;
            try {
                normalizedPath = normalizePath(filePath);
            } catch (pathError) {
                return sendError(res, '无效的文件路径');
            }
            
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

// 修改上传处理方法
export const UploadHandler: RequestHandler = async (req, res) => {
    try {
        await diskUploader(req, res);
        return sendSuccess(res, true, '文件上传成功', true);
    } catch (error) {
        let errorMessage = '文件上传失败';

        if (error instanceof multer.MulterError) {
            switch (error.code) {
                case 'LIMIT_FILE_SIZE':
                    errorMessage = '文件大小超过限制（40MB）';
                    break;
                case 'LIMIT_UNEXPECTED_FILE':
                    errorMessage = '无效的文件上传字段';
                    break;
                default:
                    errorMessage = `上传错误: ${error.message}`;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        return sendError(res, errorMessage, true);
    }
};

// 上传WebUI字体文件处理方法
export const UploadWebUIFontHandler: RequestHandler = async (req, res) => {
    try {
        await webUIFontUploader(req, res);
        return sendSuccess(res, true, '字体文件上传成功', true);
    } catch (error) {
        let errorMessage = '字体文件上传失败';

        if (error instanceof multer.MulterError) {
            switch (error.code) {
                case 'LIMIT_FILE_SIZE':
                    errorMessage = '字体文件大小超过限制（40MB）';
                    break;
                case 'LIMIT_UNEXPECTED_FILE':
                    errorMessage = '无效的文件上传字段';
                    break;
                default:
                    errorMessage = `上传错误: ${error.message}`;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        return sendError(res, errorMessage, true);
    }
};

// 删除WebUI字体文件处理方法
export const DeleteWebUIFontHandler: RequestHandler = async (_req, res) => {
    try {
        const fontPath = WebUiConfig.GetWebUIFontPath();
        const exists = await WebUiConfig.CheckWebUIFontExist();

        if (!exists) {
            return sendSuccess(res, true);
        }

        await fsProm.unlink(fontPath);
        return sendSuccess(res, true);
    } catch (error) {
        return sendError(res, '删除字体文件失败');
    }
};
