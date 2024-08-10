import { GeneralCallResult } from './common';

export interface NodeIKernelTipOffService {

    addKernelTipOffListener(listener: unknown): void;

    removeKernelTipOffListener(listenerId: unknown): void;

    tipOffSendJsData(args: unknown[]): Promise<unknown>;//2

    getPskey(domainList: string[], nocache: boolean): Promise<GeneralCallResult & {
        domainPskeyMap: Map<string, string>
    }>;//2

    tipOffSendJsData(args: unknown[]): Promise<unknown>;//2

    tipOffMsgs(args: unknown[]): Promise<unknown>;//1

    encodeUinAesInfo(args: unknown[]): Promise<unknown>;//2

    isNull(): boolean;
}
