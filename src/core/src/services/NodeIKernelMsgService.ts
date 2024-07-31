import { ElementType, MessageElement, Peer, RawMessage, SendMessageElement } from '@/core/entities';
import { NodeIKernelMsgListener } from '@/core/listeners/NodeIKernelMsgListener';
import { GeneralCallResult } from '@/core/services/common';

export interface NodeIKernelMsgService {
  addKernelMsgListener(nodeIKernelMsgListener: NodeIKernelMsgListener): number;

  sendMsg(msgId: string, peer: Peer, msgElements: SendMessageElement[], map: Map<any, any>): Promise<GeneralCallResult>;

  recallMsg(peer: Peer, msgIds: string[]): Promise<GeneralCallResult>;

  addKernelMsgImportToolListener(arg: Object): unknown;

  removeKernelMsgListener(args: unknown): unknown;

  addKernelTempChatSigListener(...args: unknown[]): unknown;

  removeKernelTempChatSigListener(...args: unknown[]): unknown;

  setAutoReplyTextList(AutoReplyText: Array<unknown>, i2: number): unknown;

  getAutoReplyTextList(...args: unknown[]): unknown;

  getOnLineDev(): void;

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

  switchToOfflineSendMsg(peer: Peer, MsgId: string): unknown;

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

  addLocalRecordMsg(Peer: Peer, msgId: string, ele: MessageElement, attr: Array<any> | number, front: boolean): Promise<unknown>;

  deleteMsg(Peer: Peer, msgIds: Array<string>): Promise<any>;

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

  getAioFirstViewLatestMsgs(peer: Peer, num: number): unknown;

  getMsgs(peer: Peer, msgId: string, count: unknown, queryOrder: boolean): Promise<unknown>;

  getMsgsIncludeSelf(peer: Peer, msgId: string, count: number, queryOrder: boolean): Promise<GeneralCallResult & {
    msgList: RawMessage[]
  }>;

  // this.$peer = contact;
  // this.$msgTime = j2;
  // this.$clientSeq = j3;
  // this.$cnt = i2;

  getMsgsWithMsgTimeAndClientSeqForC2C(...args: unknown[]): Promise<GeneralCallResult & { msgList: RawMessage[] }>;

  getMsgsWithStatus(params: {
    peer: Peer
    msgId: string
    msgTime: unknown
    cnt: unknown
    queryOrder: boolean
    isIncludeSelf: boolean
    appid: unknown
  }): Promise<GeneralCallResult & { msgList: RawMessage[] }>;

  getMsgsBySeqRange(peer: Peer, startSeq: string, endSeq: string): Promise<GeneralCallResult & { msgList: RawMessage[] }>;

  getMsgsBySeqAndCount(peer: Peer, seq: string, count: number, desc: boolean, unknownArg: boolean): Promise<GeneralCallResult & { msgList: RawMessage[] }>;

  getMsgsByMsgId(peer: Peer, ids: string[]): Promise<GeneralCallResult & { msgList: RawMessage[] }>;

  getRecallMsgsByMsgId(peer: Peer, MsgId: string[]): Promise<unknown>;

  getMsgsBySeqList(peer: Peer, seqList: string[]): Promise<GeneralCallResult & { msgList: RawMessage[] }>;

  getSingleMsg(Peer: Peer, msgSeq: string): Promise<GeneralCallResult & { msgList: RawMessage[] }>;

  getSourceOfReplyMsg(...args: unknown[]): unknown;

  getSourceOfReplyMsgV2(...args: unknown[]): unknown;

  getMsgByClientSeqAndTime(...args: unknown[]): unknown;

  getSourceOfReplyMsgByClientSeqAndTime(...args: unknown[]): unknown;

  getMsgsByTypeFilter(peer: Peer, msgId: string, cnt: unknown, queryOrder: boolean, typeFilter: { type: number, subtype: Array<number> }): unknown;

  getMsgsByTypeFilters(peer: Peer, msgId: string, cnt: unknown, queryOrder: boolean, typeFilters: Array<{ type: number, subtype: Array<number> }>): unknown;

  getMsgWithAbstractByFilterParam(...args: unknown[]): unknown;

  queryMsgsWithFilter(...args: unknown[]): unknown;

