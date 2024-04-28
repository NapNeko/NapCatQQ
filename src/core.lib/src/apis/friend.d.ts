import { FriendRequest, User } from '@/core/entities';
export declare class NTQQFriendApi {
    static getFriends(forced?: boolean): Promise<User[]>;
    static handleFriendRequest(request: FriendRequest, accept: boolean): Promise<void>;
}
