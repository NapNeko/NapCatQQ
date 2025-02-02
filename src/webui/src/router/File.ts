import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
    ListFilesHandler,
    CreateDirHandler,
    DeleteHandler,
    ReadFileHandler,
    WriteFileHandler,
    CreateFileHandler,
    BatchDeleteHandler, // 添加这一行
    RenameHandler,
    MoveHandler,
    BatchMoveHandler,
} from '../api/File';

const router = Router();

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1分钟内
    max: 60, // 最大60个请求
});

router.use(apiLimiter);

router.get('/list', ListFilesHandler);
router.post('/mkdir', CreateDirHandler);
router.post('/delete', DeleteHandler);
router.get('/read', ReadFileHandler);
router.post('/write', WriteFileHandler);
router.post('/create', CreateFileHandler);
router.post('/batchDelete', BatchDeleteHandler);
router.post('/rename', RenameHandler);
router.post('/move', MoveHandler);
router.post('/batchMove', BatchMoveHandler);

export { router as FileRouter };
