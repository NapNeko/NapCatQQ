import { Hono } from 'hono';

import { NapCatGetConfigHandler, NapCatSetConfigHandler, NapCatGetUinConfigHandler, NapCatSetUinConfigHandler } from '@/napcat-webui-backend/src/api/NapCatConfig';

const router = new Hono();

router.get('/GetConfig', NapCatGetConfigHandler);
router.post('/SetConfig', NapCatSetConfigHandler);
router.get('/GetUinConfig', NapCatGetUinConfigHandler);
router.post('/SetUinConfig', NapCatSetUinConfigHandler);

export { router as NapCatConfigRouter };
