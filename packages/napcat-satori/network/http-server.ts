import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer, Server } from 'http';
import { NapCatCore } from 'napcat-core';
import { NapCatSatoriAdapter } from '../index';
import { SatoriActionMap, SatoriResponseHelper } from '../action';
import { SatoriHttpServerConfig } from '../config/config';
import {
  ISatoriNetworkAdapter,
  SatoriEmitEventContent,
  SatoriNetworkReloadType,
} from './adapter';
import { SatoriLoginStatus } from '../types';

export class SatoriHttpServerAdapter extends ISatoriNetworkAdapter<SatoriHttpServerConfig> {
  private app: Express | null = null;
  private server: Server | null = null;

  constructor (
    name: string,
    config: SatoriHttpServerConfig,
    core: NapCatCore,
    satoriContext: NapCatSatoriAdapter,
    actions: SatoriActionMap
  ) {
    super(name, config, core, satoriContext, actions);
  }

  async open (): Promise<void> {
    if (this.isEnable) return;

    try {
      this.app = express();
      this.app.use(express.json({ limit: '50mb' }));

      // Token 验证中间件
      this.app.use(this.config.path || '/v1', (req: Request, res: Response, next: NextFunction): void => {
        if (this.config.token) {
          const authHeader = req.headers.authorization;
          const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
          if (token !== this.config.token) {
            res.status(401).json(SatoriResponseHelper.error(401, 'Unauthorized'));
            return;
          }
        }
        next();
      });

      // 注册 API 路由
      this.registerRoutes();

      this.server = createServer(this.app);

      await new Promise<void>((resolve, reject) => {
        this.server!.listen(this.config.port, this.config.host, () => {
          this.logger.log(`[Satori] HTTP服务器已启动: http://${this.config.host}:${this.config.port}${this.config.path}`);
          resolve();
        });
        this.server!.on('error', reject);
      });

      this.isEnable = true;
    } catch (error) {
      this.logger.logError(`[Satori] HTTP服务器启动失败: ${error}`);
      throw error;
    }
  }

  async close (): Promise<void> {
    if (!this.isEnable) return;

    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
      this.server = null;
    }

    this.app = null;
    this.isEnable = false;
    this.logger.log(`[Satori] HTTP服务器已关闭`);
  }

  async reload (config: SatoriHttpServerConfig): Promise<SatoriNetworkReloadType> {
    const needRestart =
      this.config.host !== config.host ||
      this.config.port !== config.port ||
      this.config.path !== config.path;

    this.config = structuredClone(config);

    if (!config.enable) {
      return SatoriNetworkReloadType.NetWorkClose;
    }

    if (needRestart && this.isEnable) {
      await this.close();
      await this.open();
    }

    return SatoriNetworkReloadType.Normal;
  }

  async onEvent<T extends SatoriEmitEventContent> (_event: T): Promise<void> {
    // HTTP 服务器不主动推送事件
  }

  private registerRoutes (): void {
    if (!this.app) return;

    const basePath = this.config.path || '/v1';
    const router = express.Router();

    // 通用 action 处理器
    const handleAction = async (actionName: string, req: Request, res: Response): Promise<void> => {
      const action = this.actions.get(actionName);
      if (!action) {
        res.status(404).json(SatoriResponseHelper.error(404, `未知的 action: ${actionName}`));
        return;
      }

      try {
        const result = await action.handle(req.body || {});
        res.json(SatoriResponseHelper.success(result));
      } catch (error) {
        this.logger.logError(`[Satori] Action ${actionName} 执行失败:`, error);
        res.status(500).json(SatoriResponseHelper.error(500, `${error}`));
      }
    };

    // 登录信息（特殊处理，可以使用缓存）
    router.post('/login.get', async (_req: Request, res: Response) => {
      try {
        const result = {
          user: {
            id: this.core.selfInfo.uin,
            name: this.core.selfInfo.nick,
            avatar: `https://q1.qlogo.cn/g?b=qq&nk=${this.core.selfInfo.uin}&s=640`,
          },
          self_id: this.core.selfInfo.uin,
          platform: this.satoriContext.configLoader.configData.platform,
          status: SatoriLoginStatus.ONLINE,
        };
        res.json(SatoriResponseHelper.success(result));
      } catch (error) {
        res.status(500).json(SatoriResponseHelper.error(500, `获取登录信息失败: ${error}`));
      }
    });

    // 动态注册所有 action 路由
    for (const [actionName] of this.actions) {
      const routePath = `/${actionName.replace(/\./g, '/')}`;
      router.post(routePath, (req, res) => handleAction(actionName, req, res));

      // 同时支持点号格式的路由
      router.post(`/${actionName}`, (req, res) => handleAction(actionName, req, res));
    }

    // 通用 action 入口
    router.post('/:action(*)', async (req: Request, res: Response) => {
      const actionParam = req.params['action'];
      if (!actionParam) {
        res.status(400).json(SatoriResponseHelper.error(400, '缺少 action 参数'));
        return;
      }
      const actionName = actionParam.replace(/\//g, '.');
      await handleAction(actionName, req, res);
    });

    this.app.use(basePath, router);

    // Debug 日志
    if (this.config.debug) {
      this.logger.logDebug(`[Satori] 已注册 ${this.actions.size} 个 action 路由`);
    }
  }
}
