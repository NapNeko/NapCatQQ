import { FriendRequest } from '../entities';

export declare class NTQQFriendApi {
    static getFriends(forced?: boolean): Promise<void>;
    static handleFriendRequest(request: FriendRequest, accept: boolean): Promise<void>;
}
