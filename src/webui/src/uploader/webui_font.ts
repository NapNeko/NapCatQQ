import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request, Response } from 'express';
import { WebUiConfig } from '@/webui';

export const webUIFontStorage = multer.diskStorage({
    destination: (_, __, cb) => {
        try {
            const fontsPath = path.dirname(WebUiConfig.GetWebUIFontPath());
            // 确保字体目录存在
            fs.mkdirSync(fontsPath, { recursive: true });
            cb(null, fontsPath);
        } catch (error) {
            // 确保错误信息被正确传递
            cb(new Error(`创建字体目录失败：${(error as Error).message}`), '');
        }
    },
    filename: (_, __, cb) => {
        // 统一保存为webui.woff
        cb(null, 'webui.woff');
    },
});

export const webUIFontUpload = multer({
    storage: webUIFontStorage,
    fileFilter: (_, file, cb) => {
        // 再次验证文件类型
        if (!file.originalname.toLowerCase().endsWith('.woff')) {
            cb(new Error('只支持WOFF格式的字体文件'));
            return;
        }
        cb(null, true);
    },
    limits: {
        fileSize: 40 * 1024 * 1024, // 限制40MB
    },
}).single('file');

const webUIFontUploader = (req: Request, res: Response) => {
    return new Promise((resolve, reject) => {
        webUIFontUpload(req, res, (error) => {
            if (error) {
                // 错误处理
                // sendError(res, error.message, true);
                return reject(error);
            }
            return resolve(true);
        });
    });
};
export default webUIFontUploader;
