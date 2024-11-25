import { Router } from 'express';

import { checkHandler, LoginHandler, LogoutHandler } from '@webapi/api/Auth';

const router = Router();
// router:登录
router.post('/login', LoginHandler);
// router:检查登录状态
router.post('/check', checkHandler);
// router:注销
router.post('/logout', LogoutHandler);

export { router as AuthRouter };
