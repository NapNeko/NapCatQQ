/**
 * @file 所有路由的入口文件
 */

import { Router } from 'express';

import { OB11ConfigRouter } from '@webapi/router/OB11Config';
import { auth } from '@webapi/middleware/auth';
import { sendSuccess } from '@webapi/utils/response';

import { QQLoginRouter } from '@webapi/router/QQLogin';
import { AuthRouter } from '@webapi/router/auth';
import { LogRouter } from '@webapi/router/Log';
import { BaseRouter } from '@webapi/router/Base';
import { FileRouter } from './File';

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

export { router as ALLRouter };
