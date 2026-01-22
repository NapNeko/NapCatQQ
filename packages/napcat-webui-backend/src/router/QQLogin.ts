import { Router } from 'express';

import {
  QQCheckLoginStatusHandler,
  QQGetQRcodeHandler,
  QQGetQuickLoginListHandler,
  QQSetQuickLoginHandler,
  QQGetLoginListNewHandler,
  getQQLoginInfoHandler,
  getAutoLoginAccountHandler,
  setAutoLoginAccountHandler,
  QQRefreshQRcodeHandler,
} from '@/napcat-webui-backend/src/api/QQLogin';

const router: Router = Router();
// router:获取快速登录列表
router.all('/GetQuickLoginList', QQGetQuickLoginListHandler);
// router:获取快速登录列表（新）
router.all('/GetQuickLoginListNew', QQGetLoginListNewHandler);
// router:检查QQ登录状态
router.post('/CheckLoginStatus', QQCheckLoginStatusHandler);
// router:获取QQ登录二维码
router.post('/GetQQLoginQrcode', QQGetQRcodeHandler);
// router:设置QQ快速登录
router.post('/SetQuickLogin', QQSetQuickLoginHandler);
// router:获取QQ登录信息
router.post('/GetQQLoginInfo', getQQLoginInfoHandler);
// router:获取快速登录QQ账号
router.post('/GetQuickLoginQQ', getAutoLoginAccountHandler);
// router:设置自动登录QQ账号
router.post('/SetQuickLoginQQ', setAutoLoginAccountHandler);
// router:刷新QQ登录二维码
router.post('/RefreshQRcode', QQRefreshQRcodeHandler);

export { router as QQLoginRouter };
