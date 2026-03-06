import { Hono } from 'hono';
import { RestartProcessHandler } from '../api/Process';

const router = new Hono();

router.post('/Restart', RestartProcessHandler);

export { router as ProcessRouter };
