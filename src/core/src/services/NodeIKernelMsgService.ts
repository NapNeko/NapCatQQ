import { ChatType, ElementType, Peer, RawMessage, SendMessageElement } from '@/core/entities';
import { NodeIKernelMsgListener } from '@/core/listeners/NodeIKernelMsgListener';
import { GeneralCallResult } from '@/core/services/common';

export interface NodeIKernelMsgService {
  addKernelMsgListener(nodeIKernelMsgListener: NodeIKernelMsgListener): number;

  sendMsg(msgId: string, peer: Peer, msgElements: SendMessageElement[], map: Map<any, any>): Promise<unknown>;

  recallMsg(peer: Peer, msgIds: string[]): Promise<GeneralCallResult>;

  addKernelMsgImportToolListener(arg: Object): unknown;

  removeKernelMsgListener(args: unknown): unknown;

  addKernelTempChatSigListener(...args: unknown[]): unknown;

  removeKernelTempChatSigListener(...args: unknown[]): unknown;

  setAutoReplyTextList(AutoReplyText: Array<unknown>, i2: number): unknown;

  getAutoReplyTextList(...args: unknown[]): unknown;

  getOnLineDev(): Promise<any>;

  kickOffLine(DevInfo: Object): unknown;

  setStatus(args: { status: number, extStatus: number, batteryStatus: number }): Promise<GeneralCallResult>;

  fetchStatusMgrInfo(): unknown;

  fetchStatusUnitedConfigInfo(): unknown;

  getOnlineStatusSmallIconBasePath(): unknown;

  getOnlineStatusSmallIconFileNameByUrl(Url: string): unknown;

  downloadOnlineStatusSmallIconByUrl(arg0: number, arg1: string): unknown;

  getOnlineStatusBigIconBasePath(): unknown;

  downloadOnlineStatusBigIconByUrl(arg0: number, arg1: string): unknown;

  getOnlineStatusCommonPath(arg: string): unknown;

  getOnlineStatusCommonFileNameByUrl(Url: string): unknown;

  downloadOnlineStatusCommonByUrl(arg0: string, arg1: string): unknown;

  // this.tokenType = i2;
  // this.apnsToken = bArr;
  // this.voipToken = bArr2;
  // this.profileId = str;

  setToken(arg: Object): unknown;

  switchForeGround(): unknown;

  switchBackGround(arg: Object): unknown;

  //hex
  setTokenForMqq(token: string): unknown;

  switchForeGroundForMqq(...args: unknown[]): unknown;

  switchBackGroundForMqq(...args: unknown[]): unknown;

  getMsgSetting(...args: unknown[]): unknown;

  setMsgSetting(...args: unknown[]): unknown;

  addSendMsg(...args: unknown[]): unknown;

  cancelSendMsg(...args: unknown[]): unknown;

  switchToOfflineSendMsg(...args: unknown[]): unknown;

  reqToOfflineSendMsg(...args: unknown[]): unknown;

  refuseReceiveOnlineFileMsg(peer: Peer, MsgId: string): unknown;

  resendMsg(...args: unknown[]): unknown;

  recallMsg(...args: unknown[]): unknown;

  reeditRecallMsg(...args: unknown[]): unknown;

  forwardMsg(...args: unknown[]): Promise<GeneralCallResult>;

  forwardMsgWithComment(...args: unknown[]): unknown;

  forwardSubMsgWithComment(...args: unknown[]): unknown;

  forwardRichMsgInVist(...args: unknown[]): unknown;

  forwardFile(...args: unknown[]): unknown;
  //Array<Msg>, Peer from, Peer to
  multiForwardMsg(...args: unknown[]): unknown;

  multiForwardMsgWithComment(...args: unknown[]): unknown;

  deleteRecallMsg(...args: unknown[]): unknown;

  deleteRecallMsgForLocal(...args: unknown[]): unknown;

  addLocalGrayTipMsg(...args: unknown[]): unknown;

  addLocalJsonGrayTipMsg(...args: unknown[]): unknown;

