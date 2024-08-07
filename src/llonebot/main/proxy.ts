// https://github.com/NapNeko/LiteLoader-NapCatExample/blob/main/src/common/proxy.ts

import type { NodeIKernelLoginService } from '@/core/services';
import type { NodeIQQNTWrapperSession, WrapperNodeApi } from '@/core/wrapper';
import process from 'process';
import os from 'os';

const dlopenOrig = process.dlopen;

let wrapperSession: NodeIQQNTWrapperSession;
let wrapperNodeApi: WrapperNodeApi;
let wrapperLoginService: NodeIKernelLoginService;

// Proxy dlopen
process.dlopen = (module: any, filename, flags = os.constants.dlopen.RTLD_LAZY) => {
  dlopenOrig(module, filename, flags);
  for (const export_name in module.exports) {
    module.exports[export_name] = new Proxy(module.exports[export_name], {
      construct: (target, args, _newTarget) => {
        const constructed = new target(...args);
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

export async function fetchServices(timeout = 10000) {
  return Promise.race([
    pollForNTInitializationCheck(),
    new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), timeout);
    })
  ]).then(result => result ? { wrapperSession, wrapperNodeApi, wrapperLoginService } : Promise.reject());
}
