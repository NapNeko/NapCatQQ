import { NapCatPathWrapper } from 'napcat-common/src/path';
import { InitWebUi, WebUiConfig, webUiRuntimePort } from 'napcat-webui-backend/index';
import { NapCatOneBot11Adapter } from 'napcat-onebot/index';
import { NativePacketHandler } from 'napcat-core/packet/handler/client';
import { FFmpegService } from 'napcat-core/helper/ffmpeg/ffmpeg';
import { logSubscription, LogWrapper } from 'napcat-core/helper/log';
import { QQBasicInfoWrapper } from '@/napcat-core/helper/qq-basic-info';
import { InstanceContext, loadQQWrapper, NapCatCore, NapCatCoreWorkingEnv, NodeIKernelLoginListener, NodeIKernelLoginService, NodeIQQNTWrapperSession, SelfInfo, WrapperNodeApi } from '@/napcat-core';
import { proxiedListenerOf } from '@/napcat-core/helper/proxy-handler';
import { statusHelperSubscription } from '@/napcat-core/helper/status';
import { applyPendingUpdates } from '@/napcat-webui-backend/src/api/UpdateNapCat';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';

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
  await applyPendingUpdates(pathWrapper);
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
  WebUiDataRuntime.setWorkingEnv(NapCatCoreWorkingEnv.Framework);
  InitWebUi(logger, pathWrapper, logSubscription, statusHelperSubscription).then().catch(e => logger.logError(e));
  // 初始化LLNC的Onebot实现
  const oneBotAdapter = new NapCatOneBot11Adapter(loaderObject.core, loaderObject.context, pathWrapper);
  // 注册到 WebUiDataRuntime，供调试功能使用
  WebUiDataRuntime.setOneBotContext(oneBotAdapter);
  await oneBotAdapter.InitOneBot();
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
