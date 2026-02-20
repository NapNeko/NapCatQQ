import { BuddyProfileLikeReq, GeneralCallResult, NTVoteInfo } from '@/napcat-core/index';

export interface NodeIKernelProfileLikeService {
  addKernelProfileLikeListener (listener: unknown): number;

  removeKernelProfileLikeListener (listenerId: number): void;

  setBuddyProfileLike (arg: unknown): Promise<{ result: number, errMsg: string, succCounts: number; }>;

  getBuddyProfileLike (req: BuddyProfileLikeReq): Promise<GeneralCallResult & {
    info: {
      userLikeInfos: Array<{
        uid: string,
        time: string,
        favoriteInfo: {
          userInfos: Array<NTVoteInfo>,
          total_count: number,
          last_time: number,
          today_count: number;
        },
        voteInfo: {
          total_count: number,
          new_count: number,
          new_nearby_count: number,
          last_visit_time: number,
          userInfos: Array<NTVoteInfo>;
        };
      }>,
      friendMaxVotes: number,
      start: number;
    };
  }>;

  getProfileLikeScidResourceInfo (arg: unknown): void;

  isNull (): boolean;
}
