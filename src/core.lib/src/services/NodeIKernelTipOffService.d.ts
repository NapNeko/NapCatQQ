import { GeneralCallResult } from "./common";
export interface NodeIKernelTipOffService {
    addKernelTipOffListener(listener: unknown): void;
    removeKernelTipOffListener(listenerId: unknown): void;
    tipOffSendJsData(args: unknown[]): Promise<unknown>;
    getPskey(domainList: string[], nocache: boolean): Promise<GeneralCallResult & {
        domainPskeyMap: Map<string, string>;
    }>;
    tipOffSendJsData(args: unknown[]): Promise<unknown>;
    tipOffMsgs(args: unknown[]): Promise<unknown>;
    encodeUinAesInfo(args: unknown[]): Promise<unknown>;
    isNull(): boolean;
}
