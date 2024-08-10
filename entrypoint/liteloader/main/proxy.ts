// https://github.com/NapNeko/LiteLoader-NapCatExample/blob/main/src/common/proxy.ts
// By Mlikiowa
import type { NodeIKernelLoginService } from '@/core/services';
import type { NodeIQQNTWrapperSession, WrapperNodeApi } from '@/core/wrapper';
import process from 'process';
import os from 'os';
const dlopenOrig = process.dlopen;

let wrapperSession: NodeIQQNTWrapperSession;
let wrapperNodeApi: WrapperNodeApi;
let wrapperLoginService: NodeIKernelLoginService;
let InitCallBack: ((...args: any[]) => void)[];
// Proxy dlopen
process.dlopen = (module: any, filename, flags = os.constants.dlopen.RTLD_LAZY) => {
  dlopenOrig(module, filename, flags);
  for (const export_name in module.exports) {
    module.exports[export_name] = new Proxy(module.exports[export_name], {
      construct: (target, args, _newTarget) => {
        let constructed;
        if (export_name === 'NodeIKernelSessionListener') {
          let HookedArg = [];
          for (let ArgIndex in args) {
            if (args[ArgIndex] instanceof Object) {
              let HookArg: any = {};
              for (let ListenerName in args[ArgIndex]) {
                HookArg[ListenerName] = function (...ListenerData: any[]) {
                  try {
                    if (ListenerName == "onSessionInitComplete") {
                      //回调成功
                      InitCallBack.map((cb) => cb(...ListenerData));
                      ClearHook();
                    }
                    //console.log("Construct-ARG-Apply", ListenerName, JSON.stringify(ListenerData, null, 2));
                  } catch (error) {

                  }
                  args[ArgIndex][ListenerName](...ListenerData);
                };
                HookedArg.push(HookArg);
              }
            } else {
              // 其它类型
              //console.log("Construct-ARG-NotProxy", args[keyArg]);
            }

          }
          constructed = new target(...HookedArg);
        } else {
          constructed = new target(...args);
        }

        if (export_name === 'NodeIQQNTWrapperSession') wrapperSession = constructed;
        if (export_name === 'NodeIKernelLoginService') wrapperLoginService = constructed;

        return constructed;
      },
    });
  }
  if (filename.toLowerCase().includes('wrapper.node')) {
    wrapperNodeApi = module.exports;
  }
};
export function ClearHook() {
  InitCallBack = [];
  process.dlopen = dlopenOrig;
  //回收Hook
}

function ntIsInitialized_Internal() {
  return wrapperSession != undefined
    && wrapperNodeApi != undefined
    && wrapperLoginService != undefined;
}

function pollForNTInitializationCheck() {
  return new Promise<boolean>((resolve, reject) => {
    let isSolve = false;
    const intervalId = setInterval(() => {
      if (isSolve) return;
      try {
        if (ntIsInitialized_Internal()) {
          isSolve = true;
          resolve(true);
        }
      } catch (error) {
        reject(error);
      } finally {
        clearInterval(intervalId);
      }
    }, 500);
  });
}
export function RegisterInitCallback(callback: (...args: any[]) => void) {
  if (InitCallBack == undefined) {
    InitCallBack = [];
  }
  InitCallBack.push(callback);
}
export async function fetchServices(timeout = 10000) {
  return Promise.race([
    pollForNTInitializationCheck(),
    new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), timeout);
    })
  ]).then(result => result ? { wrapperSession, wrapperNodeApi, wrapperLoginService } : Promise.reject());
}
