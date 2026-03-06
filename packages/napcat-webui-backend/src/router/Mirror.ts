import { Hono } from 'hono';
import {
  GetMirrorListHandler,
  SetCustomMirrorHandler,
  TestMirrorsSSEHandler,
  TestSingleMirrorHandler,
} from '@/napcat-webui-backend/src/api/Mirror';

const router = new Hono();

router.get('/List', GetMirrorListHandler);
router.post('/SetCustom', SetCustomMirrorHandler);
router.get('/Test/SSE', TestMirrorsSSEHandler);
router.post('/Test', TestSingleMirrorHandler);

export { router as MirrorRouter };
