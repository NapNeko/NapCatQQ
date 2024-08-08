import { logDebug } from "@/common/utils/log";
import { NodeIKernelLoginService } from "./services";
import { NodeIQQNTWrapperSession } from "./wrapper/wrapper";

export enum NCoreWorkMode {
    Unknown = 0,
    Shell = 1,
    LiteLoader = 2
}
export class NapCatCore {
    public WorkMode: NCoreWorkMode = NCoreWorkMode.Unknown;
    public isInit: boolean = false;
    public session: NodeIQQNTWrapperSession | undefined;
    private proxyHandler = {
        get(target: any, prop: any, receiver: any) {
          // console.log('get', prop, typeof target[prop]);
          if (typeof target[prop] === 'undefined') {
            // 如果方法不存在，返回一个函数，这个函数调用existentMethod
            return (...args: unknown[]) => {
              logDebug(`${target.constructor.name} has no method ${prop}`);
            };
          }
          // 如果方法存在，正常返回
          return Reflect.get(target, prop, receiver);
        }
      };
    get IsInit(): boolean {
        return this.isInit;
    }
}
export class NapCatShell extends NapCatCore {
    public WorkMode: NCoreWorkMode = NCoreWorkMode.Shell;
    Init() {
        
    }
}
export class NapCatLiteLoader extends NapCatCore {
    public WorkMode: NCoreWorkMode = NCoreWorkMode.LiteLoader;
    Init(WrapperSession: NodeIQQNTWrapperSession, LoginService: NodeIKernelLoginService) {

    }
}