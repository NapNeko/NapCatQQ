import type { SelfInfo } from 'napcat-core/index';

import { NodeIKernelLoginListener, NodeIKernelSessionListener } from 'napcat-core/listeners';
import { NodeIDependsAdapter, NodeIDispatcherAdapter, NodeIGlobalAdapter } from 'napcat-core/adapters';
import { NapCatPathWrapper } from 'napcat-common/src/path';
import {
  genSessionConfig,
  InstanceContext,
  loadQQWrapper,
  NapCatCore,
  NapCatCoreWorkingEnv,
  NodeIQQNTStartupSessionWrapper,
  NodeIQQNTWrapperEngine,
  NodeIQQNTWrapperSession,
  PlatformType,
  WrapperNodeApi,
  WrapperSessionInitConfig,
} from 'napcat-core';
import { hostname, systemVersion } from 'napcat-common/src/system';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { LoginListItem, NodeIKernelLoginService } from 'napcat-core/services';
import qrcode from 'napcat-qrcode/lib/main';
import { NapCatAdapterManager } from 'napcat-adapter';
import { InitWebUi } from 'napcat-webui-backend/index';
import { WebUiDataRuntime } from 'napcat-webui-backend/src/helper/Data';
import { napCatVersion } from 'napcat-common/src/version';
import { NodeIO3MiscListener } from 'napcat-core/listeners/NodeIO3MiscListener';
import { sleep } from 'napcat-common/src/helper';
import { FFmpegService } from '@/napcat-core/helper/ffmpeg/ffmpeg';
import { NativePacketHandler } from 'napcat-core/packet/handler/client';
import { Napi2NativeLoader } from 'napcat-core/packet/handler/napi2nativeLoader';
import { loadNapcatConfig } from '@/napcat-core/helper/config';
import { logSubscription, LogWrapper } from '@/napcat-core/helper/log';
import { proxiedListenerOf } from '@/napcat-core/helper/proxy-handler';
import { QQBasicInfoWrapper } from '@/napcat-core/helper/qq-basic-info';
import { statusHelperSubscription } from '@/napcat-core/helper/status';
import { applyPendingUpdates } from '@/napcat-webui-backend/src/api/UpdateNapCat';
import { connectToNamedPipe } from './pipe';

// NapCat Shell App ES 入口文件
async function handleUncaughtExceptions (logger: LogWrapper) {
  process.on('uncaughtException', (err) => {
    logger.logError('[NapCat] [Error] Unhandled Exception:', err.message);
  });
  process.on('unhandledRejection', (reason) => {
    logger.logError('[NapCat] [Error] unhandledRejection:', reason);
  });
}

function getDataPaths (wrapper: WrapperNodeApi): [string, string] {
  if (os.platform() === 'darwin') {
    const userPath = os.homedir();
    const appDataPath = path.resolve(userPath, './Library/Application Support/QQ');
    return [appDataPath, path.join(appDataPath, 'global')];
  }
  let dataPath = wrapper.NodeQQNTWrapperUtil.getNTUserDataInfoConfig();
  if (!dataPath) {
    dataPath = path.resolve(os.homedir(), './.config/QQ');
    fs.mkdirSync(dataPath, { recursive: true });
  }
  const dataPathGlobal = path.resolve(dataPath, './nt_qq/global');
  return [dataPath, dataPathGlobal];
}

function getPlatformType (): PlatformType {
  const platformMapping: Partial<Record<NodeJS.Platform, PlatformType>> = {
    win32: PlatformType.KWINDOWS,
    darwin: PlatformType.KMAC,
    linux: PlatformType.KLINUX,
  };
  return platformMapping[os.platform()] ?? PlatformType.KWINDOWS;
}

