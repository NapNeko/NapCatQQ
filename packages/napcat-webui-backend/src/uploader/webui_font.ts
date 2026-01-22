import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request, Response, RequestHandler } from 'express';
import { WebUiConfig } from '@/napcat-webui-backend/index';

// 支持的字体格式
const SUPPORTED_FONT_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.otf'];

// 清理旧的字体文件
const cleanOldFontFiles = (fontsPath: string) => {
  for (const ext of SUPPORTED_FONT_EXTENSIONS) {
    const fontPath = path.join(fontsPath, `webui${ext}`);
    try {
      if (fs.existsSync(fontPath)) {
        fs.unlinkSync(fontPath);
      }
    } catch {
      // 忽略删除失败
    }
  }
};

export const webUIFontStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    try {
      const fontsPath = path.dirname(WebUiConfig.GetWebUIFontPathSync());
      // 确保字体目录存在
      fs.mkdirSync(fontsPath, { recursive: true });
      // 清理旧的字体文件
      cleanOldFontFiles(fontsPath);
      cb(null, fontsPath);
    } catch (error) {
      // 确保错误信息被正确传递
      cb(new Error(`创建字体目录失败：${(error as Error).message}`), '');
    }
  },
  filename: (_, file, cb) => {
    // 保留原始扩展名，统一文件名为 webui
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `webui${ext}`);
  },
});

export const webUIFontUpload: RequestHandler = multer({
  storage: webUIFontStorage,
  fileFilter: (_, file, cb) => {
    // 验证文件类型
    const ext = path.extname(file.originalname).toLowerCase();
    if (!SUPPORTED_FONT_EXTENSIONS.includes(ext)) {
      cb(new Error('只支持 WOFF/WOFF2/TTF/OTF 格式的字体文件'));
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
        return reject(error);
      }
      return resolve(true);
    });
  });
};
export default webUIFontUploader;
