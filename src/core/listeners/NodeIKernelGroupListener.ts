import { DataSource, Group, GroupDetailInfo, GroupListUpdateType, GroupMember, GroupNotify, ShutUpGroupMember } from '@/core/types';

export class NodeIKernelGroupListener {
    onGroupListInited(listEmpty: boolean): any { }
    // 发现于Win 9.9.9 23159
    onGroupMemberLevelInfoChange(...args: unknown[]): any {

    }

    onGetGroupBulletinListResult(...args: unknown[]): any {
    }

    onGroupAllInfoChange(...args: unknown[]): any {
    }

    onGroupBulletinChange(...args: unknown[]): any {
    }

    onGroupBulletinRemindNotify(...args: unknown[]): any {
    }

    onGroupArkInviteStateResult(...args: unknown[]): any {
    }

    onGroupBulletinRichMediaDownloadComplete(...args: unknown[]): any {
    }

    onGroupConfMemberChange(...args: unknown[]): any {
    }

    onGroupDetailInfoChange(detailInfo: GroupDetailInfo): any {
    }

    onGroupExtListUpdate(...args: unknown[]): any {
    }

    onGroupFirstBulletinNotify(...args: unknown[]): any {
    }

    onGroupListUpdate(updateType: GroupListUpdateType, groupList: Group[]): any {
    }

    onGroupNotifiesUpdated(dboubt: boolean, notifies: GroupNotify[]): any {
    }

    onGroupBulletinRichMediaProgressUpdate(...args: unknown[]): any {
    }

    onGroupNotifiesUnreadCountUpdated(...args: unknown[]): any {
    }

    onGroupSingleScreenNotifies(doubt: boolean, seq: string, notifies: GroupNotify[]): any {
    }

    onGroupsMsgMaskResult(...args: unknown[]): any {
    }

    onGroupStatisticInfoChange(...args: unknown[]): any {
    }

    onJoinGroupNotify(...args: unknown[]): any {
    }

    onJoinGroupNoVerifyFlag(...args: unknown[]): any {
    }

    onMemberInfoChange(groupCode: string, dateSource: DataSource, members: Map<string, GroupMember>): any {
    }

    onMemberListChange(arg: {
        sceneId: string,
        ids: string[],
        infos: Map<string, GroupMember>, // uid -> GroupMember
        hasPrev: boolean,
        hasNext: boolean,
        hasRobot: boolean
    }): any {
    }

    onSearchMemberChange(...args: unknown[]): any {
    }

    onShutUpMemberListChanged(groupCode: string, members: Array<ShutUpGroupMember>): any {
    }
}