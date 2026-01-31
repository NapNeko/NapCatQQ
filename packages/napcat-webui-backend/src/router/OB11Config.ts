import { Router } from 'express';
import multer from 'multer';
import { join } from 'node:path';
import { webUiPathWrapper } from '@/napcat-webui-backend/index';

import { OB11GetConfigHandler, OB11SetConfigHandler } from '@/napcat-webui-backend/src/api/OB11Config';
import { BackupExportConfigHandler, BackupImportConfigHandler } from '@/napcat-webui-backend/src/api/BackupConfig';

const router: Router = Router();

// 延迟初始化multer配置，避免在webUiPathWrapper初始化前访问
const getUpload = () => {
  const tmpPath = join(webUiPathWrapper.cachePath, './tmp');
  return multer({ dest: tmpPath });
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