async function initializeEngine (
  engine: NodeIQQNTWrapperEngine,
  basicInfoWrapper: QQBasicInfoWrapper,
  dataPathGlobal: string,
  systemPlatform: PlatformType,
  systemVersion: string
) {
  engine.initWithDeskTopConfig(
    {
      base_path_prefix: '',
      platform_type: systemPlatform,
      app_type: 4,
      app_version: basicInfoWrapper.getFullQQVersion(),
      os_version: systemVersion,
      use_xlog: false,
      qua: basicInfoWrapper.QQVersionQua ?? '',
      global_path_config: {
        desktopGlobalPath: dataPathGlobal,
      },
      thumb_config: { maxSide: 324, minSide: 48, longLimit: 6, density: 2 },
    },
    new NodeIGlobalAdapter()
  );
}

async function initializeLoginService (
  loginService: NodeIKernelLoginService,
  basicInfoWrapper: QQBasicInfoWrapper,
  dataPathGlobal: string,
  systemVersion: string,
  hostname: string
) {
  loginService.initConfig({
    machineId: '',
    appid: basicInfoWrapper.QQVersionAppid ?? '',
    platVer: systemVersion,
    commonPath: dataPathGlobal,
    clientVer: basicInfoWrapper.getFullQQVersion(),
    hostName: hostname,
    externalVersion: false,
  });
}

