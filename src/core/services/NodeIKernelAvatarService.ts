export interface NodeIKernelAvatarService {
    addAvatarListener(listener: unknown): void;

    removeAvatarListener(listenerId: number): void;

    getAvatarPath(arg1: unknown, arg2: unknown): unknown;

    forceDownloadAvatar(uid: string, useCache: number): Promise<unknown>;

    getGroupAvatarPath(arg1: unknown, arg2: unknown): unknown;

    getConfGroupAvatarPath(arg: unknown): unknown;

    forceDownloadGroupAvatar(arg1: unknown, arg2: unknown): unknown;

    getGroupPortraitPath(arg1: unknown, arg2: unknown, arg3: unknown): unknown;

    forceDownloadGroupPortrait(arg1: unknown, arg2: unknown, arg3: unknown): unknown;

    getAvatarPaths(arg1: unknown, arg2: unknown): unknown;

    getGroupAvatarPaths(arg1: unknown, arg2: unknown): unknown;

    getConfGroupAvatarPaths(arg: unknown): unknown;

    getAvatarPathByUin(arg1: unknown, arg2: unknown): unknown;

    forceDownloadAvatarByUin(arg1: unknown, arg2: unknown): unknown;

    isNull(): boolean;
}
