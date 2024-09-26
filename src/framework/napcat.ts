import { NapCatPathWrapper } from '@/common/path';
import { LogWrapper } from '@/common/log';
import { proxiedListenerOf } from '@/common/proxy-handler';
import { QQBasicInfoWrapper } from '@/common/qq-basic-info';
import { InstanceContext, loadQQWrapper, NapCatCore, NapCatCoreWorkingEnv } from '@/core';
import { SelfInfo } from '@/core/entities';
import { NodeIKernelLoginListener } from '@/core/listeners';
import { NodeIKernelLoginService } from '@/core/services';
import { NodeIQQNTWrapperSession, WrapperNodeApi } from '@/core/wrapper';
import { InitWebUi, WebUiConfig } from '@/webui';
import { NapCatOneBot11Adapter } from '@/onebot';

//Framework ES入口文件
export async function getWebUiUrl() {
    const WebUiConfigData = (await WebUiConfig.GetWebUIConfig());
    return 'http://127.0.0.1:' + WebUiConfigData.port + '/webui/?token=' + WebUiConfigData.token;
}

export async function NCoreInitFramework(
    session: NodeIQQNTWrapperSession,
    loginService: NodeIKernelLoginService,
    registerInitCallback: (callback: () => void) => void,
) {
    //在进入本层前是否登录未进行判断
    console.log('NapCat Framework App Loading...');
    let dataPath: string | undefined;
    try {
        dataPath = (global as any).LiteLoader.plugins['NapCatQQ'].path.data;
    } catch (error) {
        dataPath = undefined;
    }

    const pathWrapper = new NapCatPathWrapper(dataPath);
    const logger = new LogWrapper(pathWrapper.logsPath);
    const basicInfoWrapper = new QQBasicInfoWrapper({ logger });
    const wrapper = loadQQWrapper(basicInfoWrapper.getFullQQVesion());
    //直到登录成功后，执行下一步
    const selfInfo = await new Promise<SelfInfo>((resolveSelfInfo) => {
        const loginListener = new NodeIKernelLoginListener();
        loginListener.onQRCodeLoginSucceed = async (loginResult) => {
            await new Promise<void>(resolvePendingInit => {
                registerInitCallback(() => resolvePendingInit());
            });
            resolveSelfInfo({
                uid: loginResult.uid,
                uin: loginResult.uin,
                nick: '', // 获取不到
                online: true,
            });
        };
        loginService.addKernelLoginListener(proxiedListenerOf(loginListener, logger) as any);
    });
    // 过早进入会导致addKernelMsgListener等Listener添加失败
    // await sleep(2500);
    // 初始化 NapCatFramework
    const loaderObject = new NapCatFramework(wrapper, session, logger, loginService, selfInfo, basicInfoWrapper, pathWrapper);

    //启动WebUi
    InitWebUi(logger, pathWrapper).then().catch(logger.logError.bind(logger));
    //初始化LLNC的Onebot实现
    new NapCatOneBot11Adapter(loaderObject.core, loaderObject.context, pathWrapper);
}

export class NapCatFramework {
    public core: NapCatCore;
    context: InstanceContext;

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
            workingEnv: NapCatCoreWorkingEnv.Framework,
            wrapper,
            session,
            logger,
            loginService,
            basicInfoWrapper,
            pathWrapper,
        };
        this.core = new NapCatCore(this.context, selfInfo);
    }
}
