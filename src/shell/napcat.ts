import type { SelfInfo } from '@/core/entities';

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
    NodeIQQNTWrapperSession,
    PlatformType,
    WrapperNodeApi,
} from '@/core';
import { QQBasicInfoWrapper } from '@/common/qq-basic-info';
import { hostname, systemVersion } from '@/common/system';
import { proxiedListenerOf } from '@/common/proxy-handler';

import path from 'path';
import fs from 'fs';
import os from 'os';
import { NodeIKernelLoginService } from '@/core/services';
import { program } from 'commander';
import qrcode from 'qrcode-terminal';
import { NapCatOneBot11Adapter } from '@/onebot';
import { InitWebUi } from '@/webui';
import { WebUiDataRuntime } from '@/webui/src/helper/Data';
import { napCatVersion } from '@/common/version';
import { NodeIO3MiscListener } from '@/core/listeners/NodeIO3MiscListener';

program.option('-q, --qq [number]', 'QQ号').parse(process.argv);
const cmdOptions = program.opts();

// NapCat Shell App ES 入口文件
export async function NCoreInitShell() {
    console.log('NapCat Shell App Loading...');

    const pathWrapper = new NapCatPathWrapper();
    const logger = new LogWrapper(pathWrapper.logsPath);
    const basicInfoWrapper = new QQBasicInfoWrapper({ logger });
    const wrapper = loadQQWrapper(basicInfoWrapper.getFullQQVesion());

    const o3Service = wrapper.NodeIO3MiscService.get();
    o3Service.addO3MiscListener(new NodeIO3MiscListener());

    logger.log(`[NapCat] [Core] NapCat.Core Version: ` + napCatVersion);
    InitWebUi(logger, pathWrapper).then().catch(logger.logError.bind(logger));

    // from constructor
    const engine = wrapper.NodeIQQNTWrapperEngine.get();
    //const util = wrapper.NodeQQNTWrapperUtil.get();
    const loginService = wrapper.NodeIKernelLoginService.get();

    const session = wrapper.NodeIQQNTWrapperSession.create();
    // from get dataPath
    const [dataPath, dataPathGlobal] = (() => {
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
    })();
    const platformMapping: Partial<Record<NodeJS.Platform, PlatformType>> = {
        win32: PlatformType.KWINDOWS,
        darwin: PlatformType.KMAC,
        linux: PlatformType.KLINUX,
    };
    const systemPlatform = platformMapping[os.platform()] ?? PlatformType.KWINDOWS;
    if (!basicInfoWrapper.QQVersionAppid || !basicInfoWrapper.QQVersionQua) throw new Error('QQVersionAppid or QQVersionQua  is not defined');
    // from initConfig
    engine.initWithDeskTopConfig(
        {
            base_path_prefix: '',
            platform_type: systemPlatform,
            app_type: 4,
            app_version: basicInfoWrapper.getFullQQVesion(),
            os_version: systemVersion,
            use_xlog: false,
            qua: basicInfoWrapper.QQVersionQua,
            global_path_config: {
                desktopGlobalPath: dataPathGlobal,
            },
            thumb_config: { maxSide: 324, minSide: 48, longLimit: 6, density: 2 },
        },
        new NodeIGlobalAdapter(),
    );
    loginService.initConfig({
        machineId: '',
        appid: basicInfoWrapper.QQVersionAppid,
        platVer: systemVersion,
        commonPath: dataPathGlobal,
        clientVer: basicInfoWrapper.getFullQQVesion(),
        hostName: hostname,
    });

    let quickLoginUin = cmdOptions.qq; // undefined | 'true' | string
    const historyLoginList = (await loginService.getLoginList()).LocalLoginInfoList;
    if (quickLoginUin == 'true') {
        if (historyLoginList.length > 0) {
            quickLoginUin = historyLoginList[0].uin;
            logger.log(`-q 指令指定使用最近的 QQ ${quickLoginUin} 进行快速登录`);
        } else {
            quickLoginUin = '';
        }
    }
    const dataTimestape = new Date().getTime().toString();
    o3Service.reportAmgomWeather('login', 'a1', [dataTimestape, '0', '0']);
    const selfInfo = await new Promise<SelfInfo>((resolve) => {
        const loginListener = new NodeIKernelLoginListener();
        let isLogined = false;
        // from constructor
        loginListener.onUserLoggedIn = (userid: string) => {
            logger.logError.bind(logger)(`当前账号(${userid})已登录,无法重复登录`);
        };

        loginListener.onQRCodeLoginSucceed = async (loginResult) => {
            isLogined = true;
            resolve({
                uid: loginResult.uid,
                uin: loginResult.uin,
                nick: '', // 获取不到
                online: true,
            });
        };

        loginListener.onQRCodeGetPicture = ({ pngBase64QrcodeData, qrcodeUrl }) => {
            //设置WebuiQrcode
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
        loginListener.onQRCodeSessionFailed = (errType: number, errCode: number, errMsg: string) => {
            if (!isLogined) {
                logger.logError.bind(logger)('[Core] [Login] Login Error,ErrCode: ', errCode, ' ErrMsg:', errMsg);
                if (errType == 1 && errCode == 3) {
                    // 二维码过期刷新
                }
                loginService.getQRCodePicture();
            }
        };
        loginListener.onLoginFailed = (args) => {
            logger.logError.bind(logger)('[Core] [Login] Login Error , ErrInfo: ', args);
        };

        loginService.addKernelLoginListener(proxiedListenerOf(loginListener, logger));
        const isConnect = loginService.connect();
        if (!isConnect) {
            logger.logError.bind(logger)('核心登录服务连接失败!');
            return;
        }
        logger.log('核心登录服务连接成功!');
        // 实现WebUi快速登录
        loginService.getLoginList().then((res) => {
            // 遍历 res.LocalLoginInfoList[x].isQuickLogin是否可以 res.LocalLoginInfoList[x].uin 转为string 加入string[] 最后遍历完成调用WebUiDataRuntime.setQQQuickLoginList
            WebUiDataRuntime.setQQQuickLoginList(res.LocalLoginInfoList.filter((item) => item.isQuickLogin).map((item) => item.uin.toString()));
        });
        if (basicInfoWrapper.QQVersionConfig?.curVersion) {
            loginService.getLoginMiscData('hotUpdateSign').then((res) => {
                if (res.result === 0) {
                    loginService.setLoginMiscData('hotUpdateSign', res.value);
                }
            });
            session.getNodeMiscService().writeVersionToRegistry(basicInfoWrapper.QQVersionConfig?.curVersion);
        }
        WebUiDataRuntime.setQuickLoginCall(async (uin: string) => {
            return await new Promise((resolve) => {
                if (uin) {
                    logger.log.bind(logger)('正在快速登录 ', uin);
                    loginService.quickLoginWithUin(uin).then(res => {
                        if (res.loginErrorInfo.errMsg) {
                            resolve({ result: false, message: res.loginErrorInfo.errMsg });
                        }
                        resolve({ result: true, message: '' });
                    }).catch((e) => {
                        logger.logError.bind(logger)(e);
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
                setTimeout(() => {
                    loginService.quickLoginWithUin(quickLoginUin)
                        .then(result => {
                            if (result.loginErrorInfo.errMsg) {
                                logger.logError.bind(logger)('快速登录错误：', result.loginErrorInfo.errMsg);
                                if (!isLogined) loginService.getQRCodePicture();
                            }
                        })
                        .catch();
                }, 1000);
            } else {
                logger.logError.bind(logger)('快速登录失败，未找到该 QQ 历史登录记录，将使用二维码登录方式');
                if (!isLogined) loginService.getQRCodePicture();
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
        }
    });
    // BEFORE LOGGING IN
    const amgomDataPiece = 'eb1fd6ac257461580dc7438eb099f23aae04ca679f4d88f53072dc56e3bb1129';
    o3Service.setAmgomDataPiece(basicInfoWrapper.QQVersionAppid, new Uint8Array(Buffer.from(amgomDataPiece, 'hex')));
    // AFTER LOGGING IN
    //99b15bdb4c984fc69d5aa1feb9aa16xx --> 99b15bdb-4c98-4fc6-9d5a-a1feb9aa16xx
    //把guid从左向右转换为guid格式 loginService.getMachineGuid()

    let guid = loginService.getMachineGuid();
    guid = guid.slice(0, 8) + '-' + guid.slice(8, 12) + '-' + guid.slice(12, 16) + '-' + guid.slice(16, 20) + '-' + guid.slice(20);
    //console.log('guid:', guid);
    //NodeIO3MiscService/reportAmgomWeather  login a6 [ '1726748166943', '184', '329' ]
    o3Service.reportAmgomWeather('login', 'a6', [dataTimestape, '184', '329']);
    // if(session.getUnitedConfigService()){
    //     session.getUnitedConfigService().fetchUnitedCommendConfig([]);
    // }
    // from initSession
    await new Promise<void>(async (resolve, reject) => {
        const sessionConfig = await genSessionConfig(
            guid,
            basicInfoWrapper.QQVersionAppid!,
            basicInfoWrapper.getFullQQVesion(),
            selfInfo.uin,
            selfInfo.uid,
            dataPath,
        );
        const sessionListener = new NodeIKernelSessionListener();
        sessionListener.onSessionInitComplete = (r: unknown) => {
            if (r === 0) {
                resolve();
            } else {
                reject(r);
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
        } catch (_) { /* Empty */
            try {
                session.startNT();
            } catch (e) {
                reject('init failed ' + e);
            }
        }
    });
    // Initialization end!

    const accountDataPath = path.resolve(dataPath, './NapCat/data');
    fs.mkdirSync(dataPath, { recursive: true });
    logger.logDebug('本账号数据/缓存目录：', accountDataPath);

    new NapCatShell(
        wrapper,
        session,
        logger,
        loginService,
        selfInfo,
        basicInfoWrapper,
        pathWrapper,
    );
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

        // TODO: complete ob11 adapter initialization logic
        new NapCatOneBot11Adapter(this.core, this.context, pathWrapper);
    }
}

NCoreInitShell();