async function handleLogin (
  loginService: NodeIKernelLoginService,
  logger: LogWrapper,
  pathWrapper: NapCatPathWrapper,
  quickLoginUin: string | undefined,
  historyLoginList: LoginListItem[]
): Promise<SelfInfo> {
  const context = { isLogined: false };
  let inner_resolve: (value: SelfInfo) => void;
  const selfInfo: Promise<SelfInfo> = new Promise((resolve) => {
    inner_resolve = resolve;
  });
  // 连接服务

  const loginListener = new NodeIKernelLoginListener();
  loginListener.onUserLoggedIn = (userid: string) => {
    const tips = `当前账号(${userid})已登录,无法重复登录`;
    logger.logError(tips);
    WebUiDataRuntime.setQQLoginError(tips);
  };
  loginListener.onQRCodeLoginSucceed = async (loginResult) => {
    context.isLogined = true;
    WebUiDataRuntime.setQQLoginStatus(true);
    inner_resolve({
      uid: loginResult.uid,
      uin: loginResult.uin,
      nick: '',
      online: true,
    });
  };
  loginListener.onLoginConnected = () => {
    waitForNetworkConnection(loginService, logger).then(() => {
      handleLoginInner(context, logger, loginService, quickLoginUin, historyLoginList).then().catch(e => logger.logError(e));
      loginListener.onLoginConnected = () => { };
    });
  };
  loginListener.onQRCodeGetPicture = ({ pngBase64QrcodeData, qrcodeUrl }) => {
    WebUiDataRuntime.setQQLoginQrcodeURL(qrcodeUrl);

    const realBase64 = pngBase64QrcodeData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(realBase64, 'base64');
    logger.logWarn('请扫描下面的二维码，然后在手Q上授权登录：');
    const qrcodePath = path.join(pathWrapper.cachePath, 'qrcode.png');
    qrcode.generate(qrcodeUrl, { small: true }, (res) => {
      logger.logWarn([
        '\n',
        res,
        '二维码解码URL: ' + qrcodeUrl,
        '如果控制台二维码无法扫码，可以复制解码url到二维码生成网站生成二维码再扫码，也可以打开下方的二维码路径图片进行扫码。',
      ].join('\n'));
      fs.writeFile(qrcodePath, buffer, {}, () => {
        logger.logWarn('二维码已保存到', qrcodePath);
      });
    });
  };

  loginListener.onQRCodeSessionFailed = (errType: number, errCode: number) => {
    if (!context.isLogined) {
      logger.logError('[Core] [Login] Login Error,ErrType: ', errType, ' ErrCode:', errCode);
      if (errType === 1 && errCode === 3) {
        // 二维码过期刷新
        WebUiDataRuntime.setQQLoginError('二维码已过期，请刷新');
      }
      loginService.getQRCodePicture();
    }
  };

  loginListener.onLoginFailed = (...args) => {
    const errInfo = JSON.stringify(args);
    logger.logError('[Core] [Login] Login Error , ErrInfo: ', errInfo);
    WebUiDataRuntime.setQQLoginError(`登录失败: ${errInfo}`);
  };

  loginService.addKernelLoginListener(proxiedListenerOf(loginListener, logger));
  loginService.connect();
  return await selfInfo;
}
async function handleLoginInner (context: { isLogined: boolean; }, logger: LogWrapper, loginService: NodeIKernelLoginService, quickLoginUin: string | undefined, historyLoginList: LoginListItem[]) {
  // 注册刷新二维码回调
  WebUiDataRuntime.setRefreshQRCodeCallback(async () => {
    loginService.getQRCodePicture();
  });

  WebUiDataRuntime.setQuickLoginCall(async (uin: string) => {
    return await new Promise((resolve) => {
      if (uin) {
        logger.log('正在快速登录 ', uin);
        loginService.quickLoginWithUin(uin).then(res => {
          if (res.loginErrorInfo.errMsg) {
            WebUiDataRuntime.setQQLoginError(res.loginErrorInfo.errMsg);
            loginService.getQRCodePicture();
            resolve({ result: false, message: res.loginErrorInfo.errMsg });
          } else {
            WebUiDataRuntime.setQQLoginStatus(true);
            WebUiDataRuntime.setQQLoginError('');
            resolve({ result: true, message: '' });
          }
        }).catch((e) => {
          logger.logError(e);
          WebUiDataRuntime.setQQLoginError('快速登录发生错误');
          loginService.getQRCodePicture();
          resolve({ result: false, message: '快速登录发生错误' });
        });
      } else {
        resolve({ result: false, message: '快速登录失败' });
      }
    });
  });

  // 注册密码登录回调
  WebUiDataRuntime.setPasswordLoginCall(async (uin: string, passwordMd5: string) => {
    return await new Promise((resolve) => {
      if (uin && passwordMd5) {
        logger.log('正在密码登录 ', uin);
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
            logger.log('需要验证码, proofWaterUrl: ', proofWaterUrl);
            resolve({
              result: false,
              message: '需要验证码',
              needCaptcha: true,
              proofWaterUrl,
            });
          } else if (res.result === '140022010') {
            const jumpUrl = res.loginErrorInfo?.jumpUrl || '';
            const newDevicePullQrCodeSig = res.loginErrorInfo?.newDevicePullQrCodeSig || '';
            logger.log('新设备需要扫码验证, jumpUrl: ', jumpUrl);
            resolve({
              result: false,
              message: '新设备需要扫码验证',
              needNewDevice: true,
              jumpUrl,
              newDevicePullQrCodeSig,
            });
          } else if (res.result === '140022011') {
            const jumpUrl = res.loginErrorInfo?.jumpUrl || '';
            const newDevicePullQrCodeSig = res.loginErrorInfo?.newDevicePullQrCodeSig || '';
            logger.log('异常设备需要验证, jumpUrl: ', jumpUrl);
            resolve({
              result: false,
              message: '异常设备需要验证',
              needNewDevice: true,
              jumpUrl,
              newDevicePullQrCodeSig,
            });
          } else if (res.result !== '0') {
            const errMsg = res.loginErrorInfo?.errMsg || '密码登录失败';
            WebUiDataRuntime.setQQLoginError(errMsg);
            loginService.getQRCodePicture();
            resolve({ result: false, message: errMsg });
          } else {
            WebUiDataRuntime.setQQLoginStatus(true);
            WebUiDataRuntime.setQQLoginError('');
            resolve({ result: true, message: '' });
          }
        }).catch((e) => {
          logger.logError(e);
          WebUiDataRuntime.setQQLoginError('密码登录发生错误');
          loginService.getQRCodePicture();
          resolve({ result: false, message: '密码登录发生错误' });
        });
      } else {
        resolve({ result: false, message: '密码登录失败：参数不完整' });
      }
    });
  });

  // 注册验证码登录回调（密码登录需要验证码时的第二步）
  WebUiDataRuntime.setCaptchaLoginCall(async (uin: string, passwordMd5: string, ticket: string, randstr: string, sid: string) => {
    return await new Promise((resolve) => {
      if (uin && passwordMd5 && ticket) {
        logger.log('正在验证码登录 ', uin);
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
          console.log('验证码登录结果: ', res);
          if (res.result === '140022010') {
            const jumpUrl = res.loginErrorInfo?.jumpUrl || '';
            const newDevicePullQrCodeSig = res.loginErrorInfo?.newDevicePullQrCodeSig || '';
            logger.log('验证码登录后需要新设备验证, jumpUrl: ', jumpUrl);
            resolve({
              result: false,
              message: '新设备需要扫码验证',
              needNewDevice: true,
              jumpUrl,
              newDevicePullQrCodeSig,
            });
          } else if (res.result === '140022011') {
            const jumpUrl = res.loginErrorInfo?.jumpUrl || '';
            const newDevicePullQrCodeSig = res.loginErrorInfo?.newDevicePullQrCodeSig || '';
            logger.log('验证码登录后需要异常设备验证, jumpUrl: ', jumpUrl);
            resolve({
              result: false,
              message: '异常设备需要验证',
              needNewDevice: true,
              jumpUrl,
              newDevicePullQrCodeSig,
            });
          } else if (res.result !== '0') {
            const errMsg = res.loginErrorInfo?.errMsg || '验证码登录失败';
            WebUiDataRuntime.setQQLoginError(errMsg);
            loginService.getQRCodePicture();
            resolve({ result: false, message: errMsg });
          } else {
            WebUiDataRuntime.setQQLoginStatus(true);
            WebUiDataRuntime.setQQLoginError('');
            resolve({ result: true, message: '' });
          }
        }).catch((e) => {
          logger.logError(e);
          WebUiDataRuntime.setQQLoginError('验证码登录发生错误');
          loginService.getQRCodePicture();
          resolve({ result: false, message: '验证码登录发生错误' });
        });
      } else {
        resolve({ result: false, message: '验证码登录失败：参数不完整' });
      }
    });
  });

  // 注册新设备登录回调（密码登录需要新设备验证时的第二步）
  WebUiDataRuntime.setNewDeviceLoginCall(async (uin: string, passwordMd5: string, newDevicePullQrCodeSig: string) => {
    return await new Promise((resolve) => {
      if (uin && passwordMd5 && newDevicePullQrCodeSig) {
        logger.log('正在新设备验证登录 ', uin);
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
            const newDevicePullQrCodeSig = res.loginErrorInfo?.newDevicePullQrCodeSig || '';
            logger.log('新设备验证后需要异常设备验证, jumpUrl: ', jumpUrl);
            resolve({
              result: false,
              message: '异常设备需要验证',
              needNewDevice: true,
              jumpUrl,
              newDevicePullQrCodeSig,
            });
          } else if (res.result !== '0') {
            const errMsg = res.loginErrorInfo?.errMsg || '新设备验证登录失败';
            WebUiDataRuntime.setQQLoginError(errMsg);
            loginService.getQRCodePicture();
            resolve({ result: false, message: errMsg });
          } else {
            WebUiDataRuntime.setQQLoginStatus(true);
            WebUiDataRuntime.setQQLoginError('');
            resolve({ result: true, message: '' });
          }
        }).catch((e) => {
          logger.logError(e);
          WebUiDataRuntime.setQQLoginError('新设备验证登录发生错误');
          loginService.getQRCodePicture();
          resolve({ result: false, message: '新设备验证登录发生错误' });
        });
      } else {
        resolve({ result: false, message: '新设备验证登录失败：参数不完整' });
      }
    });
  });
  if (quickLoginUin) {
    if (historyLoginList.some(u => u.uin === quickLoginUin)) {
      logger.log('正在快速登录 ', quickLoginUin);
      loginService.quickLoginWithUin(quickLoginUin)
        .then(result => {
          if (result.loginErrorInfo.errMsg) {
            logger.logError('快速登录错误：', result.loginErrorInfo.errMsg);
            WebUiDataRuntime.setQQLoginError(result.loginErrorInfo.errMsg);
            if (!context.isLogined) loginService.getQRCodePicture();
          }
        })
        .catch();
    } else {
      logger.logError('快速登录失败，未找到该 QQ 历史登录记录，将使用二维码登录方式');
      if (!context.isLogined) loginService.getQRCodePicture();
    }
  } else {
    logger.log('没有 -q 指令指定快速登录，将使用二维码登录方式');
    if (historyLoginList.length > 0) {
      logger.log(`可用于快速登录的 QQ：\n${historyLoginList
        .map((u, index) => `${index + 1}. ${u.uin} ${u.nickName}`)
        .join('\n')
        }`);
    }
    loginService.getQRCodePicture();
    try {
      await WebUiDataRuntime.runWebUiConfigQuickFunction();
    } catch (error) {
      logger.logError('WebUi 快速登录失败 执行失败', error);
    }
  }

  loginService.getLoginList().then((res) => {
    // 遍历 res.LocalLoginInfoList[x].isQuickLogin是否可以 res.LocalLoginInfoList[x].uin 转为string 加入string[] 最后遍历完成调用WebUiDataRuntime.setQQQuickLoginList
    const list = res.LocalLoginInfoList.filter((item) => item.isQuickLogin);
    WebUiDataRuntime.setQQQuickLoginList(list.map((item) => item.uin.toString()));
    WebUiDataRuntime.setQQNewLoginList(list);
  });
}