  addLocalJsonGrayTipMsgExt(...args: unknown[]): unknown;

  IsLocalJsonTipValid(...args: unknown[]): unknown;

  addLocalAVRecordMsg(...args: unknown[]): unknown;

  addLocalTofuRecordMsg(...args: unknown[]): unknown;

  addLocalRecordMsg(...args: unknown[]): unknown;

  deleteMsg(...args: unknown[]): unknown;

  updateElementExtBufForUI(...args: unknown[]): unknown;

  updateMsgRecordExtPbBufForUI(...args: unknown[]): unknown;

  startMsgSync(...args: unknown[]): unknown;

  startGuildMsgSync(...args: unknown[]): unknown;

  isGuildChannelSync(...args: unknown[]): unknown;

  getMsgUniqueId(UniqueId: string): string;

  isMsgMatched(...args: unknown[]): unknown;

  getOnlineFileMsgs(...args: unknown[]): unknown;

  getAllOnlineFileMsgs(...args: unknown[]): unknown;

  getLatestDbMsgs(peer: Peer, cnt: number): Promise<unknown>;

  getLastMessageList(peer: Peer[]): Promise<unknown>;

  getAioFirstViewLatestMsgs(...args: unknown[]): unknown;

  getMsgs(peer: Peer, msgId: string, count: unknown, queryOrder: boolean): Promise<unknown>;

  getMsgsIncludeSelf(peer: Peer, msgId: string, count: number, queryOrder: boolean): Promise<GeneralCallResult & {
    msgList: RawMessage[]
  }>;

  // this.$peer = contact;
  // this.$msgTime = j2;
  // this.$clientSeq = j3;
  // this.$cnt = i2;

  getMsgsWithMsgTimeAndClientSeqForC2C(...args: unknown[]): Promise<unknown>;

  getMsgsWithStatus(params: {
    peer: Peer
    msgId: string
    msgTime: unknown
    cnt: unknown
    queryOrder: boolean
    isIncludeSelf: boolean
    appid: unknown
  }): Promise<unknown>;

  getMsgsBySeqRange(peer: Peer, startSeq: string, endSeq: string): Promise<unknown>;

  getMsgsBySeqAndCount(peer: Peer, seq: string, count: number, desc: boolean, unknownArg: boolean): Promise<GeneralCallResult & { msgList: RawMessage[] }>;

  getMsgsByMsgId(peer: Peer, ids: string[]): Promise<GeneralCallResult & { msgList: RawMessage[] }>;

  getRecallMsgsByMsgId(peer: Peer, MsgId: string[]): Promise<unknown>;

  getMsgsBySeqList(peer: Peer, seqList: string[]): Promise<unknown>;

  getSingleMsg(Peer: Peer, msgSeq: string): unknown;

  getSourceOfReplyMsg(...args: unknown[]): unknown;

  getSourceOfReplyMsgV2(...args: unknown[]): unknown;

  getMsgByClientSeqAndTime(...args: unknown[]): unknown;

  getSourceOfReplyMsgByClientSeqAndTime(...args: unknown[]): unknown;

  getMsgsByTypeFilter(peer: Peer, msgId: string, cnt: unknown, queryOrder: boolean, typeFilters: unknown): unknown;

  getMsgsByTypeFilters(...args: unknown[]): unknown;

  getMsgWithAbstractByFilterParam(...args: unknown[]): unknown;

  queryMsgsWithFilter(...args: unknown[]): unknown;

  queryMsgsWithFilterVer2(MsgId: string, MsgTime: string, param: {
    chatInfo: {
      chatType: number,
      peerUid: string
    },
    filterMsgType: [],
    filterSendersUid: [],
    filterMsgFromTime: string,
    filterMsgToTime: string,
    pageLimit: number,
    isReverseOrder: boolean,
    isIncludeCurrent: boolean
  }): Promise<unknown>;
  // this.chatType = i2;
  // this.peerUid = str;

