import { Router } from 'express';
import { LoginHandler, LogoutHandler, checkHandler } from '../api/Auth';

const router = Router();

router.post('/login', LoginHandler);
router.post('/check', checkHandler);
router.post('/logout', LogoutHandler);
export { router as AuthRouter };