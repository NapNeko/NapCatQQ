import { BuddyProfileLikeReq, GeneralCallResult } from '@/core';

export interface NodeIKernelProfileLikeService {
    addKernelProfileLikeListener(listener: unknown): number;

    removeKernelProfileLikeListener(listenerId: unknown): void;

    setBuddyProfileLike(...args: unknown[]): { result: number, errMsg: string, succCounts: number };

    getBuddyProfileLike(req: BuddyProfileLikeReq): Promise<GeneralCallResult & {
        info: {
            userLikeInfos: Array<any>,
            friendMaxVotes: number,
            start: number
        }
    }>;

    getProfileLikeScidResourceInfo(...args: unknown[]): void;

    isNull(): boolean;
}
