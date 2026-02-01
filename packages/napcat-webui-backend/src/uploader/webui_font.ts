import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request, Response, RequestHandler } from 'express';
import { WebUiConfig } from '@/napcat-webui-backend/index';

// 支持的字体格式
const SUPPORTED_FONT_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.otf'];

// 清理旧的字体文件
const cleanOldFontFiles = (fontsPath: string) => {
  try {
    // 确保字体目录存在
    if (!fs.existsSync(fontsPath)) {
      return;
    }

    // 遍历目录下所有文件
    const files = fs.readdirSync(fontsPath);

    for (const file of files) {
      // 检查文件名是否以 webui 或 CustomFont 开头，且是支持的字体扩展名
      const ext = path.extname(file).toLowerCase();
      const name = path.basename(file, ext);

      if (SUPPORTED_FONT_EXTENSIONS.includes(ext) && (name === 'webui' || name === 'CustomFont')) {
        try {
          fs.unlinkSync(path.join(fontsPath, file));
        } catch (e) {
          console.error(`Failed to delete old font file ${file}:`, e);
        }
      }
    }
  } catch (err) {
    console.error('Failed to clean old font files:', err);
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
    // 强制文件名为 CustomFont，保留原始扩展名
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `CustomFont${ext}`);
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
