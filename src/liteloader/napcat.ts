import { NapCatPathWrapper } from "@/common/framework/napcat";
import { LogWrapper } from "@/common/utils/log";
import { proxiedListenerOf } from "@/common/utils/proxy-handler";
import { QQBasicInfoWrapper } from "@/common/utils/QQBasicInfo";
import { NapCatCore, NapCatCoreWorkingEnv, loadQQWrapper } from "@/core/core";
import { InstanceContext } from "@/core";
import { SelfInfo } from "@/core/entities";
import { LoginListener } from "@/core/listeners";
import { NodeIKernelLoginService } from "@/core/services";
import { WrapperNodeApi, NodeIQQNTWrapperSession } from "@/core/wrapper/wrapper";
import { NapCatOneBot11Adapter } from "@/onebot/main";
import { sleep } from "@/common/utils/helper";

//LiteLoader ES入口文件
export async function NCoreInitLiteLoader(session: NodeIQQNTWrapperSession, loginService: NodeIKernelLoginService) {
    //在进入本层前是否登录未进行判断
    console.log("NapCat LiteLoader App Loading...");
    const pathWrapper = new NapCatPathWrapper();
    const logger = new LogWrapper(pathWrapper.logsPath);
    const basicInfoWrapper = new QQBasicInfoWrapper({ logger });
    const wrapper = loadQQWrapper(basicInfoWrapper.getFullQQVesion());
    //直到登录成功后，执行下一步
    const selfInfo = await new Promise<SelfInfo>((resolve) => {
        const loginListener = new LoginListener();
        loginListener.onQRCodeLoginSucceed = async (loginResult) => resolve({
            uid: loginResult.uid,
            uin: loginResult.uin,
            nick: '', // 获取不到
            online: true
        });
        loginService.addKernelLoginListener(new wrapper.NodeIKernelLoginListener(
            proxiedListenerOf(loginListener, logger)));
    });
    // 过早进入会导致addKernelMsgListener等Listener添加失败
    await sleep(2500);
    // 初始化 NapCatLiteLoader
    const loaderObject = new NapCatLiteLoader(wrapper, session, logger, loginService, selfInfo, basicInfoWrapper);

    //启动WebUi

    //初始化LLNC的Onebot实现
    new NapCatOneBot11Adapter(loaderObject.core, loaderObject.context);
}

export class NapCatLiteLoader {
    public core: NapCatCore;
    context: InstanceContext;

    constructor(
        wrapper: WrapperNodeApi,
        session: NodeIQQNTWrapperSession,
        logger: LogWrapper,
        loginService: NodeIKernelLoginService,
        selfInfo: SelfInfo,
        basicInfoWrapper: QQBasicInfoWrapper,
    ) {
        this.context = {
            workingEnv: NapCatCoreWorkingEnv.LiteLoader,
            wrapper,
            session,
            logger,
            loginService,
            basicInfoWrapper
        };
        this.core = new NapCatCore(this.context, selfInfo);
    }
}
