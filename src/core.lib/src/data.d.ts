import { type Friend, type GroupMember, GroupNotify, type SelfInfo, BuddyCategoryType } from './entities';
export declare const selfInfo: SelfInfo;
export declare const groupMembers: Map<string, Map<string, GroupMember>>;
export declare const friends: Map<string, Friend>;
export declare const rawFriends: Array<BuddyCategoryType>;
export declare const groupNotifies: Record<string, GroupNotify>;
export declare function getGroupMember(groupQQ: string | number, memberUinOrUid: string | number): Promise<GroupMember | null | undefined>;
export declare const tempGroupCodeMap: Record<string, string>;
export declare const stat: {
    packet_received: number;
    packet_sent: number;
    message_received: number;
    message_sent: number;
    last_message_time: number;
    disconnect_times: number;
    lost_times: number;
    packet_lost: number;
};
