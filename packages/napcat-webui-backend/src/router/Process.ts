import { Router } from 'express';
import { RestartProcessHandler } from '../api/Process';

const router = Router();

// POST /api/Process/Restart - 重启进程
router.post('/Restart', RestartProcessHandler);

export { router as ProcessRouter };
