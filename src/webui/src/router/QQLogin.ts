import { Router } from 'express';
import { QQCheckLoginStatusHandler, QQGetQuickLoginListHandler } from '../api/QQLogin';

const router = Router();
router.all('/GetQuickLoginList', QQGetQuickLoginListHandler)
router.post('/CheckLoginStatus', QQCheckLoginStatusHandler);
export { router as QQLoginRouter };