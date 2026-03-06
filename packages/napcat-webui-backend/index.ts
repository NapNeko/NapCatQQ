/**
 * @file WebUI服务入口文件
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { compress } from 'hono/compress';
import type { WebUiConfigType } from './src/types';
import { createServer as createHttpsServer } from 'https';
import { createHash, randomUUID } from 'node:crypto';
import { NapCatPathWrapper } from 'napcat-common/src/path';
import { WebUiConfigWrapper } from '@/napcat-webui-backend/src/helper/config';
import { ALLRouter } from '@/napcat-webui-backend/src/router';
import { corsMiddleware } from '@/napcat-webui-backend/src/middleware/cors';
import { createUrl, getRandomToken } from '@/napcat-webui-backend/src/utils/url';
import { join, dirname, resolve } from 'node:path';
import { terminalManager } from '@/napcat-webui-backend/src/terminal/terminal_manager';
import * as net from 'node:net';
import { WebUiDataRuntime } from './src/helper/Data';
import { existsSync, readFileSync } from 'node:fs';
import { ILogWrapper } from 'napcat-common/src/log-interface';
import { ISubscription } from 'napcat-common/src/subscription-interface';
import { IStatusHelperSubscription } from '@/napcat-common/src/status-interface';
import { handleDebugWebSocket } from '@/napcat-webui-backend/src/api/Debug';
import { napCatVersion } from 'napcat-common/src/version';
import { fileURLToPath } from 'node:url';
import { NapCatOneBot11Adapter } from '@/napcat-onebot/index';
import { OB11PluginMangerAdapter } from '@/napcat-onebot/network/plugin-manger';
import type { Server } from 'http';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Hono();

export let WebUiConfig: WebUiConfigWrapper;
export let webUiPathWrapper: NapCatPathWrapper;
export let logSubscription: ISubscription;
export let statusHelperSubscription: IStatusHelperSubscription;
export let webUiLogger: ILogWrapper | null = null;
const MAX_PORT_TRY = 100;

export let webUiRuntimePort = 6099;
export let pendingTokenToSend: string | null = null;

let initialWebUiToken: string = '';

export function setInitialWebUiToken (token: string) {
  initialWebUiToken = token;
}

export function getInitialWebUiToken (): string {
  return initialWebUiToken;
}

export function setPendingTokenToSend (token: string | null) {
  pendingTokenToSend = token;
}

export async function InitPort (parsedConfig: WebUiConfigType): Promise<[string, number, string]> {
  try {
    await tryUseHost(parsedConfig.host);
    const preferredPort = parseInt(process.env['NAPCAT_WEBUI_PREFERRED_PORT'] || '', 10);

    let port: number;
    if (preferredPort > 0) {
      try {
        port = await tryUsePort(preferredPort, parsedConfig.host, 0, true);
      } catch {
        port = await tryUsePort(parsedConfig.port, parsedConfig.host);
      }
    } else {
      port = await tryUsePort(parsedConfig.port, parsedConfig.host);
    }

    return [parsedConfig.host, port, parsedConfig.token];
  } catch (error) {
    console.log('host或port不可用', error);
    return ['', 0, randomUUID()];
  }
}

async function checkCertificates (logger: ILogWrapper): Promise<{ key: string, cert: string; } | null> {
  try {
    const certPath = join(webUiPathWrapper.configPath, 'cert.pem');
    const keyPath = join(webUiPathWrapper.configPath, 'key.pem');

    if (existsSync(certPath) && existsSync(keyPath)) {
      const cert = readFileSync(certPath, 'utf8');
      const key = readFileSync(keyPath, 'utf8');
      logger.log('[NapCat] [WebUi] 找到SSL证书，将启用HTTPS模式');
      return { cert, key };
    }
    return null;
  } catch (error) {
    logger.log('[NapCat] [WebUi] 检查SSL证书时出错: ' + error);
    return null;
  }
}

export async function InitWebUi (logger: ILogWrapper, pathWrapper: NapCatPathWrapper, Subscription: ISubscription, statusSubscription: IStatusHelperSubscription) {
  webUiPathWrapper = pathWrapper;
  logSubscription = Subscription;
  statusHelperSubscription = statusSubscription;
  webUiLogger = logger;
  WebUiConfig = new WebUiConfigWrapper();
  let config = await WebUiConfig.GetWebUIConfig();

  if (config.disableWebUI) {
    logger.log('[NapCat] [WebUi] WebUI is disabled by configuration.');
    return;
  }

  if (process.env['NAPCAT_WEBUI_SECRET_KEY'] && config.token !== process.env['NAPCAT_WEBUI_SECRET_KEY']) {
    await WebUiConfig.UpdateWebUIConfig({ token: process.env['NAPCAT_WEBUI_SECRET_KEY'] });
    logger.log(`[NapCat] [WebUi] 检测到环境变量配置，已更新 WebUI Token 为 ${process.env['NAPCAT_WEBUI_SECRET_KEY']}`);
    config = await WebUiConfig.GetWebUIConfig();
  } else if (config.token === 'napcat' || !config.token) {
    const randomToken = getRandomToken(8);
    await WebUiConfig.UpdateWebUIConfig({ token: randomToken });
    logger.log('[NapCat] [WebUi] 检测到默认密码，已自动更新为安全密码');

    setPendingTokenToSend(randomToken);
    logger.log('[NapCat] [WebUi] 新密码将在QQ登录成功后发送给用户');

    config = await WebUiConfig.GetWebUIConfig();
  }

  setInitialWebUiToken(config.token);

  const [host, port, token] = await InitPort(config);
  webUiRuntimePort = port;
  if (port === 0) {
    logger.log('[NapCat] [WebUi] Current WebUi is not run.');
    return;
  }
  WebUiDataRuntime.setWebUiConfigQuickFunction(
    async () => {
      const autoLoginAccount = process.env['NAPCAT_QUICK_ACCOUNT'] || WebUiConfig.getAutoLoginAccount();
      const resolveQuickPasswordMd5 = (): string | undefined => {
        const quickPasswordMd5FromEnv = process.env['NAPCAT_QUICK_PASSWORD_MD5']?.trim();
        if (quickPasswordMd5FromEnv) {
          if (/^[a-fA-F0-9]{32}$/.test(quickPasswordMd5FromEnv)) {
            return quickPasswordMd5FromEnv.toLowerCase();
          }
          console.log('[NapCat] [WebUi] NAPCAT_QUICK_PASSWORD_MD5 格式无效（需为 32 位 MD5）');
        }

        const quickPassword = process.env['NAPCAT_QUICK_PASSWORD'];
        if (typeof quickPassword === 'string' && quickPassword.length > 0) {
          console.log('[NapCat] [WebUi] 检测到 NAPCAT_QUICK_PASSWORD，已在内存中计算 MD5 用于回退登录');
          return createHash('md5').update(quickPassword, 'utf8').digest('hex');
        }
        return undefined;
      };
      if (!autoLoginAccount) {
        return;
      }
      const quickPasswordMd5 = resolveQuickPasswordMd5();

      try {
        const { result, message } = await WebUiDataRuntime.requestQuickLogin(autoLoginAccount);
        if (result) {
          console.log(`[NapCat] [WebUi] 自动快速登录成功: ${autoLoginAccount}`);
          return;
        }
        console.log(`[NapCat] [WebUi] 自动快速登录失败: ${message || '未知错误'}`);
      } catch (error) {
        console.log('[NapCat] [WebUi] 自动快速登录异常:' + error);
      }

      if (!quickPasswordMd5) {
        console.log(`[NapCat] [WebUi] QQ ${autoLoginAccount} 未配置回退密码环境变量，建议优先使用 ACCOUNT + NAPCAT_QUICK_PASSWORD（NAPCAT_QUICK_PASSWORD_MD5 作为备用），保持二维码登录兜底`);
        return;
      }

      try {
        const { result, message, needCaptcha, needNewDevice } = await WebUiDataRuntime.requestPasswordLogin(autoLoginAccount, quickPasswordMd5);
        if (result) {
          console.log(`[NapCat] [WebUi] 自动密码回退登录成功: ${autoLoginAccount}`);
          return;
        }
        if (needCaptcha) {
          console.log(`[NapCat] [WebUi] 自动密码回退登录需要验证码，请在登录页面继续完成: ${autoLoginAccount}`);
          return;
        }
        if (needNewDevice) {
          console.log(`[NapCat] [WebUi] 自动密码回退登录需要新设备验证，请在登录页面继续完成: ${autoLoginAccount}`);
          return;
        }
        console.log(`[NapCat] [WebUi] 自动密码回退登录失败: ${message || '未知错误'}`);
      } catch (error) {
        console.log('[NapCat] [WebUi] 自动密码回退登录异常:' + error);
      }
    });

  // ---- 中间件 ----
  app.use('*', compress());
  app.use('*', corsMiddleware);

  // 自定义字体文件路由
  app.get('/webui/fonts/CustomFont.woff', async (c) => {
    const fontPath = await WebUiConfig.GetWebUIFontPath();
    if (fontPath) {
      try {
        const content = readFileSync(fontPath);
        return new Response(content, {
          headers: { 'Content-Type': 'font/woff' },
        });
      } catch {
        return c.text('Custom font not found', 404);
      }
    }
    return c.text('Custom font not found', 404);
  });

  // 自定义色彩 CSS
  app.get('/files/theme.css', async (c) => {
    const theme = await WebUiConfig.GetTheme();
    const fontMode = theme.fontMode || 'system';

    let css = '';

    if (fontMode === 'aacute') {
      css += `
@font-face {
  font-family: 'Aa偷吃可爱长大的';
  src: url('/webui/fonts/AaCute.woff') format('woff');
  font-display: swap;
}
`;
    } else if (fontMode === 'custom') {
      css += `
@font-face {
  font-family: 'CustomFont';
  src: url('/webui/fonts/CustomFont.woff') format('woff');
  font-display: swap;
}
`;
    }

    css += ':root, .light, [data-theme="light"] {';
    for (const key in theme.light) {
      css += `${key}: ${theme.light[key]};`;
    }
    if (fontMode === 'aacute') {
      css += "--font-family-base: 'Aa偷吃可爱长大的', var(--font-family-fallbacks) !important;";
      css += "--font-family-mono: 'Aa偷吃可爱长大的', var(--font-family-fallbacks) !important;";
    } else if (fontMode === 'custom') {
      css += "--font-family-base: 'CustomFont', var(--font-family-fallbacks) !important;";
      css += "--font-family-mono: 'CustomFont', var(--font-family-fallbacks) !important;";
    } else {
      css += '--font-family-base: var(--font-family-fallbacks) !important;';
      css += '--font-family-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;';
    }
    css += '}';

    css += '.dark, [data-theme="dark"] {';
    for (const key in theme.dark) {
      css += `${key}: ${theme.dark[key]};`;
    }
    if (fontMode === 'aacute') {
      css += "--font-family-base: 'Aa偷吃可爱长大的', var(--font-family-fallbacks) !important;";
      css += "--font-family-mono: 'Aa偷吃可爱长大的', var(--font-family-fallbacks) !important;";
    } else if (fontMode === 'custom') {
      css += "--font-family-base: 'CustomFont', var(--font-family-fallbacks) !important;";
      css += "--font-family-mono: 'CustomFont', var(--font-family-fallbacks) !important;";
    } else {
      css += '--font-family-base: var(--font-family-fallbacks) !important;';
      css += '--font-family-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;';
    }
    css += '}';

    return c.text(css, 200, { 'Content-Type': 'text/css' });
  });

  // 动态生成 sw.js
  app.get('/webui/sw.js', async (c) => {
    try {
      let templatePath = resolve(__dirname, 'static', 'sw_template.js');
      if (!existsSync(templatePath)) {
        templatePath = resolve(__dirname, 'src', 'assets', 'sw_template.js');
      }

      let swContent = readFileSync(templatePath, 'utf-8');
      swContent = swContent.replace('{{VERSION}}', napCatVersion);

      return new Response(swContent, {
        headers: {
          'Content-Type': 'application/javascript',
          'Service-Worker-Allowed': '/webui/',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch (error) {
      console.error('[NapCat] [WebUi] Error generating sw.js', error);
      return c.text('Error generating service worker', 500);
    }
  });

  // ---- 静态文件 ----
  app.use('/webui/*', serveStatic({
    root: pathWrapper.staticPath,
    rewriteRequestPath: (p) => p.replace(/^\/webui/, ''),
  }));

  // ---- 插件路由（无需鉴权） ----

  // 插件内存静态资源
  app.all('/plugin/:pluginId/mem/*', async (c) => {
    const pluginId = c.req.param('pluginId');
    if (!pluginId) return c.json({ code: -1, message: 'Plugin ID is required' }, 400);

    const ob11 = WebUiDataRuntime.getOneBotContext() as NapCatOneBot11Adapter | null;
    if (!ob11) return c.json({ code: -1, message: 'OneBot context not available' }, 503);

    const pluginManager = ob11.networkManager.findSomeAdapter('plugin_manager') as OB11PluginMangerAdapter | undefined;
    if (!pluginManager) return c.json({ code: -1, message: 'Plugin manager not available' }, 503);

    const routerRegistry = pluginManager.getPluginRouter(pluginId);
    const memoryRoutes = routerRegistry?.getMemoryStaticRoutes() || [];

    const url = new URL(c.req.url);
    const reqPath = url.pathname.replace(`/plugin/${pluginId}/mem`, '');

    for (const { urlPath, files } of memoryRoutes) {
      const prefix = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
      if (reqPath.startsWith(prefix)) {
        const filePath = '/' + (reqPath.substring(prefix.length).replace(/^\//, '') || '');
        const memFile = files.find(f => ('/' + f.path.replace(/^\//, '')) === filePath);
        if (memFile) {
          try {
            const content = typeof memFile.content === 'function' ? await memFile.content() : memFile.content;
            return new Response(content, {
              headers: { 'Content-Type': memFile.contentType || 'application/octet-stream' },
            });
          } catch (err) {
            console.error(`[Plugin: ${pluginId}] Error serving memory file:`, err);
            return c.json({ code: -1, message: 'Error serving memory file' }, 500);
          }
        }
      }
    }
    return c.json({ code: -1, message: 'Memory file not found' }, 404);
  });

  // 插件无认证 API
  app.all('/plugin/:pluginId/api/*', async (c) => {
    const pluginId = c.req.param('pluginId');
    if (!pluginId) return c.json({ code: -1, message: 'Plugin ID is required' }, 400);

    const ob11 = WebUiDataRuntime.getOneBotContext() as NapCatOneBot11Adapter | null;
    if (!ob11) return c.json({ code: -1, message: 'OneBot context not available' }, 503);

    const pluginManager = ob11.networkManager.findSomeAdapter('plugin_manager') as OB11PluginMangerAdapter | undefined;
    if (!pluginManager) return c.json({ code: -1, message: 'Plugin manager not available' }, 503);

    const routerRegistry = pluginManager.getPluginRouter(pluginId);
    if (!routerRegistry || !routerRegistry.hasApiNoAuthRoutes()) {
      return c.json({ code: -1, message: `Plugin '${pluginId}' has no registered no-auth API routes` }, 404);
    }

    return routerRegistry.handleApiNoAuthRequest(c, `/plugin/${pluginId}/api`);
  });

  // 插件页面及页面引用的静态资源
  app.get('/plugin/:pluginId/page/*', (c) => {
    const pluginId = c.req.param('pluginId');
    if (!pluginId) return c.json({ code: -1, message: 'Plugin ID is required' }, 400);

    const ob11 = WebUiDataRuntime.getOneBotContext() as NapCatOneBot11Adapter | null;
    if (!ob11) return c.json({ code: -1, message: 'OneBot context not available' }, 503);

    const pluginManager = ob11.networkManager.findSomeAdapter('plugin_manager') as OB11PluginMangerAdapter | undefined;
    if (!pluginManager) return c.json({ code: -1, message: 'Plugin manager not available' }, 503);

    const routerRegistry = pluginManager.getPluginRouter(pluginId);
    if (!routerRegistry) {
      return c.json({ code: -1, message: `Plugin '${pluginId}' not found` }, 404);
    }

    const url = new URL(c.req.url);
    const subPath = url.pathname.replace(`/plugin/${pluginId}/page/`, '');
    const firstSegment = subPath.split('/')[0];

    if (routerRegistry.hasPages()) {
      const pages = routerRegistry.getPages();
      const page = pages.find(p => p.path === '/' + firstSegment || p.path === firstSegment);

      if (page && subPath === firstSegment) {
        const pluginPath = routerRegistry.getPluginPath();
        if (!pluginPath) {
          return c.json({ code: -1, message: 'Plugin path not available' }, 500);
        }
        const htmlFilePath = join(pluginPath, page.htmlFile);
        if (!existsSync(htmlFilePath)) {
          return c.json({ code: -1, message: `HTML file not found: ${page.htmlFile}` }, 404);
        }
        const content = readFileSync(htmlFilePath, 'utf-8');
        return c.html(content);
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
          const htmlDir = path.dirname(join(pluginPath, p.htmlFile));
          const resp = tryServe(join(htmlDir, subPath));
          if (resp) return resp;
        }

        const resp = tryServe(join(pluginPath, subPath));
        if (resp) return resp;
      }
    }

    return c.json({ code: -1, message: 'Page or asset not found' }, 404);
  });

  // 插件文件系统静态资源
  app.all('/plugin/:pluginId/files/*', (c) => {
    const pluginId = c.req.param('pluginId');
    if (!pluginId) return c.json({ code: -1, message: 'Plugin ID is required' }, 400);

    const ob11 = WebUiDataRuntime.getOneBotContext() as NapCatOneBot11Adapter | null;
    if (!ob11) return c.json({ code: -1, message: 'OneBot context not available' }, 503);

    const pluginManager = ob11.networkManager.findSomeAdapter('plugin_manager') as OB11PluginMangerAdapter | undefined;
    if (!pluginManager) return c.json({ code: -1, message: 'Plugin manager not available' }, 503);

    const routerRegistry = pluginManager.getPluginRouter(pluginId);
    const staticRoutes = routerRegistry?.getStaticRoutes() || [];

    const url = new URL(c.req.url);
    const reqPath = url.pathname.replace(`/plugin/${pluginId}/files`, '');

    for (const { urlPath, localPath } of staticRoutes) {
      const prefix = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
      if (reqPath.startsWith(prefix) || reqPath === prefix.slice(0, -1)) {
        const relativePath = reqPath.substring(prefix.length).replace(/^\//, '') || '';
        const filePath = path.join(localPath, relativePath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const content = fs.readFileSync(filePath);
          const ext = path.extname(filePath).toLowerCase();
          const mimeMap: Record<string, string> = {
            '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
            '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
            '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff': 'font/woff',
            '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
            '.ico': 'image/x-icon', '.txt': 'text/plain',
          };
          return new Response(content, {
            headers: {
              'Content-Type': mimeMap[ext] || 'application/octet-stream',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }
      }
    }
    return c.json({ code: -1, message: 'Static resource not found' }, 404);
  });

  // ---- API 路由 ----
  app.route('/api', ALLRouter);

  // SPA 回退
  const indexFile = join(pathWrapper.staticPath, 'index.html');

  app.get('/webui/*', (c) => {
    if (existsSync(indexFile)) {
      const content = readFileSync(indexFile, 'utf-8');
      return c.html(content);
    }
    return c.text('Not Found', 404);
  });

  app.get('/', (c) => {
    return c.redirect('/webui', 301);
  });

  // ---- 启动服务 ----
  const sslCerts = await checkCertificates(logger);
  const isHttps = !!sslCerts;

  let server: Server;

  if (isHttps && sslCerts) {
    server = createHttpsServer(sslCerts, app.fetch as any) as unknown as Server;
    server.listen(port, host);
  } else {
    server = serve({
      fetch: app.fetch,
      port,
      hostname: host,
    }) as unknown as Server;
  }

  // WebSocket upgrade for Debug and Terminal
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);

    if (url.pathname.startsWith('/api/Debug/ws')) {
      handleDebugWebSocket(request, socket, head);
    } else {
      terminalManager.initialize(request, socket, head, logger);
    }
  });

  server.on('listening', () => {
    const searchParams = { token };
    logger.log(`[NapCat] [WebUi] WebUi Token: ${token}`);
    logger.log(
      `[NapCat] [WebUi] WebUi User Panel Url: ${createUrl('127.0.0.1', port.toString(), '/webui', searchParams)}`
    );
    if (host !== '') {
      logger.log(
        `[NapCat] [WebUi] WebUi User Panel Url: ${createUrl(host, port.toString(), '/webui', searchParams)}`
      );
    }
  });
}

async function tryUseHost (host: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const server = net.createServer();
      server.on('listening', () => {
        server.close();
        resolve(host);
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRNOTAVAIL') {
          reject(new Error('主机地址验证失败，可能为非本机地址'));
        } else {
          reject(new Error(`遇到错误: ${err.code}`));
        }
      });

      server.listen(0, host);
    } catch (error) {
      reject(new Error(`服务器启动时发生错误: ${error}`));
    }
  });
}

async function tryUsePort (port: number, host: string, tryCount: number = 0, singleTry: boolean = false): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      const server = net.createServer();
      server.on('listening', () => {
        server.close();
        resolve(port);
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          if (singleTry) {
            reject(new Error(`端口 ${port} 已被占用`));
          } else if (tryCount < MAX_PORT_TRY) {
            resolve(tryUsePort(port + 1, host, tryCount + 1, false));
          } else {
            reject(new Error(`端口尝试失败，达到最大尝试次数: ${MAX_PORT_TRY}`));
          }
        } else {
          reject(new Error(`遇到错误: ${err.code}`));
        }
      });

      server.listen(port, host);
    } catch (error) {
      reject(new Error(`服务器启动时发生错误: ${error}`));
    }
  });
}
