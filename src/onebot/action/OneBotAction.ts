import { ActionName, BaseCheckResult } from './router';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import { NapCatCore } from '@/core';
import { NapCatOneBot11Adapter, OB11Return } from '@/onebot';
import { NetworkAdapterConfig } from '../config/config';
import { TSchema } from '@sinclair/typebox';

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
    private validate?: ValidateFunction<unknown> = undefined;
    payloadSchema?: TSchema = undefined;
    obContext: NapCatOneBot11Adapter;

    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore) {
        this.obContext = obContext;
        this.core = core;
    }

    protected async check(payload: PayloadType): Promise<BaseCheckResult> {
        if (this.payloadSchema) {
            this.validate = new Ajv({ allowUnionTypes: true, useDefaults: true, coerceTypes: true }).compile(this.payloadSchema);
        }
        if (this.validate && !this.validate(payload)) {
            const errors = this.validate.errors as ErrorObject[];
            const errorMessages = errors.map(e => `Key: ${e.instancePath.split('/').slice(1).join('.')}, Message: ${e.message}`);
            return {
                valid: false,
                message: errorMessages.join('\n') ?? '未知错误',
            };
        }
        return { valid: true };
    }

    public async handle(payload: PayloadType, adaptername: string, config: NetworkAdapterConfig): Promise<OB11Return<ReturnDataType | null>> {
        const result = await this.check(payload);
        if (!result.valid) {
            return OB11Response.error(result.message, 400);
        }
        try {
            const resData = await this._handle(payload, adaptername, config);
            return OB11Response.ok(resData);
        } catch (e: unknown) {
            this.core.context.logger.logError('发生错误', e);
            return OB11Response.error((e as Error).message.toString() || (e as Error)?.stack?.toString() || '未知错误，可能操作超时', 200);
        }
    }

    public async websocketHandle(payload: PayloadType, echo: unknown, adaptername: string, config: NetworkAdapterConfig): Promise<OB11Return<ReturnDataType | null>> {
        const result = await this.check(payload);
        if (!result.valid) {
            return OB11Response.error(result.message, 1400, echo);
        }
        try {
            const resData = await this._handle(payload, adaptername, config);
            return OB11Response.ok(resData, echo);
        } catch (e: unknown) {
            this.core.context.logger.logError('发生错误', e);
            return OB11Response.error(((e as Error).message.toString() || (e as Error).stack?.toString()) ?? 'Error', 1200, echo);
        }
    }

    abstract _handle(payload: PayloadType, adaptername: string, config: NetworkAdapterConfig): Promise<ReturnDataType>;
}
