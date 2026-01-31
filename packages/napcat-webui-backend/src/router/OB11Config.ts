import { Router } from 'express';
import multer from 'multer';
import { join } from 'node:path';
import os from 'node:os';
import { WebUiConfig } from '@/napcat-webui-backend/index';

import { OB11GetConfigHandler, OB11SetConfigHandler } from '@/napcat-webui-backend/src/api/OB11Config';
import { BackupExportConfigHandler, BackupImportConfigHandler } from '@/napcat-webui-backend/src/api/BackupConfig';

const router: Router = Router();

// 延迟初始化multer配置
const getUpload = () => {
  // 使用系统临时目录作为基础路径，方便多个napcat用户统一读取使用
  const tmpPath = join(os.tmpdir(), 'napcat-upload');
  // 获取上传大小限制，默认50MB，最大200MB
  let uploadSizeLimit = 50;
  try {
    // 使用同步方式获取配置
    uploadSizeLimit = WebUiConfig?.WebUiConfigData?.uploadSizeLimit || 50;
  } catch (error) {
    // 如果获取失败，使用默认值
    console.warn('获取上传大小限制失败:', error);
  }
  // 确保不超过最大限制
  uploadSizeLimit = Math.min(uploadSizeLimit, 200);
  return multer({
    dest: tmpPath,
    limits: {
      fileSize: uploadSizeLimit * 1024 * 1024 // 转换为字节
    }
  });
};

// router:读取配置
router.post('/GetConfig', OB11GetConfigHandler);
// router:写入配置
router.post('/SetConfig', OB11SetConfigHandler);
// router:导出配置
router.get('/ExportConfig', BackupExportConfigHandler);
// router:导入配置
router.post('/ImportConfig', (req, res, next) => {
  const upload = getUpload();
  upload.single('configFile')(req, res, next);
}, BackupImportConfigHandler);

export { router as OB11ConfigRouter };
