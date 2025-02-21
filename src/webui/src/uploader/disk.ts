import multer from 'multer';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
const isWindows = process.platform === 'win32';

// 修改：使用 Buffer 转码文件名，解决文件上传时乱码问题
const decodeFileName = (fileName: string): string => {
    try {
        return Buffer.from(fileName, 'binary').toString('utf8');
    } catch {
        return fileName;
    }
};

export const createDiskStorage = (uploadPath: string) => {
    return multer.diskStorage({
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
};

export const createDiskUpload = (uploadPath: string) => {
    const upload = multer({ storage: createDiskStorage(uploadPath) }).array('files');
    return upload;
};

const diskUploader = (req: Request, res: Response) => {
    const uploadPath = (req.query['path'] || '') as string;
    return new Promise((resolve, reject) => {
        createDiskUpload(uploadPath)(req, res, (error) => {
            if (error) {
                // 错误处理
                return reject(error);
            }
            return resolve(true);
        });
    });
};
export default diskUploader;
