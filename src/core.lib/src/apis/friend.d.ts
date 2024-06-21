import { BuddyCategoryType, User } from '@/core/entities';
export declare class NTQQFriendApi {
    static isBuddy(uid: string): Promise<boolean>;
    static getFriends(forced?: boolean): Promise<User[]>;
    static getFriendsRaw(forced?: boolean): Promise<BuddyCategoryType[]>;
    static handleFriendRequest(flag: string, accept: boolean): Promise<void>;
}
