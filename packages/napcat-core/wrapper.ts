import { NodeIDependsAdapter, NodeIDispatcherAdapter, NodeIGlobalAdapter } from './adapters';
import {
  GeneralCallResult,
  NodeIKernelAvatarService,
  NodeIKernelBuddyService,
  NodeIKernelGroupService,
  NodeIKernelLoginService,
  NodeIKernelMsgService,
  NodeIKernelProfileLikeService,
  NodeIKernelProfileService,
  NodeIKernelRichMediaService,
  NodeIKernelRobotService,
  NodeIKernelSessionListener,
  NodeIKernelStorageCleanService,
  NodeIKernelTicketService,
  NodeIKernelTipOffService,
} from '@/napcat-core/index';
import { NodeIKernelNodeMiscService } from './services/NodeIKernelNodeMiscService';
import { NodeIKernelUixConvertService } from './services/NodeIKernelUixConvertService';
import { NodeIKernelMsgBackupService } from './services/NodeIKernelMsgBackupService';
import { NodeIKernelAlbumService } from './services/NodeIKernelAlbumService';
import { NodeIKernelTianShuService } from './services/NodeIKernelTianShuService';
import { NodeIKernelUnitedConfigService } from './services/NodeIKernelUnitedConfigService';
import { NodeIKernelSearchService } from './services/NodeIKernelSearchService';
import { NodeIKernelCollectionService } from './services/NodeIKernelCollectionService';
import { NodeIKernelRecentContactService } from './services/NodeIKernelRecentContactService';
import { NodeIKernelMSFService } from './services/NodeIKernelMSFService';
import { NodeIkernelTestPerformanceService } from './services/NodeIkernelTestPerformanceService';
import { NodeIKernelECDHService } from './services/NodeIKernelECDHService';
import { NodeIO3MiscService } from './services/NodeIO3MiscService';
import { NodeIKernelFlashTransferService } from './services/NodeIKernelFlashTransferService';
import { NodeIKernelOnlineStatusService } from './services/NodeIKernelOnlineStatusService';
import { NodeIKernelBaseEmojiService } from './services/NodeIKernelBaseEmojiService';
import { NodeIKernelSettingService } from './services/NodeIKernelSettingService';
import { NodeIKernelFileAssistantService } from './services/NodeIKernelFileAssistantService';
import { NodeIKernelDbToolsService } from './services/NodeIKernelDbToolsService';
import { NodeIYellowFaceService } from './services/NodeIYellowFaceService';
import { NodeIKernelQiDianService } from './services/NodeIKernelQiDianService';
import { NodeIKernelSkinService } from './services/NodeIKernelSkinService';
import { NodeIKernelQQPlayService } from './services/NodeIKernelQQPlayService';
import { NodeIKernelRDeliveryService } from './services/NodeIKernelRDeliveryService';
import { NodeIKernelRemotingService } from './services/NodeIKernelRemotingService';
import { NodeIKernelLiteBusinessService } from './services/NodeIKernelLiteBusinessService';
import { NodeIKernelGroupTabService } from './services/NodeIKernelGroupTabService';
import { NodeIKernelLockService } from './services/NodeIKernelLockService';
import { NodeIKernelHandOffService } from './services/NodeIKernelHandOffService';
import { NodeIKernelMiniAppService } from './services/NodeIKernelMiniAppService';
import { NodeIKernelPublicAccountService } from './services/NodeIKernelPublicAccountService';
import { NodeIKernelThirdPartySigService } from './services/NodeIKernelThirdPartySigService';
import { NodeIKernelUnifySearchService } from './services/NodeIKernelUnifySearchService';
import { NodeIKernelVasSystemUpdateService } from './services/NodeIKernelVasSystemUpdateService';
import { NodeIKernelPersonalAlbumService } from './services/NodeIKernelPersonalAlbumService';
import { NodeIKernelConfigMgrService } from './services/NodeIKernelConfigMgrService';

export interface NodeQQNTWrapperUtil {
  get (): NodeQQNTWrapperUtil;

  getNTUserDataInfoConfig (): string;

  emptyWorkingSet (n: number): void;

  getSsoCmdOfOidbReq (arg1: number, arg2: number): unknown;

