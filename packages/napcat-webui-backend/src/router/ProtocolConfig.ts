import { Router } from 'express';
import {
  GetSupportedProtocolsHandler,
  GetProtocolStatusHandler,
  SatoriGetConfigHandler,
  SatoriSetConfigHandler,
  GetAllProtocolConfigsHandler,
} from '@/napcat-webui-backend/src/api/ProtocolConfig';

const router = Router();

// 获取支持的协议列表
router.get('/protocols', GetSupportedProtocolsHandler);

// 获取协议启用状态
router.get('/status', GetProtocolStatusHandler);

// 获取所有协议配置
router.get('/all', GetAllProtocolConfigsHandler);

// Satori 配置
router.get('/satori', SatoriGetConfigHandler);
router.post('/satori', SatoriSetConfigHandler);

export { router as ProtocolConfigRouter };
