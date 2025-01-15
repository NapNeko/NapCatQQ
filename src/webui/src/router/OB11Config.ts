import { Router } from 'express';

import { OB11GetConfigHandler, OB11SetConfigHandler } from '@webapi/api/OB11Config';

const router = Router();
// router:读取配置
router.post('/GetConfig', OB11GetConfigHandler);
// router:写入配置
router.post('/SetConfig', OB11SetConfigHandler);

export { router as OB11ConfigRouter };
