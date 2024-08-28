import { NodeIDependsAdapter, NodeIDispatcherAdapter, NodeIGlobalAdapter } from './adapters';
import {
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
} from '@/core/index';
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

export interface NodeQQNTWrapperUtil {
    get(): unknown;

    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(): NodeQQNTWrapperUtil;

    getNTUserDataInfoConfig(): string;

    emptyWorkingSet(n: number): void;

    getSsoCmdOfOidbReq(arg1: number, arg2: number): unknown;

    getSsoBufferOfOidbReq(...args: unknown[]): unknown; //有点看不懂参数定义 待补充 好像是三个参数

    getOidbRspInfo(arg: string): unknown; //可能是错的

    getFileSize(path: string): Promise<number>; //直接的猜测

    genFileMd5Buf(arg: string): unknown; //可能是错的

    genFileMd5Hex(path: string): unknown; //直接的猜测

    genFileShaBuf(path: string): unknown; //直接的猜测

    genFileCumulateSha1(path: string): unknown; //直接的猜测

    genFileShaHex(path: string): unknown; //直接的猜测

    fileIsExist(path: string): unknown;

    startTrace(path: string): unknown; //可能是错的

    copyFile(src: string, dst: string): unknown;

    genFileShaAndMd5Hex(path: string, unknown: number): unknown; //可能是错的

    setTraceInfo(unknown: unknown): unknown;

    encodeOffLine(unknown: unknown): unknown;

    decodeOffLine(arg: string): unknown; //可能是错的 传递hex

    DecoderRecentInfo(arg: string): unknown; //可能是错的 传递hex

    getPinyin(arg0: string, arg1: boolean): unknown;

    matchInPinyin(arg0: any[], arg1: string): unknown; //参数特复杂 arg0是个复杂数据类型

    makeDirByPath(arg0: string): unknown;

    emptyWorkingSet(arg0: number): unknown; //参数是UINT32

    runProcess(arg0: string, arg1: boolean): unknown;

    runProcessArgs(arg0: string, arg1: { [key: string]: string }, arg2: boolean): unknown;

    calcThumbSize(arg0: number, arg1: number, arg2: unknown): unknown;

    fullWordToHalfWord(arg0: string): unknown;

    getNTUserDataInfoConfig(): unknown;

    pathIsReadableAndWriteable(path: string): unknown; //直接的猜测

    resetUserDataSavePathToDocument(): unknown;

    getSoBuildInfo(): any; //例如 0[0]_d491dc01e0a_0

    registerCountInstruments(arg0: string, arg1: string[], arg2: number, arg3: number): unknown;

    registerValueInstruments(arg0: string, arg1: string[], arg2: number, arg3: number): unknown;

    registerValueInstrumentsWithBoundary(
        arg0: string,
        arg1: unknown,
        arg2: unknown,
        arg3: number,
        arg4: number,
    ): unknown;

    reportCountIndicators(
        arg0: string,
        arg1: Map<unknown, unknown>,
        arg2: string,
        arg3: number,
        arg4: boolean,
    ): unknown;

    reportValueIndicators(
        arg0: string,
        arg1: Map<unknown, unknown>,
        arg2: string,
        arg3: boolean,
        arg4: number,
    ): unknown;

    checkNewUserDataSaveDirAvailable(arg0: string): unknown;

    copyUserData(arg0: string, arg1: string): Promise<any>;

    setUserDataSaveDirectory(arg0: string): Promise<any>;

    hasOtherRunningQQProcess(): boolean;

    quitAllRunningQQProcess(arg: boolean): unknown;

    checkNvidiaConfig(): unknown;

    repairNvidiaConfig(): unknown;

    getNvidiaDriverVersion(): unknown;

    isNull(): unknown;
}

export interface NodeIQQNTWrapperSession {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(): NodeIQQNTWrapperSession;

