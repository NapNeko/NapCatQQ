import { NodeQQNTWrapperUtil, NTApiContext, WrapperNodeApi } from '@/core/wrapper';
import path from 'node:path';
import fs from 'node:fs';
import { InstanceContext } from './wrapper';
import { proxiedListenerOf } from '@/common/utils/proxy-handler';
import { GroupListener, MsgListener, ProfileListener } from './listeners';
import { GroupMember, SelfInfo } from './entities';
import { LegacyNTEventWrapper } from '@/common/framework/event-legacy';
import { NTQQFileApi, NTQQFriendApi, NTQQGroupApi, NTQQMsgApi, NTQQSystemApi, NTQQUserApi, NTQQWebApi } from './apis';
import os from 'node:os';
import { NTQQCollectionApi } from './apis/collection';
import { NapCatConfigLoader } from './helper/config';
import { LogLevel } from '@/common/utils/log';

export enum NapCatCoreWorkingEnv {
    Unknown = 0,
    Shell = 1,
    Framework = 2,
}

export function loadQQWrapper(QQVersion: string): WrapperNodeApi {
    let wrapperNodePath = path.resolve(path.dirname(process.execPath), './resources/app/wrapper.node');
    if (!fs.existsSync(wrapperNodePath)) {
        wrapperNodePath = path.join(path.dirname(process.execPath), `resources/app/versions/${QQVersion}/wrapper.node`);
    }
    const nativemodule: any = { exports: {} };
    process.dlopen(nativemodule, wrapperNodePath);
    return nativemodule.exports;
}

export class NapCatCore {
    readonly context: InstanceContext;
    readonly apis: NTApiContext;
    readonly eventWrapper: LegacyNTEventWrapper;
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
        this.util = new this.context.wrapper.NodeQQNTWrapperUtil();
        this.eventWrapper = new LegacyNTEventWrapper(context.wrapper, context.session);
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
        let result = this.util.getNTUserDataInfoConfig();
        if (!result) {
            result = path.resolve(os.homedir(), './.config/QQ');
            fs.mkdirSync(result, { recursive: true });
        }
        return result;
    }

    // Renamed from 'InitDataListener'
    async initNapCatCoreListeners() {
        const msgListener = new MsgListener();
        msgListener.onRecvMsg = (msgs) => {
            msgs.forEach(msg => this.context.logger.logMessage(msg, this.selfInfo));
        };
        //await sleep(2500);
        this.context.session.getMsgService().addKernelMsgListener(
            new this.context.wrapper.NodeIKernelMsgListener(proxiedListenerOf(msgListener, this.context.logger)),
        );

        const profileListener = new ProfileListener();
        profileListener.onProfileDetailInfoChanged = (profile) => {
            if (profile.uid === this.selfInfo.uid) {
                Object.assign(this.selfInfo, profile);
            }
        };
        profileListener.onSelfStatusChanged = (/* Info: SelfStatusInfo */) => {
            // if (Info.status == 20) {
            //   log("账号状态变更为离线")
            // }
        };
        this.context.session.getProfileService().addKernelProfileListener(
            new this.context.wrapper.NodeIKernelProfileListener(proxiedListenerOf(profileListener, this.context.logger)),
        );

        // 群相关
        const groupListener = new GroupListener();
        groupListener.onGroupListUpdate = (updateType, groupList) => {
            // console.log("onGroupListUpdate", updateType, groupList)
            groupList.map(g => {
                const existGroup = this.apis.GroupApi.groupCache.get(g.groupCode);
                //群成员数量变化 应该刷新缓存
                if (existGroup && g.memberCount === existGroup.memberCount) {
                    Object.assign(existGroup, g);
                }
                else {
                    this.apis.GroupApi.groupCache.set(g.groupCode, g);
                    // 获取群成员
                }
                const sceneId = this.context.session.getGroupService().createMemberListScene(g.groupCode, 'groupMemberList_MainWindow');
                this.context.session.getGroupService().getNextMemberList(sceneId!, undefined, 3000).then( /* r => {
                    // console.log(`get group ${g.groupCode} members`, r);
                    // r.result.infos.forEach(member => {
                    // });
                    // groupMembers.set(g.groupCode, r.result.infos);
                } */);
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
                    }
                    else {
                        existMembers!.set(uid, member);
                    }
                    //移除成员
                    if (member.isDelete) {
                        existMembers.delete(uid);
                    }
                });
            }
            else {
                this.apis.GroupApi.groupMemberCache.set(groupCode, arg.infos);
            }
            // console.log('onMemberListChange', groupCode, arg);
        };
        groupListener.onMemberInfoChange = (groupCode, changeType, members) => {
            //console.log('onMemberInfoChange', groupCode, changeType, members);
            if (changeType === 0 && members.get(this.selfInfo.uid)?.isDelete) {
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
                    }
                    else {
                        existMembers.set(uid, member);
                    }
                    //移除成员
                    if (member.isDelete) {
                        existMembers.delete(uid);
                    }
                });
            }
            else {
                this.apis.GroupApi.groupMemberCache.set(groupCode, members);
            }
        };
    }
    checkAdminEvent(groupCode: string, memberNew: GroupMember, memberOld: GroupMember | undefined): boolean {
        if (memberNew.role !== memberOld?.role) {
            this.context.logger.log(`群 ${groupCode} ${memberNew.nick} 角色变更为 ${memberNew.role === 3 ? '管理员' : '群员'}`);
            return true;
        }
        return false;
    }
}
