import { Router } from 'express';

import {
  checkHandler,
  LoginHandler,
  LogoutHandler,
  UpdateTokenHandler,
  GeneratePasskeyRegistrationOptionsHandler,
  VerifyPasskeyRegistrationHandler,
  GeneratePasskeyAuthenticationOptionsHandler,
  VerifyPasskeyAuthenticationHandler,
  Get2FAStatusHandler,
  Generate2FASecretHandler,
  Enable2FAHandler,
  Disable2FAHandler,
} from '@/napcat-webui-backend/src/api/Auth';

const router: Router = Router();
// router:登录
router.post('/login', LoginHandler);
// router:检查登录状态
router.post('/check', checkHandler);
// router:注销
router.post('/logout', LogoutHandler);
// router:更新token
router.post('/update_token', UpdateTokenHandler);
// router:生成Passkey注册选项
router.post('/passkey/generate-registration-options', GeneratePasskeyRegistrationOptionsHandler);
// router:验证Passkey注册
router.post('/passkey/verify-registration', VerifyPasskeyRegistrationHandler);
// router:生成Passkey认证选项
router.post('/passkey/generate-authentication-options', GeneratePasskeyAuthenticationOptionsHandler);
// router:验证Passkey认证
router.post('/passkey/verify-authentication', VerifyPasskeyAuthenticationHandler);
// router:获取2FA状态
router.get('/2fa/status', Get2FAStatusHandler);
// router:生成2FA密钥
router.post('/2fa/generate-secret', Generate2FASecretHandler);
// router:启用2FA
router.post('/2fa/enable', Enable2FAHandler);
// router:禁用2FA
router.post('/2fa/disable', Disable2FAHandler);

export { router as AuthRouter };
