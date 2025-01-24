import { BuddyProfileLikeReq, GeneralCallResult, NTVoteInfo } from '@/core';

export interface NodeIKernelProfileLikeService {
    addKernelProfileLikeListener(listener: unknown): number;

    removeKernelProfileLikeListener(listenerId: unknown): void;

    setBuddyProfileLike(...args: unknown[]): { result: number, errMsg: string, succCounts: number };

    getBuddyProfileLike(req: BuddyProfileLikeReq): Promise<GeneralCallResult & {
        info: {
            userLikeInfos: Array<{
                voteInfo: {
                    total_count: number,
                    new_count: number,
                    new_nearby_count: number,
                    last_visit_time: number,
                    userInfos: Array<NTVoteInfo>
                }

            }>,
            friendMaxVotes: number,
            start: number
        }
    }>;

    getProfileLikeScidResourceInfo(...args: unknown[]): void;

    isNull(): boolean;
}
