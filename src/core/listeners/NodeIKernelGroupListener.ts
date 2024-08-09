import { Group, GroupListUpdateType, GroupMember, GroupNotify } from '@/core/entities';

interface IGroupListener {
  onGroupListUpdate(updateType: GroupListUpdateType, groupList: Group[]): void;

  onGroupExtListUpdate(...args: unknown[]): void;

  onGroupSingleScreenNotifies(doubt: boolean, seq: string, notifies: GroupNotify[]): void;

  onGroupNotifiesUpdated(dboubt: boolean, notifies: GroupNotify[]): void;

  onGroupNotifiesUnreadCountUpdated(...args: unknown[]): void;

  onGroupDetailInfoChange(...args: unknown[]): void;

  onGroupAllInfoChange(...args: unknown[]): void;

  onGroupsMsgMaskResult(...args: unknown[]): void;

  onGroupConfMemberChange(...args: unknown[]): void;

  onGroupBulletinChange(...args: unknown[]): void;

  onGetGroupBulletinListResult(...args: unknown[]): void;

  onMemberListChange(arg: {
    sceneId: string,
    ids: string[],
    infos: Map<string, GroupMember>,
    finish: boolean,
    hasRobot: boolean
  }): void;

  onMemberInfoChange(groupCode: string, changeType: number, members: Map<string, GroupMember>): void;

  onSearchMemberChange(...args: unknown[]): void;

  onGroupBulletinRichMediaDownloadComplete(...args: unknown[]): void;

  onGroupBulletinRichMediaProgressUpdate(...args: unknown[]): void;

  onGroupStatisticInfoChange(...args: unknown[]): void;

  onJoinGroupNotify(...args: unknown[]): void;

  onShutUpMemberListChanged(...args: unknown[]): void;

  onGroupBulletinRemindNotify(...args: unknown[]): void;

  onGroupFirstBulletinNotify(...args: unknown[]): void;

  onJoinGroupNoVerifyFlag(...args: unknown[]): void;

  onGroupArkInviteStateResult(...args: unknown[]): void;
  // 发现于Win 9.9.9 23159
  onGroupMemberLevelInfoChange(...args: unknown[]): void;
}

export interface NodeIKernelGroupListener extends IGroupListener {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new(listener: IGroupListener): NodeIKernelGroupListener;
}

export class GroupListener implements IGroupListener {
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

    onMemberInfoChange(groupCode: string, changeType: number, members: Map<string, GroupMember>) {
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
}

export class DebugGroupListener implements IGroupListener {
    onGroupMemberLevelInfoChange(...args: unknown[]): void {
        console.log('onGroupMemberLevelInfoChange:', ...args);
    }
    onGetGroupBulletinListResult(...args: unknown[]) {
        console.log('onGetGroupBulletinListResult:', ...args);
    }

    onGroupAllInfoChange(...args: unknown[]) {
        console.log('onGroupAllInfoChange:', ...args);
    }

    onGroupBulletinChange(...args: unknown[]) {
        console.log('onGroupBulletinChange:', ...args);
    }

    onGroupBulletinRemindNotify(...args: unknown[]) {
        console.log('onGroupBulletinRemindNotify:', ...args);
    }

    onGroupArkInviteStateResult(...args: unknown[]) {
        console.log('onGroupArkInviteStateResult:', ...args);
    }

    onGroupBulletinRichMediaDownloadComplete(...args: unknown[]) {
        console.log('onGroupBulletinRichMediaDownloadComplete:', ...args);
    }

    onGroupConfMemberChange(...args: unknown[]) {
        console.log('onGroupConfMemberChange:', ...args);
    }

    onGroupDetailInfoChange(...args: unknown[]) {
        console.log('onGroupDetailInfoChange:', ...args);
    }

    onGroupExtListUpdate(...args: unknown[]) {
        console.log('onGroupExtListUpdate:', ...args);
    }

    onGroupFirstBulletinNotify(...args: unknown[]) {
        console.log('onGroupFirstBulletinNotify:', ...args);
    }

    onGroupListUpdate(...args: unknown[]) {
        console.log('onGroupListUpdate:', ...args);
    }

    onGroupNotifiesUpdated(...args: unknown[]) {
        console.log('onGroupNotifiesUpdated:', ...args);
    }

    onGroupBulletinRichMediaProgressUpdate(...args: unknown[]) {
        console.log('onGroupBulletinRichMediaProgressUpdate:', ...args);
    }

    onGroupNotifiesUnreadCountUpdated(...args: unknown[]) {
        console.log('onGroupNotifiesUnreadCountUpdated:', ...args);
    }

    onGroupSingleScreenNotifies(doubt: boolean, seq: string, notifies: GroupNotify[]) {
        console.log('onGroupSingleScreenNotifies:');
    }

    onGroupsMsgMaskResult(...args: unknown[]) {
        console.log('onGroupsMsgMaskResult:', ...args);
    }

    onGroupStatisticInfoChange(...args: unknown[]) {
        console.log('onGroupStatisticInfoChange:', ...args);
    }

    onJoinGroupNotify(...args: unknown[]) {
        console.log('onJoinGroupNotify:', ...args);
    }

    onJoinGroupNoVerifyFlag(...args: unknown[]) {
        console.log('onJoinGroupNoVerifyFlag:', ...args);
    }

    onMemberInfoChange(groupCode: string, changeType: number, members: Map<string, GroupMember>) {
        console.log('onMemberInfoChange:', groupCode, changeType, members);
    }

    onMemberListChange(...args: unknown[]) {
        console.log('onMemberListChange:', ...args);
    }

    onSearchMemberChange(...args: unknown[]) {
        console.log('onSearchMemberChange:', ...args);
    }

    onShutUpMemberListChanged(...args: unknown[]) {
        console.log('onShutUpMemberListChanged:', ...args);
    }
}
