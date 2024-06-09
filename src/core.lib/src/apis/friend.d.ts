import { User } from '@/core/entities';
export declare class NTQQFriendApi {
    static getFriends(forced?: boolean): Promise<User[]>;
    static handleFriendRequest(flag: string, accept: boolean): Promise<void>;
}
