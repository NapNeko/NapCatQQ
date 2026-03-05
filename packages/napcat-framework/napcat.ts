import { NapCatPathWrapper } from 'napcat-common/src/path';
import { InitWebUi, WebUiConfig, webUiRuntimePort } from 'napcat-webui-backend/index';
import { NapCatAdapterManager } from 'napcat-adapter';
import { NativePacketHandler } from 'napcat-core/packet/handler/client';
import { Napi2NativeLoader } from 'napcat-core/packet/handler/napi2nativeLoader';
import { loadNapcatConfig } from '@/napcat-core/helper/config';
import { FFmpegService } from 'napcat-core/helper/ffmpeg/ffmpeg';
import { logSubscription, LogWrapper } from 'napcat-core/helper/log';
import { QQBasicInfoWrapper } from '@/napcat-core/helper/qq-basic-info';
import { InstanceContext, loadQQWrapper, NapCatCore, NapCatCoreWorkingEnv, NodeIKernelLoginListener, NodeIKernelLoginService, NodeIQQNTWrapperSession, SelfInfo, WrapperNodeApi } from '@/napcat-core';
import { proxiedListenerOf } from '@/napcat-core/helper/proxy-handler';
import { statusHelperSubscription } from '@/napcat-core/helper/status';
import { applyPendingUpdates } from '@/napcat-webui-backend/src/api/UpdateNapCat';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { NapProtoMsg } from 'napcat-protobuf';
import { OidbSvcTrpcTcpBase, OidbSvcTrpcTcp0XCDE_2RespBody } from '@/napcat-core/packet/transformer/proto';

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
  const napcatConfig = loadNapcatConfig(pathWrapper.configPath);
  // console.log('[NapCat] [Napi2NativeLoader]', napi2nativeLoader.nativeExports.enableAllBypasses?.());
  if (process.env['NAPCAT_DISABLE_BYPASS'] !== '1') {
    const bypassOptions = napcatConfig.bypass ?? {};
    const bypassEnabled = napi2nativeLoader.nativeExports.enableAllBypasses?.(bypassOptions);
    if (bypassEnabled) {
      logger.log('[NapCat] Napi2NativeLoader: 已启用Bypass');
    }
    logger.log('[NapCat] Napi2NativeLoader: Framework模式Bypass配置:', bypassOptions);
  } else {
    logger.log('[NapCat] Napi2NativeLoader: Bypass已通过环境变量禁用');
  }
  // nativePacketHandler.onAll((packet) => {
  //     console.log('[Packet]', packet.uin, packet.cmd, packet.hex_data);
  // });
  await nativePacketHandler.init(basicInfoWrapper.getFullQQVersion(), napcatConfig.o3HookMode === 1);
  // 在 init 之后注册监听器

  // 登录前监听 OidbSvcTrpcTcp.0xcde_2 数据包，获取数据库 passphrase
  let dbPassphrase: string | undefined;
  nativePacketHandler.onCmd('OidbSvcTrpcTcp.0xcde_2', ({ type, hex_data }) => {
    if (type !== 1) return; // 仅处理接收方向
    try {
      const raw = Buffer.from(hex_data, 'hex');
      const base = new NapProtoMsg(OidbSvcTrpcTcpBase).decode(raw);
      if (base.body && base.body.length > 0) {
        const body = new NapProtoMsg(OidbSvcTrpcTcp0XCDE_2RespBody).decode(base.body);
        if (body.inner?.value) {
          dbPassphrase = body.inner.value;
          logger.log('[NapCat] 已启用数据库辅助支持能力');
        }
      }
    } catch (e) {
      logger.logError('[NapCat] [0xCDE_2] 解析失败:', e);
    }
  });

  // 初始化 FFmpeg 服务
  await FFmpegService.init(pathWrapper.binaryPath, logger);

  // 提前启动 WebUI，使其在登录前可用，支持通过 WebUI 操控登录过程
  WebUiDataRuntime.setWorkingEnv(NapCatCoreWorkingEnv.Framework);
  InitWebUi(logger, pathWrapper, logSubscription, statusHelperSubscription).then().catch(e => logger.logError(e));

  // 直到登录成功后，执行下一步
  const selfInfo = await new Promise<SelfInfo>((resolve) => {
    const loginContext = { isLogined: false };

    const loginListener = new NodeIKernelLoginListener();

    loginListener.onUserLoggedIn = (userid: string) => {
      const tips = `当前账号(${userid})已登录,无法重复登录`;
      logger.logError(tips);
      WebUiDataRuntime.setQQLoginError(tips);
    };

    loginListener.onQRCodeLoginSucceed = async (loginResult) => {
      loginContext.isLogined = true;
      WebUiDataRuntime.setQQLoginStatus(true);
      WebUiDataRuntime.setQQLoginError('');
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

    loginListener.onQRCodeGetPicture = ({ qrcodeUrl }) => {
      WebUiDataRuntime.setQQLoginQrcodeURL(qrcodeUrl);
      logger.log('[NapCat] [Framework] 二维码已更新, URL:', qrcodeUrl);
    };

    loginListener.onQRCodeSessionFailed = (errType: number, errCode: number) => {
      if (!loginContext.isLogined) {
        logger.logError('[NapCat] [Framework] [Login] QRCode Session Failed, ErrType:', errType, 'ErrCode:', errCode);
        if (errType === 1 && errCode === 3) {
          WebUiDataRuntime.setQQLoginError('二维码已过期，请刷新');
        }
      }
    };

    loginListener.onLoginFailed = (...args) => {
      const errInfo = JSON.stringify(args);
      logger.logError('[NapCat] [Framework] [Login] Login Failed, ErrInfo:', errInfo);
      WebUiDataRuntime.setQQLoginError(`登录失败: ${errInfo}`);
    };

    loginListener.onLoginConnected = () => {
      logger.log('[NapCat] [Framework] 登录服务已连接');
      // 注册 WebUI 登录操作回调
      registerWebUiLoginCallbacks(loginService, loginContext, logger);
      // 获取历史登录列表供 WebUI 使用
      loginService.getLoginList().then((res) => {
        const list = res.LocalLoginInfoList.filter((item) => item.isQuickLogin);
        WebUiDataRuntime.setQQQuickLoginList(list.map((item) => item.uin.toString()));
        WebUiDataRuntime.setQQNewLoginList(list);
      }).catch(e => logger.logError('[NapCat] [Framework] 获取登录列表失败:', e));
    };

    loginListener.onQRCodeSessionUserScaned = () => {
      logger.log('[NapCat] [Framework] 二维码已被扫描，等待确认...');
    };

    loginListener.onPasswordLoginFailed = (...args) => {
      logger.logError('[NapCat] [Framework] 密码登录失败:', ...args);
    };

    loginService.addKernelLoginListener(proxiedListenerOf(loginListener, logger));
  });
  // 过早进入会导致addKernelMsgListener等Listener添加失败
  // await sleep(2500);
  // 初始化 NapCatFramework
  const loaderObject = new NapCatFramework(wrapper, session, logger, selfInfo, basicInfoWrapper, pathWrapper, nativePacketHandler, napi2nativeLoader);
  // 将捕获的 passphrase 设置到 core 上，供 DatabaseApi 使用
  if (dbPassphrase) {
    loaderObject.core.dbPassphrase = dbPassphrase;
  }
  await loaderObject.core.initCore();

  // 登录成功后设置数据路径
  WebUiDataRuntime.setQQDataPath(loaderObject.core.dataPath);

  // // 测试 DatabaseApi
  // if (dbPassphrase) {
  //   const dbApi = loaderObject.core.apis.DatabaseApi;
  //   const sqliteOk = await dbApi.isSqliteAvailable();
  //   if (sqliteOk) {
  //     try {
  //       const result = dbApi.readDatabase('nt_msg.db');
  //       if (result) {
  //         logger.log('[NapCat] [Database] nt_msg.db:\n' + dbApi.formatResults([result]));
  //       }
  //     } catch (e) {
  //       logger.logError('[NapCat] [Database] 读取失败:', e);
  //     }
  //   }
  // }

  // 使用 NapCatAdapterManager 统一管理协议适配器
  const adapterManager = new NapCatAdapterManager(loaderObject.core, loaderObject.context, pathWrapper);
  await adapterManager.initAdapters();
  // 注册 OneBot 适配器到 WebUiDataRuntime，供调试功能使用
  const oneBotAdapter = adapterManager.getOneBotAdapter();
  if (oneBotAdapter) {
    WebUiDataRuntime.setOneBotContext(oneBotAdapter);
  }
}

