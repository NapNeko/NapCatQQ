import { Hono } from 'hono';

import { OB11GetConfigHandler, OB11SetConfigHandler } from '@/napcat-webui-backend/src/api/OB11Config';
import { BackupExportConfigHandler, BackupImportConfigHandler } from '@/napcat-webui-backend/src/api/BackupConfig';

const router = new Hono();

router.post('/GetConfig', OB11GetConfigHandler);
router.post('/SetConfig', OB11SetConfigHandler);
router.get('/ExportConfig', BackupExportConfigHandler);
router.post('/ImportConfig', BackupImportConfigHandler);

export { router as OB11ConfigRouter };
