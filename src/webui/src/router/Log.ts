import { Router } from 'express';
import {
    LogHandler,
    LogListHandler,
    LogRealTimeHandler,
    CreateTerminalHandler,
    GetTerminalListHandler,
    CloseTerminalHandler,
} from '../api/Log';

const router = Router();

// 日志相关路由
router.get('/GetLog', LogHandler);
router.get('/GetLogList', LogListHandler);
router.get('/GetLogRealTime', LogRealTimeHandler);

// 终端相关路由
router.get('/terminal/list', GetTerminalListHandler);
router.post('/terminal/create', CreateTerminalHandler);
router.post('/terminal/:id/close', CloseTerminalHandler);

export { router as LogRouter };
