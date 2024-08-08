// NapCat CommonJS 入口文件
const path = require('path');
const CurrentPath = path.dirname(__filename);
let Process = require('process');
let os = require('os');

Process.dlopenOrig = Process.dlopen

let proxyHandler = {
    get(target, prop, receiver) {
        if (typeof target[prop] === 'undefined') {
            return (...args) => {
                console.log(`[NapCat] [Info] ${target.constructor.name} ${prop}`, ...args);
            };
        }
        return Reflect.get(target, prop, receiver);
    }
};

let WrapperSession = undefined;//NativeNpdeSession
let WrapperNodeApi = undefined;//NativeNpdeApi
let WrapperLoginService = undefined;

Process.dlopen = function (module, filename, flags = os.constants.dlopen.RTLD_LAZY) {
    let dlopenRet = this.dlopenOrig(module, filename, flags)
    for (let export_name in module.exports) {
        module.exports[export_name] = new Proxy(module.exports[export_name], {
            construct: (target, args, _newTarget) => {
                let ret = new target(...args)
                if (export_name === 'NodeIQQNTWrapperSession') WrapperSession = ret
                if (export_name === 'NodeIKernelLoginService') WrapperLoginService = ret
                return ret
            },
        })
    }
    if (filename.toLowerCase().indexOf('wrapper.node') != -1) {
        WrapperNodeApi = module.exports;
    }
    return dlopenRet;
}
function getWrapperSession() {
    return WrapperSession;
}
function getWrapperLoginService() {
    return WrapperLoginService;
}
function getWrapperNodeApi() {
    return WrapperNodeApi;
}
function NTIsInit() {
    return WrapperSession != undefined && WrapperNodeApi != undefined && WrapperLoginService != undefined;
}
function pollForNTInit() {
    return new Promise((resolve, reject) => {
        let isSolve = false;
        const intervalId = setInterval(() => {
            if (isSolve) return;
            try {
                if (NTIsInit()) {
                    clearInterval(intervalId);
                    isSolve = true;
                    resolve(true);
                }
            } catch (error) {
                clearInterval(intervalId);
                reject(error);
            }
        }, 500);
    });
}

async function checkNTIsInit() {
    return Promise.race([
        pollForNTInit(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("NTIsInit is false after 10 seconds")), 10000))
    ]);
}
async function NCInit() {
    console.log("[NapCat] [Info] 开始初始化NapCat");
    //await import("file://" + path.join(CurrentPath, './napcat.mjs'));
    //传入LoginService Session 其余自载入
    console.log("[NapCat] [Info] NapCat初始化完成");
}
(async () => {
    try {
        await checkNTIsInit();
    }
    catch (error) {
        console.log("[NapCat] [Error] 很遗憾在NTQQ初始化阶段失败");
        return;
        //阻止下一步
    }
    console.log("[NapCat] [Info] NTQQ初始化成功");
    console.log(getWrapperSession(), getWrapperLoginService());
    //NTCore.instance = new NTCoreWrapper(getWrapperNodeApi(), getWrapperSession());
    // 挂载NTQQ 到 NapCat Core
    let NCLoginListener = {};
    NCLoginListener.onQRCodeLoginSucceed = (arg) => {
        //登录成功 登录成功立刻进入真正初始化
        console.log("[NapCat] [Info] UIN: ", arg.uin, " 登录成功!")
        NCInit().then().catch();
    }
    // 添加Login监听
    getWrapperLoginService().addKernelLoginListener(new (getWrapperNodeApi().NodeIKernelLoginListener)(new Proxy(NCLoginListener, proxyHandler)));

    //await import("file://" + path.join(CurrentPath, './napcat.mjs'));
})();