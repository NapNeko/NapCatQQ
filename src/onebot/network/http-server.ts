import { OB11EmitEventContent, OB11NetworkReloadType } from './index';
import { Context, Hono, Next } from 'hono';
import { NapCatCore } from '@/core';
import { OB11Response } from '@/onebot/action/OneBotAction';
import { ActionMap } from '@/onebot/action';
import { cors } from 'hono/cors';
import { HttpServerConfig } from '@/onebot/config/config';
import { NapCatOneBot11Adapter } from '@/onebot';
import { IOB11NetworkAdapter } from '@/onebot/network/adapter';
import { serve } from '@hono/node-server';

export class OB11HttpServerAdapter extends IOB11NetworkAdapter<HttpServerConfig> {
    private app: Hono | undefined;
    private server: ReturnType<typeof serve> | undefined;

    constructor(name: string, config: HttpServerConfig, core: NapCatCore, obContext: NapCatOneBot11Adapter, actions: ActionMap) {
        super(name, config, core, obContext, actions);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override onEvent<T extends OB11EmitEventContent>(_event: T) {
        // http server is passive, no need to emit event
    }

    open() {
        try {
            if (this.isEnable) {
                this.core.context.logger.logError('[OneBot] [HTTP Server Adapter] 无法打开已经启动的HTTP服务器');
                return;
            }
            this.initializeServer();
            this.isEnable = true;
        } catch (e) {
            this.core.context.logger.logError(`[OneBot] [HTTP Server Adapter] 启动错误: ${e}`);
        }
    }

    async close() {
        this.isEnable = false;
        this.server?.close();
        this.app = undefined;
    }

    private initializeServer() {
        this.app = new Hono();

        // 注册全局中间件
        this.app.use(cors());
        this.app.use(this.authMiddleware.bind(this));
        this.app.use(this.statusCheckMiddleware.bind(this));
        this.app.use(this.payloadParserMiddleware.bind(this));

        // 注册路由
        this.app.get('/', this.rootHandler.bind(this));
        this.app.all('/*', this.actionHandler.bind(this));

        // 启动服务器
        this.server = serve({
            fetch: this.app.fetch.bind(this.app),
            port: this.config.port,
        });

        this.core.context.logger.log(`[OneBot] [HTTP Server Adapter] 服务器已启动于端口 ${this.config.port}`);
    }

    /**
     * 身份验证中间件
     */
    private async authMiddleware(c: Context, next: Next) {
        const token = this.config.token;
        if (!token || token.length === 0) {
            return next(); // 未配置token，跳过验证
        }

        // 从请求头或查询参数获取token
        const headerToken = c.req.header('authorization')?.split('Bearer ').pop() || '';
        const queryToken = c.req.query('access_token');
        const clientToken = typeof queryToken === 'string' && queryToken !== ''
            ? queryToken
            : headerToken;

        if (clientToken === token) {
            return next();
        }

        // 验证失败
        c.status(403);
        return c.json({ message: 'token验证失败' });
    }

    /**
     * 服务器状态检查中间件
     */
    private async statusCheckMiddleware(c: Context, next: Next) {
        if (!this.isEnable) {
            this.core.context.logger.log('[OneBot] [HTTP Server Adapter] 服务器已关闭');
            return c.json(OB11Response.error('服务器已关闭', 200));
        }
        return next();
    }

    /**
     * 请求参数解析中间件
     * 按优先级解析请求参数：JSON > 表单 > 查询参数
     */
    private async payloadParserMiddleware(c: Context, next: Next) {
        try {
            // 初始化payload对象
            let payload: Record<string, any> = {};

            // 1. 提取查询参数
            const queryParams = c.req.query();
            if (Object.keys(queryParams).length > 0) {
                payload = { ...queryParams };
            }

            // 2. 解析请求体
            const contentType = c.req.header('content-type') || '';
            let bodyData = {};

            try {
                // 优先尝试以JSON格式解析
                if (contentType.includes('application/json') || contentType === '' || contentType.includes('text/plain')) {
                    try {
                        bodyData = await c.req.json();
                    } catch {
                        // JSON解析失败时，尝试其他方式
                    }
                }

                // 如果JSON解析失败或不是JSON格式，尝试其他格式
                if (Object.keys(bodyData).length === 0) {
                    if (contentType.includes('application/x-www-form-urlencoded') ||
                        contentType.includes('multipart/form-data')) {
                        bodyData = await c.req.parseBody();
                    } else if (contentType) {
                        // 尝试通用解析
                        bodyData = await c.req.parseBody();
                    }
                }
            } catch (parseError) {
                // 所有解析方式都失败，记录错误但继续处理
                this.core.context.logger.log(`[OneBot] [HTTP Server Adapter] 请求体解析失败: ${parseError}`);
            }

            // 3. 合并参数
            payload = { ...payload, ...bodyData };

            // 4. 将解析结果保存到上下文
            c.set('payload', payload);
            return next();
        } catch (error) {
            this.core.context.logger.logError(`[OneBot] [HTTP Server Adapter] 请求处理错误: ${error}`);
            return c.json(OB11Response.error(`参数解析失败: ${(error as Error)?.message || '未知错误'}`, 200));
        }
    }

    /**
     * 根路径处理器
     */
    private rootHandler(c: Context) {
        const response = OB11Response.ok({});
        response.message = 'NapCat4 Is Running';
        return c.json(response);
    }

    /**
     * API动作处理器
     */
    async actionHandler(c: Context) {
        try {
            const payload = c.get('payload') as Record<string, any>;
            const actionName = c.req.path.split('/')[1];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const action = this.actions.get(actionName as any);

            if (!action) {
                return c.json(OB11Response.error(`不支持的API: ${actionName}`, 200));
            }

            try {
                const result = await action.handle(payload, this.name, this.config);
                return c.json(result);
            } catch (error: unknown) {
                const errorMessage = (error as Error)?.stack || (error as Error)?.message || 'Error Handle';
                this.core.context.logger.logError(`[OneBot] [HTTP Server Adapter] API处理错误: ${errorMessage}`);
                return c.json(OB11Response.error(errorMessage, 200));
            }
        } catch (error: unknown) {
            const errorMessage = (error as Error)?.message || '未知错误';
            this.core.context.logger.logError(`[OneBot] [HTTP Server Adapter] 请求处理失败: ${errorMessage}`);
            return c.json(OB11Response.error(`请求处理失败: ${errorMessage}`, 200));
        }
    }

    async reload(newConfig: HttpServerConfig) {
        const wasEnabled = this.isEnable;
        const oldPort = this.config.port;
        this.config = newConfig;

        if (newConfig.enable && !wasEnabled) {
            this.open();
            return OB11NetworkReloadType.NetWorkOpen;
        } else if (!newConfig.enable && wasEnabled) {
            this.close();
            return OB11NetworkReloadType.NetWorkClose;
        }

        if (oldPort !== newConfig.port) {
            this.close();
            if (newConfig.enable) {
                this.open();
            }
            return OB11NetworkReloadType.NetWorkReload;
        }

        return OB11NetworkReloadType.Normal;
    }
}