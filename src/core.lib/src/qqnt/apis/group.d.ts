import { GroupMember, GroupRequestOperateTypes, GroupMemberRole, GroupNotify, Group } from '../entities';
export declare class NTQQGroupApi {
    static getGroups(forced?: boolean): Promise<Group[]>;
    static getGroupMembers(groupQQ: string, num?: number): Promise<void | GroupMember[]>;
    static getGroupNotifies(): Promise<void>;
    static getGroupIgnoreNotifies(): Promise<void>;
    static handleGroupRequest(notify: GroupNotify, operateType: GroupRequestOperateTypes, reason?: string): Promise<void | undefined>;
    static quitGroup(groupQQ: string): Promise<void | undefined>;
    static kickMember(groupQQ: string, kickUids: string[], refuseForever?: boolean, kickReason?: string): Promise<void | undefined>;
    static banMember(groupQQ: string, memList: Array<{
        uid: string;
        timeStamp: number;
    }>): Promise<void | undefined>;
    static banGroup(groupQQ: string, shutUp: boolean): Promise<void | undefined>;
    static setMemberCard(groupQQ: string, memberUid: string, cardName: string): Promise<void | undefined>;
    static setMemberRole(groupQQ: string, memberUid: string, role: GroupMemberRole): Promise<void | undefined>;
    static setGroupName(groupQQ: string, groupName: string): Promise<void | undefined>;
    static setGroupTitle(groupQQ: string, uid: string, title: string): Promise<void>;
    static publishGroupBulletin(groupQQ: string, title: string, content: string): void;
}
