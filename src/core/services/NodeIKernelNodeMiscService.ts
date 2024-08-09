import { GeneralCallResult } from "./common";

//没扒干净 因为用不着
export interface NodeIKernelNodeMiscService {
    getMiniAppPath(): unknown;
    setMiniAppVersion(version:string): unknown;
    wantWinScreenOCR(imagepath: string): Promise<GeneralCallResult>;
    SendMiniAppMsg(arg1: string, arg2: string, arg3: string): unknown;
    startNewMiniApp(appfile: string, params: string): unknown;
    // 我的计划是转发给一个新程序避免吃掉Electron_AS_Node的环境 然后重写启动MiniApp 挂载相应JS脚本 这样有个问题
    // 需要自己转发ipc参数 然后必须处在gui环境 且完成校验破解 才能实现发包 有点抽象了
}