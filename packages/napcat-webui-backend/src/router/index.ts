/**
 * @file 所有路由的入口文件
 */

import { Router } from 'express';

import { OB11ConfigRouter } from '@/napcat-webui-backend/router/OB11Config';
import { auth } from '@/napcat-webui-backend/middleware/auth';
import { sendSuccess } from '@/napcat-webui-backend/utils/response';

import { QQLoginRouter } from '@/napcat-webui-backend/router/QQLogin';
import { AuthRouter } from '@/napcat-webui-backend/router/auth';
import { LogRouter } from '@/napcat-webui-backend/router/Log';
import { BaseRouter } from '@/napcat-webui-backend/router/Base';
import { FileRouter } from './File';
import { WebUIConfigRouter } from './WebUIConfig';

const router = Router();

// 鉴权中间件
router.use(auth);

// router:测试用
router.all('/test', (_, res) => {
  return sendSuccess(res);
});
// router:基础信息相关路由
router.use('/base', BaseRouter);
// router:WebUI登录相关路由
router.use('/auth', AuthRouter);
// router:QQ登录相关路由
router.use('/QQLogin', QQLoginRouter);
// router:OB11配置相关路由
router.use('/OB11Config', OB11ConfigRouter);
// router:日志相关路由
router.use('/Log', LogRouter);
// file:文件相关路由
router.use('/File', FileRouter);
// router:WebUI配置相关路由
router.use('/WebUIConfig', WebUIConfigRouter);

export { router as ALLRouter };
