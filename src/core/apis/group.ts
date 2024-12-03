import {
    GeneralCallResult,
    Group,
    GroupMember,
    NTGroupMemberRole,
    NTGroupRequestOperateTypes,
    InstanceContext,
    KickMemberV2Req,
    MemberExtSourceType,
    NapCatCore,
} from '@/core';
import { isNumeric, solveAsyncProblem } from '@/common/helper';
import { LimitedHashTable } from '@/common/message-unique';
import { NTEventWrapper } from '@/common/event';

export class NTQQGroupApi {
    context: InstanceContext;
    core: NapCatCore;
    groupCache: Map<string, Group> = new Map<string, Group>();
    groupMemberCache: Map<string, Map<string, GroupMember>> = new Map<string, Map<string, GroupMember>>();
    groups: Group[] = [];
    essenceLRU = new LimitedHashTable<number, string>(1000);
    session: any;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
    }
    async initApi() {
        this.initCache().then().catch(e => this.context.logger.logError(e));
    }
    async initCache() {
        this.groups = await this.getGroups();
        for (const group of this.groups) {
            this.groupCache.set(group.groupCode, group);
            this.refreshGroupMemberCache(group.groupCode).then().catch(e => this.context.logger.logError(e));
        }
        this.context.logger.logDebug(`加载${this.groups.length}个群组缓存完成`);
        // process.pid 调试点
    }

    async getCoreAndBaseInfo(uids: string[]) {
        return await this.core.eventWrapper.callNoListenerEvent(
            'NodeIKernelProfileService/getCoreAndBaseInfo',
            'nodeStore',
            uids,
        );
    }

    async fetchGroupEssenceList(groupCode: string) {
        const pskey = (await this.core.apis.UserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com')!;
        return this.context.session.getGroupService().fetchGroupEssenceList({
            groupCode: groupCode,
            pageStart: 0,
            pageLimit: 300,
        }, pskey);
    }

    async getGroupShutUpMemberList(groupCode: string) {
        const data = this.core.eventWrapper.registerListen('NodeIKernelGroupListener/onShutUpMemberListChanged', (group_id) => group_id === groupCode, 1, 1000);
        this.context.session.getGroupService().getGroupShutUpMemberList(groupCode);
        return (await data)[1];
    }

    async clearGroupNotifiesUnreadCount(uk: boolean) {
        return this.context.session.getGroupService().clearGroupNotifiesUnreadCount(uk);
    }

    async setGroupAvatar(gc: string, filePath: string) {
        return this.context.session.getGroupService().setHeader(gc, filePath);
    }

    async getGroups(forced = false) {
        const [, , groupList] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelGroupService/getGroupList',
            'NodeIKernelGroupListener/onGroupListUpdate',
            [forced],
        );
        return groupList;
    }

    async GetGroupMembersV3(groupQQ: string, num = 3000, timeout = 2500): Promise<{
        infos: Map<string, GroupMember>;
        finish: boolean;
        hasNext: boolean | undefined;
        listenerMode: boolean;
    }> {
        const sceneId = this.context.session.getGroupService().createMemberListScene(groupQQ, 'groupMemberList_MainWindow_1');
        const once = this.core.eventWrapper.registerListen('NodeIKernelGroupListener/onMemberListChange', (params) => params.sceneId === sceneId, 0, timeout)
            .catch(() => { });
        const result = await this.context.session.getGroupService().getNextMemberList(sceneId, undefined, num);
        if (result.errCode !== 0) {
            throw new Error('获取群成员列表出错,' + result.errMsg);
        }
        let resMode2;
        if (result.result.finish && result.result.infos.size === 0) {
            const ret = (await once)?.[0];
            if (ret) {
                resMode2 = ret;
            }
        }
        this.context.session.getGroupService().destroyMemberListScene(sceneId);
        return {
            infos: new Map([...(resMode2?.infos ?? []), ...result.result.infos]),
            finish: result.result.finish,
            hasNext: resMode2?.hasNext,
            listenerMode: resMode2?.hasNext !== undefined
        };
    }

    async getGroupExtFE0Info(groupCode: string[], forced = true) {
        return this.context.session.getGroupService().getGroupExt0xEF0Info(
            groupCode,
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

    async getGroup(groupCode: string, forced = false) {
        let group = this.groupCache.get(groupCode.toString());
        if (!group) {
            try {
                const groupList = await this.getGroups(forced);
                if (groupList.length) {
                    groupList.forEach(g => {
                        this.groupCache.set(g.groupCode, g);
                    });
                }
            } catch (e) {
                return undefined;
            }
        }
        group = this.groupCache.get(groupCode.toString());
        return group;
    }

    async getGroupMemberAll(groupCode: string, forced = false) {
        return this.context.session.getGroupService().getAllMemberList(groupCode, forced);
    }

    async refreshGroupMemberCache(groupCode: string) {
        try {
            const members = await this.getGroupMemberAll(groupCode, true);
            // 首先填入基础信息
            const existingMembers = this.groupMemberCache.get(groupCode) ?? new Map<string, GroupMember>();
            members.result.infos.forEach((value, key) => {
                existingMembers.set(value.uid, { ...value, ...existingMembers.get(value.uid) });
            });
            // 后台补全复杂信息
            let event = (async () => {
                let data = (await Promise.allSettled(members.result.ids.map(e => this.core.apis.UserApi.getUserDetailInfo(e.uid)))).filter(e => e.status === 'fulfilled').map(e => e.value);
                data.forEach(e => {
                    const existingMember = members.result.infos.get(e.uid);
                    if (existingMember) {
                        members.result.infos.set(e.uid, { ...existingMember, ...e });
                    }
                });
                this.groupMemberCache.set(groupCode, members.result.infos);
            })().then().catch(e => this.context.logger.logError(e));
            // 处理首次空缺
            if (!this.groupMemberCache.get(groupCode)) {
                await event;
            }
        } catch (e) {
            this.context.logger.logError(`刷新群成员缓存失败, ${e}`);
        }
    }

    async getGroupMember(groupCode: string | number, memberUinOrUid: string | number) {
        const groupCodeStr = groupCode.toString();
        const memberUinOrUidStr = memberUinOrUid.toString();
        let members = this.groupMemberCache.get(groupCodeStr);
        if (!members) {
            await this.refreshGroupMemberCache(groupCodeStr);
        }

        function getMember() {
            let member: GroupMember | undefined;
            if (isNumeric(memberUinOrUidStr)) {
                member = Array.from(members!.values()).find(member => member.uin === memberUinOrUidStr);
            } else {
                member = members!.get(memberUinOrUidStr);
            }
            return member;
        }

        let member = getMember();
        if (!member) {
            members = (await this.getGroupMemberAll(groupCodeStr)).result.infos;
            member = getMember();
        }
        return member;
    }

    async getGroupRecommendContactArkJson(groupCode: string) {
        return this.context.session.getGroupService().getGroupRecommendContactArkJson(groupCode);
    }

    async CreatGroupFileFolder(groupCode: string, folderName: string) {
        return this.context.session.getRichMediaService().createGroupFolder(groupCode, folderName);
    }

    async DelGroupFile(groupCode: string, files: string[]) {
        return this.context.session.getRichMediaService().deleteGroupFile(groupCode, [102], files);
    }

    async DelGroupFileFolder(groupCode: string, folderId: string) {
        return this.context.session.getRichMediaService().deleteGroupFolder(groupCode, folderId);
    }

    async addGroupEssence(GroupCode: string, msgId: string) {
        const MsgData = await this.context.session.getMsgService().getMsgsIncludeSelf({
            chatType: 2,
            guildId: '',
            peerUid: GroupCode,
        }, msgId, 1, false);
        const param = {
            groupCode: GroupCode,
            msgRandom: parseInt(MsgData.msgList[0].msgRandom),
            msgSeq: parseInt(MsgData.msgList[0].msgSeq),
        };
        return this.context.session.getGroupService().addGroupEssence(param);
    }

    async kickMemberV2Inner(param: KickMemberV2Req) {
        return this.context.session.getGroupService().kickMemberV2(param);
    }

    async deleteGroupBulletin(GroupCode: string, noticeId: string) {
        const psKey = (await this.core.apis.UserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com')!;
        return this.context.session.getGroupService().deleteGroupBulletin(GroupCode, psKey, noticeId);
    }

    async quitGroupV2(GroupCode: string, needDeleteLocalMsg: boolean) {
        const param = {
            groupCode: GroupCode,
            needDeleteLocalMsg: needDeleteLocalMsg,
        };
        return this.context.session.getGroupService().quitGroupV2(param);
    }

    async removeGroupEssenceBySeq(GroupCode: string, msgRandom: string, msgSeq: string) {
        const param = {
            groupCode: GroupCode,
            msgRandom: parseInt(msgRandom),
            msgSeq: parseInt(msgSeq),
        };
        return this.context.session.getGroupService().removeGroupEssence(param);
    }

    async removeGroupEssence(GroupCode: string, msgId: string) {
        const MsgData = await this.context.session.getMsgService().getMsgsIncludeSelf({
            chatType: 2,
            guildId: '',
            peerUid: GroupCode,
        }, msgId, 1, false);
        const param = {
            groupCode: GroupCode,
            msgRandom: parseInt(MsgData.msgList[0].msgRandom),
            msgSeq: parseInt(MsgData.msgList[0].msgSeq),
        };
        return this.context.session.getGroupService().removeGroupEssence(param);
    }

    async getSingleScreenNotifies(doubt: boolean, num: number) {
        const [, , , notifies] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelGroupService/getSingleScreenNotifies',
            'NodeIKernelGroupListener/onGroupSingleScreenNotifies',
            [
                doubt,
                '',
                num,
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

    async getGroupMemberEx(GroupCode: string, uid: string, forced = false, retry = 2) {
        const data = await solveAsyncProblem((eventWrapper: NTEventWrapper, GroupCode: string, uid: string, forced = false) => {
            return eventWrapper.callNormalEventV2(
                'NodeIKernelGroupService/getMemberInfo',
                'NodeIKernelGroupListener/onMemberInfoChange',
                [GroupCode, [uid], forced],
                (ret) => ret.result === 0,
                (params, _, members) => params === GroupCode && members.size > 0 && members.has(uid),
                1,
                forced ? 2500 : 250
            );
        }, this.core.eventWrapper, GroupCode, uid, forced);
        if (data && data[3] instanceof Map && data[3].has(uid)) {
            return data[3].get(uid);
        }
        if (retry > 0) {
            const trydata = await this.getGroupMemberEx(GroupCode, uid, true, retry - 1) as GroupMember | undefined;
            if (trydata) return trydata;
        }
        return undefined;
    }

    async getGroupFileCount(group_ids: Array<string>) {
        return this.context.session.getRichMediaService().batchGetGroupFileCount(group_ids);
    }

    async getArkJsonGroupShare(GroupCode: string) {
        const ret = await this.core.eventWrapper.callNoListenerEvent(
            'NodeIKernelGroupService/getGroupRecommendContactArkJson',
            GroupCode,
        ) as GeneralCallResult & { arkJson: string };
        return ret.arkJson;
    }

    //需要异常处理
    async uploadGroupBulletinPic(GroupCode: string, imageurl: string) {
        const _Pskey = (await this.core.apis.UserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com')!;
        return this.context.session.getGroupService().uploadGroupBulletinPic(GroupCode, _Pskey, imageurl);
    }

    async handleGroupRequest(flag: string, operateType: NTGroupRequestOperateTypes, reason?: string) {
        const flagitem = flag.split('|');
        const groupCode = flagitem[0];
        const seq = flagitem[1];
        const type = parseInt(flagitem[2]);

        return this.context.session.getGroupService().operateSysNotify(
            false,
            {
                operateType: operateType,
                targetMsg: {
                    seq: seq,  // 通知序列号
                    type: type,
                    groupCode: groupCode,
                    postscript: reason ?? ' ', // 仅传空值可能导致处理失败，故默认给个空格
                },
            });
    }

    async quitGroup(groupQQ: string) {
        return this.context.session.getGroupService().quitGroup(groupQQ);
    }

    async kickMember(groupQQ: string, kickUids: string[], refuseForever: boolean = false, kickReason: string = '') {
        return this.context.session.getGroupService().kickMember(groupQQ, kickUids, refuseForever, kickReason);
    }

    async banMember(groupQQ: string, memList: Array<{ uid: string, timeStamp: number }>) {
        // timeStamp为秒数, 0为解除禁言
        return this.context.session.getGroupService().setMemberShutUp(groupQQ, memList);
    }

    async banGroup(groupQQ: string, shutUp: boolean) {
        return this.context.session.getGroupService().setGroupShutUp(groupQQ, shutUp);
    }

    async setMemberCard(groupQQ: string, memberUid: string, cardName: string) {
        return this.context.session.getGroupService().modifyMemberCardName(groupQQ, memberUid, cardName);
    }

    async setMemberRole(groupQQ: string, memberUid: string, role: NTGroupMemberRole) {
        return this.context.session.getGroupService().modifyMemberRole(groupQQ, memberUid, role);
    }

    async setGroupName(groupQQ: string, groupName: string) {
        return this.context.session.getGroupService().modifyGroupName(groupQQ, groupName, false);
    }

    async publishGroupBulletin(groupQQ: string, content: string, picInfo: {
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
        return this.context.session.getGroupService().publishGroupBulletin(groupQQ, psKey!, data);
    }

    async getGroupRemainAtTimes(GroupCode: string) {
        return this.context.session.getGroupService().getGroupRemainAtTimes(GroupCode);
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
