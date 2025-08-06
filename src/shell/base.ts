import type { SelfInfo } from '@/core/types';

import { LogWrapper } from '@/common/log';
import { NodeIKernelLoginListener, NodeIKernelSessionListener } from '@/core/listeners';
import { NodeIDependsAdapter, NodeIDispatcherAdapter, NodeIGlobalAdapter } from '@/core/adapters';
import { NapCatPathWrapper } from '@/common/path';
import {
    genSessionConfig,
    InstanceContext,
    loadQQWrapper,
    NapCatCore,
    NapCatCoreWorkingEnv,
    NodeIQQNTWrapperEngine,
    NodeIQQNTWrapperSession,
    PlatformType,
    WrapperNodeApi,
    WrapperSessionInitConfig,
} from '@/core';
import { QQBasicInfoWrapper } from '@/common/qq-basic-info';
import { hostname, systemVersion } from '@/common/system';
import { proxiedListenerOf } from '@/common/proxy-handler';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { LoginListItem, NodeIKernelLoginService } from '@/core/services';
import { program } from 'commander';
import qrcode from '@/qrcode/lib/main';
import { NapCatOneBot11Adapter } from '@/onebot';
import { InitWebUi } from '@/webui';
import { WebUiDataRuntime } from '@/webui/src/helper/Data';
import { napCatVersion } from '@/common/version';
import { NodeIO3MiscListener } from '@/core/listeners/NodeIO3MiscListener';
import { sleep } from '@/common/helper';
import { downloadFFmpegIfNotExists } from '@/common/download-ffmpeg';
import { FFmpegService } from '@/common/ffmpeg';
import { connectToNamedPipe } from '@/shell/pipe';
// NapCat Shell App ES 入口文件
async function handleUncaughtExceptions(logger: LogWrapper) {
    process.on('uncaughtException', (err) => {
        logger.logError('[NapCat] [Error] Unhandled Exception:', err.message);
    });
    process.on('unhandledRejection', (reason) => {
        logger.logError('[NapCat] [Error] unhandledRejection:', reason);
    });
}

function getDataPaths(wrapper: WrapperNodeApi): [string, string] {
    if (os.platform() === 'darwin') {
        const userPath = os.homedir();
        const appDataPath = path.resolve(userPath, './Library/Application Support/QQ');
        return [appDataPath, path.join(appDataPath, 'global')];
    }
    let dataPath = wrapper.NodeQQNTWrapperUtil.getNTUserDataInfoConfig();
    if (!dataPath) {
        dataPath = path.resolve(os.homedir(), './.config/QQ');
        fs.mkdirSync(dataPath, { recursive: true });
    }
    const dataPathGlobal = path.resolve(dataPath, './nt_qq/global');
    return [dataPath, dataPathGlobal];
}

function getPlatformType(): PlatformType {
    const platformMapping: Partial<Record<NodeJS.Platform, PlatformType>> = {
        win32: PlatformType.KWINDOWS,
        darwin: PlatformType.KMAC,
        linux: PlatformType.KLINUX,
    };
    return platformMapping[os.platform()] ?? PlatformType.KWINDOWS;
}

async function initializeEngine(
    engine: NodeIQQNTWrapperEngine,
    basicInfoWrapper: QQBasicInfoWrapper,
    dataPathGlobal: string,
    systemPlatform: PlatformType,
    systemVersion: string
) {
    engine.initWithDeskTopConfig(
        {
            base_path_prefix: '',
            platform_type: systemPlatform,
            app_type: 4,
            app_version: basicInfoWrapper.getFullQQVersion(),
            os_version: systemVersion,
            use_xlog: false,
            qua: basicInfoWrapper.QQVersionQua ?? '',
            global_path_config: {
                desktopGlobalPath: dataPathGlobal,
            },
            thumb_config: { maxSide: 324, minSide: 48, longLimit: 6, density: 2 },
        },
        new NodeIGlobalAdapter(),
    );
}

async function initializeLoginService(
    loginService: NodeIKernelLoginService,
    basicInfoWrapper: QQBasicInfoWrapper,
    dataPathGlobal: string,
    systemVersion: string,
    hostname: string
) {
    loginService.initConfig({
        machineId: '',
        appid: basicInfoWrapper.QQVersionAppid ?? '',
        platVer: systemVersion,
        commonPath: dataPathGlobal,
        clientVer: basicInfoWrapper.getFullQQVersion(),
        hostName: hostname,
    });
}

