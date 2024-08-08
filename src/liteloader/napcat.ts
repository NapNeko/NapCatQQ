import { NTEventChannel } from "@/common/framework/event";
import { NapCatPathWrapper } from "@/common/framework/napcat";
import { sleep } from "@/common/utils/helper";
import { LogWrapper } from "@/common/utils/log";
import { proxiedListenerOf } from "@/common/utils/proxy-handler";
import { QQBasicInfoWrapper } from "@/common/utils/QQBasicInfo";
import { NapCatCoreWorkingEnv, loadQQWrapper } from "@/core/core";
import { SelfInfo } from "@/core/entities";
import { LoginListener } from "@/core/listeners";
import { NodeIKernelLoginService } from "@/core/services";
import { selfInfo } from "@/core/wrapper/data";
import { WrapperNodeApi, NodeIQQNTWrapperSession } from "@/core/wrapper/wrapper";
import { NapCatOneBot11Adapter } from "@/onebot";

//LiteLoader ES入口文件
export async function NCoreInitLiteLoader(session: NodeIQQNTWrapperSession, loginService: NodeIKernelLoginService) {
    //在进入本层前是否登录未进行判断
    console.log("NapCat LiteLoader App Loading...");
    let Basicframework = new NapCatPathWrapper();
    let logger = new LogWrapper(Basicframework.logsPath);
    let BasicInfo = new QQBasicInfoWrapper({ logger });
    let LLNC = new NapCatLiteLoader(logger, session, loginService, BasicInfo);
    
    //直到登录成功后，执行下一步
    let selfInfo = await new Promise<SelfInfo>((resolve) => {
        let OBLoginListener = new LoginListener();
        OBLoginListener.onQRCodeLoginSucceed = async (loginResult) => resolve({
            uid: loginResult.uid,
            uin: loginResult.uin,
            nick: '', // 获取不到
            online: true
        });
        loginService.addKernelLoginListener(new LLNC.wrapper.NodeIKernelLoginListener(proxiedListenerOf(OBLoginListener, logger)));
    });
    //启动WebUi

    //初始化LLNC的Onebot实现
    new NapCatOneBot11Adapter();
    
}

export class NapCatLiteLoader {
    public workingEnv: NapCatCoreWorkingEnv = NapCatCoreWorkingEnv.LiteLoader;
    public wrapper: WrapperNodeApi;
    public EventChannel: NTEventChannel;
    public session: NodeIQQNTWrapperSession;
    public logger: LogWrapper;
    public loginListener: LoginListener;
    //public core: NapCatCore;
    constructor(
        logger: LogWrapper,
        session: NodeIQQNTWrapperSession,
        loginService: NodeIKernelLoginService,
        QQBasic: QQBasicInfoWrapper
    ) {
        this.session = session;
        this.logger = logger;
        //context保存
        this.wrapper = loadQQWrapper(QQBasic.getFullQQVesion());
        //载入Wrapper.node
        this.EventChannel = new NTEventChannel(this.wrapper, session);
        this.loginListener = new LoginListener();
        this.loginListener.onQRCodeLoginSucceed = async (arg) => {
            await sleep(2500); // TODO: 等待登录完成 init那堆不知道多久完成 搞清楚之前先用个sleep 2500顶着
            selfInfo.uin = arg.uin;
            selfInfo.uid = arg.uid;
            // 保存基础登录信息
            // 初始化DataListener
        };
        loginService.addKernelLoginListener(new this.wrapper.NodeIKernelLoginListener(
            proxiedListenerOf(this.loginListener, logger)
        ));
    }
}
