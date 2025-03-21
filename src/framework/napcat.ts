import { NapCatPathWrapper } from '@/common/path';
import { LogWrapper } from '@/common/log';
import { proxiedListenerOf } from '@/common/proxy-handler';
import { QQBasicInfoWrapper } from '@/common/qq-basic-info';
import { InstanceContext, loadQQWrapper, NapCatCore, NapCatCoreWorkingEnv } from '@/core';
import { SelfInfo } from '@/core/types';
import { NodeIKernelLoginListener } from '@/core/listeners';
import { NodeIKernelLoginService } from '@/core/services';
import { NodeIQQNTWrapperSession, WrapperNodeApi } from '@/core/wrapper';
import { NapCatOneBot11Adapter } from '@/onebot';

//Framework ES入口文件
export async function getWebUiUrl() {
    return 'http://127.0.0.1:' + 6099 + '/webui/?token=napcat';
}

export async function NCoreInitFramework(
    session: NodeIQQNTWrapperSession,
    loginService: NodeIKernelLoginService,
    registerInitCallback: (callback: () => void) => void,
) {
    //在进入本层前是否登录未进行判断
    console.log('NapCat Framework App Loading...');

    process.on('uncaughtException', (err) => {
        console.log('[NapCat] [Error] Unhandled Exception:', err.message);
    });

    process.on('unhandledRejection', (reason) => {
        console.log('[NapCat] [Error] unhandledRejection:', reason);
    });

    const pathWrapper = new NapCatPathWrapper();
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
        loginService.addKernelLoginListener(proxiedListenerOf(loginListener, logger));
    });
    // 过早进入会导致addKernelMsgListener等Listener添加失败
    // await sleep(2500);
    // 初始化 NapCatFramework
    const loaderObject = new NapCatFramework(wrapper, session, logger, loginService, selfInfo, basicInfoWrapper, pathWrapper);
    await loaderObject.core.initCore();

    //初始化LLNC的Onebot实现
    await new NapCatOneBot11Adapter(loaderObject.core, loaderObject.context, pathWrapper).InitOneBot();
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