  getSsoBufferOfOidbReq (arg1: unknown, arg2: unknown, arg3: unknown): unknown;

  getOidbRspInfo (arg: string): unknown;

  getFileSize (path: string): Promise<number>;

  genFileMd5Buf (arg: string): unknown;

  genFileMd5Hex (path: string): unknown;

  genFileShaBuf (path: string): unknown;

  genFileCumulateSha1 (path: string): unknown;

  genFileShaHex (path: string): unknown;

  fileIsExist (path: string): unknown;

  startTrace (path: string): unknown;

  copyFile (src: string, dst: string): unknown;

  genFileShaAndMd5Hex (path: string, unknown: number): unknown;

  setTraceInfo (unknown: unknown): unknown;

  encodeOffLine (unknown: unknown): unknown;

  decodeOffLine (arg: string): unknown;

  DecoderRecentInfo (arg: string): unknown;

  getPinyin (arg0: string, arg1: boolean): unknown;

  getPinyinExt (arg0: string, arg1: boolean): unknown;

  matchInPinyin (arg0: unknown[], arg1: string): unknown;

  makeDirByPath (arg0: string): unknown;

  runProcess (arg0: string, arg1: boolean): unknown;

  runProcessArgs (arg0: string, arg1: { [key: string]: string; }, arg2: boolean): unknown;

  calcThumbSize (arg0: number, arg1: number, arg2: unknown): unknown;

  fullWordToHalfWord (word: string): unknown;

  getNTUserDataInfoConfig (): Promise<string>;

  pathIsReadableAndWriteable (path: string, type: number): Promise<number>; // type 2 , result 0 成功

  resetUserDataSavePathToDocument (): unknown;

  getSoBuildInfo (): unknown; // 例如 0[0]_d491dc01e0a_0

  registerCountInstruments (arg0: string, arg1: string[], arg2: number, arg3: number): unknown;

  registerValueInstruments (arg0: string, arg1: string[], arg2: number, arg3: number): unknown;

  registerValueInstrumentsWithBoundary (
    arg0: string,
    arg1: unknown,
    arg2: unknown,
    arg3: number,
    arg4: number,
  ): unknown;

  reportCountIndicators (
    arg0: string,
    arg1: Map<unknown, unknown>,
    arg2: string,
    arg3: number,
    arg4: boolean,
  ): unknown;

  reportValueIndicators (
    arg0: string,
    arg1: Map<unknown, unknown>,
    arg2: string,
    arg3: boolean,
    arg4: number,
  ): unknown;

  checkNewUserDataSaveDirAvailable (arg0: string): unknown;

  copyUserData (arg0: string, arg1: string): Promise<unknown>;

  setUserDataSaveDirectory (arg0: string): Promise<unknown>;

  hasOtherRunningQQProcess (): boolean;

  quitAllRunningQQProcess (arg: boolean): unknown;

  checkNvidiaConfig (): unknown;

  repairNvidiaConfig (): unknown;

  getNvidiaDriverVersion (): unknown;

  isNull (): unknown;

  deletePath (path: string): unknown;

  calculateDirectoryTotalSize (path: string): unknown;

  GetBaseEmojiPathByIds (arg: unknown): unknown;

  SetMobileBaseEmojiPath (arg0: unknown, arg1: unknown): unknown;

  setCreateThumbailSupportedFileExtensions (arg0: unknown, arg1: unknown): unknown;

  setFileDropNativeWindowHide (arg: unknown): unknown;

  setFileDropWindowNativeWindowHandle (arg: unknown): unknown;

  startListenFileDragEvent (arg: unknown): unknown;

  stopAccessingSecurityScopedResource (arg: unknown): unknown;

  createThumbnailImage (
    serviceName: string,
    filePath: string,
    targetPath: string,
    imgSize: {
      width: number,
      height: number;
    },
    fileFormat: string,
    arg: number | null | undefined, // null undefined都行
  ): Promise<GeneralCallResult & { targetPath?: string; }>;
}
export interface NodeIQQNTStartupSessionWrapper {
  create (): NodeIQQNTStartupSessionWrapper;
  stop (): void;
  start (): void;
  createWithModuleList (uk: unknown): unknown;
  getSessionIdList (): Promise<Map<unknown, unknown>>;
}
export interface NodeIQQNTWrapperSession {
  getNTWrapperSession (str: string): NodeIQQNTWrapperSession;

