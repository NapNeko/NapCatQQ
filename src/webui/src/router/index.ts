import { Router } from "express";
import { AuthRouter } from "./api";
const router = Router();
router.use('/auth', AuthRouter);//挂载权限路由

export { router as APIRouter }