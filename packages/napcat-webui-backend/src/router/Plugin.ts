import { Router } from 'express';
import { GetPluginListHandler, ReloadPluginHandler, SetPluginStatusHandler, UninstallPluginHandler } from '@/napcat-webui-backend/src/api/Plugin';
import { GetPluginStoreListHandler, GetPluginStoreDetailHandler, InstallPluginFromStoreHandler } from '@/napcat-webui-backend/src/api/PluginStore';

const router: Router = Router();

router.get('/List', GetPluginListHandler);
router.post('/Reload', ReloadPluginHandler);
router.post('/SetStatus', SetPluginStatusHandler);
router.post('/Uninstall', UninstallPluginHandler);

// 插件商店相关路由
router.get('/Store/List', GetPluginStoreListHandler);
router.get('/Store/Detail/:id', GetPluginStoreDetailHandler);
router.post('/Store/Install', InstallPluginFromStoreHandler);

export { router as PluginRouter };
