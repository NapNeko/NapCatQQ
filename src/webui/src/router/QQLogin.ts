import { Router } from 'express';
import { QQCheckLoginStatusHandler, QQGetQRcodeHandler, QQGetQuickLoginListHandler, QQSetQuickLoginHandler } from '../api/QQLogin';
const router = Router();
router.all('/GetQuickLoginList', QQGetQuickLoginListHandler)
router.post('/CheckLoginStatus', QQCheckLoginStatusHandler);
router.post('/GetQQLoginQrcode', QQGetQRcodeHandler);
router.post('/SetQuickLogin', QQSetQuickLoginHandler);
export { router as QQLoginRouter };