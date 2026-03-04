import { Router } from 'express';
import {
  GetMirrorListHandler,
  SetCustomMirrorHandler,
  TestMirrorsSSEHandler,
  TestSingleMirrorHandler
} from '@/napcat-webui-backend/src/api/Mirror';

const router: Router = Router();

// 获取镜像列表
router.get('/List', GetMirrorListHandler);

// 设置自定义镜像
router.post('/SetCustom', SetCustomMirrorHandler);

// SSE 实时测速
router.get('/Test/SSE', TestMirrorsSSEHandler);

// 测试单个镜像
router.post('/Test', TestSingleMirrorHandler);

export { router as MirrorRouter };
