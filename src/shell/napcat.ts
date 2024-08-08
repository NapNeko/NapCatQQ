import { NapCatPathWrapper } from "@/common/framework/napcat";
import { LogWrapper } from "@/common/utils/log";
import { QQBasicInfoWrapper } from "@/common/utils/QQBasicInfo";
import { hostname, systemVersion } from "@/common/utils/system";
import { DependsAdapter, DispatcherAdapter, GlobalAdapter } from "@/core/adapters";
import { NapCatCoreWorkingEnv, NapCatCore, loadQQWrapper } from "@/core/core";
import { LoginListener, SessionListener } from "@/core/listeners";
import { NodeIKernelLoginService } from "@/core/services";
import { WrapperNodeApi, NodeIQQNTWrapperEngine, NodeQQNTWrapperUtil, NodeIQQNTWrapperSession } from "@/core/wrapper/wrapper";
import path from "path";
import fs from "fs";
import os from "os";
import { genSessionConfig } from "@/core/wrapper/helper";
import { selfInfo } from "@/core/wrapper/data";

// NapCat Shell App ES 入口文件
export async function NCoreInitShell() {
    console.log("NapCat Shell App Loading...");
    let Basicframework = new NapCatPathWrapper();
    let logger = new LogWrapper(Basicframework.logsPath);
    let BasicInfo = new QQBasicInfoWrapper({ logger });
    new NapCatShell(logger, BasicInfo);
}
export class NapCatShell {
    public QQWrapper: WrapperNodeApi;
    public WorkMode: NapCatCoreWorkingEnv = NapCatCoreWorkingEnv.Shell;
    public Core: NapCatCore | undefined;
    public engine: NodeIQQNTWrapperEngine;
    public util: NodeQQNTWrapperUtil;
    loginService: NodeIKernelLoginService;
    session: NodeIQQNTWrapperSession;
    loginListener: LoginListener;

    get dataPath(): string {
        let result = this.util.getNTUserDataInfoConfig();
        if (!result) {
            result = path.resolve(os.homedir(), './.config/QQ');
            fs.mkdirSync(result, { recursive: true });
        }
        return result;
    }

    get dataPathGlobal(): string {
        return path.resolve(this.dataPath, './nt_qq/global');
    }
    private initSession(BasicInfo: QQBasicInfoWrapper, uin: string, uid: string): Promise<number> {
        return new Promise(async (res, rej) => {
            if (!BasicInfo.QQVersionAppid) throw new Error("QQVersionAppid must be provided");
            const sessionConfig = await genSessionConfig(BasicInfo.QQVersionAppid, BasicInfo.getFullQQVesion(), uin, uid, this.dataPath);
            const sessionListener = new SessionListener();
            sessionListener.onSessionInitComplete = (r: unknown) => {
                if ((r as number) === 0) {
                    return res(0);
                }
                rej(r);
            };
            // const oldOnSendOidbRepl = this.session.onSendOidbRepl;
            // this.session.onSendOidbRepl = (...args: unknown[]) => {
            //   console.log('onSendOidbRepl', args);
            //   return oldOnSendOidbRepl(...args);
            // };
            this.session.init(sessionConfig,
                new this.QQWrapper.NodeIDependsAdapter(new DependsAdapter()),
                new this.QQWrapper.NodeIDispatcherAdapter(new DispatcherAdapter()),
                new this.QQWrapper.NodeIKernelSessionListener(sessionListener)
            );
            try {
                this.session.startNT(0);
            } catch (__) { /* Empty */
                try {
                    this.session.startNT();
                } catch (e) {
                    rej('init failed ' + e);
                }
            }
        });
    }
    constructor(logger: LogWrapper, QQBasic: QQBasicInfoWrapper) {
        this.QQWrapper = loadQQWrapper(QQBasic.getFullQQVesion());
        this.engine = new this.QQWrapper.NodeIQQNTWrapperEngine();
        this.util = new this.QQWrapper.NodeQQNTWrapperUtil();
        this.loginService = new this.QQWrapper.NodeIKernelLoginService();
        this.session = new this.QQWrapper.NodeIQQNTWrapperSession();
        this.loginListener = new LoginListener();
        this.loginListener.onUserLoggedIn = (userid: string) => {
            logger.logError('当前账号(' + userid + ')已登录,无法重复登录');
        };
        this.initConfig(QQBasic.getFullQQVesion(), QQBasic.QQVersionAppid, QQBasic.QQVersionQua);
        this.loginListener.onQRCodeLoginSucceed = (arg) => {
            this.initSession(QQBasic, arg.uin, arg.uid).then((r) => {
                selfInfo.uin = arg.uin;
                selfInfo.uid = arg.uid;
                const dataPath = path.resolve(this.dataPath, './NapCat/data');
                fs.mkdirSync(dataPath, { recursive: true });
                logger.logDebug('本账号数据/缓存目录：', dataPath);
                //this.initDataListener();
            }).catch((e) => {
                logger.logError('initSession failed', e);
                throw new Error(`启动失败: ${JSON.stringify(e)}`);
            });
        };
    }
    initConfig(QQVersion: string | undefined, QQVersionAppid: string | undefined, QQVersionQua: string | undefined) {
        if (!QQVersion || !QQVersionAppid || !QQVersionQua) throw new Error('QQVersion, QQVersionAppid, QQVersionQua must be provided');
        this.engine.initWithDeskTopConfig({
            base_path_prefix: '',
            platform_type: 3,
            app_type: 4,
            app_version: QQVersion,
            os_version: 'Windows 10 Pro',
            use_xlog: true,
            qua: QQVersionQua,
            global_path_config: {
                desktopGlobalPath: this.dataPathGlobal,
            },
            thumb_config: { maxSide: 324, minSide: 48, longLimit: 6, density: 2 }
        }, new this.QQWrapper.NodeIGlobalAdapter(new GlobalAdapter()));
        this.loginService.initConfig({
            machineId: '',
            appid: QQVersionAppid,
            platVer: systemVersion,
            commonPath: this.dataPathGlobal,
            clientVer: QQVersion,
            hostName: hostname
        });
    }
}
