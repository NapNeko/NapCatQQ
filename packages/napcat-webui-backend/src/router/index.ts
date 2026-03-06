/**
 * @file 所有路由的入口文件
 */

import { Hono } from 'hono';

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
import { MirrorRouter } from './Mirror';
import { NapCatConfigRouter } from './NapCatConfig';

const router = new Hono();

router.use('*', auth);

router.all('/test', (c) => {
  return sendSuccess(c);
});
router.route('/base', BaseRouter);
router.route('/auth', AuthRouter);
router.route('/QQLogin', QQLoginRouter);
router.route('/OB11Config', OB11ConfigRouter);
router.route('/Log', LogRouter);
router.route('/File', FileRouter);
router.route('/WebUIConfig', WebUIConfigRouter);
router.route('/UpdateNapCat', UpdateNapCatRouter);
router.route('/Debug', DebugRouter);
router.route('/Process', ProcessRouter);
router.route('/Plugin', PluginRouter);
router.route('/Mirror', MirrorRouter);
router.route('/NapCatConfig', NapCatConfigRouter);

export { router as ALLRouter };
