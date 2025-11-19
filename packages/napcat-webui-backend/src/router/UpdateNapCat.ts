/**
 * @file UpdateNapCat路由
 */

import { Router } from 'express';
import { UpdateNapCatHandler } from '@/napcat-webui-backend/src/api/UpdateNapCat';

const router = Router();

// POST /api/UpdateNapCat/update - 更新NapCat
router.post('/update', UpdateNapCatHandler);

export { router as UpdateNapCatRouter };