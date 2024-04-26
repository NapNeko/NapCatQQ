import { FriendRequest } from '@/core/entities';
export declare class NTQQFriendApi {
    static getFriends(forced?: boolean): Promise<void>;
    static handleFriendRequest(request: FriendRequest, accept: boolean): Promise<void>;
}
