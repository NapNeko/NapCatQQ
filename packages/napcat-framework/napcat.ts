import { NapCatPathWrapper } from 'napcat-common/src/path';
import { LogWrapper } from 'napcat-common/src/log';
import { proxiedListenerOf } from 'napcat-common/src/proxy-handler';
import { QQBasicInfoWrapper } from 'napcat-common/src/qq-basic-info';
import { InstanceContext, loadQQWrapper, NapCatCore, NapCatCoreWorkingEnv } from 'napcat-core/index';
import { SelfInfo } from 'napcat-core/types';
import { NodeIKernelLoginListener } from 'napcat-core/listeners';
import { NodeIKernelLoginService } from 'napcat-core/services';
import { NodeIQQNTWrapperSession, WrapperNodeApi } from 'napcat-core/wrapper';
import { InitWebUi, WebUiConfig, webUiRuntimePort } from 'napcat-webui-backend/src/index';
import { NapCatOneBot11Adapter } from 'napcat-onebot/index';
import { FFmpegService } from 'napcat-common/src/ffmpeg';
import { NativePacketHandler } from 'napcat-core/packet/handler/client';

// Framework ES入口文件
export async function getWebUiUrl () {
  const WebUiConfigData = (await WebUiConfig.GetWebUIConfig());
  return 'http://127.0.0.1:' + webUiRuntimePort + '/webui/?token=' + encodeURIComponent(WebUiConfigData.token);
}

export async function NCoreInitFramework (
  session: NodeIQQNTWrapperSession,
  loginService: NodeIKernelLoginService,
  registerInitCallback: (callback: () => void) => void
) {
  // 在进入本层前是否登录未进行判断
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
  const wrapper = loadQQWrapper(basicInfoWrapper.getFullQQVersion());
  const nativePacketHandler = new NativePacketHandler({ logger }); // 初始化 NativePacketHandler 用于后续使用
  // nativePacketHandler.onAll((packet) => {
  //     console.log('[Packet]', packet.uin, packet.cmd, packet.hex_data);
  // });
  await nativePacketHandler.init(basicInfoWrapper.getFullQQVersion());
  // 在 init 之后注册监听器

  // 初始化 FFmpeg 服务
  await FFmpegService.init(pathWrapper.binaryPath, logger);
  // 直到登录成功后，执行下一步
  // const selfInfo = {
  //     uid: 'u_FUSS0_x06S_9Tf4na_WpUg',
  //     uin: '3684714082',
  //     nick: '',
  //     online: true
  // }
  const selfInfo = await new Promise<SelfInfo>((resolve) => {
    const loginListener = new NodeIKernelLoginListener();
    loginListener.onQRCodeLoginSucceed = async (loginResult) => {
      await new Promise<void>(resolve => {
        registerInitCallback(() => resolve());
      });
      resolve({
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
  const loaderObject = new NapCatFramework(wrapper, session, logger, loginService, selfInfo, basicInfoWrapper, pathWrapper, nativePacketHandler);
  await loaderObject.core.initCore();

  // 启动WebUi
  InitWebUi(logger, pathWrapper).then().catch(e => logger.logError(e));
  // 初始化LLNC的Onebot实现
  await new NapCatOneBot11Adapter(loaderObject.core, loaderObject.context, pathWrapper).InitOneBot();
}

export class NapCatFramework {
  public core: NapCatCore;
  context: InstanceContext;

  constructor (
    wrapper: WrapperNodeApi,
    session: NodeIQQNTWrapperSession,
    logger: LogWrapper,
    loginService: NodeIKernelLoginService,
    selfInfo: SelfInfo,
    basicInfoWrapper: QQBasicInfoWrapper,
    pathWrapper: NapCatPathWrapper,
    packetHandler: NativePacketHandler
  ) {
    this.context = {
      packetHandler,
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
