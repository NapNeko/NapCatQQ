export interface NodeIKernelFeedService {
  addKernelFeedListener (listener: unknown): number;

  removeKernelFeedListener (listenerId: number): void;

  getChannelDraft (arg1: string, arg2: number): unknown;

  getFeedCount (arg: unknown): unknown;

  getFeedLikeUserList (arg1: unknown, arg2: number): unknown;

  getFeedRichMediaFilePath (arg1: number, arg2: string, arg3: string, arg4: number, arg5: boolean): unknown;

  getJoinedRecommendItems (arg1: unknown, arg2: boolean): unknown;

  setChannelDraft (arg1: string, arg2: string, arg3: number): unknown;

  isNull (): boolean;
}
