import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import {
  ListFilesHandler,
  CreateDirHandler,
  DeleteHandler,
  ReadFileHandler,
  WriteFileHandler,
  CreateFileHandler,
  BatchDeleteHandler,
  RenameHandler,
  MoveHandler,
  BatchMoveHandler,
  DownloadHandler,
  BatchDownloadHandler,
  UploadHandler,
  UploadWebUIFontHandler,
  DeleteWebUIFontHandler,
  CheckWebUIFontExistHandler,
} from '../api/File';

const router = new Hono();

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;

const apiLimiter = async (c: Context, next: Next) => {
  const ip = (c.env as any)?.incoming?.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return c.json({ code: -1, message: 'Too many requests' }, 429);
  }

  entry.count++;
  return next();
};

router.use('*', apiLimiter);

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
router.post('/download', DownloadHandler);
router.post('/batchDownload', BatchDownloadHandler);
router.post('/upload', UploadHandler);

router.post('/font/upload/webui', UploadWebUIFontHandler);
router.post('/font/delete/webui', DeleteWebUIFontHandler);
router.get('/font/exists/webui', CheckWebUIFontExistHandler);

export { router as FileRouter };
