let process = require('process');
let os = require('os');
let path = require('path');

// 保存原始dlopen
const dlopenOrig = process.dlopen;

let wrapperSession;
let wrapperNodeApi;
let wrapperLoginService;
let getWebUiUrlFunc;
let ncCallback = () => { };
let napCatInitialized = false; // 添加一个标志

function createServiceProxy(ServiceName) {
    return new Proxy(() => { }, {
        get: (target, FunctionName) => {
            if (ServiceName === 'NodeIQQNTWrapperSession' && FunctionName === 'create') {
                return () => new Proxy({}, {
                    get: function (target, ClassFunName, receiver) {
                        return function () {
                            if (ClassFunName === 'init') {
                                let origin = arguments[3].onOpentelemetryInit;
                                arguments[3].onOpentelemetryInit = function (result) {
                                    origin(...arguments);
                                    if (result.is_init) {
                                        ncCallback();
                                    }
                                }
                            }
                            let ret = wrapperSession[ClassFunName](...arguments);
                            return ret;
                        }
                    }
                });
            }
            if (ServiceName === 'NodeIKernelLoginService' && FunctionName === 'get') {
                return () => wrapperLoginService;
            }
            return wrapperNodeApi[ServiceName][FunctionName];
        }
    });
}

function clearHook() {
    process.dlopen = dlopenOrig;
}

async function initializeNapCat() {
    console.log('[NapCat] [Info] 开始初始化NapCat');
    try {
        const currentPath = path.dirname(__filename);
        const { NCoreInitFramework, getWebUiUrl } = await import('file://' + path.join(currentPath, './napcat.mjs'));
        getWebUiUrlFunc = getWebUiUrl;
        await NCoreInitFramework(wrapperSession, wrapperLoginService, (callback) => { ncCallback = callback });

    } catch (error) {
        console.log('[NapCat] [Error] 初始化NapCat', error);
    }
}

process.dlopen = function (module, filename, flags = os.constants.dlopen.RTLD_LAZY) {
    const dlopenRet = dlopenOrig(module, filename, flags);
    if (!filename.includes('wrapper.node') || napCatInitialized) return dlopenRet;
    napCatInitialized = true; // 初始化完成后设置标志
    clearHook();
    wrapperNodeApi = module.exports;
    wrapperLoginService = wrapperNodeApi.NodeIKernelLoginService.get();
    wrapperSession = wrapperNodeApi.NodeIQQNTWrapperSession.create();

    initializeNapCat().then().catch();

    module.exports = new Proxy({}, {
        get: (target, ServiceName) => {
            if (ServiceName === 'NodeIKernelLoginService' || ServiceName === 'NodeIQQNTWrapperSession') {
                return createServiceProxy(ServiceName);
            }
            return wrapperNodeApi[ServiceName];
        }
    });

    return dlopenRet;
};

module.exports = {
    NCgetWebUiUrl: async () => {
        if (!getWebUiUrlFunc) {
            console.log('[NapCat] [Error] 未初始化完成');
            return '';
        }
        return await getWebUiUrlFunc();
    }
};