async function initializeSession (
  session: NodeIQQNTWrapperSession,
  sessionConfig: WrapperSessionInitConfig,
  startupSession: NodeIQQNTStartupSessionWrapper | null
) {
  return new Promise<void>((resolve, reject) => {
    const sessionListener = new NodeIKernelSessionListener();
    sessionListener.onOpentelemetryInit = (info) => {
      if (info.is_init) {
        resolve();
      } else {
        reject(new Error('opentelemetry init failed'));
      }
    };
    session.init(
      sessionConfig,
      new NodeIDependsAdapter(),
      new NodeIDispatcherAdapter(),
      sessionListener
    );
    if (startupSession) {
      startupSession.start();
    } else {
      try {
        session.startNT(0);
      } catch {
        try {
          session.startNT();
        } catch (e: unknown) {
          reject(new Error('init failed ' + (e as Error).message));
        }
      }
    }
  });
}
async function handleProxy (session: NodeIQQNTWrapperSession, logger: LogWrapper) {
  if (process.env['NAPCAT_PROXY_PORT']) {
    session.getMSFService().setNetworkProxy({
      userName: '',
      userPwd: '',
      address: process.env['NAPCAT_PROXY_ADDRESS'] || '127.0.0.1',
      port: +process.env['NAPCAT_PROXY_PORT'],
      proxyType: 2,
      domain: '',
      isSocket: true,
    });
    logger.logWarn('已设置代理', process.env['NAPCAT_PROXY_ADDRESS'], process.env['NAPCAT_PROXY_PORT']);
  } else if (process.env['NAPCAT_PROXY_CLOSE']) {
    session.getMSFService().setNetworkProxy({
      userName: '',
      userPwd: '',
      address: '',
      port: 0,
      proxyType: 0,
      domain: '',
      isSocket: false,
    });
  }
}

