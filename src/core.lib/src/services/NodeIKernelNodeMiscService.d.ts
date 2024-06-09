import { GeneralCallResult } from "./common";
export interface NodeIKernelNodeMiscService {
    wantWinScreenOCR(imagepath: string): Promise<GeneralCallResult>;
    SendMiniAppMsg(arg1: string, arg2: string, arg3: string): unknown;
}
