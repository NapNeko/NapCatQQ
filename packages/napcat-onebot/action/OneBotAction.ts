import { ActionName, BaseCheckResult } from './router';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import { NapCatCore } from 'napcat-core';
import { NapCatOneBot11Adapter, OB11Return } from '@/napcat-onebot/index';
import { NetworkAdapterConfig } from '../config/config';
import { TSchema } from '@sinclair/typebox';
import { StreamPacket, StreamPacketBasic, StreamStatus } from './stream/StreamBasic';

export class OB11Response {
  private static createResponse<T>(data: T, status: string, retcode: number, message: string = '', echo: unknown = null, useStream: boolean = false): OB11Return<T> {
    return {
      status,
      retcode,
      data,
      message,
      wording: message,
      echo,
      stream: useStream ? 'stream-action' : 'normal-action',
    };
  }

  static res<T>(data: T, status: string, retcode: number, message: string = '', echo: unknown = null, useStream: boolean = false): OB11Return<T> {
    return this.createResponse(data, status, retcode, message, echo, useStream);
  }

  static ok<T>(data: T, echo: unknown = null, useStream: boolean = false): OB11Return<T> {
    return this.createResponse(data, 'ok', 0, '', echo, useStream);
  }

  static error (err: string, retcode: number, echo: unknown = null, useStream: boolean = false): OB11Return<null | StreamPacketBasic> {
    return this.createResponse(useStream ? { type: StreamStatus.Error, data_type: 'error' } : null, 'failed', retcode, err, echo, useStream);
  }
}
export abstract class OneBotRequestToolkit {
  abstract send<T>(packet: StreamPacket<T>): Promise<void>;
}
export abstract class OneBotAction<PayloadType, ReturnDataType> {
  actionName: typeof ActionName[keyof typeof ActionName] = ActionName.Unknown;
  core: NapCatCore;
  private validate?: ValidateFunction<unknown> = undefined;
  payloadSchema?: TSchema = undefined;
  obContext: NapCatOneBot11Adapter;
  useStream: boolean = false;

  constructor (obContext: NapCatOneBot11Adapter, core: NapCatCore) {
    this.obContext = obContext;
    this.core = core;
  }

  protected async check (payload: PayloadType): Promise<BaseCheckResult> {
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

  public async handle (payload: PayloadType, adaptername: string, config: NetworkAdapterConfig, req: OneBotRequestToolkit = { send: async () => { } }, echo?: string): Promise<OB11Return<ReturnDataType | StreamPacketBasic | null>> {
    const result = await this.check(payload);
    if (!result.valid) {
      return OB11Response.error(result.message, 400);
    }
    try {
      const resData = await this._handle(payload, adaptername, config, req);
      return OB11Response.ok(resData, echo, this.useStream);
    } catch (e: unknown) {
      this.core.context.logger.logError('发生错误', e);
      return OB11Response.error((e as Error).message.toString() || (e as Error)?.stack?.toString() || '未知错误，可能操作超时', 200, echo, this.useStream);
    }
  }

  public async websocketHandle (payload: PayloadType, echo: unknown, adaptername: string, config: NetworkAdapterConfig, req: OneBotRequestToolkit = { send: async () => { } }): Promise<OB11Return<ReturnDataType | StreamPacketBasic | null>> {
    const result = await this.check(payload);
    if (!result.valid) {
      return OB11Response.error(result.message, 1400, echo, this.useStream);
    }
    try {
      const resData = await this._handle(payload, adaptername, config, req);
      return OB11Response.ok(resData, echo, this.useStream);
    } catch (e: unknown) {
      this.core.context.logger.logError('发生错误', e);
      return OB11Response.error(((e as Error).message.toString() || (e as Error).stack?.toString()) ?? 'Error', 1200, echo, this.useStream);
    }
  }

  abstract _handle (payload: PayloadType, adaptername: string, config: NetworkAdapterConfig, req: OneBotRequestToolkit): Promise<ReturnDataType>;
}