  get (): NodeIQQNTWrapperSession;

  new(): NodeIQQNTWrapperSession;

  create (): NodeIQQNTWrapperSession;

  init (
    wrapperSessionInitConfig: WrapperSessionInitConfig,
    nodeIDependsAdapter: NodeIDependsAdapter,
    nodeIDispatcherAdapter: NodeIDispatcherAdapter,
    nodeIKernelSessionListener: NodeIKernelSessionListener,
  ): void;

  startNT (session: number): void;

  startNT (): void;

  // === Session lifecycle ===
  close (arg: unknown): void;

  onLine (arg: unknown): void;

  offLine (arg: unknown): void;

  disableIpDirect (arg: unknown): void;

  getAccountPath (arg: unknown): string;

  updateTicket (arg: unknown): void;

  // === SSO/Network dispatch ===
  onDispatchPush (arg1: unknown, arg2: unknown): void;

  onDispatchPushWithJson (arg1: unknown, arg2: unknown): void;

  onDispatchRequestReply (arg1: unknown, arg2: unknown, arg3: unknown): void;

  onMsfPush (arg1: unknown, arg2: unknown, arg3: unknown): void;

  onNetReply (arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown): void;

  onSendOidbReply (arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown): void;

  onSendSSOReply (arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown): void;

  onUIConfigUpdate (arg1: unknown, arg2: unknown): void;

  setOnMsfStatusChanged (arg1: unknown, arg2: unknown, arg3: unknown): void;

  setOnNetworkChanged (arg: unknown): void;

  setOnWeakNetChanged (arg: unknown): void;

  // === Service getters ===
  getBdhUploadService (): unknown;

  getECDHService (): NodeIKernelECDHService;

  getMsgService (): NodeIKernelMsgService;

  getProfileService (): NodeIKernelProfileService;

  getProfileLikeService (): NodeIKernelProfileLikeService;

  getGroupService (): NodeIKernelGroupService;

  getStorageCleanService (): NodeIKernelStorageCleanService;

  getBuddyService (): NodeIKernelBuddyService;

  getRobotService (): NodeIKernelRobotService;

  getTicketService (): NodeIKernelTicketService;

  getTipOffService (): NodeIKernelTipOffService;

  getNodeMiscService (): NodeIKernelNodeMiscService;

  getRichMediaService (): NodeIKernelRichMediaService;

  getMsgBackupService (): NodeIKernelMsgBackupService;

  getAlbumService (): NodeIKernelAlbumService;

  getTianShuService (): NodeIKernelTianShuService;

  getUnitedConfigService (): NodeIKernelUnitedConfigService;

  getSearchService (): NodeIKernelSearchService;

  getFlashTransferService (): NodeIKernelFlashTransferService;

  getDirectSessionService (): unknown;

  getRDeliveryService (): NodeIKernelRDeliveryService;

  getAvatarService (): NodeIKernelAvatarService;

  getFeedChannelService (): unknown;

  getYellowFaceService (): NodeIYellowFaceService;

  getCollectionService (): NodeIKernelCollectionService;

  getSettingService (): NodeIKernelSettingService;

  getQiDianService (): NodeIKernelQiDianService;

  getFileAssistantService (): NodeIKernelFileAssistantService;

  getGuildService (): unknown;

  getSkinService (): NodeIKernelSkinService;

  getTestPerformanceService (): NodeIkernelTestPerformanceService;

  getQQPlayService (): NodeIKernelQQPlayService;

  getDbToolsService (): NodeIKernelDbToolsService;

  getUixConvertService (): NodeIKernelUixConvertService;

  getOnlineStatusService (): NodeIKernelOnlineStatusService;

  getRemotingService (): NodeIKernelRemotingService;

  getGroupTabService (): NodeIKernelGroupTabService;

  getGroupSchoolService (): unknown;

  getLiteBusinessService (): NodeIKernelLiteBusinessService;

  getGuildMsgService (): unknown;

  getLockService (): NodeIKernelLockService;

  getMSFService (): NodeIKernelMSFService;

  getGuildHotUpdateService (): unknown;

  getAVSDKService (): unknown;

