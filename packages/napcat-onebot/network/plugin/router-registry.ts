import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
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
 * 包装 Express Request 为 PluginHttpRequest
 */
function wrapRequest (req: Request): PluginHttpRequest {
  return {
    path: req.path,
    method: req.method,
    query: req.query as Record<string, string | string[] | undefined>,
    body: req.body,
    headers: req.headers as Record<string, string | string[] | undefined>,
    params: req.params,
    raw: req,
  };
}

/**
 * 包装 Express Response 为 PluginHttpResponse
 */
function wrapResponse (res: Response): PluginHttpResponse {
  const wrapped: PluginHttpResponse = {
    status (code: number) {
      res.status(code);
      return wrapped;
    },
    json (data: unknown) {
      res.json(data);
    },
    send (data: string | Buffer) {
      res.send(data);
    },
    setHeader (name: string, value: string) {
      res.setHeader(name, value);
      return wrapped;
    },
    sendFile (filePath: string) {
      res.sendFile(filePath);
    },
    redirect (url: string) {
      res.redirect(url);
    },
    raw: res,
  };
  return wrapped;
}

/**
 * 插件路由注册器实现
 * 为每个插件创建独立的路由注册器，收集路由定义
 */
/** 内存静态路由定义 */
interface MemoryStaticRoute {
  urlPath: string;
  files: MemoryStaticFile[];
}

export class PluginRouterRegistryImpl implements PluginRouterRegistry {
  private apiRoutes: PluginApiRouteDefinition[] = [];
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

  // ==================== 页面注册 ====================

  page (pageDef: PluginPageDefinition): void {
    this.pageDefinitions.push(pageDef);
  }

  pages (pageDefs: PluginPageDefinition[]): void {
    this.pageDefinitions.push(...pageDefs);
  }

  // ==================== 静态资源 ====================

  static (urlPath: string, localPath: string): void {
    // 如果是相对路径，则相对于插件目录
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
   * 构建 Express Router（用于 API 路由）
   * 注意：静态资源路由不在此处挂载，由 webui-backend 直接在不需要鉴权的路径下处理
   */
  buildApiRouter (): Router {
    const router = Router();

    // 注册 API 路由
    for (const route of this.apiRoutes) {
      const handler = this.wrapHandler(route.handler);
      switch (route.method) {
        case 'get':
          router.get(route.path, handler);
          break;
        case 'post':
          router.post(route.path, handler);
          break;
        case 'put':
          router.put(route.path, handler);
          break;
        case 'delete':
          router.delete(route.path, handler);
          break;
        case 'patch':
          router.patch(route.path, handler);
          break;
        case 'all':
          router.all(route.path, handler);
          break;
      }
    }

    return router;
  }

  /**
   * 包装处理器，添加错误处理和请求/响应包装
   */
  private wrapHandler (handler: PluginRequestHandler): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const wrappedReq = wrapRequest(req);
        const wrappedRes = wrapResponse(res);
        await handler(wrappedReq, wrappedRes, next);
      } catch (error: any) {
        console.error(`[Plugin: ${this.pluginId}] Route error:`, error);
        if (!res.headersSent) {
          res.status(500).json({
            code: -1,
            message: `Plugin error: ${error.message || 'Unknown error'}`,
          });
        }
      }
    };
  }

  // ==================== 查询方法 ====================

  /**
   * 检查是否有注册的 API 路由
   */
  hasApiRoutes (): boolean {
    return this.apiRoutes.length > 0;
  }

  /**
   * 检查是否有注册的静态资源路由
   */
  hasStaticRoutes (): boolean {
    return this.staticRoutes.length > 0 || this.memoryStaticRoutes.length > 0;
  }

  /**
   * 检查是否有注册的页面
   */
  hasPages (): boolean {
    return this.pageDefinitions.length > 0;
  }

  /**
   * 获取所有注册的页面定义
   */
  getPages (): PluginPageDefinition[] {
    return [...this.pageDefinitions];
  }

  /**
   * 获取插件 ID
   */
  getPluginId (): string {
    return this.pluginId;
  }

  /**
   * 获取插件路径
   */
  getPluginPath (): string {
    return this.pluginPath;
  }

  /**
   * 获取所有注册的静态路由
   */
  getStaticRoutes (): Array<{ urlPath: string; localPath: string; }> {
    return [...this.staticRoutes];
  }

  /**
   * 获取所有注册的内存静态路由
   */
  getMemoryStaticRoutes (): MemoryStaticRoute[] {
    return [...this.memoryStaticRoutes];
  }

  /**
   * 清空路由（用于插件卸载）
   */
  clear (): void {
    this.apiRoutes = [];
    this.pageDefinitions = [];
    this.staticRoutes = [];
    this.memoryStaticRoutes = [];
  }
}
