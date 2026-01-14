import { NapCatCore } from 'napcat-core';
import { NapCatSatoriAdapter } from '@/napcat-satori/index';

export abstract class SatoriAction<PayloadType, ReturnType> {
  abstract actionName: string;
  protected satoriAdapter: NapCatSatoriAdapter;
  protected core: NapCatCore;

  constructor (satoriAdapter: NapCatSatoriAdapter, core: NapCatCore) {
    this.satoriAdapter = satoriAdapter;
    this.core = core;
  }

  abstract handle (payload: PayloadType): Promise<ReturnType>;

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
