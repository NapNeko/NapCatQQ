import { GeneralCallResult } from "./common";
export interface NodeIKernelNodeMiscService {
    wantWinScreenOCR(imagepath: string): Promise<GeneralCallResult>;
}