  // this.chatInfo = new ChatInfo();
  // this.filterMsgType = new ArrayList<>();
  // this.filterSendersUid = new ArrayList<>();
  // this.chatInfo = chatInfo;
  // this.filterMsgType = arrayList;
  // this.filterSendersUid = arrayList2;
  // this.filterMsgFromTime = j2;
  // this.filterMsgToTime = j3;
  // this.pageLimit = i2;
  // this.isReverseOrder = z;
  // this.isIncludeCurrent = z2;
  //queryMsgsWithFilterEx(0L, 0L, 0L, new QueryMsgsParams(new ChatInfo(2, str), new ArrayList(), new ArrayList(), 0L, 0L, 250, false, true))
  queryMsgsWithFilterEx(msgId: string, msgTime: string, megSeq: string, param: {
    chatInfo: {
      chatType: number,
      peerUid: string
    },
    filterMsgType: [],
    filterSendersUid: [],
    filterMsgFromTime: string,
    filterMsgToTime: string,
    pageLimit: number,
    isReverseOrder: boolean,
    isIncludeCurrent: boolean

  }): Promise<unknown>;
  //queryMsgsWithFilterEx(this.$msgId, this.$msgTime, this.$msgSeq, this.$param)
  queryFileMsgsDesktop(...args: unknown[]): unknown;

  setMsgRichInfoFlag(...args: unknown[]): unknown;

  queryPicOrVideoMsgs(msgId: string, msgTime: string, megSeq: string, param: {
    chatInfo: {
      chatType: number,
      peerUid: string
    },
    filterMsgType: [],
    filterSendersUid: [],
    filterMsgFromTime: string,
    filterMsgToTime: string,
    pageLimit: number,
    isReverseOrder: boolean,
    isIncludeCurrent: boolean
  }): Promise<unknown>;

  queryPicOrVideoMsgsDesktop(...args: unknown[]): unknown;

  queryEmoticonMsgs(...args: unknown[]): unknown;

  queryTroopEmoticonMsgs(...args: unknown[]): unknown;

  queryMsgsAndAbstractsWithFilter(...args: unknown[]): unknown;

  setFocusOnGuild(...args: unknown[]): unknown;

  setFocusSession(...args: unknown[]): unknown;

  enableFilterUnreadInfoNotify(...args: unknown[]): unknown;

  enableFilterMsgAbstractNotify(...args: unknown[]): unknown;

  onScenesChangeForSilenceMode(...args: unknown[]): unknown;

  getContactUnreadCnt(...args: unknown[]): unknown;

  getUnreadCntInfo(...args: unknown[]): unknown;

  getGuildUnreadCntInfo(...args: unknown[]): unknown;

  getGuildUnreadCntTabInfo(...args: unknown[]): unknown;

  getAllGuildUnreadCntInfo(...args: unknown[]): unknown;

  getAllJoinGuildCnt(...args: unknown[]): unknown;

  getAllDirectSessionUnreadCntInfo(...args: unknown[]): unknown;

  getCategoryUnreadCntInfo(...args: unknown[]): unknown;

  getGuildFeedsUnreadCntInfo(...args: unknown[]): unknown;

  setUnVisibleChannelCntInfo(...args: unknown[]): unknown;

  setUnVisibleChannelTypeCntInfo(...args: unknown[]): unknown;

  setVisibleGuildCntInfo(...args: unknown[]): unknown;

  setMsgRead(peer: Peer): Promise<GeneralCallResult>;

  setAllC2CAndGroupMsgRead(...args: unknown[]): unknown;

  setGuildMsgRead(...args: unknown[]): unknown;

  setAllGuildMsgRead(...args: unknown[]): unknown;

  setMsgReadAndReport(...args: unknown[]): unknown;

  setSpecificMsgReadAndReport(...args: unknown[]): unknown;

  setLocalMsgRead(...args: unknown[]): unknown;

  setGroupGuildMsgRead(...args: unknown[]): unknown;

  getGuildGroupTransData(...args: unknown[]): unknown;