async function handleLogin(
    loginService: NodeIKernelLoginService,
    logger: LogWrapper,
    pathWrapper: NapCatPathWrapper,
    quickLoginUin: string | undefined,
    historyLoginList: LoginListItem[]
): Promise<SelfInfo> {
    let context = { isLogined: false };
    let inner_resolve: (value: SelfInfo) => void;
    let selfInfo: Promise<SelfInfo> = new Promise((resolve) => {
        inner_resolve = resolve;
    });
    // 连接服务

    const loginListener = new NodeIKernelLoginListener();
    loginListener.onUserLoggedIn = (userid: string) => {
        logger.logError(`当前账号(${userid})已登录,无法重复登录`);
    };
    loginListener.onQRCodeLoginSucceed = async (loginResult) => {
        context.isLogined = true;
        inner_resolve({
            uid: loginResult.uid,
            uin: loginResult.uin,
            nick: '',
            online: true,
        });

    };
    loginListener.onLoginConnected = () => {
        waitForNetworkConnection(loginService, logger).then(() => {
            handleLoginInner(context, logger, loginService, quickLoginUin, historyLoginList).then().catch(e => logger.logError(e));
            loginListener.onLoginConnected = () => { };
        });
    }
    loginListener.onQRCodeGetPicture = ({ pngBase64QrcodeData, qrcodeUrl }) => {
        WebUiDataRuntime.setQQLoginQrcodeURL(qrcodeUrl);

        const realBase64 = pngBase64QrcodeData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(realBase64, 'base64');
        logger.logWarn('请扫描下面的二维码，然后在手Q上授权登录：');
        const qrcodePath = path.join(pathWrapper.cachePath, 'qrcode.png');
        qrcode.generate(qrcodeUrl, { small: true }, (res) => {
            logger.logWarn([
                '\n',
                res,
                '二维码解码URL: ' + qrcodeUrl,
                '如果控制台二维码无法扫码，可以复制解码url到二维码生成网站生成二维码再扫码，也可以打开下方的二维码路径图片进行扫码。',
            ].join('\n'));
            fs.writeFile(qrcodePath, buffer, {}, () => {
                logger.logWarn('二维码已保存到', qrcodePath);
            });
        });
    };

    loginListener.onQRCodeSessionFailed = (errType: number, errCode: number) => {
        if (!context.isLogined) {
            logger.logError('[Core] [Login] Login Error,ErrType: ', errType, ' ErrCode:', errCode);
            if (errType == 1 && errCode == 3) {
                // 二维码过期刷新
            }
            loginService.getQRCodePicture();
        }
    };

    loginListener.onLoginFailed = (...args) => {
        logger.logError('[Core] [Login] Login Error , ErrInfo: ', JSON.stringify(args));
    };

    loginService.addKernelLoginListener(proxiedListenerOf(loginListener, logger));
    loginService.connect();
    return await selfInfo;
}
async function handleLoginInner(context: { isLogined: boolean }, logger: LogWrapper, loginService: NodeIKernelLoginService, quickLoginUin: string | undefined, historyLoginList: LoginListItem[]) {
    WebUiDataRuntime.setQuickLoginCall(async (uin: string) => {
        return await new Promise((resolve) => {
            if (uin) {
                logger.log('正在快速登录 ', uin);
                loginService.quickLoginWithUin(uin).then(res => {
                    if (res.loginErrorInfo.errMsg) {
                        resolve({ result: false, message: res.loginErrorInfo.errMsg });
                    }
                    resolve({ result: true, message: '' });
                }).catch((e) => {
                    logger.logError(e);
                    resolve({ result: false, message: '快速登录发生错误' });
                });
            } else {
                resolve({ result: false, message: '快速登录失败' });
            }
        });
    });
    if (quickLoginUin) {
        if (historyLoginList.some(u => u.uin === quickLoginUin)) {
            logger.log('正在快速登录 ', quickLoginUin);
            loginService.quickLoginWithUin(quickLoginUin)
                .then(result => {
                    if (result.loginErrorInfo.errMsg) {
                        logger.logError('快速登录错误：', result.loginErrorInfo.errMsg);
                        if (!context.isLogined) loginService.getQRCodePicture();
                    }
                })
                .catch();
        } else {
            logger.logError('快速登录失败，未找到该 QQ 历史登录记录，将使用二维码登录方式');
            if (!context.isLogined) loginService.getQRCodePicture();
        }
    } else {
        logger.log('没有 -q 指令指定快速登录，将使用二维码登录方式');
        if (historyLoginList.length > 0) {
            logger.log(`可用于快速登录的 QQ：\n${historyLoginList
                .map((u, index) => `${index + 1}. ${u.uin} ${u.nickName}`)
                .join('\n')
                }`);
        }
        loginService.getQRCodePicture();
        try {
            await WebUiDataRuntime.runWebUiConfigQuickFunction();
        } catch (error) {
            logger.logError('WebUi 快速登录失败 执行失败', error);
        }
    }

    loginService.getLoginList().then((res) => {
        // 遍历 res.LocalLoginInfoList[x].isQuickLogin是否可以 res.LocalLoginInfoList[x].uin 转为string 加入string[] 最后遍历完成调用WebUiDataRuntime.setQQQuickLoginList
        const list = res.LocalLoginInfoList.filter((item) => item.isQuickLogin);
        WebUiDataRuntime.setQQQuickLoginList(list.map((item) => item.uin.toString()));
        WebUiDataRuntime.setQQNewLoginList(list);
    });
}

