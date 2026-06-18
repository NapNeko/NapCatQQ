import { Router } from 'express';

import { NapCatGetConfigHandler, NapCatSetConfigHandler, NapCatGetUinConfigHandler, NapCatSetUinConfigHandler } from '@/napcat-webui-backend/src/api/NapCatConfig';

const router: Router = Router();

// router:获取 NapCat 配置（napcat.json 登录前配置）
router.get('/GetConfig', NapCatGetConfigHandler);
// router:设置 NapCat 配置（napcat.json 登录前配置）
router.post('/SetConfig', NapCatSetConfigHandler);
// router:获取 NapCat per-uin 配置（napcat_{uin}.json 登录后配置）
router.get('/GetUinConfig', NapCatGetUinConfigHandler);
// router:设置 NapCat per-uin 配置（napcat_{uin}.json 登录后配置）
router.post('/SetUinConfig', NapCatSetUinConfigHandler);

export { router as NapCatConfigRouter };
