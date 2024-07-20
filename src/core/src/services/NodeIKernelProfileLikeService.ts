import { BuddyProfileLikeReq } from "../entities/user";
import { GeneralCallResult } from "./common";

export interface NodeIKernelProfileLikeService {
  addKernelProfileLikeListener(listener: NodeIKernelProfileLikeService): void;

  removeKernelProfileLikeListener(listener: unknown): void;

  setBuddyProfileLike(...args: unknown[]): { result: number, errMsg: string, succCounts: number };

  getBuddyProfileLike(req: BuddyProfileLikeReq): Promise<GeneralCallResult & {
    "info": {
      "userLikeInfos": Array<any>,
      "friendMaxVotes": number,
      "start": number
    }
  }>;

  getProfileLikeScidResourceInfo(...args: unknown[]): void;

  isNull(): boolean;
}
