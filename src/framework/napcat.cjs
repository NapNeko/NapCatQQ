// https://github.com/NapNeko/LiteLoader-NapCatExample/blob/main/src/common/proxy.ts
// By Mlikiowa

const process = require('process');
const os = require('os');
const path = require('path');

const currentPath = path.dirname(__filename);

const dlopenOrig = process.dlopen;

let wrapperSession;
let wrapperNodeApi;
let wrapperLoginService;
let initCallBack;

// Proxy dlopen
process.dlopen = (module, filename, flags = os.constants.dlopen.RTLD_LAZY) => {
    dlopenOrig(module, filename, flags);
    for (const export_name in module.exports) {
        module.exports[export_name] = new Proxy(module.exports[export_name], {
            construct: (target, args, _newTarget) => {
                let constructed;
                if (export_name === 'NodeIKernelSessionListener') {
                    let HookedArg = [];
                    for (let ArgIndex in args) {
                        if (args[ArgIndex] instanceof Object) {
                            let HookArg = {};
                            for (let ListenerName in args[ArgIndex]) {
                                HookArg[ListenerName] = function (...ListenerData) {
                                    try {
                                        if (ListenerName === "onSessionInitComplete") {
                                            //回调成功
                                            initCallBack.forEach((cb) => cb(...ListenerData));
                                            clearHook();
                                        }
                                        //console.log("Construct-ARG-Apply", ListenerName, JSON.stringify(ListenerData, null, 2));
                                    } catch (error) {
                                        // ignored
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

/**
 * 清理 Hook
 */
function clearHook() {
    initCallBack = [];
    process.dlopen = dlopenOrig;
}

function ntIsInitialized_Internal() {
    return wrapperSession !== undefined
        && wrapperNodeApi !== undefined
        && wrapperLoginService !== undefined;
}

function pollForNTInitializationCheck() {
    return new Promise((resolve, reject) => {
        let isSolve = false;
        const intervalRef = setInterval(() => {
            if (isSolve) return;
            try {
                if (ntIsInitialized_Internal()) {
                    isSolve = true;
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            } finally {
                clearInterval(intervalRef);
            }
        }, 500);
    });
}

function registerInitCallback(callback) {
    if (initCallBack === undefined) {
        initCallBack = [];
    }
    initCallBack.push(callback);
}

async function fetchServices(timeout = 10000) {
    return Promise.race([
        pollForNTInitializationCheck(),
        new Promise((resolve) => {
            setTimeout(() => resolve(false), timeout);
        })
    ]).then(result => result ?
        { wrapperSession, wrapperNodeApi, wrapperLoginService } :
        Promise.reject()
    );
}

async function NCInit() {
    console.log("[NapCat] [Info] 开始初始化NapCat");

    try {
        const { wrapperSession, wrapperLoginService } = await fetchServices();
        const { NCoreInitLiteLoader } = await import('file://' + path.join(currentPath, './napcat.mjs'));
        //传入LoginService Session 其余自载入
        await NCoreInitLiteLoader(wrapperSession, wrapperLoginService, registerInitCallback);
        //console.log("[NapCat] [Info] NapCat初始化完成");
    } catch (error) {
        console.error("[NapCat] [Error] 初始化NapCat失败", error);
    }
}

NCInit();
