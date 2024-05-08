import { Router } from 'express';
import { QQCheckLoginStatusHandler, QQGetQRcodeHandler, QQGetQuickLoginListHandler } from '../api/QQLogin';

const router = Router();
router.all('/GetQuickLoginList', QQGetQuickLoginListHandler)
router.post('/CheckLoginStatus', QQCheckLoginStatusHandler);
router.post('/GetQQLoginQrcode', QQGetQRcodeHandler);
export { router as QQLoginRouter };