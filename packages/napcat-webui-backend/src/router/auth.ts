import { Router } from 'express';

import {
  checkHandler,
  LoginHandler,
  LogoutHandler,
  UpdateTokenHandler,
} from '@/napcat-webui-backend/src/api/Auth';

const router = Router();
// router:登录
router.post('/login', LoginHandler);
// router:检查登录状态
router.post('/check', checkHandler);
// router:注销
router.post('/logout', LogoutHandler);
// router:更新token
router.post('/update_token', UpdateTokenHandler);

export { router as AuthRouter };
