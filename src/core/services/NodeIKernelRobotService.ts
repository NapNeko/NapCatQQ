import { NodeIKernelRobotListener } from '@/core/listeners';
import { GeneralCallResult, Peer } from '..';

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

    getAllRobotFriendsFromCache(): Promise<unknown>;

    fetchAllRobots(arg1: unknown, arg2: unknown): unknown;

    removeAllRecommendCache(): unknown;

    setRobotPickTts(arg1: unknown, arg2: unknown): unknown;

    getRobotUinRange(data: unknown): Promise<{ response: { robotUinRanges: Array<unknown> } }>;

    getRobotFunctions(peer: Peer, params: {
        uins: Array<string>,
        num: 0,
        client_info: { platform: 4, version: '', build_num: 9999 },
        tinyids: [],
        page: 0,
        full_fetch: false,
        scene: 4,
        filter: 1,
        bkn: ''
    }): Promise<GeneralCallResult & { response: { bot_features: Array<unknown>, next_page: number } }>;

    isNull(): boolean;
}
