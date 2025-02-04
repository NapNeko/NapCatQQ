import {
    NTQQFileApi,
    NTQQFriendApi,
    NTQQGroupApi,
    NTQQMsgApi,
    NTQQSystemApi,
    NTQQUserApi,
    NTQQWebApi,
} from '@/core/apis';
import { NTQQCollectionApi } from '@/core/apis/collection';
import {
    NodeIQQNTWrapperSession,
    NodeQQNTWrapperUtil,
    PlatformType,
    VendorType,
    WrapperNodeApi,
    WrapperSessionInitConfig,
} from '@/core/wrapper';
import { LogLevel, LogWrapper } from '@/common/log';
import { NodeIKernelLoginService } from '@/core/services';
import { QQBasicInfoWrapper } from '@/common/qq-basic-info';
import { NapCatPathWrapper } from '@/common/path';
import path from 'node:path';
import fs from 'node:fs';
import { hostname, systemName, systemVersion } from '@/common/system';
import { NTEventWrapper } from '@/common/event';
import { KickedOffLineInfo, SelfInfo, SelfStatusInfo } from '@/core/types';
import { NapCatConfigLoader, NapcatConfigSchema } from '@/core/helper/config';
import os from 'node:os';
import { NodeIKernelMsgListener, NodeIKernelProfileListener } from '@/core/listeners';
import { proxiedListenerOf } from '@/common/proxy-handler';
import { NTQQPacketApi } from './apis/packet';
export * from './wrapper';
export * from './types';
export * from './services';
export * from './listeners';

export enum NapCatCoreWorkingEnv {
    Unknown = 0,
    Shell = 1,
    Framework = 2,
}

export function loadQQWrapper(QQVersion: string): WrapperNodeApi {
    let appPath;
    if (os.platform() === 'darwin') {
        appPath = path.resolve(path.dirname(process.execPath), '../Resources/app');
    } else if (os.platform() === 'linux') {
        appPath = path.resolve(path.dirname(process.execPath), './resources/app');
    } else {
        appPath = path.resolve(path.dirname(process.execPath), `./versions/${QQVersion}/`);
    }
    let wrapperNodePath = path.resolve(appPath, 'wrapper.node');
    if (!fs.existsSync(wrapperNodePath)) {
        wrapperNodePath = path.join(appPath, './resources/app/wrapper.node');
    }
    //老版本兼容 未来去掉
    if (!fs.existsSync(wrapperNodePath)) {
        wrapperNodePath = path.join(path.dirname(process.execPath), `./resources/app/versions/${QQVersion}/wrapper.node`);
    }
    const nativemodule: { exports: WrapperNodeApi } = { exports: {} as WrapperNodeApi };
    process.dlopen(nativemodule, wrapperNodePath);
    return nativemodule.exports;
}
export function getMajorPath(QQVersion: string): string {
    // major.node
    let appPath;
    if (os.platform() === 'darwin') {
        appPath = path.resolve(path.dirname(process.execPath), '../Resources/app');
    } else if (os.platform() === 'linux') {
        appPath = path.resolve(path.dirname(process.execPath), './resources/app');
    } else {
        appPath = path.resolve(path.dirname(process.execPath), `./versions/${QQVersion}/`);
    }
    let majorPath = path.resolve(appPath, 'major.node');
    if (!fs.existsSync(majorPath)) {
        majorPath = path.join(appPath, './resources/app/major.node');
    }
    //老版本兼容 未来去掉
    if (!fs.existsSync(majorPath)) {
        majorPath = path.join(path.dirname(process.execPath), `./resources/app/versions/${QQVersion}/major.node`);
    }
    return majorPath;
}
export class NapCatCore {
    readonly context: InstanceContext;
    readonly eventWrapper: NTEventWrapper;
    NapCatDataPath: string = '';
    NapCatTempPath: string = '';
    apis: StableNTApiWrapper;
    // runtime info, not readonly
    selfInfo: SelfInfo;
    util: NodeQQNTWrapperUtil;
    configLoader: NapCatConfigLoader;

    // 通过构造器递过去的 runtime info 应该尽量少
    constructor(context: InstanceContext, selfInfo: SelfInfo) {
        this.selfInfo = selfInfo;
        this.context = context;
        this.util = this.context.wrapper.NodeQQNTWrapperUtil;
        this.eventWrapper = new NTEventWrapper(context.session);
        this.configLoader = new NapCatConfigLoader(this, this.context.pathWrapper.configPath,NapcatConfigSchema);
        this.apis = {
            FileApi: new NTQQFileApi(this.context, this),
            SystemApi: new NTQQSystemApi(this.context, this),
            CollectionApi: new NTQQCollectionApi(this.context, this),
            PacketApi: new NTQQPacketApi(this.context, this),
            WebApi: new NTQQWebApi(this.context, this),
            FriendApi: new NTQQFriendApi(this.context, this),
            MsgApi: new NTQQMsgApi(this.context, this),
            UserApi: new NTQQUserApi(this.context, this),
            GroupApi: new NTQQGroupApi(this.context, this),
        };
    }
    async initCore() {
        this.NapCatDataPath = path.join(this.dataPath, 'NapCat');
        fs.mkdirSync(this.NapCatDataPath, { recursive: true });
        this.NapCatTempPath = path.join(this.NapCatDataPath, 'temp');
        // 创建临时目录
        if (!fs.existsSync(this.NapCatTempPath)) {
            fs.mkdirSync(this.NapCatTempPath, { recursive: true });
        }
        //遍历this.apis[i].initApi 如果存在该函数进行async 调用
        for (const apiKey in this.apis) {
            const api = this.apis[apiKey as keyof StableNTApiWrapper];
            if ('initApi' in api && typeof api.initApi === 'function') {
                await api.initApi();
            }
        }
        this.initNapCatCoreListeners().then().catch((e) => this.context.logger.logError(e));

        this.context.logger.setFileLogEnabled(
            this.configLoader.configData.fileLog,
        );
        this.context.logger.setConsoleLogEnabled(
            this.configLoader.configData.consoleLog,
        );
        this.context.logger.setFileAndConsoleLogLevel(
            this.configLoader.configData.fileLogLevel as LogLevel,
            this.configLoader.configData.consoleLogLevel as LogLevel,
        );
    }
    get dataPath(): string {
        let result = this.context.wrapper.NodeQQNTWrapperUtil.getNTUserDataInfoConfig();
        if (!result) {
            result = path.resolve(os.homedir(), './.config/QQ');
            fs.mkdirSync(result, { recursive: true });
        }
        return result;
    }

