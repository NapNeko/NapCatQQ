import { Router } from 'express';
import { OB11GetConfigHandler,OB11SetConfigHandler} from '../api/OB11Config';
const router = Router();
router.post('/GetConfig', OB11GetConfigHandler)
router.post('/SetConfig', OB11SetConfigHandler);
export { router as OB11ConfigRouter };