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
    checkLikeStatus(param: {
        businessType: number;
        uins: string[];
    }): Promise<any>;
    isNull(): boolean;
}