    // Renamed from 'InitDataListener'
    async initNapCatCoreListeners() {
        const msgListener = new NodeIKernelMsgListener();

        msgListener.onKickedOffLine = (Info: KickedOffLineInfo) => {
            // 下线通知
            this.context.logger.logError('[KickedOffLine] [' + Info.tipsTitle + '] ' + Info.tipsDesc);
            this.selfInfo.online = false;
        };
        msgListener.onRecvMsg = (msgs) => {
            msgs.forEach(msg => this.context.logger.logMessage(msg, this.selfInfo));
        };
        msgListener.onAddSendMsg = (msg) => {
            this.context.logger.logMessage(msg, this.selfInfo);
        };
        this.context.session.getMsgService().addKernelMsgListener(
            proxiedListenerOf(msgListener, this.context.logger),
        );

        const profileListener = new NodeIKernelProfileListener();
        profileListener.onProfileDetailInfoChanged = (profile) => {
            if (profile.uid === this.selfInfo.uid) {
                Object.assign(this.selfInfo, profile);
            }
        };
        profileListener.onSelfStatusChanged = (Info: SelfStatusInfo) => {
            if (Info.status == 20) {
                this.selfInfo.online = false;
                this.context.logger.log('账号状态变更为离线');
            } else {
                this.selfInfo.online = true;
            }
        };
        this.context.session.getProfileService().addKernelProfileListener(
            proxiedListenerOf(profileListener, this.context.logger),
        );
    }
}

export async function genSessionConfig(
    guid: string,
    QQVersionAppid: string,
    QQVersion: string,
    selfUin: string,
    selfUid: string,
    account_path: string
): Promise<WrapperSessionInitConfig> {
    const downloadPath = path.join(account_path, 'NapCat', 'temp');
    fs.mkdirSync(downloadPath, { recursive: true });
    const platformMapping: Partial<Record<NodeJS.Platform, PlatformType>> = {
        win32: PlatformType.KWINDOWS,
        darwin: PlatformType.KMAC,
        linux: PlatformType.KLINUX,
    };
    const systemPlatform = platformMapping[os.platform()] ?? PlatformType.KWINDOWS;
    return {
        selfUin,
        selfUid,
        desktopPathConfig: {
            account_path, // 可以通过NodeQQNTWrapperUtil().getNTUserDataInfoConfig()获取
        },
        clientVer: QQVersion,
        a2: '',
        d2: '',
        d2Key: '',
        machineId: '',
        platform: systemPlatform,  // 3是Windows?
        platVer: systemVersion,  // 系统版本号, 应该可以固定
        appid: QQVersionAppid,
        rdeliveryConfig: {
            appKey: '',
            systemId: 0,
            appId: '',
            logicEnvironment: '',
            platform: systemPlatform,
            language: '',
            sdkVersion: '',
            userId: '',
            appVersion: '',
            osVersion: '',
            bundleId: '',
            serverUrl: '',
            fixedAfterHitKeys: [''],
        },
        defaultFileDownloadPath: downloadPath,
        deviceInfo: {
            guid,
            buildVer: QQVersion,
            localId: 2052,
            devName: hostname,
            devType: systemName,
            vendorName: '',
            osVer: systemVersion,
            vendorOsName: systemName,
            setMute: false,
            vendorType: VendorType.KNOSETONIOS,
        },
        deviceConfig: '{"appearance":{"isSplitViewMode":true},"msg":{}}',
    };
}

export interface InstanceContext {
    readonly workingEnv: NapCatCoreWorkingEnv;
    readonly wrapper: WrapperNodeApi;
    readonly session: NodeIQQNTWrapperSession;
    readonly logger: LogWrapper;
    readonly loginService: NodeIKernelLoginService;
    readonly basicInfoWrapper: QQBasicInfoWrapper;
    readonly pathWrapper: NapCatPathWrapper;
}

export interface StableNTApiWrapper {
    FileApi: NTQQFileApi,
    SystemApi: NTQQSystemApi,
    PacketApi: NTQQPacketApi,
    CollectionApi: NTQQCollectionApi,
    WebApi: NTQQWebApi,
    FriendApi: NTQQFriendApi,
    MsgApi: NTQQMsgApi,
    UserApi: NTQQUserApi,
    GroupApi: NTQQGroupApi
}
