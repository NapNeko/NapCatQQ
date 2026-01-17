import { Router } from 'express';
import { GetPluginListHandler, ReloadPluginHandler, SetPluginStatusHandler, UninstallPluginHandler } from '@/napcat-webui-backend/src/api/Plugin';

const router = Router();

router.get('/List', GetPluginListHandler);
router.post('/Reload', ReloadPluginHandler);
router.post('/SetStatus', SetPluginStatusHandler);
router.post('/Uninstall', UninstallPluginHandler);

export { router as PluginRouter };
