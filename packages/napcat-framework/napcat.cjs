const process = require('process');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

// 保存原始dlopen
const dlopenOrig = process.dlopen;

let wrapperSession;
let wrapperNodeApi;
let wrapperLoginService;
let getWebUiUrlFunc;
let wrapperHooked = false;
let sessionReady = false;
let warnedMissingSession = false;
const initCallbacks = new Set();
const sessionProxies = new WeakMap();
let resolveSession;
const sessionPromise = new Promise(resolve => { resolveSession = resolve; });

// 原生导出可能含只读、不可配置的属性，使用独立 target 避免替换方法时违反 Proxy 约束。
// 同时保留导出枚举、prototype 和属性探测，不能把 wrapper 伪装成空对象。
function nativeProxy (target, get, construct) {
  // bound function 没有不可配置的 prototype/caller 属性，可转发原生 class 的属性。
  // eslint-disable-next-line no-extra-bind
  const facade = typeof target === 'function' ? function () {}.bind(null) : {};
  const proxy = new Proxy(facade, {
    get: (_, key) => get(key),
    has: (_, key) => Reflect.has(target, key),
    ownKeys: () => Reflect.ownKeys(target),
    getOwnPropertyDescriptor: (_, key) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
      return descriptor ? { ...descriptor, configurable: true } : undefined;
    },
    getPrototypeOf: () => Reflect.getPrototypeOf(target),
    set: (_, key, value) => Reflect.set(target, key, value, target),
    apply: (_, thisArg, args) => Reflect.apply(target, thisArg, args),
    construct: (_, args, newTarget) => {
      const instance = Reflect.construct(target, args, newTarget === proxy ? target : newTarget);
      return construct ? construct(instance) : instance;
    },
  });
  return proxy;
}

function callInitCallback (callback) {
  try {
    callback();
  } catch (error) {
    // NapCat 的回调不能中断 QQ 自己的初始化回调。
    console.log('[NapCat] [Error] 初始化回调失败', error);
  }
}

function registerInitCallback (callback) {
  if (sessionReady) callInitCallback(callback);
  else initCallbacks.add(callback);
}

function markSessionReady (session) {
  if (session !== wrapperSession || sessionReady) return;
  sessionReady = true;
  for (const callback of initCallbacks) callInitCallback(callback);
  initCallbacks.clear();
}

function wrapSessionListener (listener, session) {
  const target = listener && typeof listener === 'object' ? listener : {};
  const methods = new Map();
  // 缺失第四参/原方法时也提供监听器，不修改 QQ 的原对象（可能已冻结）。
  const telemetryCallback = (...args) => {
    const origin = target.onOpentelemetryInit;
    const ret = typeof origin === 'function' ? Reflect.apply(origin, target, args) : undefined;
    if (args[0]?.is_init) markSessionReady(session);
    return ret;
  };
  const listenerTarget = Object.create(Object.getPrototypeOf(target), {
    ...Object.getOwnPropertyDescriptors(target),
    onOpentelemetryInit: { value: telemetryCallback, enumerable: true, configurable: true },
  });
  return nativeProxy(listenerTarget, key => {
    if (key === 'onOpentelemetryInit') return telemetryCallback;
    const value = Reflect.get(target, key, target);
    if (typeof value !== 'function' || key === 'constructor') return value;
    if (!methods.has(value)) methods.set(value, value.bind(target));
    return methods.get(value);
  });
}

function captureSession (session) {
  if (!session || typeof session.init !== 'function') {
    if (!warnedMissingSession) {
      warnedMissingSession = true;
      console.log('[NapCat] [Warn] QQ 尚未返回有效 Session，等待 QQ 后续创建会话');
    }
    return session;
  }
  if (!wrapperSession) {
    wrapperSession = session;
    resolveSession(session);
  }
  if (sessionProxies.has(session)) return sessionProxies.get(session);
  const methods = new Map();
  const proxy = nativeProxy(session, key => {
    const value = Reflect.get(session, key, session);
    if (typeof value !== 'function' || key === 'constructor') return value;
    if (!methods.has(key)) {
      methods.set(key, (...args) => {
        if (key === 'init') args[3] = wrapSessionListener(args[3], session);
        return Reflect.apply(value, session, args);
      });
    }
    return methods.get(key);
  });
  sessionProxies.set(session, proxy);
  return proxy;
}

function createSessionServiceProxy (service) {
  const methods = new Map();
  return nativeProxy(service, key => {
    const value = Reflect.get(service, key, service);
    if (typeof value !== 'function' || key === 'constructor') return value;
    if (!methods.has(key)) {
      methods.set(key, (...args) => {
        // 使用原生 class 作为 this；把 QQ 的参数原样传递，不能提前固定调用 nt_1。
        const ret = Reflect.apply(value, service, args);
        return key === 'create' || key === 'getNTWrapperSession' ? captureSession(ret) : ret;
      });
    }
    return methods.get(key);
  }, captureSession);
}

function clearHook () {
  process.dlopen = dlopenOrig;
}

async function initializeNapCat () {
  console.log('[NapCat] [Info] 开始初始化NapCat');
  try {
    const currentPath = path.dirname(__filename);
    const { NCoreInitFramework, getWebUiUrl } = await import(pathToFileURL(path.join(currentPath, './napcat.mjs')).href);
    getWebUiUrlFunc = getWebUiUrl;
    await NCoreInitFramework(sessionPromise, wrapperLoginService, registerInitCallback);
  } catch (error) {
    console.log('[NapCat] [Error] 初始化NapCat', error);
  }
}

process.dlopen = function (module, filename, flags = os.constants.dlopen.RTLD_LAZY) {
  const dlopenRet = dlopenOrig(module, filename, flags);
  if (path.basename(filename) !== 'wrapper.node' || wrapperHooked) return dlopenRet;
  wrapperHooked = true;
  clearHook();
  wrapperNodeApi = module.exports;
  wrapperLoginService = wrapperNodeApi.NodeIKernelLoginService.get();
  const sessionService = createSessionServiceProxy(wrapperNodeApi.NodeIQQNTWrapperSession);
  module.exports = nativeProxy(wrapperNodeApi, key => {
    if (key === 'NodeIQQNTWrapperSession') return sessionService;
    return Reflect.get(wrapperNodeApi, key, wrapperNodeApi);
  });

  // 先安装拦截，再异步加载 Framework。会话由 QQ 创建，不调用已移除的工厂或抢跑初始化。
  initializeNapCat().catch(error => console.log('[NapCat] [Error] 初始化NapCat', error));

  return dlopenRet;
};

module.exports = {
  NCgetWebUiUrl: async () => {
    if (!getWebUiUrlFunc) {
      console.log('[NapCat] [Error] 未初始化完成');
      return '';
    }
    return await getWebUiUrlFunc();
  },
};
