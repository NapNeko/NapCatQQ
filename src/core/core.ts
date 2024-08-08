import { LogWrapper } from "@/common/utils/log";
import { NodeIQQNTWrapperSession, WrapperNodeApi } from "./wrapper/wrapper";
import path from "node:path";
import fs from "node:fs";
import { NodeIKernelLoginService } from "./services";
import { SelfInfo } from "./entities";

export enum NapCatCoreWorkingEnv {
    Unknown = 0,
    Shell = 1,
    LiteLoader = 2,
}

export function loadQQWrapper(QQVersion: string): WrapperNodeApi {
    let wrapperNodePath = path.resolve(path.dirname(process.execPath), './resources/app/wrapper.node');
    if (!fs.existsSync(wrapperNodePath)) {
        wrapperNodePath = path.join(path.dirname(process.execPath), `resources/app/versions/${QQVersion}/wrapper.node`);
    }
    const nativemodule: any = { exports: {} };
    process.dlopen(nativemodule, wrapperNodePath);
    return nativemodule.exports;
}

export interface InstanceContext {
    readonly workingEnv: NapCatCoreWorkingEnv;
    readonly core: NapCatCore;
    readonly wrapper: WrapperNodeApi;
    readonly session: NodeIQQNTWrapperSession;
    readonly logger: LogWrapper;
    readonly loginService: NodeIKernelLoginService;
    readonly selfInfo: SelfInfo;
    readonly QQVersion: string;
}

export class NapCatCore {
    readonly context: InstanceContext;

    constructor(context: InstanceContext) {
        this.context = context;
    }

    // Renamed from 'InitDataListener'
    initNapCatCoreListeners() {
        
    }
}
