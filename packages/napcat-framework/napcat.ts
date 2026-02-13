import { NapCatPathWrapper } from 'napcat-common/src/path';
import { InitWebUi, WebUiConfig, webUiRuntimePort } from 'napcat-webui-backend/index';
import { NapCatAdapterManager } from 'napcat-adapter';
import { NativePacketHandler } from 'napcat-core/packet/handler/client';
import { Napi2NativeLoader } from 'napcat-core/packet/handler/napi2nativeLoader';
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

  const logger = new LogWrapper(pathWrapper.logsPath);
  await applyPendingUpdates(pathWrapper, logger);
  const basicInfoWrapper = new QQBasicInfoWrapper({ logger });
  const wrapper = loadQQWrapper(basicInfoWrapper.QQMainPath, basicInfoWrapper.getFullQQVersion());
  const nativePacketHandler = new NativePacketHandler({ logger }); // 初始化 NativePacketHandler 用于后续使用
  const napi2nativeLoader = new Napi2NativeLoader({ logger }); // 初始化 Napi2NativeLoader 用于后续使用
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
  const loaderObject = new NapCatFramework(wrapper, session, logger, selfInfo, basicInfoWrapper, pathWrapper, nativePacketHandler, napi2nativeLoader);
  await loaderObject.core.initCore();

  // 启动WebUi
  WebUiDataRuntime.setWorkingEnv(NapCatCoreWorkingEnv.Framework);
  WebUiDataRuntime.setQQDataPath(loaderObject.core.dataPath);
  InitWebUi(logger, pathWrapper, logSubscription, statusHelperSubscription).then().catch(e => logger.logError(e));
  // 使用 NapCatAdapterManager 统一管理协议适配器
  const adapterManager = new NapCatAdapterManager(loaderObject.core, loaderObject.context, pathWrapper);
  await adapterManager.initAdapters();
  // 注册 OneBot 适配器到 WebUiDataRuntime，供调试功能使用
  const oneBotAdapter = adapterManager.getOneBotAdapter();
  if (oneBotAdapter) {
    WebUiDataRuntime.setOneBotContext(oneBotAdapter);
  }
}

export class NapCatFramework {
  public core: NapCatCore;
  context: InstanceContext;

  constructor (
    wrapper: WrapperNodeApi,
    session: NodeIQQNTWrapperSession,
    logger: LogWrapper,
    selfInfo: SelfInfo,
    basicInfoWrapper: QQBasicInfoWrapper,
    pathWrapper: NapCatPathWrapper,
    packetHandler: NativePacketHandler,
    napi2nativeLoader: Napi2NativeLoader
  ) {
    this.context = {
      packetHandler,
      napi2nativeLoader,
      workingEnv: NapCatCoreWorkingEnv.Framework,
      wrapper,
      session,
      logger,
      basicInfoWrapper,
      pathWrapper,
    };
    this.core = new NapCatCore(this.context, selfInfo);
  }
}
