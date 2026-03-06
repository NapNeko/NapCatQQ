import { Hono } from 'hono';
import {
  LogHandler,
  LogListHandler,
  LogRealTimeHandler,
  CreateTerminalHandler,
  GetTerminalListHandler,
  CloseTerminalHandler,
} from '../api/Log';

const router = new Hono();

router.get('/GetLog', LogHandler);
router.get('/GetLogList', LogListHandler);
router.get('/GetLogRealTime', LogRealTimeHandler);

router.get('/terminal/list', GetTerminalListHandler);
router.post('/terminal/create', CreateTerminalHandler);
router.post('/terminal/:id/close', CloseTerminalHandler);

export { router as LogRouter };
