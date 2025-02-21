import { Router } from 'express';

import {
    CheckDefaultTokenHandler,
    checkHandler,
    LoginHandler,
    LogoutHandler,
    UpdateTokenHandler,
} from '@webapi/api/Auth';

const router = Router();
// router:登录
router.post('/login', LoginHandler);
// router:检查登录状态
router.post('/check', checkHandler);
// router:注销
router.post('/logout', LogoutHandler);
// router:更新token
router.post('/update_token', UpdateTokenHandler);
// router:检查默认token
router.get('/check_using_default_token', CheckDefaultTokenHandler);

export { router as AuthRouter };
