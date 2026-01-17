/**
 * @file 所有路由的入口文件
 */

import { Router } from 'express';

import { OB11ConfigRouter } from '@/napcat-webui-backend/src/router/OB11Config';
import { auth } from '@/napcat-webui-backend/src/middleware/auth';
import { sendSuccess } from '@/napcat-webui-backend/src/utils/response';

import { QQLoginRouter } from '@/napcat-webui-backend/src/router/QQLogin';
import { AuthRouter } from '@/napcat-webui-backend/src/router/auth';
import { LogRouter } from '@/napcat-webui-backend/src/router/Log';
import { BaseRouter } from '@/napcat-webui-backend/src/router/Base';
import { FileRouter } from './File';
import { WebUIConfigRouter } from './WebUIConfig';
import { UpdateNapCatRouter } from './UpdateNapCat';
import DebugRouter from '@/napcat-webui-backend/src/api/Debug';
import { ProcessRouter } from './Process';
import { PluginRouter } from './Plugin';

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
// router:更新NapCat相关路由
router.use('/UpdateNapCat', UpdateNapCatRouter);
// router:调试相关路由
router.use('/Debug', DebugRouter);
// router:进程管理相关路由
router.use('/Process', ProcessRouter);
// router:插件管理相关路由
router.use('/Plugin', PluginRouter);

export { router as ALLRouter };
