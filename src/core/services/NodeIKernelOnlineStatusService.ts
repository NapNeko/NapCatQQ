export interface NodeIKernelOnlineStatusService {

  addKernelOnlineStatusListener(listener: unknown): void;

  removeKernelOnlineStatusListener(listenerId: unknown): void;

  getShouldShowAIOStatusAnimation(arg: unknown): unknown;

  setReadLikeList(arg: unknown): unknown;

  getLikeList(arg: unknown): unknown;

  setLikeStatus(arg: unknown): unknown;

  getAggregationPageEntrance(): unknown;

  didClickAggregationPageEntrance(): unknown;

  getAggregationGroupModels(): unknown;

  // {
  //   "businessType": 1,
  //   "uins": [
  //     "1627126029",
  //     "66600000",
  //     "71702575"
  //   ]
  // }

  checkLikeStatus(param: {
    businessType: number,
    uins: string[]
  }): Promise<any>;

  isNull(): boolean;
}