  setGroupGuildBubbleRead(...args: unknown[]): unknown;

  getGuildGroupBubble(...args: unknown[]): unknown;

  fetchGroupGuildUnread(...args: unknown[]): unknown;

  setGroupGuildFlag(...args: unknown[]): unknown;

  setGuildUDCFlag(...args: unknown[]): unknown;

  setGuildTabUserFlag(...args: unknown[]): unknown;

  setBuildMode(...args: unknown[]): unknown;

  setConfigurationServiceData(...args: unknown[]): unknown;

  setMarkUnreadFlag(...args: unknown[]): unknown;

  getChannelEventFlow(...args: unknown[]): unknown;

  getMsgEventFlow(...args: unknown[]): unknown;

  getRichMediaFilePathForMobileQQSend(...args: unknown[]): unknown;

  getRichMediaFilePathForGuild(arg: {
    md5HexStr: string,
    fileName: string,
    elementType: ElementType,
    elementSubType: number,
    thumbSize: 0,
    needCreate: true,
    downloadType: 1,
    file_uuid: ''
  }): string;

  assembleMobileQQRichMediaFilePath(...args: unknown[]): unknown;

  getFileThumbSavePathForSend(...args: unknown[]): unknown;

  getFileThumbSavePath(...args: unknown[]): unknown;

  translatePtt2Text(j2: string, e2: {}, e3: {}): unknown;

  setPttPlayedState(...args: unknown[]): unknown;

  fetchFavEmojiList(...args: unknown[]): unknown;

  addFavEmoji(...args: unknown[]): unknown;

  fetchMarketEmoticonList(...args: unknown[]): unknown;

  fetchMarketEmoticonShowImage(...args: unknown[]): unknown;

  fetchMarketEmoticonAioImage(...args: unknown[]): unknown;

  fetchMarketEmotionJsonFile(...args: unknown[]): unknown;

  getMarketEmoticonPath(...args: unknown[]): unknown;

  getMarketEmoticonPathBySync(...args: unknown[]): unknown;

  fetchMarketEmoticonFaceImages(...args: unknown[]): unknown;

  fetchMarketEmoticonAuthDetail(...args: unknown[]): unknown;

  getFavMarketEmoticonInfo(...args: unknown[]): unknown;

  addRecentUsedFace(...args: unknown[]): unknown;

  getRecentUsedFaceList(...args: unknown[]): unknown;

  getMarketEmoticonEncryptKeys(...args: unknown[]): unknown;

  downloadEmojiPic(...args: unknown[]): unknown;

  deleteFavEmoji(...args: unknown[]): unknown;

  modifyFavEmojiDesc(...args: unknown[]): unknown;

  queryFavEmojiByDesc(...args: unknown[]): unknown;

  getHotPicInfoListSearchString(...args: unknown[]): unknown;

  getHotPicSearchResult(...args: unknown[]): unknown;

  getHotPicHotWords(...args: unknown[]): unknown;

  getHotPicJumpInfo(...args: unknown[]): unknown;

  getEmojiResourcePath(...args: unknown[]): unknown;

  JoinDragonGroupEmoji(...args: unknown[]): unknown;

  getMsgAbstracts(...args: unknown[]): unknown;

  getMsgAbstract(...args: unknown[]): unknown;

  getMsgAbstractList(...args: unknown[]): unknown;

  getMsgAbstractListBySeqRange(...args: unknown[]): unknown;

  refreshMsgAbstracts(...args: unknown[]): unknown;

  refreshMsgAbstractsByGuildIds(...args: unknown[]): unknown;

  getRichMediaElement(...args: unknown[]): unknown;

  cancelGetRichMediaElement(...args: unknown[]): unknown;

  refuseGetRichMediaElement(...args: unknown[]): unknown;

  switchToOfflineGetRichMediaElement(...args: unknown[]): unknown;

  downloadRichMedia(...args: unknown[]): unknown;

  getFirstUnreadMsgSeq(...args: unknown[]): unknown;

