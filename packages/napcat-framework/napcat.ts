import { NapCatPathWrapper } from 'napcat-common/src/path';
import { InitWebUi, WebUiConfig, webUiRuntimePort } from 'napcat-webui-backend/index';
import { ProtocolManager } from 'napcat-protocol';
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

  const logger = new LogWrapper(pathWrapper.logsPath);
  await applyPendingUpdates(pathWrapper, logger);
  const basicInfoWrapper = new QQBasicInfoWrapper({ logger });
  const wrapper = loadQQWrapper(basicInfoWrapper.getFullQQVersion());
  const nativePacketHandler = new NativePacketHandler({ logger });
  await nativePacketHandler.init(basicInfoWrapper.getFullQQVersion());

  // 初始化 FFmpeg 服务
  await FFmpegService.init(pathWrapper.binaryPath, logger);

  const selfInfo = await new Promise<SelfInfo>((resolve) => {
    const loginListener = new NodeIKernelLoginListener();
    loginListener.onQRCodeLoginSucceed = async (loginResult) => {
      await new Promise<void>(resolve => {
        registerInitCallback(() => resolve());
      });
      resolve({
        uid: loginResult.uid,
        uin: loginResult.uin,
        nick: '',
        online: true,
      });
    };
    loginService.addKernelLoginListener(proxiedListenerOf(loginListener, logger));
  });

  // 初始化 NapCatFramework
  const loaderObject = new NapCatFramework(wrapper, session, logger, selfInfo, basicInfoWrapper, pathWrapper, nativePacketHandler);
  await loaderObject.core.initCore();

  // 启动WebUi
  WebUiDataRuntime.setWorkingEnv(NapCatCoreWorkingEnv.Framework);
  InitWebUi(logger, pathWrapper, logSubscription, statusHelperSubscription).then().catch(e => logger.logError(e));

  // 使用协议管理器初始化所有协议
  const protocolManager = new ProtocolManager(loaderObject.core, loaderObject.context, pathWrapper);

  // 初始化所有协议
  await protocolManager.initAllProtocols();

  // 获取适配器并注册到 WebUiDataRuntime
  const onebotAdapter = protocolManager.getOneBotAdapter();
  const satoriAdapter = protocolManager.getSatoriAdapter();

  if (onebotAdapter) {
    WebUiDataRuntime.setOneBotContext(onebotAdapter.getRawAdapter());
  }

  if (satoriAdapter) {
    WebUiDataRuntime.setSatoriContext(satoriAdapter.getRawAdapter());
    WebUiDataRuntime.setOnSatoriConfigChanged(async (newConfig) => {
      const prev = satoriAdapter.getConfigLoader().configData;
      await protocolManager.reloadProtocolConfig('satori', prev, newConfig);
    });
  }

  // 保存协议管理器引用
  loaderObject.protocolManager = protocolManager;
}

export class NapCatFramework {
  public core: NapCatCore;
  public context: InstanceContext;
  public protocolManager?: ProtocolManager;

  constructor (
    wrapper: WrapperNodeApi,
    session: NodeIQQNTWrapperSession,
    logger: LogWrapper,
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
      basicInfoWrapper,
      pathWrapper,
    };
    this.core = new NapCatCore(this.context, selfInfo);
  }
}
