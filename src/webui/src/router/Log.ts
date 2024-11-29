import { Router } from 'express';
import { LogHandler, LogListHandler } from '../api/Log';
const router = Router();
// router:读取日志内容
router.get('/GetLog', LogHandler);
// router:读取日志列表
router.get('/GetLogList', LogListHandler);

export { router as LogRouter };
