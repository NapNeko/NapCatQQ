import { ActionName, BaseCheckResult } from './router';
import { NapCatCore } from '@/core';
import { NapCatOneBot11Adapter, OB11Return } from '@/onebot';
import { NetworkAdapterConfig } from '../config/config';
import { z } from 'zod';

export class OB11Response {
    private static createResponse<T>(data: T, status: string, retcode: number, message: string = '', echo: unknown = null): OB11Return<T> {
        return {
            status,
            retcode,
            data,
            message,
            wording: message,
            echo,
        };
    }

    static res<T>(data: T, status: string, retcode: number, message: string = ''): OB11Return<T> {
        return this.createResponse(data, status, retcode, message);
    }

    static ok<T>(data: T, echo: unknown = null): OB11Return<T> {
        return this.createResponse(data, 'ok', 0, '', echo);
    }

    static error(err: string, retcode: number, echo: unknown = null): OB11Return<null> {
        return this.createResponse(null, 'failed', retcode, err, echo);
    }
}

export abstract class OneBotAction<PayloadType, ReturnDataType> {
    actionName: typeof ActionName[keyof typeof ActionName] = ActionName.Unknown;
    core: NapCatCore;
    payloadSchema?: z.ZodType<PayloadType, z.ZodTypeDef, unknown> = undefined;
    obContext: NapCatOneBot11Adapter;

    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore) {
        this.obContext = obContext;
        this.core = core;
    }

    protected async check(payload: unknown): Promise<BaseCheckResult & { parsedPayload?: PayloadType }> {
        if (!this.payloadSchema) {
            return { valid: true, parsedPayload: payload as PayloadType };
        }

        try {
            // 使用 zod 验证并转换数据，并返回解析后的数据
            const parsedPayload = this.payloadSchema.parse(payload) as PayloadType;
            return { valid: true, parsedPayload };
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages = error.errors.map(e =>
                    `Key: ${e.path.join('.')}, Message: ${e.message}`
                );
                return {
                    valid: false,
                    message: errorMessages.join('\n') || '未知错误',
                };
            }
            return {
                valid: false,
                message: '验证过程中发生未知错误'
            };
        }
    }

    public async handle(payload: unknown, adaptername: string, config: NetworkAdapterConfig): Promise<OB11Return<ReturnDataType | null>> {
        const result = await this.check(payload);
        if (!result.valid) {
            return OB11Response.error(result.message!, 400);
        }
        try {
            const resData = await this._handle(result.parsedPayload as PayloadType, adaptername, config);
            return OB11Response.ok(resData);
        } catch (e: unknown) {
            this.core.context.logger.logError('发生错误', e);
            return OB11Response.error((e as Error).message.toString() || (e as Error)?.stack?.toString() || '未知错误，可能操作超时', 200);
        }
    }

    public async websocketHandle(payload: unknown, echo: unknown, adaptername: string, config: NetworkAdapterConfig): Promise<OB11Return<ReturnDataType | null>> {
        const result = await this.check(payload);
        if (!result.valid) {
            return OB11Response.error(result.message!, 1400, echo);
        }
        try {
            const resData = await this._handle(result.parsedPayload as PayloadType, adaptername, config);
            return OB11Response.ok(resData, echo);
        } catch (e: unknown) {
            this.core.context.logger.logError('发生错误', e);
            return OB11Response.error(((e as Error).message.toString() || (e as Error).stack?.toString()) ?? 'Error', 1200, echo);
        }
    }

    abstract _handle(payload: PayloadType, adaptername: string, config: NetworkAdapterConfig): Promise<ReturnDataType>;
}