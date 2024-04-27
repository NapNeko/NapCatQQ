import { NodeIKernelRobotListener } from "@/core/listeners";
export interface NodeIKernelRobotService {
    fetchGroupRobotStoreDiscovery(arg: unknown): unknown;
    sendGroupRobotStoreSearch(arg: unknown): unknown;
    fetchGroupRobotStoreCategoryList(arg: unknown): unknown;
    FetchSubscribeMsgTemplate(arg: unknown): unknown;
    FetchSubcribeMsgTemplateStatus(arg: unknown): unknown;
    SubscribeMsgTemplateSet(arg1: unknown, arg2: unknown): unknown;
    fetchRecentUsedRobots(arg: unknown): unknown;
    fetchShareArkInfo(arg: unknown): unknown;
    addKernelRobotListener(Listener: NodeIKernelRobotListener): number;
    removeKernelRobotListener(ListenerId: number): unknown;
    getAllRobotFriendsFromCache(): unknown;
    fetchAllRobots(arg1: unknown, arg2: unknown): unknown;
    removeAllRecommendCache(): unknown;
    setRobotPickTts(arg1: unknown, arg2: unknown): unknown;
    isNull(): boolean;
}
