import {
    ChatType,
    GeneralCallResult,
    Group,
    GroupMember,
    GroupMemberRole,
    GroupRequestOperateTypes,
    InstanceContext,
    KickMemberV2Req,
    MemberExtSourceType,
    NapCatCore,
    NodeIKernelGroupService,
} from '@/core';
import { isNumeric, runAllWithTimeout, sleep } from '@/common/helper';

export class NTQQGroupApi {
    context: InstanceContext;
    core: NapCatCore;
    groupCache: Map<string, Group> = new Map<string, Group>();
    groupMemberCache: Map<string, Map<string, GroupMember>> = new Map<string, Map<string, GroupMember>>();
    groups: Group[] = [];

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
        this.initCache().then().catch(context.logger.logError);
    }

    async initCache() {
        this.groups = await this.getGroups();
        for (const group of this.groups) {
            this.groupCache.set(group.groupCode, group);
            //const data = await this.getGroupMembers(group.groupCode, 3000);
            //this.groupMemberCache.set(group.groupCode, data);
        }
        this.context.logger.logDebug(`加载${this.groups.length}个群组缓存完成`);
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
    async getGroupExtFE0Info(GroupCode: string[], forced = true) {
        return this.context.session.getGroupService().getGroupExt0xEF0Info(
            GroupCode,
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
                viewedMsgDisappearTime: 1
            },
            forced
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

    async getGroupMemberLatestSendTimeCache(GroupCode: string, uids: string[]) {
        return this.getGroupMemberLatestSendTime(GroupCode, uids);
    }

    /**
     * 通过QQ自带数据库获取群成员最后发言时间(仅返回有效数据 且消耗延迟大 需要进行缓存)
     * @param GroupCode 群号
     * @param uids QQ号
     * @returns Map<string, string> key: uin value: sendTime
     * @example
     * let ret = await NTQQGroupApi.getGroupMemberLastestSendTime('123456');
     * for (let [uin, sendTime] of ret) {
     *  console.log(uin, sendTime);
     * }
     */
    async getGroupMemberLatestSendTime(GroupCode: string, uids: string[]) {
        const getdata = async (uid: string) => {
            const NTRet = await this.getLatestMsgByUids(GroupCode, [uid]);
            if (NTRet.result != 0 && NTRet.msgList.length < 1) {
                return undefined;
            }
            return { sendUin: NTRet.msgList[0].senderUin, sendTime: NTRet.msgList[0].msgTime };
        };
        const PromiseData: Promise<({
            sendUin: string;
            sendTime: string;
        } | undefined)>[] = [];
        const ret: Map<string, string> = new Map();
        for (const uid of uids) {
            PromiseData.push(getdata(uid).catch(() => undefined));
        }
        const allRet = await runAllWithTimeout(PromiseData, 2500);
        for (const PromiseDo of allRet) {
            if (PromiseDo) {
                ret.set(PromiseDo.sendUin, PromiseDo.sendTime);
            }
        }
        return ret;
    }

    async getLatestMsgByUids(GroupCode: string, uids: string[]) {
        return await this.context.session.getMsgService().queryMsgsWithFilterEx('0', '0', '0', {
            chatInfo: {
                peerUid: GroupCode,
                chatType: ChatType.KCHATTYPEGROUP,
            },
            filterMsgType: [],
            filterSendersUid: uids,
            filterMsgToTime: '0',
            filterMsgFromTime: '0',
            isReverseOrder: false,
            isIncludeCurrent: true,
            pageLimit: 1,
        });
    }

    async getGroupMemberAll(GroupCode: string, forced = false) {
        return this.context.session.getGroupService().getAllMemberList(GroupCode, forced);
    }

    async getGroupMember(groupCode: string | number, memberUinOrUid: string | number) {
        const groupCodeStr = groupCode.toString();
        const memberUinOrUidStr = memberUinOrUid.toString();
        let members = this.groupMemberCache.get(groupCodeStr);
        if (!members) {
            try {
                members = await this.getGroupMembersV2(groupCodeStr);
                // 更新群成员列表
                this.groupMemberCache.set(groupCodeStr, members);
            } catch (e) {
                return null;
            }
        }

        // log('getGroupMember', members);
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
            members = await this.getGroupMembersV2(groupCodeStr);
            member = getMember();
        }
        return member;
    }

    async getLatestMsg(GroupCode: string, uins: string[]) {
        const uids: Array<string> = [];
        for (const uin of uins) {
            const uid = await this.core.apis.UserApi.getUidByUinV2(uin);
            if (uid) {
                uids.push(uid);
            }
        }
        return await this.context.session.getMsgService().queryMsgsWithFilterEx('0', '0', '0', {
            chatInfo: {
                peerUid: GroupCode,
                chatType: ChatType.KCHATTYPEGROUP,
            },
            filterMsgType: [],
            filterSendersUid: uids,
            filterMsgToTime: '0',
            filterMsgFromTime: '0',
            isReverseOrder: false,
            isIncludeCurrent: true,
            pageLimit: 1,
        });
    }

    async getGroupRecommendContactArkJson(GroupCode: string) {
        return this.context.session.getGroupService().getGroupRecommendContactArkJson(GroupCode);
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
        // 代码没测过
        // 需要 ob11msgid->msgId + (peer) -> msgSeq + msgRandom
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
        // GetMsgByShoretID(ShoretID); -> MsgService.getMsgs(Peer,MsgId,1,false); -> 组出参数
        return this.context.session.getGroupService().addGroupEssence(param);
    }

    async kickMemberV2Inner(param: KickMemberV2Req) {
        return this.context.session.getGroupService().kickMemberV2(param);
    }

    async deleteGroupBulletin(GroupCode: string, noticeId: string) {
        const _Pskey = (await this.core.apis.UserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com')!;
        return this.context.session.getGroupService().deleteGroupBulletin(GroupCode, _Pskey, noticeId);
    }

    async quitGroupV2(GroupCode: string, needDeleteLocalMsg: boolean) {
        const param = {
            groupCode: GroupCode,
            needDeleteLocalMsg: needDeleteLocalMsg,
        };
        //应该是直接返回不需要Listener的 未经测试 需测试再发布
        return this.context.session.getGroupService().quitGroupV2(param);
    }

    async removeGroupEssence(GroupCode: string, msgId: string) {
        // 代码没测过
        // 需要 ob11msgid->msgId + (peer) -> msgSeq + msgRandom
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
        // GetMsgByShoretID(ShoretID); -> MsgService.getMsgs(Peer,MsgId,1,false); -> 组出参数
        return this.context.session.getGroupService().removeGroupEssence(param);
    }

    async getSingleScreenNotifies(num: number) {
        const [, , , notifies] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelGroupService/getSingleScreenNotifies',
            'NodeIKernelGroupListener/onGroupSingleScreenNotifies',
            [
                false,
                '',
                num,
            ],
        );
        return notifies;
    }

    async getGroupMemberV2(GroupCode: string, uid: string, forced = false) {
        const Listener = this.core.eventWrapper.registerListen(
            'NodeIKernelGroupListener/onMemberInfoChange',
            1,
            forced ? 5000 : 250,
            (params) => params === GroupCode,
        );
        const retData = await (
            this.core.eventWrapper
                .createEventFunction('NodeIKernelGroupService/getMemberInfo')
        )!(GroupCode, [uid], forced);
        if (retData.result !== 0) {
            throw new Error(`${retData.errMsg}`);
        }
        const result = await Listener as unknown;
        let member: GroupMember | undefined;
        if (Array.isArray(result) && result?.[2] instanceof Map) {
            const members = result[2] as Map<string, GroupMember>;
            member = members.get(uid);
        }
        return member;
    }

    async getGroupMembersV2(groupQQ: string, num = 3000): Promise<Map<string, GroupMember>> {
        const groupService = this.context.session.getGroupService();
        const sceneId = groupService.createMemberListScene(groupQQ, 'groupMemberList_MainWindow');
        const listener = this.core.eventWrapper.registerListen(
            'NodeIKernelGroupListener/onMemberListChange',
            1,
            500,
            (params) => params.sceneId === sceneId,
        );
        try {
            const [membersFromFunc, membersFromListener] = await Promise.allSettled([
                groupService.getNextMemberList(sceneId, undefined, num),
                listener,
            ]);
            if (membersFromFunc.status === 'fulfilled' && membersFromListener.status === 'fulfilled') {
                return new Map([
                    ...membersFromFunc.value.result.infos, 
                    ...membersFromListener.value[0].infos
                ]);
            }
            if (membersFromFunc.status === 'fulfilled') {
                return membersFromFunc.value.result.infos;
            }
            if (membersFromListener.status === 'fulfilled') {
                return membersFromListener.value[0].infos;
            }
            throw new Error('获取群成员列表失败');
        } finally {
            groupService.destroyMemberListScene(sceneId);
        }
    }
    
    async getGroupMembers(groupQQ: string, num = 3000): Promise<Map<string, GroupMember>> {
        const groupService = this.context.session.getGroupService();
        const sceneId = groupService.createMemberListScene(groupQQ, 'groupMemberList_MainWindow');
        const result = await groupService.getNextMemberList(sceneId!, undefined, num);
        if (result.errCode !== 0) {
            throw new Error('获取群成员列表出错,' + result.errMsg);
        }

        this.context.logger.logDebug(`获取群(${groupQQ})成员列表结果:`, `members: ${result.result.infos.size}`); //, Array.from(result.result.infos.values()));
        return result.result.infos;
        /*
        console.log(sceneId);
        const result = await napCatCore.getGroupService().getNextMemberList(sceneId, num);
        console.log(result);
    
        return result;
        */
    }

    async getGroupNotifies() {
        // 获取管理员变更
        // 加群通知，退出通知，需要管理员权限

    }

    async GetGroupFileCount(Gids: Array<string>) {
        return this.context.session.getRichMediaService().batchGetGroupFileCount(Gids);
    }

    async getGroupIgnoreNotifies() {
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

    async handleGroupRequest(flag: string, operateType: GroupRequestOperateTypes, reason?: string) {
        const flagitem = flag.split('|');
        const groupCode = flagitem[0];
        const seq = flagitem[1];
        const type = parseInt(flagitem[2]);

        return this.context.session.getGroupService().operateSysNotify(
            false,
            {
                'operateType': operateType, // 2 拒绝
                'targetMsg': {
                    'seq': seq,  // 通知序列号
                    'type': type,
                    'groupCode': groupCode,
                    'postscript': reason ?? ' ', // 仅传空值可能导致处理失败，故默认给个空格
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

    async setMemberRole(groupQQ: string, memberUid: string, role: GroupMemberRole) {
        return this.context.session.getGroupService().modifyMemberRole(groupQQ, memberUid, role);
    }

    async setGroupName(groupQQ: string, groupName: string) {
        return this.context.session.getGroupService().modifyGroupName(groupQQ, groupName, false);
    }

    // 头衔不可用
    /*
    async setGroupTitle(groupQQ: string, uid: string, title: string) {

    }
     */

    async publishGroupBulletin(groupQQ: string, content: string, picInfo: {
        id: string,
        width: number,
        height: number
    } | undefined = undefined, pinned: number = 0, confirmRequired: number = 0) {
        const _Pskey = (await this.core.apis.UserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com');
        //text是content内容url编码
        const data = {
            text: encodeURI(content),
            picInfo: picInfo,
            oldFeedsId: '',
            pinned: pinned,
            confirmRequired: confirmRequired,
        };
        return this.context.session.getGroupService().publishGroupBulletin(groupQQ, _Pskey!, data);
    }

    async getGroupRemainAtTimes(GroupCode: string) {
        this.context.session.getGroupService().getGroupRemainAtTimes(GroupCode);
    }

    async getMemberExtInfo(groupCode: string, uin: string) {
        // 仅NTQQ 9.9.11 24568测试 容易炸开谨慎使用
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
