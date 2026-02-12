export interface NodeIKernelAvatarService {
  addAvatarListener(listener: unknown): void;

  removeAvatarListener(listenerId: number): void;

  getAvatarPath(arg1: unknown, arg2: unknown): unknown;

  forceDownloadAvatar(uid: string, useCache: number): Promise<unknown>;

  getGroupAvatarPath(arg1: unknown, arg2: unknown): unknown;

  getConfGroupAvatarPath(arg: unknown): unknown;

  forceDownloadGroupAvatar(arg1: unknown, arg2: unknown): unknown;

  getGroupPortraitPath(arg1: string, arg2: number, arg3: number): unknown;

  forceDownloadGroupPortrait(arg1: string, arg2: number, arg3: number): unknown;

  getAvatarPaths(arg1: Array<unknown>[], arg2: number): unknown;

  getGroupAvatarPaths(arg1: Array<unknown>[], arg2: string): unknown;

  getConfGroupAvatarPaths(arg: unknown): unknown;

  getAvatarPathByUin(arg1: unknown, arg2: unknown): unknown;

  forceDownloadAvatarByUin(arg1: unknown, arg2: unknown): unknown;

  isNull(): boolean;
}
