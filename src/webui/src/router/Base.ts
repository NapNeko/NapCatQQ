import { Router } from 'express';
import { GetThemeConfigHandler, PackageInfoHandler, QQVersionHandler, SetThemeConfigHandler } from '../api/BaseInfo';
import { StatusRealTimeHandler } from '@webapi/api/Status';
import { GetProxyHandler } from '../api/Proxy';

const router = Router();
// router: 获取nc的package.json信息
router.get('/QQVersion', QQVersionHandler);
router.get('/PackageInfo', PackageInfoHandler);
router.get('/GetSysStatusRealTime', StatusRealTimeHandler);
router.get('/proxy', GetProxyHandler);
router.get('/Theme', GetThemeConfigHandler);
router.post('/SetTheme', SetThemeConfigHandler);

export { router as BaseRouter };
