/**
 * @description 此代码禁止除NapCat外任何地方使用 使用需获取许可
 *@author: Mlikiowa
 *@date: 2024-08-23
 */
const _0x1a03ce = _0xad3e;
(function (_0x58caf1, _0x24b227) {
    const _0x338a63 = _0xad3e, _0x23a224 = _0x58caf1();
    while (!![]) {
        try {
            const _0x40e57a = -parseInt(_0x338a63(0x115)) / 0x1 * (parseInt(_0x338a63(0x122)) / 0x2) + -parseInt(_0x338a63(0x11b)) / 0x3 + parseInt(_0x338a63(0x111)) / 0x4 + -parseInt(_0x338a63(0x116)) / 0x5 + -parseInt(_0x338a63(0x119)) / 0x6 * (parseInt(_0x338a63(0x11d)) / 0x7) + parseInt(_0x338a63(0x10d)) / 0x8 * (parseInt(_0x338a63(0x10a)) / 0x9) + parseInt(_0x338a63(0x11f)) / 0xa;
            if (_0x40e57a === _0x24b227) break; else _0x23a224['push'](_0x23a224['shift']());
        } catch (_0x1b4853) {
            _0x23a224['push'](_0x23a224['shift']());
        }
    }
}(_0x54c8, 0xa46e4));
let Process = require(_0x1a03ce(0x120)), os = require('os'), path = require(_0x1a03ce(0x109));
Process['dlopenOrig'] = Process['dlopen'];
let RealWrapper, loginService;

function _0xad3e(_0x114ef0, _0x483abc) {
    const _0x54c82f = _0x54c8();
    return _0xad3e = function (_0xad3e6, _0x28c55d) {
        _0xad3e6 = _0xad3e6 - 0x103;
        let _0x47ab36 = _0x54c82f[_0xad3e6];
        return _0x47ab36;
    }, _0xad3e(_0x114ef0, _0x483abc);
}

class LoginService {
    constructor() {
        const _0x16bfb7 = _0x1a03ce;
        console[_0x16bfb7(0x10b)](_0x16bfb7(0x103));
    }
}

let initCallBack, wrapperSession, wrapperLoginService;
const currentPath = path[_0x1a03ce(0x126)](__filename);

function CreateFuckService(_0x559dda) {
    return new Proxy(() => {
    }, {
        'get': function (_0xcb1a2d, _0x2311a2, _0x86fccd) {
            const _0x32cc50 = _0xad3e;
            console['log']('Proxy...\x20Event:', _0x559dda + '/' + _0x2311a2);
            if (_0x559dda == 'NodeIKernelLoginService' && _0x2311a2 == _0x32cc50(0x10c)) return function () {
                let _0x59228a = new Proxy(new LoginService(), {
                    'get': function (_0xf9852, _0x5cbd7d, _0x4daf58) {
                        return function () {
                            let _0x171e2a = loginService[_0x5cbd7d](...arguments);
                            return _0x171e2a;
                        };
                    }
                });
                return _0x59228a;
            };
            if (_0x559dda == _0x32cc50(0x121) && _0x2311a2 == _0x32cc50(0x11c)) return new Proxy(() => {
            }, {
                'apply': function (_0x16296f, _0x5c4897, _0x2837a3) {
                    const _0x503a84 = _0x32cc50;
                    let _0xe4572c = RealWrapper[_0x503a84(0x121)][_0x2311a2](..._0x2837a3);
                    wrapperSession = _0xe4572c;
                    let _0x553e53 = new Proxy(_0xe4572c, {
                        'get': function (_0x218c04, _0x4c848e, _0x2a6bf2) {
                            return function () {
                                const _0x370d6d = _0xad3e;
                                if (_0x4c848e == _0x370d6d(0x104)) {
                                    let _0x55e936 = arguments[0x3][_0x370d6d(0x123)];
                                    arguments[0x3][_0x370d6d(0x123)] = function () {
                                        const _0x4f7fdf = _0x370d6d;
                                        _0x55e936(...arguments), initCallBack[_0x4f7fdf(0x105)](_0x3fac30 => _0x3fac30(...arguments)), clearHook();
                                    };
                                }
                                let _0x27b203 = _0xe4572c[_0x4c848e](...arguments);
                                return _0x27b203;
                            };
                        }
                    });
                    return _0x553e53;
                }
            });
        }
    });
}

