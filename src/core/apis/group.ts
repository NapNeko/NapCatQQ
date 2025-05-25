import {
    GeneralCallResult,
    GroupMember,
    NTGroupMemberRole,
    NTGroupRequestOperateTypes,
    InstanceContext,
    KickMemberV2Req,
    MemberExtSourceType,
    NapCatCore,
    GroupNotify,
    GroupInfoSource,
    ShutUpGroupMember,
    Peer,
    ChatType,
} from '@/core';
import { isNumeric, solveAsyncProblem } from '@/common/helper';
import { LimitedHashTable } from '@/common/message-unique';
import { NTEventWrapper } from '@/common/event';
import { CancelableTask, TaskExecutor } from '@/common/cancel-task';
import { createGroupDetailInfoV2Param, createGroupExtFilter, createGroupExtInfo } from '../data';

export class NTQQGroupApi {
    context: InstanceContext;
    core: NapCatCore;
    groupMemberCache: Map<string, Map<string, GroupMember>> = new Map<string, Map<string, GroupMember>>();
    essenceLRU = new LimitedHashTable<number, string>(1000);

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
    }

    async setGroupRemark(groupCode: string, remark: string) {
        return this.context.session.getGroupService().modifyGroupRemark(groupCode, remark);
    }
    async fetchGroupDetail(groupCode: string) {
        const [, detailInfo] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelGroupService/getGroupDetailInfo',
            'NodeIKernelGroupListener/onGroupDetailInfoChange',
            [groupCode, GroupInfoSource.KDATACARD],
            (ret) => ret.result === 0,
            (detailInfo) => detailInfo.groupCode === groupCode,
            1,
            5000
        );
        return detailInfo;
    }

    async initApi() {
        this.initCache().then().catch(e => this.context.logger.logError(e));
    }

    async createGrayTip(groupCode: string, tip: string) {
        return this.context.session.getMsgService().addLocalJsonGrayTipMsg(
            {
                chatType: ChatType.KCHATTYPEGROUP,
                peerUid: groupCode,
            } as Peer,
            {
                busiId: 2201,
                jsonStr: JSON.stringify({ "align": "center", "items": [{ "txt": tip, "type": "nor" }] }),
                recentAbstract: tip,
                isServer: false
            },
            true,
            true
        )
    }
    async initCache() {
        for (const group of await this.getGroups(true)) {
            this.refreshGroupMemberCache(group.groupCode, false).then().catch(e => this.context.logger.logError(e));
        }
    }

    async fetchGroupEssenceList(groupCode: string) {
        const pskey = (await this.core.apis.UserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com')!;
        return this.context.session.getGroupService().fetchGroupEssenceList({
            groupCode: groupCode,
            pageStart: 0,
            pageLimit: 300,
        }, pskey);
    }

    async getGroupShutUpMemberList(groupCode: string): Promise<ShutUpGroupMember[]> {
        const executor: TaskExecutor<ShutUpGroupMember[]> = async (resolve, reject, onCancel) => {
            this.core.eventWrapper.registerListen(
                'NodeIKernelGroupListener/onShutUpMemberListChanged',
                (group_id) => group_id === groupCode,
                1,
                1000
            ).then((data) => {
                resolve(data[1]);
            }).catch(reject);

            onCancel(() => {
                reject(new Error('Task was canceled'));
            });
        };

        const task = new CancelableTask(executor);
        this.context.session.getGroupService().getGroupShutUpMemberList(groupCode).then(e => {
            if (e.result !== 0) {
                task.cancel();
            }
        });
        return await task.catch(() => []);
    }

    async clearGroupNotifiesUnreadCount(doubt: boolean) {
        return this.context.session.getGroupService().clearGroupNotifiesUnreadCount(doubt);
    }

    async setGroupAvatar(groupCode: string, filePath: string) {
        return this.context.session.getGroupService().setHeader(groupCode, filePath);
    }

    // 0 0 无需管理员审核
    // 0 2 需要管理员审核
    // 1 2 禁止Bot入群( 最好只传一个1 ？)
    async setGroupRobotAddOption(groupCode: string, robotMemberSwitch?: number, robotMemberExamine?: number) {
        let extInfo = createGroupExtInfo(groupCode);
        let groupExtFilter = createGroupExtFilter();
        if (robotMemberSwitch !== undefined) {
            extInfo.extInfo.inviteRobotMemberSwitch = robotMemberSwitch;
            groupExtFilter.inviteRobotMemberSwitch = 1;
        }
        if (robotMemberExamine !== undefined) {
            extInfo.extInfo.inviteRobotMemberExamine = robotMemberExamine;
            groupExtFilter.inviteRobotMemberExamine = 1;
        }
        return this.context.session.getGroupService().modifyGroupExtInfoV2(extInfo, groupExtFilter);
    }

    async setGroupAddOption(groupCode: string, option: {
        addOption: number;
        groupQuestion?: string;
        groupAnswer?: string;
    }) {
        let param = createGroupDetailInfoV2Param(groupCode);
        // 设置要修改的目标
        param.filter.addOption = 1;
        if (option.addOption == 4 || option.addOption == 5) {
            // 4 问题进入答案 5 问题管理员批准
            param.filter.groupQuestion = 1;
            param.filter.groupAnswer = option.addOption == 4 ? 1 : 0;
            param.modifyInfo.groupQuestion = option.groupQuestion || '';
            param.modifyInfo.groupAnswer = option.addOption == 4 ? option.groupAnswer || '' : '';
        }
        param.modifyInfo.addOption = option.addOption;
        return this.context.session.getGroupService().modifyGroupDetailInfoV2(param, 0);
    }

    async setGroupSearch(groupCode: string, option: {
        noCodeFingerOpenFlag?: number;
        noFingerOpenFlag?: number;
    }) {
        let param = createGroupDetailInfoV2Param(groupCode);
        if (option.noCodeFingerOpenFlag) {
            param.filter.noCodeFingerOpenFlag = 1;
            param.modifyInfo.noCodeFingerOpenFlag = option.noCodeFingerOpenFlag;
        }
        if (option.noFingerOpenFlag) {
            param.filter.noFingerOpenFlag = 1;
            param.modifyInfo.noFingerOpenFlag = option.noFingerOpenFlag;
        }
        return this.context.session.getGroupService().modifyGroupDetailInfoV2(param, 0);
    }

    async getGroups(forced: boolean = false) {
        const [, , groupList] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelGroupService/getGroupList',
            'NodeIKernelGroupListener/onGroupListUpdate',
            [forced],
        );
        return groupList;
    }

    async getGroupExtFE0Info(groupCodes: Array<string>, forced = true) {
        return this.context.session.getGroupService().getGroupExt0xEF0Info(
            groupCodes,
            [],
            {
                bindGuildId: 1,
                blacklistExpireTime: 1,
                companyId: 1,
                essentialMsgPrivilege: 1,
                essentialMsgSwitch: 1,
                fullGroupExpansionSeq: 1,
                fullGroupExpansionSwitch: 1,
                gangUpId: 1,
                groupAioBindGuildId: 1,
                groupBindGuildIds: 1,
                groupBindGuildSwitch: 1,
                groupExcludeGuildIds: 1,
                groupExtFlameData: 1,
                groupFlagPro1: 1,
                groupInfoExtSeq: 1,
                groupOwnerId: 1,
                groupSquareSwitch: 1,
                hasGroupCustomPortrait: 1,
                inviteRobotMemberExamine: 1,
                inviteRobotMemberSwitch: 1,
                inviteRobotSwitch: 1,
                isLimitGroupRtc: 1,
                lightCharNum: 1,
                luckyWord: 1,
                luckyWordId: 1,
                msgEventSeq: 1,
                qqMusicMedalSwitch: 1,
                reserve: 1,
                showPlayTogetherSwitch: 1,
                starId: 1,
                todoSeq: 1,
                viewedMsgDisappearTime: 1,
            },
            forced,
        );
    }

    async getGroupMemberAll(groupCode: string, forced = false) {
        return this.context.session.getGroupService().getAllMemberList(groupCode, forced);
    }

    async refreshGroupMemberCache(groupCode: string, isWait = true) {
        const updateCache = async () => {
            try {
                const members = await this.getGroupMemberAll(groupCode, true);
                this.groupMemberCache.set(groupCode, members.result.infos);
            } catch (e) {
                this.context.logger.logError(`刷新群成员缓存失败, 群号: ${groupCode}, 错误: ${e}`);
            }
        };

        if (isWait) {
            await updateCache();
        } else {
            updateCache();
        }

        return this.groupMemberCache.get(groupCode);
    }
    async refreshGroupMemberCachePartial(groupCode: string, uid: string) {
        const member = await this.getGroupMemberEx(groupCode, uid, true);
        if (member) {
            this.groupMemberCache.get(groupCode)?.set(uid, member);
        }
        return member;
    }
    async getGroupMember(groupCode: string | number, memberUinOrUid: string | number) {
        const groupCodeStr = groupCode.toString();
        const memberUinOrUidStr = memberUinOrUid.toString();

        // 获取群成员缓存
        let members = this.groupMemberCache.get(groupCodeStr);
        if (!members) {
            members = (await this.refreshGroupMemberCache(groupCodeStr, true));
        }

        const getMember = () => {
            if (isNumeric(memberUinOrUidStr)) {
                return Array.from(members!.values()).find(member => member.uin === memberUinOrUidStr);
            } else {
                return members!.get(memberUinOrUidStr);
            }
        };

        let member = getMember();
        // 如果缓存中不存在该成员，尝试刷新缓存
        if (!member) {
            members = (await this.refreshGroupMemberCache(groupCodeStr, true));
            member = getMember();
        }
        return member;
    }

    async getGroupRecommendContactArkJson(groupCode: string) {
        return this.context.session.getGroupService().getGroupRecommendContactArkJson(groupCode);
    }

    async creatGroupFileFolder(groupCode: string, folderName: string) {
        return this.context.session.getRichMediaService().createGroupFolder(groupCode, folderName);
    }

    async delGroupFile(groupCode: string, files: Array<string>) {
        return this.context.session.getRichMediaService().deleteGroupFile(groupCode, [102], files);
    }

    async delGroupFileFolder(groupCode: string, folderId: string) {
        return this.context.session.getRichMediaService().deleteGroupFolder(groupCode, folderId);
    }

    async transGroupFile(groupCode: string, fileId: string) {
        return this.context.session.getRichMediaService().transGroupFile(groupCode, fileId);
    }

    async addGroupEssence(groupCode: string, msgId: string) {
        const MsgData = await this.context.session.getMsgService().getMsgsIncludeSelf({
            chatType: 2,
            guildId: '',
            peerUid: groupCode,
        }, msgId, 1, false);
        if (!MsgData.msgList[0]) {
            throw new Error('消息不存在');
        }
        const param = {
            groupCode: groupCode,
            msgRandom: parseInt(MsgData.msgList[0].msgRandom),
            msgSeq: parseInt(MsgData.msgList[0].msgSeq),
        };
        return this.context.session.getGroupService().addGroupEssence(param);
    }

    async kickMemberV2Inner(param: KickMemberV2Req) {
        return this.context.session.getGroupService().kickMemberV2(param);
    }

    async deleteGroupBulletin(groupCode: string, noticeId: string) {
        const psKey = (await this.core.apis.UserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com')!;
        return this.context.session.getGroupService().deleteGroupBulletin(groupCode, psKey, noticeId);
    }

    async quitGroupV2(GroupCode: string, needDeleteLocalMsg: boolean) {
        const param = {
            groupCode: GroupCode,
            needDeleteLocalMsg: needDeleteLocalMsg,
        };
        return this.context.session.getGroupService().quitGroupV2(param);
    }

    async removeGroupEssenceBySeq(groupCode: string, msgRandom: string, msgSeq: string) {
        const param = {
            groupCode: groupCode,
            msgRandom: parseInt(msgRandom),
            msgSeq: parseInt(msgSeq),
        };
        return this.context.session.getGroupService().removeGroupEssence(param);
    }

    async removeGroupEssence(groupCode: string, msgId: string) {
        const MsgData = await this.context.session.getMsgService().getMsgsIncludeSelf({
            chatType: 2,
            guildId: '',
            peerUid: groupCode,
        }, msgId, 1, false);
        if (!MsgData.msgList[0]) {
            throw new Error('消息不存在');
        }
        const param = {
            groupCode: groupCode,
            msgRandom: parseInt(MsgData.msgList[0].msgRandom),
            msgSeq: parseInt(MsgData.msgList[0].msgSeq),
        };
        return this.context.session.getGroupService().removeGroupEssence(param);
    }

    async getSingleScreenNotifies(doubt: boolean, count: number) {
        const [, , , notifies] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelGroupService/getSingleScreenNotifies',
            'NodeIKernelGroupListener/onGroupSingleScreenNotifies',
            [
                doubt,
                '',
                count,
            ],
        );
        return notifies;
    }

    async searchGroup(groupCode: string) {
        const [, ret] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelSearchService/searchGroup',
            'NodeIKernelSearchListener/onSearchGroupResult',
            [{
                keyWords: groupCode,
                groupNum: 25,
                exactSearch: false,
                penetrate: ''
            }],
            (ret) => ret.result === 0,
            (params) => !!params.groupInfos.find(g => g.groupCode === groupCode),
            1,
            5000
        );
        return ret.groupInfos.find(g => g.groupCode === groupCode);
    }

    async getGroupMemberEx(groupCode: string, uid: string, forced: boolean = false, retry: number = 2) {
        const data = await solveAsyncProblem((eventWrapper: NTEventWrapper, GroupCode: string, uid: string, forced = false) => {
            return eventWrapper.callNormalEventV2(
                'NodeIKernelGroupService/getMemberInfo',
                'NodeIKernelGroupListener/onMemberInfoChange',
                [groupCode, [uid], forced],
                (ret) => ret.result === 0,
                (params, _, members) => params === GroupCode && members.size > 0 && members.has(uid),
                1,
                forced ? 2500 : 250
            );
        }, this.core.eventWrapper, groupCode, uid, forced);
        if (data && data[3] instanceof Map && data[3].has(uid)) {
            return data[3].get(uid);
        }
        if (retry > 0) {
            const trydata = await this.getGroupMemberEx(groupCode, uid, true, retry - 1) as GroupMember | undefined;
            if (trydata) return trydata;
        }
        return undefined;
    }

    async getGroupFileCount(groupCodes: Array<string>) {
        return this.context.session.getRichMediaService().batchGetGroupFileCount(groupCodes);
    }

    async getArkJsonGroupShare(groupCode: string) {
        const ret = await this.core.eventWrapper.callNoListenerEvent(
            'NodeIKernelGroupService/getGroupRecommendContactArkJson',
            groupCode,
        ) as GeneralCallResult & { arkJson: string };
        return ret.arkJson;
    }

    async uploadGroupBulletinPic(groupCode: string, imageurl: string) {
        const _Pskey = (await this.core.apis.UserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com')!;
        return this.context.session.getGroupService().uploadGroupBulletinPic(groupCode, _Pskey, imageurl);
    }

    async handleGroupRequest(doubt: boolean, notify: GroupNotify, operateType: NTGroupRequestOperateTypes, reason?: string) {
        return this.context.session.getGroupService().operateSysNotify(
            doubt,
            {
                operateType: operateType,
                targetMsg: {
                    seq: notify.seq,  // 通知序列号
                    type: notify.type,
                    groupCode: notify.group.groupCode,
                    postscript: reason ?? ' ', // 仅传空值可能导致处理失败，故默认给个空格
                },
            });
    }

    async quitGroup(groupCode: string) {
        return this.context.session.getGroupService().quitGroup(groupCode);
    }

    async kickMember(groupCode: string, kickUids: string[], refuseForever: boolean = false, kickReason: string = '') {
        return this.context.session.getGroupService().kickMember(groupCode, kickUids, refuseForever, kickReason);
    }

    async banMember(groupCode: string, memList: Array<{ uid: string, timeStamp: number }>) {
        // timeStamp为秒数, 0为解除禁言
        return this.context.session.getGroupService().setMemberShutUp(groupCode, memList);
    }

    async banGroup(groupCode: string, shutUp: boolean) {
        return this.context.session.getGroupService().setGroupShutUp(groupCode, shutUp);
    }

    async setMemberCard(groupCode: string, memberUid: string, cardName: string) {
        return this.context.session.getGroupService().modifyMemberCardName(groupCode, memberUid, cardName);
    }

    async setMemberRole(groupCode: string, memberUid: string, role: NTGroupMemberRole) {
        return this.context.session.getGroupService().modifyMemberRole(groupCode, memberUid, role);
    }

    async setGroupName(groupCode: string, groupName: string) {
        return this.context.session.getGroupService().modifyGroupName(groupCode, groupName, false);
    }

    async publishGroupBulletin(groupCode: string, content: string, picInfo: {
        id: string,
        width: number,
        height: number
    } | undefined = undefined, pinned: number = 0, confirmRequired: number = 0) {
        const psKey = (await this.core.apis.UserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com');
        //text是content内容url编码
        const data = {
            text: encodeURI(content),
            picInfo: picInfo,
            oldFeedsId: '',
            pinned: pinned,
            confirmRequired: confirmRequired,
        };
        return this.context.session.getGroupService().publishGroupBulletin(groupCode, psKey!, data);
    }

    async getGroupRemainAtTimes(groupCode: string) {
        return this.context.session.getGroupService().getGroupRemainAtTimes(groupCode);
    }

    async getMemberExtInfo(groupCode: string, uin: string) {
        return this.context.session.getGroupService().getMemberExtInfo(
            {
                groupCode: groupCode,
                sourceType: MemberExtSourceType.TITLETYPE,
                beginUin: '0',
                dataTime: '0',
                uinList: [uin],
                uinNum: '',
                seq: '',
                groupType: '',
                richCardNameVer: '',
                memberExtFilter: {
                    memberLevelInfoUin: 1,
                    memberLevelInfoPoint: 1,
                    memberLevelInfoActiveDay: 1,
                    memberLevelInfoLevel: 1,
                    memberLevelInfoName: 1,
                    levelName: 1,
                    dataTime: 1,
                    userShowFlag: 1,
                    sysShowFlag: 1,
                    timeToUpdate: 1,
                    nickName: 1,
                    specialTitle: 1,
                    levelNameNew: 1,
                    userShowFlagNew: 1,
                    msgNeedField: 1,
                    cmdUinFlagExt3Grocery: 1,
                    memberIcon: 1,
                    memberInfoSeq: 1,
                },
            },
        );
    }
}
