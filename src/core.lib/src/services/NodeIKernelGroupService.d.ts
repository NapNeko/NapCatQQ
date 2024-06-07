import { NodeIKernelGroupListener } from '@/core/listeners/NodeIKernelGroupListener';
import { GroupExtParam, GroupMember, GroupMemberRole, GroupNotifyTypes, GroupRequestOperateTypes } from '@/core/entities';
import { GeneralCallResult } from '@/core/services/common';
export interface NodeIKernelGroupService {
    addKernelGroupListener(listener: NodeIKernelGroupListener): number;
    removeKernelGroupListener(listenerId: unknown): void;
    createMemberListScene(groupCode: string, scene: string): string;
    destroyMemberListScene(): void;
    getNextMemberList(sceneId: string, a: undefined, num: number): Promise<{
        errCode: number;
        errMsg: string;
        result: {
            ids: string[];
            infos: Map<string, GroupMember>;
            finish: boolean;
            hasRobot: boolean;
        };
    }>;
    getPrevMemberList(): unknown;
    monitorMemberList(): unknown;
    searchMember(uid: string): unknown;
    getMemberInfo(uid: string): unknown;
    kickMember(groupCode: string, memberUids: string[], refuseForever: boolean, kickReason: string): Promise<void>;
    modifyMemberRole(groupCode: string, uid: string, role: GroupMemberRole): void;
    modifyMemberCardName(groupCode: string, uid: string, cardName: string): void;
    getTransferableMemberInfo(uid: string): unknown;
    transferGroup(uid: string): void;
    getGroupList(force: boolean): Promise<GeneralCallResult>;
    getGroupExtList(force: boolean): Promise<GeneralCallResult>;
    getGroupDetailInfo(groupCode: string): unknown;
    getMemberExtInfo(arg: GroupExtParam): Promise<unknown>;
    getGroupAllInfo(): unknown;
    getDiscussExistInfo(): unknown;
    getGroupConfMember(): unknown;
    getGroupMsgMask(): unknown;
    getGroupPortrait(): void;
    modifyGroupName(groupCode: string, groupName: string, arg: false): void;
    modifyGroupRemark(groupCode: string, remark: string): void;
    modifyGroupDetailInfo(groupCode: string, arg: unknown): void;
    setGroupMsgMask(groupCode: string, arg: unknown): void;
    changeGroupShieldSettingTemp(groupCode: string, arg: unknown): void;
    inviteToGroup(arg: unknown): void;
    inviteMembersToGroup(args: unknown[]): void;
    inviteMembersToGroupWithMsg(args: unknown): void;
    createGroup(arg: unknown): void;
    createGroupWithMembers(arg: unknown): void;
    quitGroup(groupCode: string): void;
    destroyGroup(groupCode: string): void;
    getSingleScreenNotifies(arg1: boolean, arg2: string, arg3: number): Promise<GeneralCallResult>;
    clearGroupNotifies(groupCode: string): void;
    getGroupNotifiesUnreadCount(unknown: Boolean): Promise<GeneralCallResult>;
    clearGroupNotifiesUnreadCount(groupCode: string): void;
    operateSysNotify(doubt: boolean, operateMsg: {
        operateType: GroupRequestOperateTypes;
        targetMsg: {
            seq: string;
            type: GroupNotifyTypes;
            groupCode: string;
            postscript: string;
        };
    }): Promise<void>;
    setTop(groupCode: string, isTop: boolean): void;
    getGroupBulletin(groupCode: string): unknown;
    deleteGroupBulletin(groupCode: string, seq: string): void;
    publishGroupBulletin(groupCode: string, pskey: string, data: any): Promise<GeneralCallResult>;
    publishInstructionForNewcomers(groupCode: string, arg: unknown): void;
    uploadGroupBulletinPic(groupCode: string, pskey: string, imagePath: string): Promise<GeneralCallResult & {
        errCode: number;
        picInfo?: {
            id: string;
            width: number;
            height: number;
        };
    }>;
    downloadGroupBulletinRichMedia(groupCode: string): unknown;
    getGroupBulletinList(groupCode: string): unknown;
    getGroupStatisticInfo(groupCode: string): unknown;
    getGroupRemainAtTimes(groupCode: string): number;
    getJoinGroupNoVerifyFlag(groupCode: string): unknown;
    getGroupArkInviteState(groupCode: string): unknown;
    reqToJoinGroup(groupCode: string, arg: unknown): void;
    setGroupShutUp(groupCode: string, shutUp: boolean): void;
    getGroupShutUpMemberList(groupCode: string): unknown[];
    setMemberShutUp(groupCode: string, memberTimes: {
        uid: string;
        timeStamp: number;
    }[]): Promise<void>;
    getGroupRecommendContactArkJson(groupCode: string): unknown;
    getJoinGroupLink(groupCode: string): unknown;
    modifyGroupExtInfo(groupCode: string, arg: unknown): void;
    isNull(): boolean;
}
