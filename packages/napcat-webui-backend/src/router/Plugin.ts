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
  ImportLocalPluginHandler,
  ReloadPluginHandler,
  LoadIsolatedPluginHandler,
  ReloadIsolatedPluginHandler,
  StopIsolatedPluginHandler,
  HealthCheckIsolatedPluginHandler,
  HMRControlHandler,
  PluginEventsSSEHandler,
} from '@/napcat-webui-backend/src/api/Plugin';
import {
  GetPluginStoreListHandler,
  GetPluginStoreDetailHandler,
  InstallPluginFromStoreHandler,
  InstallPluginFromStoreSSEHandler
} from '@/napcat-webui-backend/src/api/PluginStore';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { NapCatOneBot11Adapter } from '@/napcat-onebot/index';
import { OB11PluginMangerAdapter } from '@/napcat-onebot/network/plugin-manger';

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

// 插件重载 & 热重载路由
router.post('/Reload', ReloadPluginHandler);
router.post('/Isolate/Load', LoadIsolatedPluginHandler);
router.post('/Isolate/Reload', ReloadIsolatedPluginHandler);
router.post('/Isolate/Stop', StopIsolatedPluginHandler);
router.get('/Isolate/Health', HealthCheckIsolatedPluginHandler);
router.post('/HMR', HMRControlHandler);
router.get('/Events', PluginEventsSSEHandler);

// 插件商店相关路由
router.get('/Store/List', GetPluginStoreListHandler);
router.get('/Store/Detail/:id', GetPluginStoreDetailHandler);
router.post('/Store/Install', InstallPluginFromStoreHandler);
router.get('/Store/Install/SSE', InstallPluginFromStoreSSEHandler);

// 插件扩展路由 - 动态挂载插件注册的 API 路由
router.use('/ext/:pluginId', (req, res, next): void => {
  const { pluginId } = req.params;

  if (!pluginId) {
    res.status(400).json({ code: -1, message: 'Plugin ID is required' });
    return;
  }

  // 获取插件管理器
  const ob11 = WebUiDataRuntime.getOneBotContext() as NapCatOneBot11Adapter;
  if (!ob11) {
    res.status(503).json({ code: -1, message: 'OneBot context not available' });
    return;
  }

  const pluginManager = ob11.networkManager.findSomeAdapter('plugin_manager') as OB11PluginMangerAdapter;
  if (!pluginManager) {
    res.status(503).json({ code: -1, message: 'Plugin manager not available' });
    return;
  }

  // 获取插件路由
  const routerRegistry = pluginManager.getPluginRouter(pluginId);
  if (!routerRegistry || !routerRegistry.hasApiRoutes()) {
    res.status(404).json({ code: -1, message: `Plugin '${pluginId}' has no registered API routes` });
    return;
  }

  // 构建并执行插件路由
  const pluginRouter = routerRegistry.buildApiRouter();
  pluginRouter(req, res, next);
});

// 插件页面路由 - 服务插件注册的 HTML 页面
router.get('/page/:pluginId/:pagePath', (req, res): void => {
  const { pluginId, pagePath } = req.params;

  if (!pluginId) {
    res.status(400).json({ code: -1, message: 'Plugin ID is required' });
    return;
  }

  // 获取插件管理器
  const ob11 = WebUiDataRuntime.getOneBotContext() as NapCatOneBot11Adapter;
  if (!ob11) {
    res.status(503).json({ code: -1, message: 'OneBot context not available' });
    return;
  }

  const pluginManager = ob11.networkManager.findSomeAdapter('plugin_manager') as OB11PluginMangerAdapter;
  if (!pluginManager) {
    res.status(503).json({ code: -1, message: 'Plugin manager not available' });
    return;
  }

  // 获取插件路由
  const routerRegistry = pluginManager.getPluginRouter(pluginId);
  if (!routerRegistry || !routerRegistry.hasPages()) {
    res.status(404).json({ code: -1, message: `Plugin '${pluginId}' has no registered pages` });
    return;
  }

  // 查找匹配的页面
  const pages = routerRegistry.getPages();
  const page = pages.find(p => p.path === '/' + pagePath || p.path === pagePath);
  if (!page) {
    res.status(404).json({ code: -1, message: `Page '${pagePath}' not found in plugin '${pluginId}'` });
    return;
  }

  // 获取插件路径
  const pluginPath = routerRegistry.getPluginPath();
  if (!pluginPath) {
    res.status(500).json({ code: -1, message: 'Plugin path not available' });
    return;
  }

  // 构建 HTML 文件路径并发送
  const htmlFilePath = path.join(pluginPath, page.htmlFile);
  if (!fs.existsSync(htmlFilePath)) {
    res.status(404).json({ code: -1, message: `HTML file not found: ${page.htmlFile}` });
    return;
  }

  res.sendFile(htmlFilePath);
});

export { router as PluginRouter };