  getRecentContactService (): NodeIKernelRecentContactService;

  getConfigMgrService (): NodeIKernelConfigMgrService;

  getBaseEmojiService (): NodeIKernelBaseEmojiService;

  getHandOffService (): NodeIKernelHandOffService;

  getMiniAppService (): NodeIKernelMiniAppService;

  getPublicAccountService (): NodeIKernelPublicAccountService;

  getThirdPartySigService (): NodeIKernelThirdPartySigService;

  getUnifySearchService (): NodeIKernelUnifySearchService;

  getVasSystemUpdateService (): NodeIKernelVasSystemUpdateService;

  getPersonalAlbumService (): NodeIKernelPersonalAlbumService;

  getGProGuildMsgService (): unknown;

  getFileBridgeHostService (): unknown;

  getWiFiPhotoClientService (): unknown;
}

export interface EnginInitDesktopConfig {
  base_path_prefix: string;
  platform_type: PlatformType;
  app_type: 4;
  app_version: string;
  os_version: string;
  use_xlog: boolean;
  qua: string;
  global_path_config: {
    desktopGlobalPath: string;
  };
  thumb_config: { maxSide: 324; minSide: 48; longLimit: 6; density: 2; };
}

export interface NodeIQQNTWrapperEngine {
  get (): NodeIQQNTWrapperEngine;

  initWithDeskTopConfig (config: EnginInitDesktopConfig, nodeIGlobalAdapter: NodeIGlobalAdapter): void;

  initWithMobileConfig (config: unknown, nodeIGlobalAdapter: NodeIGlobalAdapter): void;

  initLog (arg: unknown): void;

  setLogLevel (arg: unknown): void;

  onSendSSOReply (arg1: unknown, arg2: unknown, arg3: unknown, arg4: unknown, arg5: unknown): void;
}

export interface WrapperNodeApi {
  NodeIO3MiscService: NodeIO3MiscService;
  NodeQQNTWrapperUtil: NodeQQNTWrapperUtil;
  NodeIQQNTWrapperSession: NodeIQQNTWrapperSession;
  NodeIQQNTStartupSessionWrapper: NodeIQQNTStartupSessionWrapper;
  NodeIQQNTWrapperEngine: NodeIQQNTWrapperEngine;
  NodeIKernelLoginService: NodeIKernelLoginService;

}
export enum PlatformType {
  KUNKNOWN,
  KANDROID,
  KIOS,
  KWINDOWS,
  KMAC,
  KLINUX,
}

export enum DeviceType {
  KUNKNOWN,
  KPHONE,
  KPAD,
  KCOMPUTER,
}

// 推送类型
export enum VendorType {
  KNOSETONIOS = 0,
  KSUPPORTGOOGLEPUSH = 99,
  KSUPPORTHMS = 3,
  KSUPPORTOPPOPUSH = 4,
  KSUPPORTTPNS = 2,
  KSUPPORTVIVOPUSH = 5,
  KUNSUPPORTANDROIDPUSH = 1,
}

export interface WrapperSessionInitConfig {
  selfUin: string;
  selfUid: string;
  desktopPathConfig: {
    account_path: string; // 可以通过NodeQQNTWrapperUtil().getNTUserDataInfoConfig()获取
  };
  clientVer: string; // 9.9.8-22355
  a2: string;
  d2: string;
  d2Key: string;
  machineId: string;
  platform: PlatformType; // 3是Windows?
  platVer: string; // 系统版本号, 应该可以固定
  appid: string;
  rdeliveryConfig: {
    appKey: string;
    systemId: number;
    appId: string;
    logicEnvironment: string;
    platform: PlatformType;
    language: string;
    sdkVersion: string;
    userId: string;
    appVersion: string;
    osVersion: string;
    bundleId: string;
    serverUrl: string;
    fixedAfterHitKeys: string[];
  };
  defaultFileDownloadPath: string; // 这个可以通过环境变量获取？
  deviceInfo: {
    guid: string;
    buildVer: string;
    localId: number;
    devName: string;
    devType: string;
    vendorName: string;
    osVer: string;
    vendorOsName: string;
    setMute: boolean;
    vendorType: VendorType;
  };
  deviceConfig: '{"appearance":{"isSplitViewMode":true},"msg":{}}';
}
