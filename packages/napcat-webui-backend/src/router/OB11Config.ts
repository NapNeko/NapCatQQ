import { Router } from 'express';
import multer from 'multer';

import { OB11GetConfigHandler, OB11SetConfigHandler } from '@/napcat-webui-backend/src/api/OB11Config';
import { BackupExportConfigHandler, BackupImportConfigHandler } from '@/napcat-webui-backend/src/api/BackupConfig';

const router: Router = Router();

// 使用内存存储，配合流式处理
const upload = multer({
  storage: multer.memoryStorage(),
});

// router:读取配置
router.post('/GetConfig', OB11GetConfigHandler);
// router:写入配置
router.post('/SetConfig', OB11SetConfigHandler);
// router:导出配置
router.get('/ExportConfig', BackupExportConfigHandler);
// router:导入配置
router.post('/ImportConfig', upload.single('configFile'), BackupImportConfigHandler);

export { router as OB11ConfigRouter };
