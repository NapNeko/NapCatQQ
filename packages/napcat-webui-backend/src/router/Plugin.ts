import { Hono } from 'hono';
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
  GetPluginIconHandler,
} from '@/napcat-webui-backend/src/api/Plugin';
import {
  GetPluginStoreListHandler,
  GetPluginStoreDetailHandler,
  InstallPluginFromStoreHandler,
  InstallPluginFromStoreSSEHandler,
} from '@/napcat-webui-backend/src/api/PluginStore';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { NapCatOneBot11Adapter } from '@/napcat-onebot/index';
import { OB11PluginMangerAdapter } from '@/napcat-onebot/network/plugin-manger';

const uploadDir = path.join(os.tmpdir(), 'napcat-plugin-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = new Hono();

router.get('/List', GetPluginListHandler);
router.post('/SetStatus', SetPluginStatusHandler);
router.post('/Uninstall', UninstallPluginHandler);
router.get('/Config', GetPluginConfigHandler);
router.post('/Config', SetPluginConfigHandler);
router.get('/Config/SSE', PluginConfigSSEHandler);
router.post('/Config/Change', PluginConfigChangeHandler);
router.post('/RegisterManager', RegisterPluginManagerHandler);
router.get('/Icon/:pluginId', GetPluginIconHandler);

router.get('/Store/List', GetPluginStoreListHandler);
router.get('/Store/Detail/:id', GetPluginStoreDetailHandler);
router.post('/Store/Install', InstallPluginFromStoreHandler);
router.get('/Store/Install/SSE', InstallPluginFromStoreSSEHandler);

router.all('/ext/:pluginId/*', async (c) => {
  const pluginId = c.req.param('pluginId');

  if (!pluginId) {
    return c.json({ code: -1, message: 'Plugin ID is required' }, 400);
  }

  const ob11 = WebUiDataRuntime.getOneBotContext() as NapCatOneBot11Adapter;
  if (!ob11) {
    return c.json({ code: -1, message: 'OneBot context not available' }, 503);
  }

  const pluginManager = ob11.networkManager.findSomeAdapter('plugin_manager') as OB11PluginMangerAdapter;
  if (!pluginManager) {
    return c.json({ code: -1, message: 'Plugin manager not available' }, 503);
  }

  const routerRegistry = pluginManager.getPluginRouter(pluginId);
  if (!routerRegistry || !routerRegistry.hasApiRoutes()) {
    return c.json({ code: -1, message: `Plugin '${pluginId}' has no registered API routes` }, 404);
  }

  return routerRegistry.handleApiRequest(c, `/ext/${pluginId}`);
});

router.get('/page/:pluginId/:pagePath', (c) => {
  const pluginId = c.req.param('pluginId');
  const pagePath = c.req.param('pagePath');

  if (!pluginId) {
    return c.json({ code: -1, message: 'Plugin ID is required' }, 400);
  }

  const ob11 = WebUiDataRuntime.getOneBotContext() as NapCatOneBot11Adapter;
  if (!ob11) {
    return c.json({ code: -1, message: 'OneBot context not available' }, 503);
  }

  const pluginManager = ob11.networkManager.findSomeAdapter('plugin_manager') as OB11PluginMangerAdapter;
  if (!pluginManager) {
    return c.json({ code: -1, message: 'Plugin manager not available' }, 503);
  }

  const routerRegistry = pluginManager.getPluginRouter(pluginId);
  if (!routerRegistry || !routerRegistry.hasPages()) {
    return c.json({ code: -1, message: `Plugin '${pluginId}' has no registered pages` }, 404);
  }

  const pages = routerRegistry.getPages();
  const page = pages.find(p => p.path === '/' + pagePath || p.path === pagePath);
  if (!page) {
    return c.json({ code: -1, message: `Page '${pagePath}' not found in plugin '${pluginId}'` }, 404);
  }

  const pluginPath = routerRegistry.getPluginPath();
  if (!pluginPath) {
    return c.json({ code: -1, message: 'Plugin path not available' }, 500);
  }

  const htmlFilePath = path.join(pluginPath, page.htmlFile);
  if (!fs.existsSync(htmlFilePath)) {
    return c.json({ code: -1, message: `HTML file not found: ${page.htmlFile}` }, 404);
  }

  const content = fs.readFileSync(htmlFilePath, 'utf-8');
  return c.html(content);
});

export { router as PluginRouter };
