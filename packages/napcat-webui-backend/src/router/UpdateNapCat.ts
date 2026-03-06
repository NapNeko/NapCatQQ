import { Hono } from 'hono';
import { UpdateNapCatHandler } from '@/napcat-webui-backend/src/api/UpdateNapCat';

const router = new Hono();

router.post('/update', UpdateNapCatHandler);

export { router as UpdateNapCatRouter };
