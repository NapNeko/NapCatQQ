// 用于 NapCat 对QQ流程分析
let Process = require('process');
let os = require('os');
let path = require('path');
Process.dlopenOrig = Process.dlopen;

let RealWrapper;
let loginService;

//Fuck LoginService
class LoginService {
    constructor() {
        console.log('[NapCat] Fuck LoginService Loading...');
    }
}

//NapCat 专有逻辑
let initCallBack;
let wrapperSession;
let wrapperLoginService;
const currentPath = path.dirname(__filename);

function CreateFuckService(ServiceName) {
    return new Proxy(() => { }, {
        get: function (target, FunctionName, receiver) {
            console.log("Proxy... Event:", ServiceName + '/' + FunctionName);
            if (ServiceName == 'NodeIKernelLoginService' && FunctionName == 'get') {
                return function () {
                    let ret = new Proxy(new LoginService(), {
                        get: function (target, ClassFunName, receiver) {
                            return function () {
                                let ret = loginService[ClassFunName](...arguments);
                                // if (ret instanceof Promise) {
                                //     ret.then((data) => {
                                //         console.log("Called ", '实例方法 NodeIKernelLoginService/' + ClassFunName, ' 参数:', ...arguments, '返回:', data);
                                //     });
                                // } else {
                                //     console.log("Called ", '实例方法 NodeIKernelLoginService/' + ClassFunName, ' 参数:', ...arguments, '返回:', ret);
                                // }
                                return ret;
                            }

                        }
                    })
                    return ret;
                }
            }

            if (ServiceName == 'NodeIQQNTWrapperSession' && FunctionName == 'create') {
                return new Proxy(() => { }, {
                    apply: function (target, thisArg, argArray) {
                        let Session = RealWrapper.NodeIQQNTWrapperSession[FunctionName](...argArray);
                        //传递Session
                        wrapperSession = Session;

                        let ret = new Proxy(Session, {
                            get: function (target, ClassFunName, receiver) {
                                return function () {
                                    if (ClassFunName == 'init') {
                                        let origin = arguments[3].onSessionInitComplete;
                                        arguments[3].onSessionInitComplete = function () {
                                            //console.log("Listner ", '注册方法 NodeIKernelSessionListener/onSessionInitComplete', ' 参数:', ...arguments);
                                            origin(...arguments);
                                            initCallBack.forEach((cb) => cb(...arguments));
                                            clearHook();
                                        }
                                    }
                                    let ret = Session[ClassFunName](...arguments);
                                    // if (ret instanceof Promise) {
                                    //     ret.then((data) => {
                                    //         console.log("Called ", '实例方法 NodeIQQNTWrapperSession/' + ClassFunName, ' 参数:', ...arguments, '返回:', data);
                                    //     });
                                    // } else {
                                    //     console.log("Called ", '实例方法 NodeIQQNTWrapperSession/' + ClassFunName, ' 参数:', ...arguments, '返回:', ret);
                                    // }

                                    return ret;
                                }

                            }
                        });
                        return ret;
                    }
                });
            }
        }
    }
    );
}
Process.dlopen = function (module, filename, flags = os.constants.dlopen.RTLD_LAZY) {
    let dlopenRet = this.dlopenOrig(module, filename, flags);
    if (filename.indexOf('wrapper.node') == -1) return dlopenRet;
    //仅对Wrapper.node进行处理
    RealWrapper = module.exports;
    //先行获取LoginService操作权
    loginService = new RealWrapper.NodeIKernelLoginService();
    wrapperLoginService = loginService;
    //开始针对性处理
    module.exports = new Proxy({}, {
        get: function (target, ServiceName, receiver) {
            if (ServiceName == 'NodeIKernelLoginService') return CreateFuckService(ServiceName);
            if (ServiceName == 'NodeIQQNTWrapperSession') return CreateFuckService(ServiceName);
            return RealWrapper[ServiceName];
        }
    });
    //返回预先构造的对象
    return dlopenRet;
};

//辅助函数
function clearHook() {
    initCallBack = [];
    process.dlopen = dlopenOrig;
}

function ntIsInitialized_Internal() {
    return wrapperSession !== undefined;
}

function pollForNTInitializationCheck() {
    return new Promise((resolve, reject) => {
        let isSolve = false;
        const intervalRef = setInterval(() => {
            if (isSolve) return;
            try {
                if (ntIsInitialized_Internal()) {
                    isSolve = true;
                    clearInterval(intervalRef);
                    resolve(true);
                }
            } catch (error) {
                reject(error);
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
        }),
    ]).then(result => result ?
        { wrapperSession, wrapperLoginService } :
        Promise.reject("fetchServices Timeout!"),
    );
}
let getWebUiUrlFunc = undefined;
async function NCInit() {
    console.log('[NapCat] [Info] 开始初始化NapCat');

    try {
        const { wrapperSession, wrapperLoginService } = await fetchServices();
        const { NCoreInitFramework, getWebUiUrl } = await import('file://' + path.join(currentPath, './napcat.mjs'));
        getWebUiUrlFunc = getWebUiUrl;
        //传入LoginService Session 其余自载入
        await NCoreInitFramework(wrapperSession, wrapperLoginService, registerInitCallback);
        //console.log("[NapCat] [Info] NapCat初始化完成");
    } catch (error) {
        console.log('[NapCat] [Error] 初始化NapCat失败', error);
    }
}

NCInit();
module.exports = {
    NCgetWebUiUrl: async () => {
        if (getWebUiUrlFunc === undefined) {
            console.log('[NapCat] [Error] 未初始化完成');
            return '';
        }
        return await getWebUiUrlFunc();
    }
};