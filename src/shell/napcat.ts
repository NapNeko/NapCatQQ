import type { WrapperNodeApi, NodeIQQNTWrapperEngine, NodeQQNTWrapperUtil, NodeIQQNTWrapperSession } from "@/core/wrapper/wrapper";
import type { NodeIKernelLoginService } from "@/core/services";
import type { NapCatCore } from "@/core";
import type { SelfInfo } from "@/core/entities";

import { LogWrapper } from "@/common/utils/log";
import { LoginListener, SessionListener } from "@/core/listeners";
import { DependsAdapter, DispatcherAdapter, GlobalAdapter } from "@/core/adapters";
import { NapCatPathWrapper } from "@/common/framework/napcat";
import { NapCatCoreWorkingEnv, loadQQWrapper } from "@/core";
import { QQBasicInfoWrapper } from "@/common/utils/QQBasicInfo";
import { hostname, systemVersion } from "@/common/utils/system";
import { genSessionConfig } from "@/core/wrapper/helper";
import { proxiedListenerOf } from "@/common/utils/proxy-handler";

import path from "path";
import fs from "fs";
import os from "os";



// NapCat Shell App ES 入口文件
export async function NCoreInitShell() {
    console.log("NapCat Shell App Loading...");

    let pathWrapper = new NapCatPathWrapper();
    let logger = new LogWrapper(pathWrapper.logsPath);
    let basicInfoWrapper = new QQBasicInfoWrapper({ logger });
    let wrapper = loadQQWrapper(basicInfoWrapper.getFullQQVesion());

    // from constructor
    let engine = new wrapper.NodeIQQNTWrapperEngine();
    let util = new wrapper.NodeQQNTWrapperUtil();
    let loginService = new wrapper.NodeIKernelLoginService();
    let session = new wrapper.NodeIQQNTWrapperSession();

    // from get dataPath
    let dataPath = util.getNTUserDataInfoConfig();
    if (!dataPath) {
        dataPath = path.resolve(os.homedir(), './.config/QQ');
        fs.mkdirSync(dataPath, { recursive: true });
    }
    let dataPathGlobal = path.resolve(dataPath, './nt_qq/global');

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
            thumb_config: { maxSide: 324, minSide: 48, longLimit: 6, density: 2 }
        },
        new wrapper.NodeIGlobalAdapter(new GlobalAdapter())
    );
    loginService.initConfig({
        machineId: '',
        appid: basicInfoWrapper.QQVersionAppid!,
        platVer: systemVersion,
        commonPath: dataPathGlobal,
        clientVer: basicInfoWrapper.getFullQQVesion(),
        hostName: hostname
    });

    let selfInfo = await new Promise<SelfInfo>((resolve) => {
        let loginListener = new LoginListener();

        // from constructor
        loginListener.onUserLoggedIn = (userid: string) => {
            logger.logError('当前账号(' + userid + ')已登录,无法重复登录');
        };

        loginListener.onQRCodeLoginSucceed = async (loginResult) => resolve({
            uid: loginResult.uid,
            uin: loginResult.uin,
            nick: '', // 获取不到
            online: true
        });
        loginService.addKernelLoginListener(new wrapper.NodeIKernelLoginListener(
            proxiedListenerOf(loginListener, logger)));
    });

    // from initSession
    const sessionConfig = await genSessionConfig(
        basicInfoWrapper.QQVersionAppid!,
        basicInfoWrapper.getFullQQVesion(),
        selfInfo.uin,
        selfInfo.uid,
        dataPath
    );
    const sessionListener = new SessionListener();
    sessionListener.onSessionInitComplete = (r: unknown) => {
        if (r !== 0) {
            throw r;
        }
    };
    session.init(
        sessionConfig,
        new wrapper.NodeIDependsAdapter(new DependsAdapter()),
        new wrapper.NodeIDispatcherAdapter(new DispatcherAdapter()),
        new wrapper.NodeIKernelSessionListener(sessionListener)
    );
    try {
        session.startNT(0);
    } catch (__) {
        session.startNT(); // may still throw error; we do not catch that
    }
    // Initialization end!

    const accountDataPath = path.resolve(dataPath, './NapCat/data');
    fs.mkdirSync(dataPath, { recursive: true });
    logger.logDebug('本账号数据/缓存目录：', accountDataPath);
}

export class NapCatShell {
}
