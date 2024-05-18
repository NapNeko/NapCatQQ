import { Group, GroupMember, GroupNotify } from '@/core/entities';
interface IGroupListener {
    onGroupListUpdate(updateType: number, groupList: Group[]): void;
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
        sceneId: string;
        ids: string[];
        infos: Map<string, GroupMember>;
        finish: boolean;
        hasRobot: boolean;
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
    onGroupMemberLevelInfoChange(...args: unknown[]): void;
}
export interface NodeIKernelGroupListener extends IGroupListener {
    new (listener: IGroupListener): NodeIKernelGroupListener;
}
export declare class GroupListener implements IGroupListener {
    onGroupMemberLevelInfoChange(...args: unknown[]): void;
    onGetGroupBulletinListResult(...args: unknown[]): void;
    onGroupAllInfoChange(...args: unknown[]): void;
    onGroupBulletinChange(...args: unknown[]): void;
    onGroupBulletinRemindNotify(...args: unknown[]): void;
    onGroupArkInviteStateResult(...args: unknown[]): void;
    onGroupBulletinRichMediaDownloadComplete(...args: unknown[]): void;
    onGroupConfMemberChange(...args: unknown[]): void;
    onGroupDetailInfoChange(...args: unknown[]): void;
    onGroupExtListUpdate(...args: unknown[]): void;
    onGroupFirstBulletinNotify(...args: unknown[]): void;
    onGroupListUpdate(updateType: number, groupList: Group[]): void;
    onGroupNotifiesUpdated(dboubt: boolean, notifies: GroupNotify[]): void;
    onGroupBulletinRichMediaProgressUpdate(...args: unknown[]): void;
    onGroupNotifiesUnreadCountUpdated(...args: unknown[]): void;
    onGroupSingleScreenNotifies(doubt: boolean, seq: string, notifies: GroupNotify[]): void;
    onGroupsMsgMaskResult(...args: unknown[]): void;
    onGroupStatisticInfoChange(...args: unknown[]): void;
    onJoinGroupNotify(...args: unknown[]): void;
    onJoinGroupNoVerifyFlag(...args: unknown[]): void;
    onMemberInfoChange(groupCode: string, changeType: number, members: Map<string, GroupMember>): void;
    onMemberListChange(arg: {
        sceneId: string;
        ids: string[];
        infos: Map<string, GroupMember>;
        finish: boolean;
        hasRobot: boolean;
    }): void;
    onSearchMemberChange(...args: unknown[]): void;
    onShutUpMemberListChanged(...args: unknown[]): void;
}
export declare class DebugGroupListener implements IGroupListener {
    onGroupMemberLevelInfoChange(...args: unknown[]): void;
    onGetGroupBulletinListResult(...args: unknown[]): void;
    onGroupAllInfoChange(...args: unknown[]): void;
    onGroupBulletinChange(...args: unknown[]): void;
    onGroupBulletinRemindNotify(...args: unknown[]): void;
    onGroupArkInviteStateResult(...args: unknown[]): void;
    onGroupBulletinRichMediaDownloadComplete(...args: unknown[]): void;
    onGroupConfMemberChange(...args: unknown[]): void;
    onGroupDetailInfoChange(...args: unknown[]): void;
    onGroupExtListUpdate(...args: unknown[]): void;
    onGroupFirstBulletinNotify(...args: unknown[]): void;
    onGroupListUpdate(...args: unknown[]): void;
    onGroupNotifiesUpdated(...args: unknown[]): void;
    onGroupBulletinRichMediaProgressUpdate(...args: unknown[]): void;
    onGroupNotifiesUnreadCountUpdated(...args: unknown[]): void;
    onGroupSingleScreenNotifies(doubt: boolean, seq: string, notifies: GroupNotify[]): void;
    onGroupsMsgMaskResult(...args: unknown[]): void;
    onGroupStatisticInfoChange(...args: unknown[]): void;
    onJoinGroupNotify(...args: unknown[]): void;
    onJoinGroupNoVerifyFlag(...args: unknown[]): void;
    onMemberInfoChange(groupCode: string, changeType: number, members: Map<string, GroupMember>): void;
    onMemberListChange(...args: unknown[]): void;
    onSearchMemberChange(...args: unknown[]): void;
    onShutUpMemberListChanged(...args: unknown[]): void;
}
export {};
