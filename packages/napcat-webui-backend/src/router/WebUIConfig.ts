import { Hono } from 'hono';
import {
  GetWebUIConfigHandler,
  GetDisableWebUIHandler,
  UpdateDisableWebUIHandler,
  UpdateWebUIConfigHandler,
  GetClientIPHandler,
  GetSSLStatusHandler,
  UploadSSLCertHandler,
  DeleteSSLCertHandler,
} from '@/napcat-webui-backend/src/api/WebUIConfig';

const router = new Hono();

router.get('/GetConfig', GetWebUIConfigHandler);
router.post('/UpdateConfig', UpdateWebUIConfigHandler);
router.get('/GetDisableWebUI', GetDisableWebUIHandler);
router.post('/UpdateDisableWebUI', UpdateDisableWebUIHandler);
router.get('/GetClientIP', GetClientIPHandler);
router.get('/GetSSLStatus', GetSSLStatusHandler);
router.post('/UploadSSLCert', UploadSSLCertHandler);
router.post('/DeleteSSLCert', DeleteSSLCertHandler);

export { router as WebUIConfigRouter };
