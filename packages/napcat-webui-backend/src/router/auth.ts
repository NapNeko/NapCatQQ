import { Hono } from 'hono';

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

const router = new Hono();
router.post('/login', LoginHandler);
router.post('/check', checkHandler);
router.post('/logout', LogoutHandler);
router.post('/update_token', UpdateTokenHandler);
router.post('/passkey/generate-registration-options', GeneratePasskeyRegistrationOptionsHandler);
router.post('/passkey/verify-registration', VerifyPasskeyRegistrationHandler);
router.post('/passkey/generate-authentication-options', GeneratePasskeyAuthenticationOptionsHandler);
router.post('/passkey/verify-authentication', VerifyPasskeyAuthenticationHandler);

export { router as AuthRouter };
