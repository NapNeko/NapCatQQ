import { Router } from 'express';
import { LoginHandler, LogoutHandler } from '../api/Auth';

const router = Router();

router.post('/login', LoginHandler);
router.post('/logout', LogoutHandler);
export { router as AuthRouter };