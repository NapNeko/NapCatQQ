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

router.get('/page/:pluginId/*', (c) => {
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
  if (!routerRegistry) {
    return c.json({ code: -1, message: `Plugin '${pluginId}' not found` }, 404);
  }

  const url = new URL(c.req.url);
  const subPath = url.pathname.replace(`/page/${pluginId}/`, '');
  const firstSegment = subPath.split('/')[0];

  if (routerRegistry.hasPages()) {
    const pages = routerRegistry.getPages();
    const page = pages.find(p => p.path === '/' + firstSegment || p.path === firstSegment);

    if (page && subPath === firstSegment) {
      const pluginPath = routerRegistry.getPluginPath();
      if (!pluginPath) {
        return c.json({ code: -1, message: 'Plugin path not available' }, 500);
      }
      const htmlFilePath = path.join(pluginPath, page.htmlFile);
      if (!fs.existsSync(htmlFilePath)) {
        return c.json({ code: -1, message: `HTML file not found: ${page.htmlFile}` }, 404);
      }
      return c.html(fs.readFileSync(htmlFilePath, 'utf-8'));
    }

    const pluginPath = routerRegistry.getPluginPath();
    if (pluginPath) {
      const mimeMap: Record<string, string> = {
        '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
        '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
        '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff': 'font/woff',
        '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
        '.ico': 'image/x-icon', '.txt': 'text/plain', '.map': 'application/json',
      };
      const tryServe = (filePath: string): Response | null => {
        const normalized = path.normalize(filePath);
        if (!normalized.startsWith(path.normalize(pluginPath))) return null;
        if (fs.existsSync(normalized) && fs.statSync(normalized).isFile()) {
          const ext = path.extname(normalized).toLowerCase();
          return new Response(fs.readFileSync(normalized), {
            headers: { 'Content-Type': mimeMap[ext] || 'application/octet-stream' },
          });
        }
        return null;
      };

      const staticRoutes = routerRegistry.getStaticRoutes() || [];
      for (const { urlPath, localPath } of staticRoutes) {
        const prefix = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
        if (subPath.startsWith(prefix + '/') || subPath === prefix) {
          const relativePath = subPath.substring(prefix.length).replace(/^\//, '');
          const resp = tryServe(path.join(localPath, relativePath));
          if (resp) return resp;
        }
      }

      for (const p of pages) {
        const htmlDir = path.dirname(path.join(pluginPath, p.htmlFile));
        const resp = tryServe(path.join(htmlDir, subPath));
        if (resp) return resp;
      }

      const resp = tryServe(path.join(pluginPath, subPath));
      if (resp) return resp;
    }
  }

  return c.json({ code: -1, message: 'Page or asset not found' }, 404);
});

export { router as PluginRouter };
