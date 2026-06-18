import { DataSource, Group, GroupDetailInfo, GroupListUpdateType, GroupMember, GroupNotify, ShutUpGroupMember } from '@/napcat-core/types';

export class NodeIKernelGroupListener {
  onGroupListInited (_listEmpty: boolean): any { }
  // 发现于Win 9.9.9 23159
  onGroupMemberLevelInfoChange (..._args: unknown[]): any {

  }

  onGetGroupBulletinListResult (..._args: unknown[]): any {
  }

  onGroupAllInfoChange (..._args: unknown[]): any {
  }

  onGroupBulletinChange (..._args: unknown[]): any {
  }

  onGroupBulletinRemindNotify (..._args: unknown[]): any {
  }

  onGroupArkInviteStateResult (..._args: unknown[]): any {
  }

  onGroupBulletinRichMediaDownloadComplete (..._args: unknown[]): any {
  }

  onGroupConfMemberChange (..._args: unknown[]): any {
  }

  onGroupDetailInfoChange (_detailInfo: GroupDetailInfo): any {
  }

  onGroupExtListUpdate (..._args: unknown[]): any {
  }

  onGroupFirstBulletinNotify (..._args: unknown[]): any {
  }

  onGroupListUpdate (_updateType: GroupListUpdateType, _groupList: Group[]): any {
  }

  onGroupNotifiesUpdated (_dboubt: boolean, _notifies: GroupNotify[]): any {
  }

  onGroupBulletinRichMediaProgressUpdate (..._args: unknown[]): any {
  }

  onGroupNotifiesUnreadCountUpdated (..._args: unknown[]): any {
  }

  onGroupSingleScreenNotifies (_doubt: boolean, _seq: string, _notifies: GroupNotify[]): any {
  }

  onGroupsMsgMaskResult (..._args: unknown[]): any {
  }

  onGroupStatisticInfoChange (..._args: unknown[]): any {
  }

  onJoinGroupNotify (..._args: unknown[]): any {
  }

  onJoinGroupNoVerifyFlag (..._args: unknown[]): any {
  }

  onMemberInfoChange (_groupCode: string, _dateSource: DataSource, _members: Map<string, GroupMember>): any {
  }

  onMemberListChange (_arg: {
    sceneId: string,
    ids: string[],
    infos: Map<string, GroupMember>, // uid -> GroupMember
    hasPrev: boolean,
    hasNext: boolean,
    hasRobot: boolean;
  }): any {
  }

  onSearchMemberChange (..._args: unknown[]): any {
  }

  onShutUpMemberListChanged (_groupCode: string, _members: Array<ShutUpGroupMember>): any {
  }
}
