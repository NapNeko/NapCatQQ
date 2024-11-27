import { Router } from 'express';

import {
    QQCheckLoginStatusHandler,
    QQGetQRcodeHandler,
    QQGetQuickLoginListHandler,
    QQSetQuickLoginHandler,
} from '@webapi/api/QQLogin';

const router = Router();
// router:获取快速登录列表
router.all('/GetQuickLoginList', QQGetQuickLoginListHandler);
// router:检查QQ登录状态
router.post('/CheckLoginStatus', QQCheckLoginStatusHandler);
// router:获取QQ登录二维码
router.post('/GetQQLoginQrcode', QQGetQRcodeHandler);
// router:设置QQ快速登录
router.post('/SetQuickLogin', QQSetQuickLoginHandler);

export { router as QQLoginRouter };
