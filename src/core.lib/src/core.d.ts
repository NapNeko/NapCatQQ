/// <reference types="node" />
import { NodeIQQNTWrapperSession, NodeQQNTWrapperUtil } from '@/core/wrapper';
import { QuickLoginResult } from '@/core/services';
import { BuddyListener, GroupListener, MsgListener, ProfileListener } from '@/core/listeners';
export interface OnLoginSuccess {
    (uin: string, uid: string): void | Promise<void>;
}
export declare class NapCatCore {
    readonly session: NodeIQQNTWrapperSession;
    readonly util: NodeQQNTWrapperUtil;
    private engine;
    private loginService;
    private readonly loginListener;
    private onLoginSuccessFuncList;
    constructor();
    get dataPath(): string;
    get dataPathGlobal(): string;
    private initConfig;
    private initSession;
    private initDataListener;
    addListener(listener: BuddyListener | GroupListener | MsgListener | ProfileListener): number;
    onLoginSuccess(func: OnLoginSuccess): void;
    quickLogin(uin: string): Promise<QuickLoginResult>;
    qrLogin(): Promise<{
        url: string;
        base64: string;
        buffer: Buffer;
    }>;
    passwordLogin(uin: string, password: string, proofSig?: string, proofRand?: string, proofSid?: string): Promise<void>;
}
export declare const napCatCore: NapCatCore;