  getFirstUnreadCommonMsg(...args: unknown[]): unknown;

  getFirstUnreadAtmeMsg(...args: unknown[]): unknown;

  getFirstUnreadAtallMsg(...args: unknown[]): unknown;

  getNavigateInfo(...args: unknown[]): unknown;

  getChannelFreqLimitInfo(...args: unknown[]): unknown;

  getRecentUseEmojiList(...args: unknown[]): unknown;

  getRecentEmojiList(...args: unknown[]): unknown;

  setMsgEmojiLikes(...args: unknown[]): unknown;

  getMsgEmojiLikesList(...args: unknown[]): unknown;

  setMsgEmojiLikesForRole(...args: unknown[]): unknown;

  clickInlineKeyboardButton(...args: unknown[]): unknown;

  setCurOnScreenMsg(...args: unknown[]): unknown;

  setCurOnScreenMsgForMsgEvent(...args: unknown[]): unknown;

  getMiscData(key: string): unknown;

  setMiscData(key: string, value: string): unknown;

  getBookmarkData(...args: unknown[]): unknown;

  setBookmarkData(...args: unknown[]): unknown;

  sendShowInputStatusReq(ChatType: number, EventType: number, toUid: string): Promise<unknown>;

  queryCalendar(...args: unknown[]): unknown;

  queryFirstMsgSeq(...args: unknown[]): unknown;

  queryRoamCalendar(...args: unknown[]): unknown;

  queryFirstRoamMsg(...args: unknown[]): unknown;

  fetchLongMsg(...args: unknown[]): unknown;

  fetchLongMsgWithCb(...args: unknown[]): unknown;

  setIsStopKernelFetchLongMsg(...args: unknown[]): unknown;

  insertGameResultAsMsgToDb(...args: unknown[]): unknown;

  getMultiMsg(...args: unknown[]): Promise<GeneralCallResult & {
    msgList: RawMessage[]
  }>;

  setDraft(...args: unknown[]): unknown;

  getDraft(...args: unknown[]): unknown;

  deleteDraft(...args: unknown[]): unknown;

  getRecentHiddenSesionList(...args: unknown[]): unknown;

  setRecentHiddenSession(...args: unknown[]): unknown;

  delRecentHiddenSession(...args: unknown[]): unknown;

  getCurHiddenSession(...args: unknown[]): unknown;

  setCurHiddenSession(...args: unknown[]): unknown;

  setReplyDraft(...args: unknown[]): unknown;

  getReplyDraft(...args: unknown[]): unknown;

  deleteReplyDraft(...args: unknown[]): unknown;

  getFirstUnreadAtMsg(...args: unknown[]): unknown;

  clearMsgRecords(...args: unknown[]): unknown;//设置已读后调用我觉得比较好 清理记录

  IsExistOldDb(...args: unknown[]): unknown;

  canImportOldDbMsg(...args: unknown[]): unknown;

  setPowerStatus(z: boolean): unknown;

  canProcessDataMigration(...args: unknown[]): unknown;

  importOldDbMsg(...args: unknown[]): unknown;

  stopImportOldDbMsgAndroid(...args: unknown[]): unknown;

  isMqqDataImportFinished(...args: unknown[]): unknown;

  getMqqDataImportTableNames(...args: unknown[]): unknown;

  getCurChatImportStatusByUin(...args: unknown[]): unknown;

  getDataImportUserLevel(...args: unknown[]): unknown;

  getMsgQRCode(...args: unknown[]): unknown;

  getGuestMsgAbstracts(...args: unknown[]): unknown;

  getGuestMsgByRange(...args: unknown[]): unknown;

  getGuestMsgAbstractByRange(...args: unknown[]): unknown;

  registerSysMsgNotification(...args: unknown[]): unknown;

  unregisterSysMsgNotification(...args: unknown[]): unknown;

  enterOrExitAio(...args: unknown[]): unknown;

