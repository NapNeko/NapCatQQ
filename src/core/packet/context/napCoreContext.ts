import { NapCatCore } from '@/core';

export interface NapCoreCompatBasicInfo {
    readonly requireMinNTQQBuild: (buildVer: string) => boolean;
    readonly uin: number;
    readonly uid: string;
    readonly uin2uid: (uin: number) => Promise<string>;
    readonly uid2uin: (uid: string) => Promise<number>;
    readonly sendSsoCmdReqByContend: (cmd: string, trace_id: string) => Promise<void>;
}

export class NapCoreContext {
    private readonly core: NapCatCore;

    constructor(core: NapCatCore) {
        this.core = core;
    }

    get logger() {
        return this.core.context.logger;
    }

    get basicInfo() {
        return {
            requireMinNTQQBuild: (buildVer: string) => this.core.context.basicInfoWrapper.requireMinNTQQBuild(buildVer),
            uin: +this.core.selfInfo.uin,
            uid: this.core.selfInfo.uid,
            uin2uid: (uin: number) => this.core.apis.UserApi.getUidByUinV2(String(uin)).then(res => res ?? ''),
            uid2uin: (uid: string) => this.core.apis.UserApi.getUinByUidV2(uid).then(res => +res),
        } as NapCoreCompatBasicInfo;
    }

    get config() {
        return this.core.configLoader.configData;
    }

    sendSsoCmdReqByContend = (cmd: string, trace_id: string) => this.core.context.session.getMsgService().sendSsoCmdReqByContend(cmd, trace_id);
}
