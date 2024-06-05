import { type Friend, type FriendRequest, type Group, type GroupMember, GroupNotify, type SelfInfo, BuddyCategoryType } from './entities';
import { WebApiGroupMember } from '@/core/apis';
export declare const Credentials: {
    Skey: string;
    CreatTime: number;
    Cookies: Map<string, string>;
    ClientKey: string;
    KeyIndex: string;
    PskeyData: Map<string, string>;
    PskeyTime: Map<string, number>;
};
export declare const WebGroupData: {
    GroupData: Map<string, WebApiGroupMember[]>;
    GroupTime: Map<string, number>;
};
export declare const selfInfo: SelfInfo;
export declare const groups: Map<string, Group>;
export declare function deleteGroup(groupQQ: string): void;
export declare const groupMembers: Map<string, Map<string, GroupMember>>;
export declare const friends: Map<string, Friend>;
export declare const friendRequests: Record<string, FriendRequest>;
export declare const groupNotifies: Record<string, GroupNotify>;
export declare const napCatError: {
    ffmpegError: string;
    httpServerError: string;
    wsServerError: string;
    otherError: string;
};
export declare function getFriend(uinOrUid: string): Promise<Friend | undefined>;
export declare function getGroup(qq: string | number): Promise<Group | undefined>;
export declare function getGroupMember(groupQQ: string | number, memberUinOrUid: string | number): Promise<GroupMember | null | undefined>;
export declare const tempGroupCodeMap: Record<string, string>;
export declare const rawFriends: Array<BuddyCategoryType>;
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
