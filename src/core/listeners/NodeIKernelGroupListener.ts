import { DataSource, Group, GroupListUpdateType, GroupMember, GroupNotify } from '@/core/entities';

export class NodeIKernelGroupListener {
    // 发现于Win 9.9.9 23159
    onGroupMemberLevelInfoChange(...args: unknown[]): void {

    }

    onGetGroupBulletinListResult(...args: unknown[]) {
    }

    onGroupAllInfoChange(...args: unknown[]) {
    }

    onGroupBulletinChange(...args: unknown[]) {
    }

    onGroupBulletinRemindNotify(...args: unknown[]) {
    }

    onGroupArkInviteStateResult(...args: unknown[]) {
    }

    onGroupBulletinRichMediaDownloadComplete(...args: unknown[]) {
    }

    onGroupConfMemberChange(...args: unknown[]) {
    }

    onGroupDetailInfoChange(...args: unknown[]) {
    }

    onGroupExtListUpdate(...args: unknown[]) {
    }

    onGroupFirstBulletinNotify(...args: unknown[]) {
    }

    onGroupListUpdate(updateType: GroupListUpdateType, groupList: Group[]) {
    }

    onGroupNotifiesUpdated(dboubt: boolean, notifies: GroupNotify[]) {
    }

    onGroupBulletinRichMediaProgressUpdate(...args: unknown[]) {
    }

    onGroupNotifiesUnreadCountUpdated(...args: unknown[]) {
    }

    onGroupSingleScreenNotifies(doubt: boolean, seq: string, notifies: GroupNotify[]) {
    }

    onGroupsMsgMaskResult(...args: unknown[]) {
    }

    onGroupStatisticInfoChange(...args: unknown[]) {
    }

    onJoinGroupNotify(...args: unknown[]) {
    }

    onJoinGroupNoVerifyFlag(...args: unknown[]) {
    }

    onMemberInfoChange(groupCode: string, dateSource: DataSource, members: Map<string, GroupMember>) {
    }

    onMemberListChange(arg: {
        sceneId: string,
        ids: string[],
        infos: Map<string, GroupMember>, // uid -> GroupMember
        finish: boolean,
        hasRobot: boolean
    }) {
    }

    onSearchMemberChange(...args: unknown[]) {
    }

    onShutUpMemberListChanged(...args: unknown[]) {
    }

    onGroupListInited(...args: unknown[]) {
    }
}