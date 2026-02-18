import { Router } from 'express';

import { NapCatGetConfigHandler, NapCatSetConfigHandler } from '@/napcat-webui-backend/src/api/NapCatConfig';

const router: Router = Router();

// router:获取 NapCat 配置
router.get('/GetConfig', NapCatGetConfigHandler);
// router:设置 NapCat 配置
router.post('/SetConfig', NapCatSetConfigHandler);

export { router as NapCatConfigRouter };
