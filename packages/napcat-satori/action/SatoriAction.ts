import { NapCatCore } from 'napcat-core';
import { NapCatSatoriAdapter } from '../index';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import { TSchema } from '@sinclair/typebox';

export interface SatoriCheckResult {
  valid: boolean;
  message?: string;
}

export interface SatoriResponse<T = unknown> {
  data?: T;
  error?: {
    code: number;
    message: string;
  };
}

export class SatoriResponseHelper {
  static success<T> (data: T): SatoriResponse<T> {
    return { data };
  }

  static error (code: number, message: string): SatoriResponse<null> {
    return { error: { code, message } };
  }
}

export abstract class SatoriAction<PayloadType, ReturnType> {
  abstract actionName: string;
  protected satoriAdapter: NapCatSatoriAdapter;
  protected core: NapCatCore;
  payloadSchema?: TSchema = undefined;
  private validate?: ValidateFunction<unknown> = undefined;

  constructor (satoriAdapter: NapCatSatoriAdapter, core: NapCatCore) {
    this.satoriAdapter = satoriAdapter;
    this.core = core;
  }

  /**
   * 验证请求参数
   */
  protected async check (payload: PayloadType): Promise<SatoriCheckResult> {
    if (this.payloadSchema) {
      this.validate = new Ajv({
        allowUnionTypes: true,
        useDefaults: true,
        coerceTypes: true,
      }).compile(this.payloadSchema);
    }

    if (this.validate && !this.validate(payload)) {
      const errors = this.validate.errors as ErrorObject[];
      const errorMessages = errors.map(
        (e) => `Key: ${e.instancePath.split('/').slice(1).join('.')}, Message: ${e.message}`
      );
      return {
        valid: false,
        message: errorMessages.join('\n') ?? '未知错误',
      };
    }

    return { valid: true };
  }

  /**
   * 处理请求入口（带验证）
   */
  async handle (payload: PayloadType): Promise<ReturnType> {
    const checkResult = await this.check(payload);
    if (!checkResult.valid) {
      throw new Error(checkResult.message || '参数验证失败');
    }
    return this._handle(payload);
  }

  /**
   * 实际处理逻辑（子类实现）
   */
  protected abstract _handle (payload: PayloadType): Promise<ReturnType>;

  protected get logger () {
    return this.core.context.logger;
  }

  protected get selfInfo () {
    return this.core.selfInfo;
  }

  protected get platform () {
    return this.satoriAdapter.configLoader.configData.platform;
  }
}
