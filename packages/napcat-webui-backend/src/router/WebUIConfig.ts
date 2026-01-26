import { Router } from 'express';
import {
  GetWebUIConfigHandler,
  GetDisableWebUIHandler,
  UpdateDisableWebUIHandler,
  UpdateWebUIConfigHandler,
  GetClientIPHandler,
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

export { router as WebUIConfigRouter };
