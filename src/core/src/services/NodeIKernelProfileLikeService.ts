import { BuddyProfileLikeReq } from "../entities/user";

export interface NodeIKernelProfileLikeService {
  addKernelProfileLikeListener(listener: NodeIKernelProfileLikeService): void;

  removeKernelProfileLikeListener(listener: unknown): void;

  setBuddyProfileLike(...args: unknown[]): { result: number, errMsg: string, succCounts: number };

  getBuddyProfileLike(req: BuddyProfileLikeReq): void;

  getProfileLikeScidResourceInfo(...args: unknown[]): void;

  isNull(): boolean;
}
