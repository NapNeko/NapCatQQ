import { ActionName, BaseCheckResult } from './types';
import { OB11Response } from './OB11Response';
import { OB11Return } from '@/onebot/types';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import { NapCatCore } from '@/core';

import { NapCatOneBot11Adapter } from '@/onebot';

abstract class BaseAction<PayloadType, ReturnDataType> {
    actionName: ActionName = ActionName.Unknown;
    CoreContext: NapCatCore;
    private validate: undefined | ValidateFunction<any> = undefined;
    PayloadSchema: any = undefined;
    OneBotContext: NapCatOneBot11Adapter;

    constructor(onebotContext: NapCatOneBot11Adapter, coreContext: NapCatCore) {
        this.OneBotContext = onebotContext;
        this.CoreContext = coreContext;
    }

    protected async check(payload: PayloadType): Promise<BaseCheckResult> {
        if (this.PayloadSchema) {
            this.validate = new Ajv({ allowUnionTypes: true }).compile(this.PayloadSchema);
        }
        if (this.validate && !this.validate(payload)) {
            const errors = this.validate.errors as ErrorObject[];
            const errorMessages: string[] = errors.map((e) => {
                return `Key: ${e.instancePath.split('/').slice(1).join('.')}, Message: ${e.message}`;
            });
            return {
                valid: false,
                message: errorMessages.join('\n') as string || '未知错误',
            };
        }
        return {
            valid: true,
        };
    }

    public async handle(payload: PayloadType): Promise<OB11Return<ReturnDataType | null>> {
        const result = await this.check(payload);
        if (!result.valid) {
            return OB11Response.error(result.message, 400);
        }
        try {
            const resData = await this._handle(payload);
            return OB11Response.ok(resData);
        } catch (e: any) {
            this.CoreContext.context.logger.logError('发生错误', e);
            return OB11Response.error(e?.toString() || e?.stack?.toString() || '未知错误，可能操作超时', 200);
        }
    }

    public async websocketHandle(payload: PayloadType, echo: any): Promise<OB11Return<ReturnDataType | null>> {
        const result = await this.check(payload);
        if (!result.valid) {
            return OB11Response.error(result.message, 1400);
        }
        try {
            const resData = await this._handle(payload);
            return OB11Response.ok(resData, echo);
        } catch (e: any) {
            this.CoreContext.context.logger.logError('发生错误', e);
            return OB11Response.error(e.stack?.toString() || e.toString(), 1200, echo);
        }
    }

    abstract _handle(payload: PayloadType): PromiseLike<ReturnDataType>;
}

export default BaseAction;
