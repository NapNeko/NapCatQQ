import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import {
  GetPluginListHandler,
  SetPluginStatusHandler,
  UninstallPluginHandler,
  GetPluginConfigHandler,
  SetPluginConfigHandler,
  RegisterPluginManagerHandler,
  PluginConfigSSEHandler,
  PluginConfigChangeHandler,
  ImportLocalPluginHandler
} from '@/napcat-webui-backend/src/api/Plugin';
import {
  GetPluginStoreListHandler,
  GetPluginStoreDetailHandler,
  InstallPluginFromStoreHandler,
  InstallPluginFromStoreSSEHandler
} from '@/napcat-webui-backend/src/api/PluginStore';

// 配置 multer 用于文件上传
const uploadDir = path.join(os.tmpdir(), 'napcat-plugin-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 限制
  },
  fileFilter: (_req, file, cb) => {
    // 只允许 .zip 文件
    if (file.mimetype === 'application/zip' ||
      file.mimetype === 'application/x-zip-compressed' ||
      file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip files are allowed'));
    }
  }
});

const router: Router = Router();

router.get('/List', GetPluginListHandler);
router.post('/SetStatus', SetPluginStatusHandler);
router.post('/Uninstall', UninstallPluginHandler);
router.get('/Config', GetPluginConfigHandler);
router.post('/Config', SetPluginConfigHandler);
router.get('/Config/SSE', PluginConfigSSEHandler);
router.post('/Config/Change', PluginConfigChangeHandler);
router.post('/RegisterManager', RegisterPluginManagerHandler);
router.post('/Import', upload.single('plugin'), ImportLocalPluginHandler);

// 插件商店相关路由
router.get('/Store/List', GetPluginStoreListHandler);
router.get('/Store/Detail/:id', GetPluginStoreDetailHandler);
router.post('/Store/Install', InstallPluginFromStoreHandler);
router.get('/Store/Install/SSE', InstallPluginFromStoreSSEHandler);

export { router as PluginRouter };
