import multer from 'multer';
import { Request, Response, RequestHandler } from 'express';
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

export const createDiskUpload = (uploadPath: string): RequestHandler => {
  const upload = multer({
    storage: createDiskStorage(uploadPath),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB 文件大小限制
      files: 20, // 最多同时上传20个文件
      fieldSize: 1024 * 1024, // 1MB 字段大小限制
      fields: 10, // 最多10个字段
    },
  }).array('files');
  return upload;
};

const diskUploader = (req: Request, res: Response) => {
  const uploadPath = (req.query['path'] || '') as string;
  return new Promise((resolve, reject) => {
    createDiskUpload(uploadPath)(req, res, (error) => {
      if (error) {
        // 错误处理
        if (error.code === 'LIMIT_FILE_SIZE') {
          return reject(new Error('文件大小超过限制（最大100MB）'));
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
          return reject(new Error('文件数量超过限制（最多20个文件）'));
        }
        if (error.code === 'LIMIT_FIELD_VALUE') {
          return reject(new Error('字段值大小超过限制'));
        }
        if (error.code === 'LIMIT_FIELD_COUNT') {
          return reject(new Error('字段数量超过限制'));
        }
        return reject(error);
      }
      return resolve(true);
    });
  });
};
export default diskUploader;
