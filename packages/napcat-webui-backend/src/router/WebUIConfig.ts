import { Router } from 'express';
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

const router: Router = Router();

// 获取WebUI基础配置
router.get('/GetConfig', GetWebUIConfigHandler);

// 更新WebUI基础配置
router.post('/UpdateConfig', UpdateWebUIConfigHandler);

// 获取是否禁用WebUI
router.get('/GetDisableWebUI', GetDisableWebUIHandler);

// 更新是否禁用WebUI
router.post('/UpdateDisableWebUI', UpdateDisableWebUIHandler);

// 获取当前客户端IP
router.get('/GetClientIP', GetClientIPHandler);

// 获取SSL证书状态
router.get('/GetSSLStatus', GetSSLStatusHandler);

// 上传SSL证书
router.post('/UploadSSLCert', UploadSSLCertHandler);

// 删除SSL证书
router.post('/DeleteSSLCert', DeleteSSLCertHandler);

export { router as WebUIConfigRouter };
