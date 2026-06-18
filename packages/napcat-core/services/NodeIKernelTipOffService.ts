import { GeneralCallResult } from './common';

export interface NodeIKernelTipOffService {

  addKernelTipOffListener (listener: unknown): number;

  removeKernelTipOffListener (listenerId: number): void;

  tipOffSendJsData (arg1: unknown, arg2: unknown): Promise<unknown>;

  getPskey (domainList: string[], nocache: boolean): Promise<GeneralCallResult & {
    domainPskeyMap: Map<string, string>;
  }>;

  tipOffMsgs (arg: unknown): Promise<unknown>;

  encodeUinAesInfo (arg1: unknown, arg2: unknown): Promise<unknown>;

  isNull (): boolean;
}
