import type { SelfInfo } from '@/core/entities';

import { LogWrapper } from '@/common/utils/log';
import { LoginListener, SessionListener } from '@/core/listeners';
import { DependsAdapter, DispatcherAdapter, GlobalAdapter } from '@/core/adapters';
import { NapCatPathWrapper } from '@/common/framework/napcat';
import {
    InstanceContext,
    loadQQWrapper,
    NapCatCore,
    NapCatCoreWorkingEnv,
    NodeIQQNTWrapperSession,
    WrapperNodeApi,
} from '@/core';
import { QQBasicInfoWrapper } from '@/common/utils/QQBasicInfo';
import { hostname, systemVersion } from '@/common/utils/system';
import { genSessionConfig } from '@/core/wrapper/helper';
import { proxiedListenerOf } from '@/common/utils/proxy-handler';

import path from 'path';
import fs from 'fs';
import os from 'os';
import { NodeIKernelLoginService } from '@/core/services';
import { program } from 'commander';
import qrcode from 'qrcode-terminal';
import { NapCatOneBot11Adapter } from '@/onebot';

program.option('-q, --qq [number]', 'QQ号').parse(process.argv);
const cmdOptions = program.opts();

// NapCat Shell App ES 入口文件
export async function NCoreInitShell() {
    console.log('NapCat Shell App Loading...');

    const pathWrapper = new NapCatPathWrapper();
    const logger = new LogWrapper(pathWrapper.logsPath);
    const basicInfoWrapper = new QQBasicInfoWrapper({ logger });
    const wrapper = loadQQWrapper(basicInfoWrapper.getFullQQVesion());

    // from constructor
    const engine = new wrapper.NodeIQQNTWrapperEngine();
    const util = new wrapper.NodeQQNTWrapperUtil();
    const loginService = new wrapper.NodeIKernelLoginService();
    const session = new wrapper.NodeIQQNTWrapperSession();

    // from get dataPath
    let dataPath = util.getNTUserDataInfoConfig();
    if (!dataPath) {
        dataPath = path.resolve(os.homedir(), './.config/QQ');
        fs.mkdirSync(dataPath, { recursive: true });
    }
    const dataPathGlobal = path.resolve(dataPath, './nt_qq/global');

    // from initConfig
    engine.initWithDeskTopConfig(
        {
            base_path_prefix: '',
            platform_type: 3,
            app_type: 4,
            app_version: basicInfoWrapper.getFullQQVesion(),
            os_version: 'Windows 10 Pro',
            use_xlog: true,
            qua: basicInfoWrapper.QQVersionQua!,
            global_path_config: {
                desktopGlobalPath: dataPathGlobal,
            },
            thumb_config: { maxSide: 324, minSide: 48, longLimit: 6, density: 2 },
        },
        new wrapper.NodeIGlobalAdapter(new GlobalAdapter()),
    );
    loginService.initConfig({
        machineId: '',
        appid: basicInfoWrapper.QQVersionAppid!,
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

    const selfInfo = await new Promise<SelfInfo>((resolve, reject) => {
        const loginListener = new LoginListener();

        // from constructor
        loginListener.onUserLoggedIn = (userid: string) => {
            logger.logError(`当前账号(${userid})已登录,无法重复登录`);
        };

        loginListener.onQRCodeLoginSucceed = async (loginResult) => resolve({
            uid: loginResult.uid,
            uin: loginResult.uin,
            nick: '', // 获取不到
            online: true,
        });

        loginListener.onQRCodeGetPicture = ({ pngBase64QrcodeData, qrcodeUrl }) => {
            const realBase64 = pngBase64QrcodeData.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(realBase64, 'base64');
            logger.logWarn('请扫描下面的二维码，然后在手Q上授权登录：');
            const qrcodePath = path.join(pathWrapper.binaryPath, 'qrcode.png');
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

        loginService.addKernelLoginListener(new wrapper.NodeIKernelLoginListener(
            proxiedListenerOf(loginListener, logger)));

        if (quickLoginUin && historyLoginList.some(u => u.uin === quickLoginUin)) {
            logger.log('正在快速登录 ', quickLoginUin);
            setTimeout(() => {
                loginService.quickLoginWithUin(quickLoginUin)
                    .then(result => {
                        if (result.loginErrorInfo.errMsg) {
                            logger.logError('快速登录错误：', result.loginErrorInfo.errMsg);
                            reject();
                        }
                    })
                    .catch(e => reject(e));
            }, 1000);
        } else {
            logger.log('没有 -q 指令指定快速登录，或未曾登录过这个 QQ，将使用二维码登录方式');
            if (historyLoginList.length > 0) {
                logger.log(`可用于快速登录的 QQ：\n${historyLoginList.map((u, index) => `${index + 1}. ${u.uin} ${u.nickName}`).join('\n')
                    }`);
            }
            loginService.getQRCodePicture();
        }
    });
    // BEFORE LOGGING IN

    // AFTER LOGGING IN

    // from initSession
    await new Promise<void>(async (resolve, reject) => {
        const sessionConfig = await genSessionConfig(
            basicInfoWrapper.QQVersionAppid!,
            basicInfoWrapper.getFullQQVesion(),
            selfInfo.uin,
            selfInfo.uid,
            dataPath,
        );
        const sessionListener = new SessionListener();
        sessionListener.onSessionInitComplete = (r: unknown) => {
            if (r === 0) {
                resolve();
            } else {
                reject(r);
            }
        };
        session.init(
            sessionConfig,
            new wrapper.NodeIDependsAdapter(new DependsAdapter()),
            new wrapper.NodeIDispatcherAdapter(new DispatcherAdapter()),
            new wrapper.NodeIKernelSessionListener(sessionListener),
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