  /**
   * @deprecated 该函数已被标记为废弃，请使用新的替代方法。
   * 使用过滤条件查询消息列表的版本2接口。
   * 
   * 该函数通过一系列过滤条件来查询特定聊天中的消息列表。这些条件包括消息类型、发送者、时间范围等。
   * 函数返回一个Promise，解析为查询结果的未知类型对象。
   * 
   * @param MsgId 消息ID，用于特定消息的查询。
   * @param MsgTime 消息时间，用于指定消息的时间范围。
   * @param param 查询参数对象，包含详细的过滤条件和分页信息。
   * @param param.chatInfo 聊天信息，包括聊天类型和对方用户ID。
   * @param param.filterMsgType 需要过滤的消息类型数组，留空表示不过滤。
   * @param param.filterSendersUid 需要过滤的发送者用户ID数组。
   * @param param.filterMsgFromTime 查询消息的起始时间。
   * @param param.filterMsgToTime 查询消息的结束时间。
   * @param param.pageLimit 每页的消息数量限制。
   * @param param.isReverseOrder 是否按时间顺序倒序返回消息。
   * @param param.isIncludeCurrent 是否包含当前页码。
   * @returns 返回一个Promise，解析为查询结果的未知类型对象。
   */
  queryMsgsWithFilterVer2(MsgId: string, MsgTime: string, param: {
    chatInfo: {
      chatType: number,
      peerUid: string
    },
    filterMsgType: [],
    filterSendersUid: Array<string>,
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
    filterSendersUid: string[],
    filterMsgFromTime: string,
    filterMsgToTime: string,
    pageLimit: number,
    isReverseOrder: boolean,
    isIncludeCurrent: boolean
  }): Promise<GeneralCallResult & {
    msgList: RawMessage[]
  }>;
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

  queryMsgsAndAbstractsWithFilter(msgId: string, msgTime: string, megSeq: string, param: {
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
  }): unknown;

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

  setAllC2CAndGroupMsgRead(): Promise<unknown>;

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

  setBuildMode(flag: number/*0 1 3*/): unknown;

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
  //猜测居多
  translatePtt2Text(MsgId: string, Peer: {}, MsgElement: {}): unknown;

  setPttPlayedState(...args: unknown[]): unknown;
  // NodeIQQNTWrapperSession fetchFavEmojiList [
  //   "",
  //   48,
  //   true,
  //   true
  // ]
  fetchFavEmojiList(str: string, num: number, uk1: boolean, uk2: boolean): Promise<GeneralCallResult & {
    emojiInfoList: Array<{
      uin: string,
      emoId: number,
      emoPath: string,
      isExist: boolean,
      resId: string,
      url: string,
      md5: string,
      emoOriginalPath: string,
      thumbPath: string,
      RomaingType: string,
      isAPNG: false,
      isMarkFace: false,
      eId: string,
      epId: string,
      ocrWord: string,
      modifyWord: string,
      exposeNum: number,
      clickNum: number,
      desc: string
    }>
  }>;

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

  JoinDragonGroupEmoji(JoinDragonGroupEmojiReq: any/*joinDragonGroupEmojiReq*/): unknown;

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

  getFirstUnreadMsgSeq(args: {
    peerUid: string
    guildId: string
  }): unknown;

  getFirstUnreadCommonMsg(...args: unknown[]): unknown;

  getFirstUnreadAtmeMsg(...args: unknown[]): unknown;

  getFirstUnreadAtallMsg(...args: unknown[]): unknown;

  getNavigateInfo(...args: unknown[]): unknown;

  getChannelFreqLimitInfo(...args: unknown[]): unknown;

  getRecentUseEmojiList(...args: unknown[]): unknown;

  getRecentEmojiList(...args: unknown[]): unknown;

  setMsgEmojiLikes(...args: unknown[]): unknown;

  getMsgEmojiLikesList(peer: Peer, msgSeq: string, emojiId: string, emojiType: string, cookie: string, bForward: boolean, number: number): Promise<unknown>;

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

  fetchLongMsg(peer: Peer, msgId: string): unknown;

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

  getFirstUnreadAtMsg(peer: Peer): unknown;

  clearMsgRecords(...args: unknown[]): unknown;//设置已读后调用我觉得比较好 清理记录 现在别了

  IsExistOldDb(...args: unknown[]): unknown;

  canImportOldDbMsg(...args: unknown[]): unknown;

  setPowerStatus(z: boolean): unknown;

  canProcessDataMigration(...args: unknown[]): unknown;

  importOldDbMsg(...args: unknown[]): unknown;

  stopImportOldDbMsgAndroid(...args: unknown[]): unknown;

  isMqqDataImportFinished(...args: unknown[]): unknown;

  getMqqDataImportTableNames(...args: unknown[]): unknown;

  getCurChatImportStatusByUin(...args: unknown[]): unknown;

  getDataImportUserLevel(): unknown;

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

  insertMsgToMsgBox(peer: Peer, msgId: string, arg: 2006): unknown;

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

  //新的希望
  dataMigrationImportMsgPbRecord(DataMigrationMsgInfo: Array<{
    extensionData: string//"Hex" 
    extraData: string //""
    chatType: number
    chatUin: string
    msgType: number
    msgTime: string
    msgSeq: string
    msgRandom: string
  }>, DataMigrationResourceInfo: {
    extraData: string
    filePath: string
    fileSize: string
    msgRandom: string
    msgSeq: string
    msgSubType: number
    msgType: number
  }): unknown;

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
