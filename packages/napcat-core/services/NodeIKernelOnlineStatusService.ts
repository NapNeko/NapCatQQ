export interface NodeIKernelOnlineStatusService {

  addKernelOnlineStatusListener (listener: unknown): number;

  removeKernelOnlineStatusListener (listenerId: number): void;

  getShouldShowAIOStatusAnimation (arg: unknown): unknown;

  setReadLikeList (arg: unknown): unknown;

  getLikeList (arg: unknown): Promise<unknown>;

  setLikeStatus (arg: unknown): Promise<unknown>;

  setOnlineStatusLiteBusinessSwitch (enabled: boolean): void;

  getAggregationPageEntrance (): unknown;

  didClickAggregationPageEntrance (): unknown;

  getAggregationGroupModels (): unknown;

  checkLikeStatus (param: {
    businessType: number,
    uins: string[];
  }): Promise<unknown>;

  isNull (): boolean;
}
