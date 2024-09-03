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
import { getMachineId, hostname, systemName, systemVersion } from '@/common/system';
import { NTEventWrapper } from '@/common/event';
import { DataSource, GroupMember, KickedOffLineInfo, SelfInfo, SelfStatusInfo } from '@/core/entities';
import { NapCatConfigLoader } from '@/core/helper/config';
import os from 'node:os';
import { NodeIKernelGroupListener, NodeIKernelMsgListener, NodeIKernelProfileListener } from '@/core/listeners';
import { proxiedListenerOf } from '@/common/proxy-handler';

export * from './wrapper';
export * from './entities';
export * from './services';
export * from './listeners';

export enum NapCatCoreWorkingEnv {
    Unknown = 0,
    Shell = 1,
    Framework = 2,
}

export function loadQQWrapper(QQVersion: string): WrapperNodeApi {
    let appPath;
    appPath = path.resolve(path.dirname(process.execPath), './resources/app');
    let wrapperNodePath = path.resolve(appPath, 'wrapper.node');
    if (!fs.existsSync(wrapperNodePath)) {
        wrapperNodePath = path.join(appPath, `versions/${QQVersion}/wrapper.node`);
    }
    const nativemodule: any = { exports: {} };
    process.dlopen(nativemodule, wrapperNodePath);
    return nativemodule.exports;
}

export class NapCatCore {
    readonly context: InstanceContext;
    readonly apis: StableNTApiWrapper;
    readonly eventWrapper: NTEventWrapper;
    // readonly eventChannel: NTEventChannel;
    NapCatDataPath: string;
    NapCatTempPath: string;
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
        this.apis = {
            FileApi: new NTQQFileApi(this.context, this),
            SystemApi: new NTQQSystemApi(this.context, this),
            CollectionApi: new NTQQCollectionApi(this.context, this),
            WebApi: new NTQQWebApi(this.context, this),
            FriendApi: new NTQQFriendApi(this.context, this),
            MsgApi: new NTQQMsgApi(this.context, this),
            UserApi: new NTQQUserApi(this.context, this),
            GroupApi: new NTQQGroupApi(this.context, this),
        };
        this.configLoader = new NapCatConfigLoader(this, this.context.pathWrapper.configPath);
        this.NapCatDataPath = path.join(this.dataPath, 'NapCat');
        fs.mkdirSync(this.NapCatDataPath, { recursive: true });
        this.NapCatTempPath = path.join(this.NapCatDataPath, 'temp');
        // 创建临时目录
        if (!fs.existsSync(this.NapCatTempPath)) {
            fs.mkdirSync(this.NapCatTempPath, { recursive: true });
        }
        this.initNapCatCoreListeners().then().catch(this.context.logger.logError);

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
        //await sleep(2500);
        this.context.session.getMsgService().addKernelMsgListener(
            proxiedListenerOf(msgListener, this.context.logger) as any,
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
                this.context.logger.log("账号状态变更为离线");
            }
            this.selfInfo.online = true;
        };
        this.context.session.getProfileService().addKernelProfileListener(
            proxiedListenerOf(profileListener, this.context.logger),
        );

        // 群相关
        const groupListener = new NodeIKernelGroupListener();
        groupListener.onGroupListUpdate = (updateType, groupList) => {
            // console.log("onGroupListUpdate", updateType, groupList)
            groupList.map(g => {
                const existGroup = this.apis.GroupApi.groupCache.get(g.groupCode);
                //群成员数量变化 应该刷新缓存
                if (existGroup && g.memberCount === existGroup.memberCount) {
                    Object.assign(existGroup, g);
                } else {
                    this.apis.GroupApi.groupCache.set(g.groupCode, g);
                    // 获取群成员
                }
                const sceneId = this.context.session.getGroupService().createMemberListScene(g.groupCode, 'groupMemberList_MainWindow');
                this.context.session.getGroupService().getNextMemberList(sceneId, undefined, 3000).then( /* r => {
                    // console.log(`get group ${g.groupCode} members`, r);
                    // r.result.infos.forEach(member => {
                    // });
                    // groupMembers.set(g.groupCode, r.result.infos);
                } */);
                this.context.session.getGroupService().destroyMemberListScene(sceneId);
            });
        };
        groupListener.onMemberListChange = (arg) => {
            // todo: 应该加一个内部自己维护的成员变动callback，用于判断成员变化通知
            const groupCode = arg.sceneId.split('_')[0];
            if (this.apis.GroupApi.groupMemberCache.has(groupCode)) {
                const existMembers = this.apis.GroupApi.groupMemberCache.get(groupCode)!;
                arg.infos.forEach((member, uid) => {
                    //console.log('onMemberListChange', member);
                    const existMember = existMembers.get(uid);
                    if (existMember) {
                        Object.assign(existMember, member);
                    } else {
                        existMembers!.set(uid, member);
                    }
                    //移除成员
                    if (member.isDelete) {
                        existMembers.delete(uid);
                    }
                });
            } else {
                this.apis.GroupApi.groupMemberCache.set(groupCode, arg.infos);
            }
        };
        groupListener.onMemberInfoChange = (groupCode, dataSource, members) => {
            if (dataSource === DataSource.LOCAL && members.get(this.selfInfo.uid)?.isDelete) {
                // 自身退群或者被踢退群 5s用于Api操作 之后不再出现
                setTimeout(() => {
                    this.apis.GroupApi.groupCache.delete(groupCode);
                }, 5000);

            }
            const existMembers = this.apis.GroupApi.groupMemberCache.get(groupCode);
            if (existMembers) {
                members.forEach((member, uid) => {
                    const existMember = existMembers.get(uid);
                    if (existMember) {
                        // 检查管理变动
                        member.isChangeRole = this.checkAdminEvent(groupCode, member, existMember);
                        // 更新成员信息
                        Object.assign(existMember, member);
                    } else {
                        existMembers.set(uid, member);
                    }
                    //移除成员
                    if (member.isDelete) {
                        existMembers.delete(uid);
                    }
                });
            } else {
                this.apis.GroupApi.groupMemberCache.set(groupCode, members);
            }
        };
        this.context.session.getGroupService().addKernelGroupListener(
            proxiedListenerOf(groupListener, this.context.logger) as any,
        );
    }

    checkAdminEvent(groupCode: string, memberNew: GroupMember, memberOld: GroupMember | undefined): boolean {
        if (memberNew.role !== memberOld?.role) {
            this.context.logger.logDebug(`群 ${groupCode} ${memberNew.nick} 角色变更为 ${memberNew.role === 3 ? '管理员' : '群员'}`);
            return true;
        }
        return false;
    }
}

