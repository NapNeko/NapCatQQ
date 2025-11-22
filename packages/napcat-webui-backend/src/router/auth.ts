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
} from '@/napcat-webui-backend/src/api/Auth';

const router = Router();
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

export { router as AuthRouter };
