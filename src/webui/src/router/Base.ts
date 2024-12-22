import { Router } from 'express';
import { PackageInfoHandler, QQVersionHandler } from '../api/BaseInfo';
import { StatusRealTimeHandler } from "@webapi/api/Status";

const router = Router();
// router: 获取nc的package.json信息
router.get('/QQVersion', QQVersionHandler);
router.get('/PackageInfo', PackageInfoHandler);
router.get('/GetSysStatusRealTime', StatusRealTimeHandler);

export { router as BaseRouter };