async function waitForNetworkConnection (loginService: NodeIKernelLoginService, logger: LogWrapper) {
  let network_ok = false;
  let _tryCount = 0;
  while (!network_ok) {
    network_ok = loginService.getMsfStatus() !== 3;// win 11 0连接 1未连接
    logger.log('等待网络连接...');
    await sleep(500);
    _tryCount++;
  }
  logger.log('网络已连接');
  return network_ok;
}

export async function NCoreInitShell () {
  console.log('NapCat Shell App Loading...');
  const pathWrapper = new NapCatPathWrapper();
  const logger = new LogWrapper(pathWrapper.logsPath);
  handleUncaughtExceptions(logger);
  await applyPendingUpdates(pathWrapper, logger);

  // 提前初始化 Native 模块（在登录前加载）
  const basicInfoWrapper = new QQBasicInfoWrapper({ logger });
  const nativePacketHandler = new NativePacketHandler({ logger });
  const napi2nativeLoader = new Napi2NativeLoader({ logger });

  // 初始化 FFmpeg 服务
  await FFmpegService.init(pathWrapper.binaryPath, logger);

  if (!(process.env['NAPCAT_DISABLE_PIPE'] === '1' || process.env['NAPCAT_WORKER_PROCESS'] === '1')) {
    await connectToNamedPipe(logger).catch(e => logger.logError('命名管道连接失败', e));
  }
  const wrapper = loadQQWrapper(basicInfoWrapper.QQMainPath, basicInfoWrapper.getFullQQVersion());
  // wrapper.node 加载后再初始化 hook，按 schema 读取配置
  const napcatConfig = loadNapcatConfig(pathWrapper.configPath);
  await nativePacketHandler.init(basicInfoWrapper.getFullQQVersion(), napcatConfig.o3HookMode === 1 ? true : false);
  if (process.env['NAPCAT_ENABLE_VERBOSE_LOG'] === '1') {
    napi2nativeLoader.nativeExports.setVerbose?.(true);
  }
  // wrapper.node 加载后立刻启用 Bypass（可通过环境变量禁用）
  if (process.env['NAPCAT_DISABLE_BYPASS'] !== '1') {
    const bypassOptions = napcatConfig.bypass ?? {};
    napi2nativeLoader.nativeExports.enableAllBypasses?.(bypassOptions);
  } else {
    logger.log('[NapCat] Napi2NativeLoader: Bypass已通过环境变量禁用');
  }

  const o3Service = wrapper.NodeIO3MiscService.get();
  o3Service.addO3MiscListener(new NodeIO3MiscListener());

  logger.log('[NapCat] [Core] NapCat.Core Version: ' + napCatVersion);
  WebUiDataRuntime.setWorkingEnv(NapCatCoreWorkingEnv.Shell);
  InitWebUi(logger, pathWrapper, logSubscription, statusHelperSubscription).then().catch(e => logger.logError(e));
  const engine = wrapper.NodeIQQNTWrapperEngine.get();
  const loginService = wrapper.NodeIKernelLoginService.get();
  let session: NodeIQQNTWrapperSession;
  let startupSession: NodeIQQNTStartupSessionWrapper | null = null;
  try {
    startupSession = wrapper.NodeIQQNTStartupSessionWrapper.create();
    session = wrapper.NodeIQQNTWrapperSession.getNTWrapperSession('nt_1');
  } catch (e: unknown) {
    try {
      session = wrapper.NodeIQQNTWrapperSession.create();
    } catch (error) {
      logger.logError('创建 StartupSession 失败', e);
      logger.logError('创建 Session 失败', error);
      throw error;
    }
  }
  const [dataPath, dataPathGlobal] = getDataPaths(wrapper);
  WebUiDataRuntime.setQQDataPath(dataPath);
  const systemPlatform = getPlatformType();

  if (!basicInfoWrapper.QQVersionAppid || !basicInfoWrapper.QQVersionQua) throw new Error('QQVersionAppid or QQVersionQua  is not defined');

  await initializeEngine(engine, basicInfoWrapper, dataPathGlobal, systemPlatform, systemVersion);
  await initializeLoginService(loginService, basicInfoWrapper, dataPathGlobal, systemVersion, hostname);
  handleProxy(session, logger);

  let quickLoginUin: string | undefined;
  try {
    const args = process.argv;
    const qIndex = args.findIndex(arg => arg === '-q' || arg === '--qq');
    if (qIndex !== -1 && qIndex + 1 < args.length) {
      quickLoginUin = args[qIndex + 1];
    }
  } catch (error) {
    logger.logWarn('解析命令行参数失败，无法使用快速登录功能', error);
  }

  const historyLoginList = (await loginService.getLoginList()).LocalLoginInfoList;

  const dataTimestape = new Date().getTime().toString();
  o3Service.reportAmgomWeather('login', 'a1', [dataTimestape, '0', '0']);

  const selfInfo = await handleLogin(loginService, logger, pathWrapper, quickLoginUin, historyLoginList);

  // 登录成功后通知 Master 进程（用于切换崩溃重试策略）
  if (typeof process.send === 'function') {
    process.send({ type: 'login-success' });
    logger.log('[NapCat] 已通知主进程登录成功');
  }

  const amgomDataPiece = 'eb1fd6ac257461580dc7438eb099f23aae04ca679f4d88f53072dc56e3bb1129';
  o3Service.setAmgomDataPiece(basicInfoWrapper.QQVersionAppid, new Uint8Array(Buffer.from(amgomDataPiece, 'hex')));

  let guid = loginService.getMachineGuid();
  guid = guid.slice(0, 8) + '-' + guid.slice(8, 12) + '-' + guid.slice(12, 16) + '-' + guid.slice(16, 20) + '-' + guid.slice(20);
  o3Service.reportAmgomWeather('login', 'a6', [dataTimestape, '184', '329']);

  const sessionConfig = await genSessionConfig(
    guid,
    basicInfoWrapper.QQVersionAppid,
    basicInfoWrapper.getFullQQVersion(),
    selfInfo.uin,
    selfInfo.uid,
    dataPath
  );

  await initializeSession(session, sessionConfig, startupSession);

  const accountDataPath = path.resolve(dataPath, './NapCat/data');
  // 判断dataPath是否为根目录 或者 D:/ 之类的盘目录
  if (dataPath !== '/' && /^[a-zA-Z]:\\$/.test(dataPath) === false) {
    try {
      fs.mkdirSync(accountDataPath, { recursive: true });
    } catch (error) {
      logger.logError('创建accountDataPath失败', error);
    }
  }

  logger.logDebug('本账号数据/缓存目录：', accountDataPath);

  await new NapCatShell(
    wrapper,
    session,
    logger,
    selfInfo,
    basicInfoWrapper,
    pathWrapper,
    nativePacketHandler,
    napi2nativeLoader
  ).InitNapCat();
}

export class NapCatShell {
  readonly core: NapCatCore;
  readonly context: InstanceContext;

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
      workingEnv: NapCatCoreWorkingEnv.Shell,
      wrapper,
      session,
      logger,
      basicInfoWrapper,
      pathWrapper,
    };
    this.core = new NapCatCore(this.context, selfInfo);
  }

  async InitNapCat () {
    await this.core.initCore();
    // 监听下线通知并同步到 WebUI
    this.core.event.on('KickedOffLine', (tips: string) => {
      WebUiDataRuntime.setQQLoginError(tips);
    });
    // 使用 NapCatAdapterManager 统一管理协议适配器
    const adapterManager = new NapCatAdapterManager(this.core, this.context, this.context.pathWrapper);
    await adapterManager.initAdapters()
      .catch(e => this.context.logger.logError('初始化协议适配器失败', e));
    // 注册 OneBot 适配器到 WebUiDataRuntime，供调试功能使用
    const oneBotAdapter = adapterManager.getOneBotAdapter();
    if (oneBotAdapter) {
      WebUiDataRuntime.setOneBotContext(oneBotAdapter);
    }
  }
}
