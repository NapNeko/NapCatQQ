import { GeneralCallResult } from './common';

export interface NodeIKernelNodeMiscService {
    writeVersionToRegistry(version: string): void;

    getMiniAppPath(): unknown;

    setMiniAppVersion(version: string): unknown;

    wantWinScreenOCR(imagepath: string): Promise<GeneralCallResult>;

    SendMiniAppMsg(arg1: string, arg2: string, arg3: string): unknown;

    startNewMiniApp(appfile: string, params: string): unknown;
}
