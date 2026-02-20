import { NodeIKernelRobotListener } from '@/napcat-core/listeners';
import { GeneralCallResult, Peer } from '..';

export interface NodeIKernelRobotService {
  addKernelRobotListener (listener: NodeIKernelRobotListener): number;

  removeKernelRobotListener (listenerId: number): void;

  fetchGroupRobotStoreDiscovery (arg: unknown): unknown;

  fetchGroupRobotStoreCategoryList (arg: unknown): unknown;

  FetchSubscribeMsgTemplate (arg: unknown): unknown;

  FetchSubcribeMsgTemplateStatus (arg: unknown): unknown;

  SubscribeMsgTemplateSet (arg1: unknown, arg2: unknown): unknown;

  fetchRecentUsedRobots (arg: unknown): unknown;

  fetchShareArkInfo (arg: unknown): unknown;

  getAllRobotFriendsFromCache (): Promise<unknown>;

  fetchAllRobots (arg1: boolean, arg2: unknown): unknown;

  removeAllRecommendCache (): unknown;

  setRobotPickTts (arg1: unknown, arg2: unknown): unknown;

  getRobotUinRange (data: unknown): Promise<{ response: { robotUinRanges: Array<unknown>; }; }>;

  getRobotFunctions (peer: Peer, params: {
    uins: Array<string>,
    num: 0,
    client_info: { platform: 4, version: '', build_num: 9999; },
    tinyids: [],
    page: 0,
    full_fetch: false,
    scene: 4,
    filter: 1,
    bkn: '';
  }): Promise<GeneralCallResult & { response: { bot_features: Array<unknown>, next_page: number; }; }>;

  fetchRobotShareLimit (arg1: unknown, arg2: unknown): unknown;

  updateGroupRobotProfile (arg1: unknown, arg2: unknown): unknown;

  sendCommonRobotToGuild (arg1: unknown, arg2: unknown): unknown;

  sendGroupRobotStoreSearch (arg: unknown): unknown;

  fetchMyRobotLists (arg: unknown): unknown;

  batchGetBotsMenu (arg: unknown): unknown;

  fetchAddRobotGroupList (arg: unknown): unknown;

  getGuildRobotList (arg: unknown): unknown;

  querySessionList (arg: unknown): unknown;

  fetchListRobot (arg: unknown): unknown;

  subscribeGuildGlobalRobot (arg: unknown): unknown;

  addGuildRobot (arg: unknown): unknown;

  upMicGuildRobot (arg: unknown): unknown;

  downMicGuildRobot (arg: unknown): unknown;

  getRedDot (arg: unknown): unknown;

  delRedDot (arg: unknown): unknown;

  changeMyBot (arg: unknown): unknown;

  getAudioLiveRobotStatus (arg: unknown): unknown;

  backFlowRobotCoreInfos (arg: unknown): unknown;

  batchFetchRobotCoreInfos (arg: unknown): unknown;

  queryPicRecomQuestions (arg: unknown): unknown;

  delSessionMsgs (arg: unknown): unknown;

  fetchMobileRobotRecommendCards (arg: unknown): unknown;

  saveSelectedAIModelOrOptIds (arg: unknown): unknown;

  setRobotStoryEnter (arg: unknown): unknown;

  aiGenAvatar (arg: unknown): unknown;

  fetchRobotFeatureWithReq (arg: unknown): unknown;

  fetchGroupRobotProfileWithReq (arg: unknown): unknown;

  setAddRobotToGroup (arg: unknown): unknown;

  setRemoveRobotFromGroup (arg: unknown): unknown;

  FetchGroupRobotInfo (arg: unknown): unknown;

  fetchGuildRobotInfo (arg: unknown): unknown;

  aiGenBotInfo (arg: unknown): unknown;

  fetchAiGenTemplateInfo (arg: unknown): unknown;

  fetchShareInfo (arg: unknown): unknown;

  updateShareInfo (arg: unknown): unknown;

  queryGuildGlobalRobotSubscription (arg: unknown): unknown;

  resetConversation (arg: unknown): unknown;

  setGuildRobotPermission (arg: unknown): unknown;

  fetchGuildRobotPermission (arg: unknown): unknown;

  editSession (arg: unknown): unknown;

  isNull (): boolean;
}