async function initializeSession(
    session: NodeIQQNTWrapperSession,
    sessionConfig: WrapperSessionInitConfig
) {
    return new Promise<void>((resolve, reject) => {
        const sessionListener = new NodeIKernelSessionListener();
        sessionListener.onOpentelemetryInit = (info) => {
            if (info.is_init) {
                resolve();
            } else {
                reject(new Error('opentelemetry init failed'));
            }
        };
        session.init(
            sessionConfig,
            new NodeIDependsAdapter(),
            new NodeIDispatcherAdapter(),
            sessionListener,
        );
        try {
            session.startNT(0);
        } catch {
            try {
                session.startNT();
            } catch (e: unknown) {
                reject(new Error('init failed ' + (e as Error).message));
            }
        }
    });
}
async function handleProxy(session: NodeIQQNTWrapperSession, logger: LogWrapper) {
    if (process.env['NAPCAT_PROXY_PORT']) {
        session.getMSFService().setNetworkProxy({
            userName: '',
            userPwd: '',
            address: process.env['NAPCAT_PROXY_ADDRESS'] || '127.0.0.1',
            port: +process.env['NAPCAT_PROXY_PORT'],
            proxyType: 2,
            domain: '',
            isSocket: true
        });
        logger.logWarn('已设置代理', process.env['NAPCAT_PROXY_ADDRESS'], process.env['NAPCAT_PROXY_PORT']);
    } else if (process.env['NAPCAT_PROXY_CLOSE']) {
        session.getMSFService().setNetworkProxy({
            userName: '',
            userPwd: '',
            address: '',
            port: 0,
            proxyType: 0,
            domain: '',
            isSocket: false
        });
    }
}

async function waitForNetworkConnection(loginService: NodeIKernelLoginService, logger: LogWrapper) {
    let network_ok = false;
    let tryCount = 0;
    while (!network_ok) {
        network_ok = loginService.getMsfStatus() !== 3;// win 11 0连接 1未连接
        logger.log('等待网络连接...');
        await sleep(500);
        tryCount++;
    }
    logger.log('网络已连接');
    return network_ok;
}