function registerWebUiLoginCallbacks (
  loginService: NodeIKernelLoginService,
  loginContext: { isLogined: boolean; },
  logger: LogWrapper
) {
  // 刷新二维码
  WebUiDataRuntime.setRefreshQRCodeCallback(async () => {
    loginService.getQRCodePicture();
  });

  // 快速登录
  WebUiDataRuntime.setQuickLoginCall(async (uin: string) => {
    return await new Promise((resolve) => {
      if (!uin) {
        return resolve({ result: false, message: '快速登录失败' });
      }
      logger.log('[NapCat] [Framework] 正在快速登录', uin);
      loginService.quickLoginWithUin(uin).then(res => {
        const success = res.result === '0' && !res.loginErrorInfo?.errMsg;
        if (!success) {
          const errMsg = res.loginErrorInfo?.errMsg || `快速登录失败，错误码: ${res.result}`;
          WebUiDataRuntime.setQQLoginError(errMsg);
          resolve({ result: false, message: errMsg });
        } else {
          loginContext.isLogined = true;
          WebUiDataRuntime.setQQLoginStatus(true);
          WebUiDataRuntime.setQQLoginError('');
          resolve({ result: true, message: '' });
        }
      }).catch((e) => {
        logger.logError('[NapCat] [Framework] 快速登录异常:', e);
        WebUiDataRuntime.setQQLoginError('快速登录发生错误');
        resolve({ result: false, message: '快速登录发生错误' });
      });
    });
  });

  // 密码登录
  WebUiDataRuntime.setPasswordLoginCall(async (uin: string, passwordMd5: string) => {
    return await new Promise((resolve) => {
      if (!uin || !passwordMd5) {
        return resolve({ result: false, message: '密码登录失败：参数不完整' });
      }
      logger.log('[NapCat] [Framework] 正在密码登录', uin);
      loginService.passwordLogin({
        uin,
        passwordMd5,
        step: 0,
        newDeviceLoginSig: new Uint8Array(),
        proofWaterSig: new Uint8Array(),
        proofWaterRand: new Uint8Array(),
        proofWaterSid: new Uint8Array(),
        unusualDeviceCheckSig: new Uint8Array(),
      }).then(res => {
        if (res.result === '140022008') {
          const proofWaterUrl = res.loginErrorInfo?.proofWaterUrl || '';
          resolve({ result: false, message: '需要验证码', needCaptcha: true, proofWaterUrl });
        } else if (res.result === '140022010' || res.result === '140022011') {
          const jumpUrl = res.loginErrorInfo?.jumpUrl || '';
          const newDevicePullQrCodeSig = res.loginErrorInfo?.newDevicePullQrCodeSig || '';
          resolve({ result: false, message: '新设备需要扫码验证', needNewDevice: true, jumpUrl, newDevicePullQrCodeSig });
        } else if (res.result !== '0') {
          const errMsg = res.loginErrorInfo?.errMsg || '密码登录失败';
          WebUiDataRuntime.setQQLoginError(errMsg);
          resolve({ result: false, message: errMsg });
        } else {
          loginContext.isLogined = true;
          WebUiDataRuntime.setQQLoginStatus(true);
          WebUiDataRuntime.setQQLoginError('');
          resolve({ result: true, message: '' });
        }
      }).catch((e) => {
        logger.logError('[NapCat] [Framework] 密码登录异常:', e);
        WebUiDataRuntime.setQQLoginError('密码登录发生错误');
        resolve({ result: false, message: '密码登录发生错误' });
      });
    });
  });

  // 验证码登录（密码登录需要验证码时的第二步）
  WebUiDataRuntime.setCaptchaLoginCall(async (uin: string, passwordMd5: string, ticket: string, randstr: string, sid: string) => {
    return await new Promise((resolve) => {
      if (!uin || !passwordMd5 || !ticket) {
        return resolve({ result: false, message: '验证码登录失败：参数不完整' });
      }
      logger.log('[NapCat] [Framework] 正在验证码登录', uin);
      loginService.passwordLogin({
        uin,
        passwordMd5,
        step: 1,
        newDeviceLoginSig: new Uint8Array(),
        proofWaterSig: new TextEncoder().encode(ticket),
        proofWaterRand: new TextEncoder().encode(randstr),
        proofWaterSid: new TextEncoder().encode(sid),
        unusualDeviceCheckSig: new Uint8Array(),
      }).then(res => {
        if (res.result === '140022010' || res.result === '140022011') {
          const jumpUrl = res.loginErrorInfo?.jumpUrl || '';
          const newDevicePullQrCodeSig = res.loginErrorInfo?.newDevicePullQrCodeSig || '';
          resolve({ result: false, message: '新设备需要扫码验证', needNewDevice: true, jumpUrl, newDevicePullQrCodeSig });
        } else if (res.result !== '0') {
          const errMsg = res.loginErrorInfo?.errMsg || '验证码登录失败';
          WebUiDataRuntime.setQQLoginError(errMsg);
          resolve({ result: false, message: errMsg });
        } else {
          loginContext.isLogined = true;
          WebUiDataRuntime.setQQLoginStatus(true);
          WebUiDataRuntime.setQQLoginError('');
          resolve({ result: true, message: '' });
        }
      }).catch((e) => {
        logger.logError('[NapCat] [Framework] 验证码登录异常:', e);
        WebUiDataRuntime.setQQLoginError('验证码登录发生错误');
        resolve({ result: false, message: '验证码登录发生错误' });
      });
    });
  });

  // 新设备验证登录（密码登录需要新设备验证时的第二步）
  WebUiDataRuntime.setNewDeviceLoginCall(async (uin: string, passwordMd5: string, newDevicePullQrCodeSig: string) => {
    return await new Promise((resolve) => {
      if (!uin || !passwordMd5 || !newDevicePullQrCodeSig) {
        return resolve({ result: false, message: '新设备验证登录失败：参数不完整' });
      }
      logger.log('[NapCat] [Framework] 正在新设备验证登录', uin);
      loginService.passwordLogin({
        uin,
        passwordMd5,
        step: 2,
        newDeviceLoginSig: new TextEncoder().encode(newDevicePullQrCodeSig),
        proofWaterSig: new Uint8Array(),
        proofWaterRand: new Uint8Array(),
        proofWaterSid: new Uint8Array(),
        unusualDeviceCheckSig: new Uint8Array(),
      }).then(res => {
        if (res.result === '140022011') {
          const jumpUrl = res.loginErrorInfo?.jumpUrl || '';
          const sig = res.loginErrorInfo?.newDevicePullQrCodeSig || '';
          resolve({ result: false, message: '异常设备需要验证', needNewDevice: true, jumpUrl, newDevicePullQrCodeSig: sig });
        } else if (res.result !== '0') {
          const errMsg = res.loginErrorInfo?.errMsg || '新设备验证登录失败';
          WebUiDataRuntime.setQQLoginError(errMsg);
          resolve({ result: false, message: errMsg });
        } else {
          loginContext.isLogined = true;
          WebUiDataRuntime.setQQLoginStatus(true);
          WebUiDataRuntime.setQQLoginError('');
          resolve({ result: true, message: '' });
        }
      }).catch((e) => {
        logger.logError('[NapCat] [Framework] 新设备验证登录异常:', e);
        WebUiDataRuntime.setQQLoginError('新设备验证登录发生错误');
        resolve({ result: false, message: '新设备验证登录发生错误' });
      });
    });
  });
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
