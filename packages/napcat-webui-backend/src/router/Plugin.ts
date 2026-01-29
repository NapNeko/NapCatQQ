import { Router } from 'express';
import {
  GetPluginListHandler,
  SetPluginStatusHandler,
  UninstallPluginHandler,
  GetPluginConfigHandler,
  SetPluginConfigHandler,
  RegisterPluginManagerHandler,
  PluginConfigSSEHandler,
  PluginConfigChangeHandler
} from '@/napcat-webui-backend/src/api/Plugin';
import {
  GetPluginStoreListHandler,
  GetPluginStoreDetailHandler,
  InstallPluginFromStoreHandler,
  InstallPluginFromStoreSSEHandler
} from '@/napcat-webui-backend/src/api/PluginStore';

const router: Router = Router();

router.get('/List', GetPluginListHandler);
router.post('/SetStatus', SetPluginStatusHandler);
router.post('/Uninstall', UninstallPluginHandler);
router.get('/Config', GetPluginConfigHandler);
router.post('/Config', SetPluginConfigHandler);
router.get('/Config/SSE', PluginConfigSSEHandler);
router.post('/Config/Change', PluginConfigChangeHandler);
router.post('/RegisterManager', RegisterPluginManagerHandler);

// 插件商店相关路由
router.get('/Store/List', GetPluginStoreListHandler);
router.get('/Store/Detail/:id', GetPluginStoreDetailHandler);
router.post('/Store/Install', InstallPluginFromStoreHandler);
router.get('/Store/Install/SSE', InstallPluginFromStoreSSEHandler);

export { router as PluginRouter };
