/// <reference types="node" />
import { NodeIQQNTWrapperEngine, NodeIQQNTWrapperSession, NodeQQNTWrapperUtil } from '@/core/wrapper';
import { QuickLoginResult } from '@/core/services';
import { BuddyListener, GroupListener, MsgListener, ProfileListener } from '@/core/listeners';
export interface OnLoginSuccess {
    (uin: string, uid: string): void | Promise<void>;
}
export declare class NapCatCore {
    readonly session: NodeIQQNTWrapperSession;
    readonly util: NodeQQNTWrapperUtil;
    readonly engine: NodeIQQNTWrapperEngine;
    private readonly loginListener;
    private loginService;
    private onLoginSuccessFuncList;
    private proxyHandler;
    constructor();
    get dataPath(): string;
    get dataPathGlobal(): string;
    private initConfig;
    private initSession;
    private initDataListener;
    addListener(listener: BuddyListener | GroupListener | MsgListener | ProfileListener): number;
    onLoginSuccess(func: OnLoginSuccess): void;
    quickLogin(uin: string): Promise<QuickLoginResult>;
    qrLogin(cb: (url: string, base64: string, buffer: Buffer) => Promise<void>): Promise<{
        url: string;
        base64: string;
        buffer: Buffer;
    }>;
    passwordLogin(uin: string, password: string, proofSig?: string, proofRand?: string, proofSid?: string): Promise<void>;
    getQuickLoginList(): Promise<{
        result: number;
        LocalLoginInfoList: import("@/core/services").LoginListItem[];
    }>;
}
export declare const napCatCore: NapCatCore;
