import { Router } from 'express';
import { LogHandler, LogListHandler, LogRealTimeHandler } from '../api/Log';

const router = Router();
// router:读取日志内容
router.get('/GetLog', LogHandler);
// router:读取日志列表
router.get('/GetLogList', LogListHandler);

// router:实时日志
router.get('/GetLogRealTime', LogRealTimeHandler);

export { router as LogRouter };
