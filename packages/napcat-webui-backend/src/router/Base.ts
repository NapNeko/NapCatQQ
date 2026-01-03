import { Router } from 'express';
import { GetThemeConfigHandler, GetNapCatVersion, QQVersionHandler, SetThemeConfigHandler, getLatestTagHandler, getAllReleasesHandler } from '../api/BaseInfo';
import { StatusRealTimeHandler } from '@/napcat-webui-backend/src/api/Status';
import { GetProxyHandler } from '../api/Proxy';

const router = Router();
// router: 获取nc的package.json信息
router.get('/QQVersion', QQVersionHandler);
router.get('/GetNapCatVersion', GetNapCatVersion);
router.get('/getLatestTag', getLatestTagHandler);
router.get('/getAllReleases', getAllReleasesHandler);
router.get('/GetSysStatusRealTime', StatusRealTimeHandler);
router.get('/proxy', GetProxyHandler);
router.get('/Theme', GetThemeConfigHandler);
router.post('/SetTheme', SetThemeConfigHandler);

export { router as BaseRouter };
