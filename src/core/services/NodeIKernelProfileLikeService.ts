import { BuddyProfileLikeReq, GeneralCallResult, NTVoteInfo } from '@/core';

export interface NodeIKernelProfileLikeService {
    addKernelProfileLikeListener(listener: unknown): number;

    removeKernelProfileLikeListener(listenerId: unknown): void;

    setBuddyProfileLike(...args: unknown[]): { result: number, errMsg: string, succCounts: number };

    getBuddyProfileLike(req: BuddyProfileLikeReq): Promise<GeneralCallResult & {
        info: {
            userLikeInfos: Array<{
                uid: string,
                time: string,
                favoriteInfo: {
                    userInfos: Array<NTVoteInfo>,//哪些人点我
                    total_count: number,
                    last_time: number,
                    today_count: number
                },
                voteInfo: {
                    total_count: number,
                    new_count: number,
                    new_nearby_count: number,
                    last_visit_time: number,
                    userInfos: Array<NTVoteInfo>,//点过哪些人
                }
            }>,
            friendMaxVotes: number,
            start: number
        }
    }>;

    getProfileLikeScidResourceInfo(...args: unknown[]): void;

    isNull(): boolean;
}