    init(
        wrapperSessionInitConfig: WrapperSessionInitConfig,
        nodeIDependsAdapter: NodeIDependsAdapter,
        nodeIDispatcherAdapter: NodeIDispatcherAdapter,
        nodeIKernelSessionListener: NodeIKernelSessionListener,
    ): void;

    startNT(n: 0): void;

    startNT(): void;

    getBdhUploadService(): unknown;

    getECDHService(): NodeIKernelECDHService;

    getMsgService(): NodeIKernelMsgService;

    getProfileService(): NodeIKernelProfileService;

    getProfileLikeService(): NodeIKernelProfileLikeService;

    getGroupService(): NodeIKernelGroupService;

    getStorageCleanService(): NodeIKernelStorageCleanService;

    getBuddyService(): NodeIKernelBuddyService;

    getRobotService(): NodeIKernelRobotService;

    getTicketService(): NodeIKernelTicketService;

    getTipOffService(): NodeIKernelTipOffService;

    getNodeMiscService(): NodeIKernelNodeMiscService;

    getRichMediaService(): NodeIKernelRichMediaService;

    getMsgBackupService(): NodeIKernelMsgBackupService;

    getAlbumService(): NodeIKernelAlbumService;

    getTianShuService(): NodeIKernelTianShuService;

    getUnitedConfigService(): NodeIKernelUnitedConfigService;

    getSearchService(): NodeIKernelSearchService;

    getDirectSessionService(): unknown;

    getRDeliveryService(): unknown;

    getAvatarService(): NodeIKernelAvatarService;

    getFeedChannelService(): unknown;

    getYellowFaceService(): unknown;

    getCollectionService(): NodeIKernelCollectionService;

    getSettingService(): unknown;

    getQiDianService(): unknown;

    getFileAssistantService(): unknown;

    getGuildService(): unknown;

    getSkinService(): unknown;

    getTestPerformanceService(): NodeIkernelTestPerformanceService;

    getQQPlayService(): unknown;

    getDbToolsService(): unknown;

    getUixConvertService(): NodeIKernelUixConvertService;

    getOnlineStatusService(): unknown;

    getRemotingService(): unknown;

    getGroupTabService(): unknown;

    getGroupSchoolService(): unknown;

    getLiteBusinessService(): unknown;

    getGuildMsgService(): unknown;

    getLockService(): unknown;

    getMSFService(): NodeIKernelMSFService;

    getGuildHotUpdateService(): unknown;

    getAVSDKService(): unknown;

    getRecentContactService(): NodeIKernelRecentContactService;

    getConfigMgrService(): unknown;
}

export interface EnginInitDesktopConfig {
    base_path_prefix: string;
    platform_type: 3;
    app_type: 4;
    app_version: string;
    os_version: string;
    use_xlog: true;
    qua: string;
    global_path_config: {
        desktopGlobalPath: string;
    };
    thumb_config: { maxSide: 324; minSide: 48; longLimit: 6; density: 2 };
}

export interface NodeIQQNTWrapperEngine {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(): NodeIQQNTWrapperEngine;

    initWithDeskTopConfig(config: EnginInitDesktopConfig, nodeIGlobalAdapter: NodeIGlobalAdapter): void;
}

export interface WrapperNodeApi {
    [key: string]: any;

    NodeQQNTWrapperUtil: NodeQQNTWrapperUtil;
    NodeIQQNTWrapperSession: NodeIQQNTWrapperSession;
    NodeIQQNTWrapperEngine: NodeIQQNTWrapperEngine;
    NodeIKernelLoginService: NodeIKernelLoginService;
    NodeIKernelProfileService: NodeIKernelProfileService;
}

export enum PlatformType {
    KUNKNOWN,
    KANDROID,
    KIOS,
    KWINDOWS,
    KMAC,
}

export enum DeviceType {
    KUNKNOWN,
    KPHONE,
    KPAD,
    KCOMPUTER,
}

//推送类型
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