export async function NCoreInitShell() {
    console.log('NapCat Shell App Loading...');
    const pathWrapper = new NapCatPathWrapper();
    const logger = new LogWrapper(pathWrapper.logsPath);
    handleUncaughtExceptions(logger);
    await connectToNamedPipe(logger).catch(e => logger.logError('命名管道连接失败', e));
    if (!process.env['NAPCAT_DISABLE_FFMPEG_DOWNLOAD']) {
        downloadFFmpegIfNotExists(logger).then(({ path, reset }) => {
            if (reset && path) {
                FFmpegService.setFfmpegPath(path, logger);
            }
        }).catch(e => {
            logger.logError('[Ffmpeg] Error:', e);
        });
    }
    const basicInfoWrapper = new QQBasicInfoWrapper({ logger });
    const wrapper = loadQQWrapper(basicInfoWrapper.getFullQQVersion());

    const o3Service = wrapper.NodeIO3MiscService.get();
    o3Service.addO3MiscListener(new NodeIO3MiscListener());

    logger.log('[NapCat] [Core] NapCat.Core Version: ' + napCatVersion);
    InitWebUi(logger, pathWrapper).then().catch(e => logger.logError(e));

    const engine = wrapper.NodeIQQNTWrapperEngine.get();
    const loginService = wrapper.NodeIKernelLoginService.get();
    const session = wrapper.NodeIQQNTWrapperSession.create();

    const [dataPath, dataPathGlobal] = getDataPaths(wrapper);
    const systemPlatform = getPlatformType();

    if (!basicInfoWrapper.QQVersionAppid || !basicInfoWrapper.QQVersionQua) throw new Error('QQVersionAppid or QQVersionQua  is not defined');

    await initializeEngine(engine, basicInfoWrapper, dataPathGlobal, systemPlatform, systemVersion);
    await initializeLoginService(loginService, basicInfoWrapper, dataPathGlobal, systemVersion, hostname);
    handleProxy(session, logger);
    program.option('-q, --qq [number]', 'QQ号').parse(process.argv);
    const cmdOptions = program.opts();
    const quickLoginUin = cmdOptions['qq'];
    const historyLoginList = (await loginService.getLoginList()).LocalLoginInfoList;

    const dataTimestape = new Date().getTime().toString();
    o3Service.reportAmgomWeather('login', 'a1', [dataTimestape, '0', '0']);

    const selfInfo = await handleLogin(loginService, logger, pathWrapper, quickLoginUin, historyLoginList);
    const amgomDataPiece = 'eb1fd6ac257461580dc7438eb099f23aae04ca679f4d88f53072dc56e3bb1129';
    o3Service.setAmgomDataPiece(basicInfoWrapper.QQVersionAppid, new Uint8Array(Buffer.from(amgomDataPiece, 'hex')));

    let guid = loginService.getMachineGuid();
    guid = guid.slice(0, 8) + '-' + guid.slice(8, 12) + '-' + guid.slice(12, 16) + '-' + guid.slice(16, 20) + '-' + guid.slice(20);
    o3Service.reportAmgomWeather('login', 'a6', [dataTimestape, '184', '329']);

    const sessionConfig = await genSessionConfig(
        guid,
        basicInfoWrapper.QQVersionAppid,
        basicInfoWrapper.getFullQQVersion(),
        selfInfo.uin,
        selfInfo.uid,
        dataPath,
    );

    await initializeSession(session, sessionConfig);

    const accountDataPath = path.resolve(dataPath, './NapCat/data');
    //判断dataPath是否为根目录 或者 D:/ 之类的盘目录
    if (dataPath !== '/' && /^[a-zA-Z]:\\$/.test(dataPath) === false) {
        try {
            fs.mkdirSync(accountDataPath, { recursive: true });
        } catch (error) {
            logger.logError('创建accountDataPath失败', error);
        }
    }

    logger.logDebug('本账号数据/缓存目录：', accountDataPath);

    await new NapCatShell(
        wrapper,
        session,
        logger,
        loginService,
        selfInfo,
        basicInfoWrapper,
        pathWrapper,
    ).InitNapCat();
}


export class NapCatShell {
    readonly core: NapCatCore;
    readonly context: InstanceContext;

    constructor(
        wrapper: WrapperNodeApi,
        session: NodeIQQNTWrapperSession,
        logger: LogWrapper,
        loginService: NodeIKernelLoginService,
        selfInfo: SelfInfo,
        basicInfoWrapper: QQBasicInfoWrapper,
        pathWrapper: NapCatPathWrapper,
    ) {
        this.context = {
            workingEnv: NapCatCoreWorkingEnv.Shell,
            wrapper,
            session,
            logger,
            loginService,
            basicInfoWrapper,
            pathWrapper,
        };
        this.core = new NapCatCore(this.context, selfInfo);

    }
    async InitNapCat() {
        await this.core.initCore();
        new NapCatOneBot11Adapter(this.core, this.context, this.context.pathWrapper).InitOneBot()
            .catch(e => this.context.logger.logError('初始化OneBot失败', e));
    }
}

