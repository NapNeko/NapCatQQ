import { Router } from 'express';
import { PackageInfoHandler } from '../api/BaseInfo';

const router = Router();
// router: 获取nc的package.json信息
router.get('/PackageInfo', PackageInfoHandler);

export { router as BaseRouter };
