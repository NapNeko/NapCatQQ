import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer, Server } from 'http';
import { NapCatCore } from 'napcat-core';
import { NapCatSatoriAdapter } from '@/napcat-satori/index';
import { SatoriActionMap } from '@/napcat-satori/action';
import { SatoriHttpServerConfig } from '@/napcat-satori/config/config';
import {
  ISatoriNetworkAdapter,
  SatoriEmitEventContent,
  SatoriNetworkReloadType,
} from './adapter';
import { SatoriApiResponse, SatoriLoginStatus } from '@/napcat-satori/types';

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
      this.app.use(express.json());

      // Token 验证中间件
      this.app.use(this.config.path || '/v1', (req: Request, res: Response, next: NextFunction): void => {
        if (this.config.token) {
          const authHeader = req.headers.authorization;
          const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
          if (token !== this.config.token) {
            res.status(401).json({ error: { code: 401, message: 'Unauthorized' } });
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

    // 获取登录信息
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
        this.sendSuccess(res, result);
      } catch (error) {
        this.sendError(res, 500, `获取登录信息失败: ${error}`);
      }
    });

    // 发送消息
    router.post('/message.create', async (req: Request, res: Response): Promise<void> => {
      try {
        const { channel_id, content } = req.body;
        if (!channel_id || !content) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }
        const result = await this.actions.get('message.create')?.handle({ channel_id, content });
        this.sendSuccess(res, result);
      } catch (error) {
        this.sendError(res, 500, `发送消息失败: ${error}`);
      }
    });

    // 获取消息
    router.post('/message.get', async (req: Request, res: Response): Promise<void> => {
      try {
        const { channel_id, message_id } = req.body;
        if (!channel_id || !message_id) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }
        const result = await this.actions.get('message.get')?.handle({ channel_id, message_id });
        this.sendSuccess(res, result);
      } catch (error) {
        this.sendError(res, 500, `获取消息失败: ${error}`);
      }
    });

    // 删除消息
    router.post('/message.delete', async (req: Request, res: Response): Promise<void> => {
      try {
        const { channel_id, message_id } = req.body;
        if (!channel_id || !message_id) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }
        await this.actions.get('message.delete')?.handle({ channel_id, message_id });
        this.sendSuccess(res, {});
      } catch (error) {
        this.sendError(res, 500, `删除消息失败: ${error}`);
      }
    });

    // 获取频道信息
    router.post('/channel.get', async (req: Request, res: Response): Promise<void> => {
      try {
        const { channel_id } = req.body;
        if (!channel_id) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }
        const result = await this.actions.get('channel.get')?.handle({ channel_id });
        this.sendSuccess(res, result);
      } catch (error) {
        this.sendError(res, 500, `获取频道信息失败: ${error}`);
      }
    });

    // 获取频道列表
    router.post('/channel.list', async (req: Request, res: Response): Promise<void> => {
      try {
        const { guild_id, next } = req.body;
        if (!guild_id) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }
        const result = await this.actions.get('channel.list')?.handle({ guild_id, next });
        this.sendSuccess(res, result);
      } catch (error) {
        this.sendError(res, 500, `获取频道列表失败: ${error}`);
      }
    });

    // 获取群组信息
    router.post('/guild.get', async (req: Request, res: Response): Promise<void> => {
      try {
        const { guild_id } = req.body;
        if (!guild_id) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }
        const result = await this.actions.get('guild.get')?.handle({ guild_id });
        this.sendSuccess(res, result);
      } catch (error) {
        this.sendError(res, 500, `获取群组信息失败: ${error}`);
      }
    });

    // 获取群组列表
    router.post('/guild.list', async (req: Request, res: Response) => {
      try {
        const { next } = req.body;
        const result = await this.actions.get('guild.list')?.handle({ next });
        this.sendSuccess(res, result);
      } catch (error) {
        this.sendError(res, 500, `获取群组列表失败: ${error}`);
      }
    });

    // 获取群成员信息
    router.post('/guild.member.get', async (req: Request, res: Response): Promise<void> => {
      try {
        const { guild_id, user_id } = req.body;
        if (!guild_id || !user_id) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }
        const result = await this.actions.get('guild.member.get')?.handle({ guild_id, user_id });
        this.sendSuccess(res, result);
      } catch (error) {
        this.sendError(res, 500, `获取群成员信息失败: ${error}`);
      }
    });

    // 获取群成员列表
    router.post('/guild.member.list', async (req: Request, res: Response): Promise<void> => {
      try {
        const { guild_id, next } = req.body;
        if (!guild_id) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }
        const result = await this.actions.get('guild.member.list')?.handle({ guild_id, next });
        this.sendSuccess(res, result);
      } catch (error) {
        this.sendError(res, 500, `获取群成员列表失败: ${error}`);
      }
    });

    // 获取用户信息
    router.post('/user.get', async (req: Request, res: Response): Promise<void> => {
      try {
        const { user_id } = req.body;
        if (!user_id) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }
        const result = await this.actions.get('user.get')?.handle({ user_id });
        this.sendSuccess(res, result);
      } catch (error) {
        this.sendError(res, 500, `获取用户信息失败: ${error}`);
      }
    });

    // 获取好友列表
    router.post('/friend.list', async (req: Request, res: Response) => {
      try {
        const { next } = req.body;
        const result = await this.actions.get('friend.list')?.handle({ next });
        this.sendSuccess(res, result);
      } catch (error) {
        this.sendError(res, 500, `获取好友列表失败: ${error}`);
      }
    });

    // 处理好友请求
    router.post('/friend.approve', async (req: Request, res: Response): Promise<void> => {
      try {
        const { message_id, approve, comment } = req.body;
        if (message_id === undefined || approve === undefined) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }
        await this.actions.get('friend.approve')?.handle({ message_id, approve, comment });
        this.sendSuccess(res, {});
      } catch (error) {
        this.sendError(res, 500, `处理好友请求失败: ${error}`);
      }
    });

    // 踢出群成员
    router.post('/guild.member.kick', async (req: Request, res: Response): Promise<void> => {
      try {
        const { guild_id, user_id, permanent } = req.body;
        if (!guild_id || !user_id) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }
        await this.actions.get('guild.member.kick')?.handle({ guild_id, user_id, permanent });
        this.sendSuccess(res, {});
      } catch (error) {
        this.sendError(res, 500, `踢出群成员失败: ${error}`);
      }
    });

    // 禁言群成员
    router.post('/guild.member.mute', async (req: Request, res: Response): Promise<void> => {
      try {
        const { guild_id, user_id, duration } = req.body;
        if (!guild_id || !user_id) {
          this.sendError(res, 400, '缺少必要参数');
          return;
        }
        await this.actions.get('guild.member.mute')?.handle({ guild_id, user_id, duration });
        this.sendSuccess(res, {});
      } catch (error) {
        this.sendError(res, 500, `禁言群成员失败: ${error}`);
      }
    });

    // 上传文件
    router.post('/upload.create', async (req: Request, res: Response) => {
      try {
        const result = await this.actions.get('upload.create')?.handle(req.body);
        this.sendSuccess(res, result);
      } catch (error) {
        this.sendError(res, 500, `上传文件失败: ${error}`);
      }
    });

    this.app.use(basePath, router);
  }

  private sendSuccess<T> (res: Response, data: T): void {
    const response: SatoriApiResponse<T> = { data };
    res.json(response);
  }

  private sendError (res: Response, code: number, message: string): void {
    const response: SatoriApiResponse = { error: { code, message } };
    res.status(code >= 400 && code < 600 ? code : 500).json(response);
  }
}
