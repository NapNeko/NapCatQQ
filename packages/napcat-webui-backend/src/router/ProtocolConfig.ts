import { Router } from 'express';
import {
  GetSupportedProtocolsHandler,
  GetProtocolStatusHandler,
  SatoriGetConfigHandler,
  SatoriSetConfigHandler,
  GetAllProtocolConfigsHandler,
  GetProtocolConfigHandler,
  SetProtocolConfigHandler,
} from '@/napcat-webui-backend/src/api/ProtocolConfig';

const router = Router();

// 获取支持的协议列表
router.get('/protocols', GetSupportedProtocolsHandler);

// 获取协议启用状态
router.get('/status', GetProtocolStatusHandler);

// 获取所有协议配置
router.get('/all', GetAllProtocolConfigsHandler);

// Satori 配置 (Reserved for backward compatibility or specific usage)
router.get('/satori', SatoriGetConfigHandler);
router.post('/satori', SatoriSetConfigHandler);

// 通用协议配置路由
router.get('/:name/config', GetProtocolConfigHandler);
router.post('/:name/config', SetProtocolConfigHandler);

export { router as ProtocolConfigRouter };
