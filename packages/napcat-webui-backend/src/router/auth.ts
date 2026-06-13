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
  Verify2FACodeHandler,
} from '@/napcat-webui-backend/src/api/Auth';

const router: Router = Router();
router.post('/login', LoginHandler);
router.post('/check', checkHandler);
router.post('/logout', LogoutHandler);
router.post('/update_token', UpdateTokenHandler);
router.post('/passkey/generate-registration-options', GeneratePasskeyRegistrationOptionsHandler);
router.post('/passkey/verify-registration', VerifyPasskeyRegistrationHandler);
router.post('/passkey/generate-authentication-options', GeneratePasskeyAuthenticationOptionsHandler);
router.post('/passkey/verify-authentication', VerifyPasskeyAuthenticationHandler);
router.get('/2fa/status', Get2FAStatusHandler);
router.post('/2fa/generate-secret', Generate2FASecretHandler);
router.post('/2fa/enable', Enable2FAHandler);
router.post('/2fa/disable', Disable2FAHandler);
router.post('/2fa/verify', Verify2FACodeHandler);

export { router as AuthRouter };
