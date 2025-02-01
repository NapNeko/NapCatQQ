import { Router } from 'express';
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

router.get('/list', ListFilesHandler);
router.post('/mkdir', CreateDirHandler);
router.post('/delete', DeleteHandler);
router.get('/read', ReadFileHandler);
router.post('/write', WriteFileHandler);
router.post('/create', CreateFileHandler);
router.post('/batchDelete', BatchDeleteHandler); // 添加这一行
router.post('/rename', RenameHandler);
router.post('/move', MoveHandler);
router.post('/batchMove', BatchMoveHandler);

export { router as FileRouter };
