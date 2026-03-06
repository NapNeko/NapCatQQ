import { Hono } from 'hono';
import type { Context } from 'hono';
import path from 'path';
import { readFileSync } from 'fs';
import {
  PluginRouterRegistry,
  PluginRequestHandler,
  PluginApiRouteDefinition,
  PluginPageDefinition,
  PluginHttpRequest,
  PluginHttpResponse,
  HttpMethod,
  MemoryStaticFile,
} from './types';

/**
 * 从 Hono Context 构建 PluginHttpRequest（ABI 稳定桥接）
 */
async function wrapRequest (c: Context, overrideParams?: Record<string, string>): Promise<PluginHttpRequest> {
  let body: unknown = undefined;
  const method = c.req.method.toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    try {
      body = await c.req.json();
    } catch {
      try {
        body = await c.req.text();
      } catch {
        body = undefined;
      }
    }
  }

  const url = new URL(c.req.url);
  const query: Record<string, string | string[] | undefined> = {};
  url.searchParams.forEach((value, key) => {
    const existing = query[key];
    if (existing !== undefined) {
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        query[key] = [existing, value];
      }
    } else {
      query[key] = value;
    }
  });

  const headers: Record<string, string | string[] | undefined> = {};
  c.req.raw.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    path: url.pathname,
    method: c.req.method,
    query,
    body,
    headers,
    params: overrideParams || c.req.param() as Record<string, string>,
    raw: c.req.raw,
  };
}

/**
 * 创建桥接的 PluginHttpResponse（ABI 稳定桥接）
 * 将插件的命令式 API (res.status().json()) 桥接到 Hono 的函数式 Response
 */
function createPluginResponseBridge (): { wrappedRes: PluginHttpResponse; getResponse: () => Response } {
  let statusCode = 200;
  const headers: Record<string, string> = {};
  let responseData: { type: string; data: any } | null = null;

  const wrappedRes: PluginHttpResponse = {
    status (code: number) {
      statusCode = code;
      return wrappedRes;
    },
    json (data: unknown) {
      responseData = { type: 'json', data };
    },
    send (data: string | Buffer) {
      responseData = { type: 'raw', data };
    },
    setHeader (name: string, value: string) {
      headers[name] = value;
      return wrappedRes;
    },
    sendFile (filePath: string) {
      responseData = { type: 'file', data: filePath };
    },
    redirect (url: string) {
      responseData = { type: 'redirect', data: url };
    },
    raw: null,
  };

  const getResponse = (): Response => {
    const h = new Headers(headers);
    if (!responseData) {
      return new Response(null, { status: statusCode, headers: h });
    }
    switch (responseData.type) {
      case 'json':
        h.set('Content-Type', 'application/json');
        return new Response(JSON.stringify(responseData.data), { status: statusCode, headers: h });
      case 'raw': {
        const data = responseData.data;
        if (Buffer.isBuffer(data)) {
          return new Response(data, { status: statusCode, headers: h });
        }
        return new Response(String(data), { status: statusCode, headers: h });
      }
      case 'file': {
        try {
          const content = readFileSync(responseData.data);
          const ext = path.extname(responseData.data).toLowerCase();
          const mimeMap: Record<string, string> = {
            '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
            '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
            '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff': 'font/woff',
            '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
          };
          h.set('Content-Type', mimeMap[ext] || 'application/octet-stream');
          return new Response(content, { status: statusCode, headers: h });
        } catch {
          return new Response('File not found', { status: 404 });
        }
      }
      case 'redirect':
        return Response.redirect(responseData.data, 302);
      default:
        return new Response(null, { status: statusCode, headers: h });
    }
  };

  return { wrappedRes, getResponse };
}

/** 内存静态路由定义 */
interface MemoryStaticRoute {
  urlPath: string;
  files: MemoryStaticFile[];
}

export class PluginRouterRegistryImpl implements PluginRouterRegistry {
  private apiRoutes: PluginApiRouteDefinition[] = [];
  private apiNoAuthRoutes: PluginApiRouteDefinition[] = [];
  private pageDefinitions: PluginPageDefinition[] = [];
  private staticRoutes: Array<{ urlPath: string; localPath: string; }> = [];
  private memoryStaticRoutes: MemoryStaticRoute[] = [];

  constructor (
    private readonly pluginId: string,
    private readonly pluginPath: string
  ) { }

  // ==================== API 路由注册 ====================

  api (method: HttpMethod, routePath: string, handler: PluginRequestHandler): void {
    this.apiRoutes.push({ method, path: routePath, handler });
  }

  get (routePath: string, handler: PluginRequestHandler): void {
    this.api('get', routePath, handler);
  }

  post (routePath: string, handler: PluginRequestHandler): void {
    this.api('post', routePath, handler);
  }

  put (routePath: string, handler: PluginRequestHandler): void {
    this.api('put', routePath, handler);
  }

  delete (routePath: string, handler: PluginRequestHandler): void {
    this.api('delete', routePath, handler);
  }

  // ==================== 无认证 API 路由注册 ====================

  apiNoAuth (method: HttpMethod, routePath: string, handler: PluginRequestHandler): void {
    this.apiNoAuthRoutes.push({ method, path: routePath, handler });
  }

  getNoAuth (routePath: string, handler: PluginRequestHandler): void {
    this.apiNoAuth('get', routePath, handler);
  }

  postNoAuth (routePath: string, handler: PluginRequestHandler): void {
    this.apiNoAuth('post', routePath, handler);
  }

