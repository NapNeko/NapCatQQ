import { Router } from 'express';
import { QQCheckLoginStatusHandler } from '../api/QQLogin';

const router = Router();

router.post('/CheckLoginStatus', QQCheckLoginStatusHandler);
export { router as QQLoginRouter };