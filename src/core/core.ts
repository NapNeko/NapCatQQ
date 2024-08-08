import { LogWrapper } from "@/common/utils/log";
import { NodeIQQNTWrapperSession, WrapperNodeApi } from "./wrapper/wrapper";
import path from "node:path";
import fs from "node:fs";
import { NodeIKernelLoginService } from "./services";

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

export class NapCatCore {
    readonly workingEnv: NapCatCoreWorkingEnv;
    readonly wrapper: WrapperNodeApi;
    readonly session: NodeIQQNTWrapperSession;
    readonly logger: LogWrapper;
    readonly loginService: NodeIKernelLoginService;

    constructor(
        env: NapCatCoreWorkingEnv,
        wrapper: WrapperNodeApi,
        session: NodeIQQNTWrapperSession, 
        logger: LogWrapper,
        loginService: NodeIKernelLoginService,
        QQVersion: string
    ) {
        this.workingEnv = env;
        this.logger = logger;
        this.wrapper = wrapper;
        this.session = session;
        this.loginService = loginService;
    }

    // Renamed from 'InitDataListener'
    initNapCatCoreListeners() {
        
    }
}