  putNoAuth (routePath: string, handler: PluginRequestHandler): void {
    this.apiNoAuth('put', routePath, handler);
  }

  deleteNoAuth (routePath: string, handler: PluginRequestHandler): void {
    this.apiNoAuth('delete', routePath, handler);
  }

  // ==================== 页面注册 ====================

  page (pageDef: PluginPageDefinition): void {
    this.pageDefinitions.push(pageDef);
  }

  pages (pageDefs: PluginPageDefinition[]): void {
    this.pageDefinitions.push(...pageDefs);
  }

  // ==================== 静态资源 ====================

  static (urlPath: string, localPath: string): void {
    const absolutePath = path.isAbsolute(localPath)
      ? localPath
      : path.join(this.pluginPath, localPath);
    this.staticRoutes.push({ urlPath, localPath: absolutePath });
  }

  staticOnMem (urlPath: string, files: MemoryStaticFile[]): void {
    this.memoryStaticRoutes.push({ urlPath, files });
  }

  // ==================== 构建路由 ====================

  /**
   * 构建 Hono 子应用（用于 API 路由）
   * 插件 ABI 通过 wrapRequest/createPluginResponseBridge 保持稳定
   */
  buildApiRouter (): Hono {
    const app = new Hono();

    for (const route of this.apiRoutes) {
      const handler = this.wrapHandler(route.handler);
      this.registerRoute(app, route.method, route.path, handler);
    }

    return app;
  }

  private wrapHandler (handler: PluginRequestHandler): (c: Context) => Promise<Response> {
    return async (c: Context) => {
      try {
        const wrappedReq = await wrapRequest(c);
        const { wrappedRes, getResponse } = createPluginResponseBridge();
        await handler(wrappedReq, wrappedRes, () => { });
        return getResponse();
      } catch (error: any) {
        console.error(`[Plugin: ${this.pluginId}] Route error:`, error);
        return c.json({
          code: -1,
          message: `Plugin error: ${error.message || 'Unknown error'}`,
        }, 500);
      }
    };
  }

  private registerRoute (app: Hono, method: HttpMethod, routePath: string, handler: (c: Context) => Promise<Response>) {
    switch (method) {
      case 'get': app.get(routePath, handler); break;
      case 'post': app.post(routePath, handler); break;
      case 'put': app.put(routePath, handler); break;
      case 'delete': app.delete(routePath, handler); break;
      case 'patch': app.patch(routePath, handler); break;
      case 'all': app.all(routePath, handler); break;
    }
  }

  // ==================== 查询方法 ====================

  hasApiRoutes (): boolean {
    return this.apiRoutes.length > 0;
  }

  hasApiNoAuthRoutes (): boolean {
    return this.apiNoAuthRoutes.length > 0;
  }

  /**
   * 构建无认证 Hono 子应用（用于 /plugin/{pluginId}/api/ 路径）
   */
  buildApiNoAuthRouter (): Hono {
    const app = new Hono();

    for (const route of this.apiNoAuthRoutes) {
      const handler = this.wrapHandler(route.handler);
      this.registerRoute(app, route.method, route.path, handler);
    }

    return app;
  }

  hasStaticRoutes (): boolean {
    return this.staticRoutes.length > 0 || this.memoryStaticRoutes.length > 0;
  }

  hasPages (): boolean {
    return this.pageDefinitions.length > 0;
  }

  getPages (): PluginPageDefinition[] {
    return [...this.pageDefinitions];
  }

  getPluginId (): string {
    return this.pluginId;
  }

  getPluginPath (): string {
    return this.pluginPath;
  }

  getStaticRoutes (): Array<{ urlPath: string; localPath: string; }> {
    return [...this.staticRoutes];
  }

  getMemoryStaticRoutes (): MemoryStaticRoute[] {
    return [...this.memoryStaticRoutes];
  }

  /**
   * 处理插件 API 请求的便捷方法
   * 用于在 WebUI 后端中动态路由到插件子应用
   */
  async handleApiRequest (c: Context, basePath: string): Promise<Response> {
    const app = this.buildApiRouter();
    const url = new URL(c.req.url);
    const subPath = url.pathname.substring(url.pathname.indexOf(basePath) + basePath.length) || '/';
    const newUrl = new URL(subPath + url.search, url.origin);
    const newReq = new Request(newUrl, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? c.req.raw.body : undefined,
      ...(c.req.method !== 'GET' && c.req.method !== 'HEAD' ? { duplex: 'half' as const } : {}),
    } as RequestInit);
    return app.fetch(newReq);
  }

  async handleApiNoAuthRequest (c: Context, basePath: string): Promise<Response> {
    const app = this.buildApiNoAuthRouter();
    const url = new URL(c.req.url);
    const subPath = url.pathname.substring(url.pathname.indexOf(basePath) + basePath.length) || '/';
    const newUrl = new URL(subPath + url.search, url.origin);
    const newReq = new Request(newUrl, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? c.req.raw.body : undefined,
      ...(c.req.method !== 'GET' && c.req.method !== 'HEAD' ? { duplex: 'half' as const } : {}),
    } as RequestInit);
    return app.fetch(newReq);
  }

  clear (): void {
    this.apiRoutes = [];
    this.apiNoAuthRoutes = [];
    this.pageDefinitions = [];
    this.staticRoutes = [];
    this.memoryStaticRoutes = [];
  }
}