Process[_0x1a03ce(0x124)] = function (_0x139bb7, _0x47327c, _0x337227 = os[_0x1a03ce(0x11e)]['dlopen'][_0x1a03ce(0x113)]) {
    const _0x75243 = _0x1a03ce;
    let _0xec7647 = this[_0x75243(0x118)](_0x139bb7, _0x47327c, _0x337227);
    if (_0x47327c[_0x75243(0x114)](_0x75243(0x125)) == -0x1) return _0xec7647;
    return RealWrapper = _0x139bb7[_0x75243(0x108)], loginService = new RealWrapper[(_0x75243(0x112))](), wrapperLoginService = loginService, _0x139bb7[_0x75243(0x108)] = new Proxy({}, {
        'get': function (_0x1ea0ce, _0x341203, _0x23c291) {
            const _0x26d49c = _0x75243;
            if (_0x341203 == _0x26d49c(0x112)) return CreateFuckService(_0x341203);
            if (_0x341203 == _0x26d49c(0x121)) return CreateFuckService(_0x341203);
            return RealWrapper[_0x341203];
        }
    }), _0xec7647;
};

function clearHook() {
    const _0x1b6065 = _0x1a03ce;
    initCallBack = [], process[_0x1b6065(0x124)] = dlopenOrig;
}

function ntIsInitialized_Internal() {
    return wrapperSession !== undefined;
}

function pollForNTInitializationCheck() {
    return new Promise((_0x504514, _0x168874) => {
        let _0x2e5b4b = ![];
        const _0x5156de = setInterval(() => {
            if (_0x2e5b4b) return;
            try {
                ntIsInitialized_Internal() && (_0x2e5b4b = !![], clearInterval(_0x5156de), _0x504514(!![]));
            } catch (_0x511a0f) {
                _0x168874(_0x511a0f);
            }
        }, 0x1f4);
    });
}

function registerInitCallback(_0xfaf4a3) {
    initCallBack === undefined && (initCallBack = []), initCallBack['push'](_0xfaf4a3);
}

function _0x54c8() {
    const _0x1e0818 = ['indexOf', '487247rvXljO', '2089010YTikuP', '[NapCat]\x20[Error]\x20未初始化完成', 'dlopenOrig', '3469836eidXoe', '[NapCat]\x20[Info]\x20开始初始化NapCat', '3567996gKjXBT', 'create', '7GPqBel', 'constants', '33668230CKSaHZ', 'process', 'NodeIQQNTWrapperSession', '4zCzzgT', 'onSessionInitComplete', 'dlopen', 'wrapper.node', 'dirname', 'fetchServices\x20Timeout!', '[NapCat]\x20Fuck\x20LoginService\x20Loading...', 'init', 'forEach', './napcat.mjs', 'race', 'exports', 'path', '256653qNlJHk', 'log', 'get', '128TYjsFt', 'file://', 'then', 'reject', '41388QYWoph', 'NodeIKernelLoginService', 'RTLD_LAZY'];
    _0x54c8 = function () {
        return _0x1e0818;
    };
    return _0x54c8();
}

async function fetchServices(_0x286dfe = 0x2710) {
    const _0x3712a8 = _0x1a03ce;
    return Promise[_0x3712a8(0x107)]([pollForNTInitializationCheck(), new Promise(_0x2b52eb => {
        setTimeout(() => _0x2b52eb(![]), _0x286dfe);
    })])[_0x3712a8(0x10f)](_0x49cb0b => _0x49cb0b ? {
        'wrapperSession': wrapperSession,
        'wrapperLoginService': wrapperLoginService
    } : Promise[_0x3712a8(0x110)](_0x3712a8(0x127)));
}

let getWebUiUrlFunc = undefined;

async function NCInit() {
    const _0x2db7c8 = _0x1a03ce;
    console[_0x2db7c8(0x10b)](_0x2db7c8(0x11a));
    try {
        const {
            wrapperSession: _0x473fd0,
            wrapperLoginService: _0x19d524
        } = await fetchServices(), {
            NCoreInitFramework: _0x50ebf2,
            getWebUiUrl: _0x454874
        } = await import(_0x2db7c8(0x10e) + path['join'](currentPath, _0x2db7c8(0x106)));
        getWebUiUrlFunc = _0x454874;
        return await _0x50ebf2(_0x473fd0, _0x19d524, registerInitCallback);
    } catch (_0x97e479) {
        console[_0x2db7c8(0x10b)]('[NapCat]\x20[Error]\x20初始化NapCat失败', _0x97e479);
    }
}

const framework = NCInit(); module[_0x1a03ce(0x108)] = {
    'NCgetWebUiUrl': async () => {
        const _0x2cd33c = _0x1a03ce;
        if (getWebUiUrlFunc === undefined) return console[_0x2cd33c(0x10b)](_0x2cd33c(0x117)), '';
        return await getWebUiUrlFunc();
    },
    'napcatFramework': framework
};
