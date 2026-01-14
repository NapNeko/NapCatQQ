import { NapCatCore } from 'napcat-core';
import { NapCatSatoriAdapter } from '../index';
import { SatoriMsgApi } from './msg';
import { SatoriEventApi } from './event';

export interface SatoriApiList {
  MsgApi: SatoriMsgApi;
  EventApi: SatoriEventApi;
}

export function createSatoriApis (
  satoriAdapter: NapCatSatoriAdapter,
  core: NapCatCore
): SatoriApiList {
  return {
    MsgApi: new SatoriMsgApi(satoriAdapter, core),
    EventApi: new SatoriEventApi(satoriAdapter, core),
  };
}

export { SatoriMsgApi } from './msg';
export { SatoriEventApi } from './event';