export async function genSessionConfig(QQVersionAppid: string, QQVersion: string, selfUin: string, selfUid: string, account_path: string): Promise<WrapperSessionInitConfig> {
    const downloadPath = path.join(account_path, 'NapCat', 'temp');
    fs.mkdirSync(downloadPath, { recursive: true });
    const guid: string = await getMachineId();//26702 支持JS获取guid值 在LoginService中获取 TODO mlikiow a
    return {
        selfUin,
        selfUid,
        desktopPathConfig: {
            account_path, // 可以通过NodeQQNTWrapperUtil().getNTUserDataInfoConfig()获取
        },
        clientVer: QQVersion,  // 9.9.8-22355
        a2: '',
        d2: '',
        d2Key: '',
        machineId: '',
        platform: PlatformType.KWINDOWS,  // 3是Windows?
        platVer: systemVersion,  // 系统版本号, 应该可以固定
        appid: QQVersionAppid,
        rdeliveryConfig: {
            appKey: '',
            systemId: 0,
            appId: '',
            logicEnvironment: '',
            platform: PlatformType.KWINDOWS,
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
    CollectionApi: NTQQCollectionApi,
    WebApi: NTQQWebApi,
    FriendApi: NTQQFriendApi,
    MsgApi: NTQQMsgApi,
    UserApi: NTQQUserApi,
    GroupApi: NTQQGroupApi
}