  // this.peerUid = "";
  // this.peerNickname = "";
  // this.fromGroupCode = "";
  // this.sig = new byte[0];
  // this.selfUid = "";
  // this.selfPhone = "";
  // this.chatType = i2;
  // this.peerUid = str;
  // this.peerNickname = str2;
  // this.fromGroupCode = str3;
  // this.sig = bArr;
  // this.selfUid = str4;
  // this.selfPhone = str5;
  // this.gameSession = tempChatGameSession;
  prepareTempChat(args: unknown): unknown;//主动临时消息 不做

  //chattype,uid->Promise<any>
  getTempChatInfo(ChatType: number, Uid: string): unknown;

  setContactLocalTop(...args: unknown[]): unknown;

  switchAnonymousChat(...args: unknown[]): unknown;

  renameAnonyChatNick(...args: unknown[]): unknown;

  getAnonymousInfo(...args: unknown[]): unknown;

  updateAnonymousInfo(...args: unknown[]): unknown;

  sendSummonMsg(peer: Peer, MsgElement: unknown, MsgAttributeInfo: unknown): Promise<unknown>;//频道的东西

  outputGuildUnreadInfo(...args: unknown[]): unknown;

  checkMsgWithUrl(...args: unknown[]): unknown;

  checkTabListStatus(...args: unknown[]): unknown;

  getABatchOfContactMsgBoxInfo(...args: unknown[]): unknown;

  insertMsgToMsgBox(...args: unknown[]): unknown;

  isHitEmojiKeyword(...args: unknown[]): unknown;

  getKeyWordRelatedEmoji(...args: unknown[]): unknown;

  recordEmoji(...args: unknown[]): unknown;

  fetchGetHitEmotionsByWord(args: Object): Promise<unknown>;//表情推荐？

  deleteAllRoamMsgs(...args: unknown[]): unknown;//漫游消息？

  packRedBag(...args: unknown[]): unknown;

  grabRedBag(...args: unknown[]): unknown;

  pullDetail(...args: unknown[]): unknown;

  selectPasswordRedBag(...args: unknown[]): unknown;

  pullRedBagPasswordList(...args: unknown[]): unknown;

  requestTianshuAdv(...args: unknown[]): unknown;

  tianshuReport(...args: unknown[]): unknown;

  tianshuMultiReport(...args: unknown[]): unknown;

  GetMsgSubType(a0: number, a1: number): unknown;

  setIKernelPublicAccountAdapter(...args: unknown[]): unknown;
  //tempChatGameSession有关
  createUidFromTinyId(fromTinyId: string, toTinyId: string): unknown;

  dataMigrationGetDataAvaiableContactList(...args: unknown[]): unknown;

  dataMigrationGetMsgList(...args: unknown[]): unknown;

  dataMigrationStopOperation(...args: unknown[]): unknown;

  dataMigrationImportMsgPbRecord(...args: unknown[]): unknown;

  dataMigrationGetResourceLocalDestinyPath(...args: unknown[]): unknown;

  dataMigrationSetIOSPathPrefix(...args: unknown[]): unknown;

  getServiceAssistantSwitch(...args: unknown[]): unknown;

  setServiceAssistantSwitch(...args: unknown[]): unknown;

  setSubscribeFolderUsingSmallRedPoint(...args: unknown[]): unknown;

  clearGuildNoticeRedPoint(...args: unknown[]): unknown;

  clearFeedNoticeRedPoint(...args: unknown[]): unknown;

  clearFeedSquareRead(...args: unknown[]): unknown;

  IsC2CStyleChatType(...args: unknown[]): unknown;

  IsTempChatType(uin: number): unknown;//猜的

  getGuildInteractiveNotification(...args: unknown[]): unknown;

  getGuildNotificationAbstract(...args: unknown[]): unknown;

  setFocusOnBase(...args: unknown[]): unknown;

  queryArkInfo(...args: unknown[]): unknown;

  queryUserSecQuality(...args: unknown[]): unknown;

  getGuildMsgAbFlag(...args: unknown[]): unknown;

  getGroupMsgStorageTime(): unknown;//这是嘛啊

}
