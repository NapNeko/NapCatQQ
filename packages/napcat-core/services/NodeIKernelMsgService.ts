import { ElementType, MessageElement, Peer, RawMessage, FileElement, SendMessageElement, AvRecordElement, TofuRecordElement } from '@/napcat-core/types';
import { NodeIKernelMsgListener } from '@/napcat-core/listeners/NodeIKernelMsgListener';
import { GeneralCallResult } from '@/napcat-core/services/common';
import { MsgReqType, QueryMsgsParams, TmpChatInfoApi, MsgTypeFilter, MsgIdentity, SgrpStreamParams, GrayTipJsonInfo, ForwardFileInfo, LocalGrayTipInfo, TokenInfo, BackGroundInfo } from '@/napcat-core/types/msg';

export interface NodeIKernelMsgService {
  buildMultiForwardMsg (req: { srcMsgIds: Array<string>, srcContact: Peer; }): Promise<GeneralCallResult & { rspInfo: { elements: unknown; }; }>;

  generateMsgUniqueId (chatType: number, time: string): string;

  addKernelMsgListener (nodeIKernelMsgListener: NodeIKernelMsgListener): number;

  sendMsg (msgId: string, peer: Peer, msgElements: SendMessageElement[], map: Map<number, unknown>): Promise<GeneralCallResult>;

  recallMsg (peer: Peer, msgIds: string[]): Promise<GeneralCallResult>;

  addKernelMsgImportToolListener (listener: unknown): string;

  removeKernelMsgListener (listenerId: string): void;

  addKernelTempChatSigListener (listener: unknown): string;

  removeKernelTempChatSigListener (listenerId: string): void;

  setAutoReplyTextList (AutoReplyText: Array<unknown>, i2: number): unknown;

  getAutoReplyTextList (): unknown;

  getOnLineDev (): void;

  kickOffLine (DevInfo: unknown): unknown;

  setStatus (args: { status: number, extStatus: number, batteryStatus: number, customStatus?: { faceId: string, wording: string, faceType: string; }; }): Promise<GeneralCallResult>;

  fetchStatusMgrInfo (): unknown;

  fetchStatusUnitedConfigInfo (): unknown;

  getOnlineStatusSmallIconBasePath (): unknown;

  getOnlineStatusSmallIconFileNameByUrl (Url: string): unknown;

  downloadOnlineStatusSmallIconByUrl (arg0: number, arg1: string): unknown;

  getOnlineStatusBigIconBasePath (): unknown;

  downloadOnlineStatusBigIconByUrl (arg0: number, arg1: string): unknown;

  getOnlineStatusCommonPath (arg: string): unknown;

  getOnlineStatusCommonFileNameByUrl (Url: string): unknown;

  downloadOnlineStatusCommonByUrl (arg0: string, arg1: string): unknown;

  setToken (tokenInfo: TokenInfo): Promise<GeneralCallResult>;

  switchForeGround (): unknown;

  switchBackGround (info: BackGroundInfo): Promise<GeneralCallResult>;

  setTokenForMqq (token: string): unknown;

  switchForeGroundForMqq (data: string | Uint8Array): Promise<GeneralCallResult>;

  switchBackGroundForMqq (data: string | Uint8Array): Promise<GeneralCallResult>;

  getMsgSetting (): unknown;

  setMsgSetting (setting: unknown): unknown;

  addSendMsg (msgId: string, peer: Peer, msgElements: SendMessageElement[], map: Map<number, unknown>): unknown;

  cancelSendMsg (peer: Peer, msgId: string): Promise<void>;

  switchToOfflineSendMsg (peer: Peer, MsgId: string): unknown;

  reqToOfflineSendMsg (peer: Peer, msgId: string): unknown;

  refuseReceiveOnlineFileMsg (peer: Peer, MsgId: string): unknown;

  resendMsg (peer: Peer, msgId: string): Promise<void>;

  reeditRecallMsg (peer: Peer, msgId: string): unknown;

  forwardMsg (msgIds: string[], peer: Peer, dstPeers: Peer[], commentElements: unknown): Promise<GeneralCallResult>;

  forwardMsgWithComment (msgIds: string[], srcContact: Peer, dstContacts: Peer[], commentElements: Array<unknown>, arg5: unknown): unknown;

  forwardSubMsgWithComment (msgIds: string[], subMsgIds: string[], srcContact: Peer, dstContacts: Peer[], commentElements: Array<unknown>, arg6: unknown): unknown;

  forwardRichMsgInVist (richMsgInfos: Array<unknown>, dstContacts: Peer[]): unknown;

  forwardFile (fileInfo: ForwardFileInfo, peer: Peer): unknown;

  multiForwardMsg (peer: Peer, srcContact: Peer, msgIds: string[]): unknown;

  multiForwardMsgWithComment (msgInfos: Array<unknown>, srcContact: Peer, dstContact: Peer, commentElements: Array<unknown>, arg5: unknown): unknown;

  deleteRecallMsg (peer: Peer, msgId: string): unknown;

  deleteRecallMsgForLocal (peer: Peer, msgId: string): unknown;

  addLocalGrayTipMsg (peer: Peer, grayTipInfo: LocalGrayTipInfo, isUnread: boolean): unknown;

  addLocalJsonGrayTipMsg (arg1: Peer, arg2: GrayTipJsonInfo, arg3: boolean, arg4: boolean): unknown;

  addLocalJsonGrayTipMsgExt (arg1: Peer, arg2: MsgIdentity, arg3: GrayTipJsonInfo, arg4: boolean, arg5: boolean): unknown;

  IsLocalJsonTipValid (tipType: number): boolean;

  addLocalAVRecordMsg (peer: Peer, avRecord: AvRecordElement): unknown;

  addLocalTofuRecordMsg (peer: Peer, tofuRecord: TofuRecordElement): unknown;

  addLocalRecordMsg (Peer: Peer, msgId: string, ele: MessageElement, attr: Array<unknown> | number, front: boolean): Promise<unknown>;

  addLocalRecordMsgWithExtInfos (peer: Peer, msgId: string, extInfos: unknown): unknown;

  deleteMsg (Peer: Peer, msgIds: Array<string>): Promise<unknown>;

  updateElementExtBufForUI (arg1: Peer, arg2: string, arg3: string, arg4: string | Uint8Array): unknown;

  updateMsgRecordExtPbBufForUI (arg1: Peer, arg2: string, arg3: unknown): unknown;

  startMsgSync (): unknown;

  startGuildMsgSync (): unknown;

  isGuildChannelSync (): unknown;

  getMsgUniqueId (UniqueId: string): string;

  isMsgMatched (matchInfo: unknown): unknown;

  getOnlineFileMsgs (peer: Peer): Promise<GeneralCallResult & {
    msgList: {
      msgId: string;
      msgRandom: string;
      senderUid: string;
      peerUid: string;
      msgTime: string;
      elements: {
        elementType: number;
        elementId: string;
        fileElement: FileElement;
      }[];
    }[];  // 一大坨，懒得写
  }>;

  getAllOnlineFileMsgs (): unknown;

  getLatestDbMsgs (peer: Peer, cnt: number): Promise<GeneralCallResult & {
    msgList: RawMessage[];
  }>;

  getLastMessageList (peer: Peer[]): Promise<GeneralCallResult & {
    msgList: RawMessage[];
  }>;

  getAioFirstViewLatestMsgs (peer: Peer, num: number): Promise<GeneralCallResult & {
    msgList: RawMessage[];
  }>;

  // getMsgService/getMsgs { chatType: 2, peerUid: '975206796', privilegeFlag: 336068800 } 0 20 true
  getMsgs (peer: Peer & { privilegeFlag: number; }, msgId: string, count: number, queryOrder: boolean): Promise<GeneralCallResult & {
    msgList: RawMessage[];
  }>;

  getMsgsIncludeSelf (peer: Peer, msgId: string, count: number, queryOrder: boolean): Promise<GeneralCallResult & {
    msgList: RawMessage[];
  }>;

  // @deprecated
  getMsgsWithMsgTimeAndClientSeqForC2C (peer: Peer, arg2: string, arg3: string, arg4: number, arg5: boolean, arg6: boolean, arg7: boolean): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  getMsgsWithStatus (params: {
    peer: Peer;
    msgId: string;
    msgTime: unknown;
    cnt: unknown;
    queryOrder: boolean;
    isIncludeSelf: boolean;
    appid: unknown;
  }): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  getMsgsBySeqRange (peer: Peer, startSeq: string, endSeq: string): Promise<GeneralCallResult & {
    msgList: RawMessage[];
  }>;

  // @deprecated
  getMsgsBySeqAndCount (peer: Peer, seq: string, count: number, desc: boolean, isReverseOrder: boolean): Promise<GeneralCallResult & {
    msgList: RawMessage[];
  }>;

  getMsgsByMsgId (peer: Peer, ids: string[]): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  getRecallMsgsByMsgId (peer: Peer, MsgId: string[]): Promise<unknown>;

  getMsgsBySeqList (peer: Peer, seqList: string[]): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  getMsgsExt (msgReq: MsgReqType): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  getSingleMsg (Peer: Peer, msgSeq: string): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  // 下面的msgid全部不真实
  getSourceOfReplyMsg (peer: Peer, msgId: string, sourceSeq: string): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  // 用法和聊天记录一样
  getSourceOfReplyMsgV2 (peer: Peer, rootMsgId: string, replyMsgId: string): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  getMsgByClientSeqAndTime (peer: Peer, clientSeq: string, time: string): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  getSourceOfReplyMsgByClientSeqAndTime (peer: Peer, clientSeq: string, time: string, replyMsgId: string): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  getMsgsByTypeFilter (peer: Peer, msgId: string, cnt: Array<unknown>, queryOrder: boolean, typeFilter: {
    type: number,
    subtype: Array<number>;
  }): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  getMsgsByTypeFilters (peer: Peer, msgId: string, cnt: number, queryOrder: boolean, typeFilters: Array<{
    type: number,
    subtype: Array<number>;
  }>): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  getMsgWithAbstractByFilterParam (arg1: Peer, arg2: string, arg3: string, arg4: number, arg5: MsgTypeFilter): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  queryMsgsWithFilter (msgId: string, msgTime: string, param: QueryMsgsParams): Promise<GeneralCallResult & { msgList: RawMessage[]; }>;

  // queryMsgsWithFilterVer2(MsgId: string, MsgTime: string, param: QueryMsgsParams): Promise<unknown>;

  queryMsgsWithFilterEx (msgId: string, msgTime: string, megSeq: string, param: QueryMsgsParams): Promise<GeneralCallResult & {
    msgList: RawMessage[];
  }>;

  queryFileMsgsDesktop (msgId: string, msgTime: string, msgSeq: string, param: QueryMsgsParams): Promise<GeneralCallResult & {
    msgList: RawMessage[];
  }>;

  setMsgRichInfoFlag (flag: boolean): void;

  queryPicOrVideoMsgs (msgId: string, msgTime: string, megSeq: string, param: QueryMsgsParams): Promise<unknown>;

  queryPicOrVideoMsgsDesktop (msgId: string, msgTime: string, msgSeq: string, param: QueryMsgsParams): unknown;

  queryEmoticonMsgs (msgId: string, msgTime: string, msgSeq: string, Params: QueryMsgsParams): Promise<unknown>;

  queryTroopEmoticonMsgs (msgId: string, msgTime: string, msgSeq: string, Params: QueryMsgsParams): Promise<unknown>;

  queryMsgsAndAbstractsWithFilter (msgId: string, msgTime: string, megSeq: string, param: QueryMsgsParams): unknown;

  setFocusOnGuild (arg: unknown): unknown;

  setFocusSession (arg: unknown): unknown;

  enableFilterUnreadInfoNotify (arg: unknown): unknown;

  enableFilterMsgAbstractNotify (arg: unknown): unknown;

  onScenesChangeForSilenceMode (arg: unknown): unknown;

  getContactUnreadCnt (peers: Peer[]): unknown;

  getUnreadCntInfo (arg: unknown): unknown;

  getGuildUnreadCntInfo (arg: unknown): unknown;

  getGuildUnreadCntTabInfo (arg: unknown): unknown;

  getAllGuildUnreadCntInfo (arg: unknown): unknown;

  getAllJoinGuildCnt (arg: unknown): unknown;

  getAllDirectSessionUnreadCntInfo (arg: unknown): unknown;

  getCategoryUnreadCntInfo (arg: unknown): unknown;

  getGuildFeedsUnreadCntInfo (arg: unknown): unknown;

  setUnVisibleChannelCntInfo (arg: unknown): unknown;

  setUnVisibleChannelTypeCntInfo (arg: unknown): unknown;

  setVisibleGuildCntInfo (arg: unknown): unknown;

  setMsgRead (peer: Peer): Promise<GeneralCallResult>;

  setAllC2CAndGroupMsgRead (): Promise<unknown>;

  setGuildMsgRead (arg: unknown): unknown;

  setAllGuildMsgRead (arg: unknown): unknown;

  setMsgReadAndReport (peer: Peer, msg: RawMessage): unknown;

  setSpecificMsgReadAndReport (arg1: Peer, arg2: string): unknown;

  setLocalMsgRead (peer: Peer): unknown;

  setGroupGuildMsgRead (arg: unknown): unknown;

  getGuildGroupTransData (arg: unknown): unknown;

  setGroupGuildBubbleRead (arg: unknown): unknown;

  getGuildGroupBubble (arg: unknown): unknown;

  fetchGroupGuildUnread (arg: unknown): unknown;

  setGroupGuildFlag (arg: unknown): unknown;

  setGuildUDCFlag (arg: unknown): unknown;

  setGuildTabUserFlag (arg: unknown): unknown;

  setBuildMode (flag: number/* 0 1 3 */): unknown;

  setConfigurationServiceData (arg: unknown): unknown;

  setMarkUnreadFlag (peer: Peer, unread: boolean): unknown;

  getChannelEventFlow (arg: unknown): unknown;

  getMsgEventFlow (arg: unknown): unknown;

  getRichMediaFilePathForMobileQQSend (arg: unknown): unknown;

  getRichMediaFilePathForGuild (arg: {
    md5HexStr: string,
    fileName: string,
    elementType: ElementType,
    elementSubType: number,
    thumbSize: 0,
    needCreate: true,
    downloadType: 1,
    file_uuid: '';
  }): string;

  assembleMobileQQRichMediaFilePath (arg: unknown): unknown;

  getFileThumbSavePathForSend (thumbSize: number, createNeed: boolean): string;

  getFileThumbSavePath (arg1: string, arg2: number, arg3: boolean): unknown;

  translatePtt2Text (msgId: string, peer: Peer, msgElement: MessageElement): unknown;

  setPttPlayedState (arg1: string, arg2: Peer, arg3: string): unknown;

  fetchFavEmojiList (str: string, num: number, backward: boolean, forceRefresh: boolean): Promise<GeneralCallResult & {
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
      desc: string;
    }>;
  }>;

  addFavEmoji (arg: unknown): unknown;

  fetchMarketEmoticonList (arg1: number, arg2: number): unknown;

  fetchMarketEmoticonShowImage (arg: unknown): unknown;

  fetchMarketEmoticonAioImage (arg: unknown): unknown;

  fetchMarketEmotionJsonFile (arg: unknown): unknown;

  getMarketEmoticonPath (arg1: number, arg2: Array<unknown>[], arg3: number): unknown;

  getMarketEmoticonPathBySync (arg1: number, arg2: Array<unknown>[], arg3: number): unknown;

  fetchMarketEmoticonFaceImages (arg: unknown): unknown;

  fetchMarketEmoticonAuthDetail (arg: unknown): unknown;

  getFavMarketEmoticonInfo (tabId: number, emojiId: string): unknown;

  addRecentUsedFace (arg: unknown): unknown;

  getRecentUsedFaceList (arg: unknown): unknown;

  getMarketEmoticonEncryptKeys (arg1: number, arg2: Array<unknown>[]): unknown;

  downloadEmojiPic (arg1: number, arg2: Array<unknown>[], arg3: number, arg4: Map<unknown, unknown>): unknown;

  deleteFavEmoji (arg: unknown): unknown;

  modifyFavEmojiDesc (arg: unknown): unknown;

  queryFavEmojiByDesc (arg: unknown): unknown;

  getHotPicInfoListSearchString (arg1: string, arg2: string, arg3: number, arg4: number, arg5: boolean): unknown;

  getHotPicSearchResult (arg: unknown): unknown;

  getHotPicHotWords (arg: unknown): unknown;

  getHotPicJumpInfo (arg: unknown): unknown;

  getEmojiResourcePath (arg: unknown): unknown;

  JoinDragonGroupEmoji (JoinDragonGroupEmojiReq: {
    latestMsgSeq: string,
    manageEmojiId: number,
    manageMsgSeq: string,
    peerContact: Peer;
  }): Promise<unknown>;

  getMsgAbstracts (arg: unknown): unknown;

  getMsgAbstract (arg1: Peer, arg2: string): unknown;

  getMsgAbstractList (arg: unknown): unknown;

  getMsgAbstractListBySeqRange (arg: unknown): unknown;

  refreshMsgAbstracts (arg: unknown): unknown;

  refreshMsgAbstractsByGuildIds (arg: unknown): unknown;

  getRichMediaElement (arg: {
    msgId: string,
    peerUid: string,
    chatType: number,
    elementId: string,
    downSourceType: number,
    downloadType: number,
  }): Promise<any>;

  cancelGetRichMediaElement (arg: unknown): unknown;

  refuseGetRichMediaElement (args: {
    msgId: string,
    peerUid: string,
    chatType: number,
    elementId: string,
    downloadType: number, // 1
    downSourceType: number, // 1
  }): Promise<void>;

  switchToOfflineGetRichMediaElement (arg: unknown): unknown;

  downloadRichMedia (args: {
    fileModelId: string,
    downSourceType: number,
    triggerType: number,
    msgId: string,
    chatType: number,
    peerUid: string,
    elementId: string,
    thumbSize: number,
    downloadType: number,
    filePath: string;
  } & {
    downloadSourceType: number, // 33800左右一下的老版本 新版34606已经完全上面格式
  }): unknown;

  getFirstUnreadMsgSeq (args: {
    peerUid: string;
    guildId: string;
  }): Promise<unknown>;

  getFirstUnreadCommonMsg (arg: unknown): unknown;

  getFirstUnreadAtmeMsg (peer: Peer): unknown;

  getFirstUnreadAtallMsg (peer: Peer): unknown;

  getNavigateInfo (arg: unknown): unknown;

  getChannelFreqLimitInfo (arg: unknown): unknown;

  getRecentUseEmojiList (): unknown;

  getRecentEmojiList (arg: unknown): unknown;

  setMsgEmojiLikes (peer: Peer, msgSeq: string, emojiId: string, emojiType: string, setOrCancel: boolean): unknown;

  getMsgEmojiLikesList (peer: Peer, msgSeq: string, emojiId: string, emojiType: string, cookie: string, bForward: boolean, number: number): Promise<{
    result: number,
    errMsg: string,
    emojiLikesList:
    Array<{
      tinyId: string,
      nickName: string,
      headUrl: string;
    }>,
    cookie: string,
    isLastPage: boolean,
    isFirstPage: boolean;
  }>;

  setMsgEmojiLikesForRole (arg1: Peer, arg2: string, arg3: string, arg4: string, arg5: string, arg6: string, arg7: boolean, arg8: boolean, arg9: SgrpStreamParams): unknown;

  clickInlineKeyboardButton (params: {
    guildId?: string,
    peerId: string,
    botAppid: string,
    msgSeq: string,
    buttonId: string,
    callback_data: string,
    dmFlag: number,
    chatType: number; // 1私聊 2群
  }): Promise<GeneralCallResult & { status: number, promptText: string, promptType: number, promptIcon: number; }>;

  setCurOnScreenMsg (arg: unknown): unknown;

  setCurOnScreenMsgForMsgEvent (peer: Peer, msgRegList: Map<string, Uint8Array>): void;

  getMiscData (key: string): unknown;

  setMiscData (key: string, value: string): unknown;

  getBookmarkData (key: string): unknown;

  setBookmarkData (key: string, value: string): unknown;

  sendShowInputStatusReq (ChatType: number, EventType: number, toUid: string): Promise<unknown>;

  queryCalendar (peer: Peer, msgTime: number): unknown;

  queryFirstMsgSeq (peer: Peer, msgTime: number): unknown;

  queryRoamCalendar (peer: Peer, msgTime: number): unknown;

  queryFirstRoamMsg (peer: Peer, msgTime: number): unknown;

  fetchLongMsg (peer: Peer, msgId: string): unknown;

  fetchLongMsgWithCb (peer: Peer, msgId: number): unknown;

  setIsStopKernelFetchLongMsg (arg: unknown): unknown;

  insertGameResultAsMsgToDb (arg: unknown): unknown;

  getMultiMsg (arg1: Peer, arg2: string, arg3: string): Promise<GeneralCallResult & {
    msgList: RawMessage[];
  }>;

  setDraft (arg1: Peer, arg2: Array<unknown>[]): unknown;

  getDraft (peer: Peer): unknown;

  deleteDraft (peer: Peer): unknown;

  getRecentHiddenSesionList (): unknown;

  setRecentHiddenSession (arg: unknown): unknown;

  delRecentHiddenSession (arg: unknown): unknown;

  getCurHiddenSession (): unknown;

  setCurHiddenSession (arg: unknown): unknown;

  setReplyDraft (arg1: Peer, arg2: string, arg3: Array<unknown>[]): unknown;

  getReplyDraft (arg1: Peer, arg2: string): unknown;

  deleteReplyDraft (arg1: Peer, arg2: string): unknown;

  getFirstUnreadAtMsg (peer: Peer): unknown;

  clearMsgRecords (peer: Peer): unknown;

  IsExistOldDb (): unknown;

  canImportOldDbMsg (): unknown;

  setPowerStatus (isPowerOn: boolean): unknown;

  canProcessDataMigration (): unknown;

  importOldDbMsg (): unknown;

  stopImportOldDbMsgAndroid (): unknown;

  isMqqDataImportFinished (): unknown;

  getMqqDataImportTableNames (): unknown;

  getCurChatImportStatusByUin (arg1: unknown, arg2: unknown): unknown;

  getDataImportUserLevel (): unknown;

  getMsgQRCode (): unknown;

  getGuestMsgAbstracts (arg: unknown): unknown;

  getGuestMsgByRange (arg: unknown): unknown;

  getGuestMsgAbstractByRange (arg: unknown): unknown;

  registerSysMsgNotification (arg1: number, arg2: string, arg3: Array<unknown>[]): unknown;

  unregisterSysMsgNotification (arg1: number, arg2: string, arg3: Array<unknown>[]): unknown;

  enterOrExitAio (arg: unknown): unknown;

  prepareTempChat (args: unknown): unknown;

  sendSsoCmdReqByContend (cmd: string, param: unknown): Promise<unknown>;

  getTempChatInfo (ChatType: number, Uid: string): Promise<TmpChatInfoApi>;

  setContactLocalTop (peer: Peer, isTop: boolean): unknown;

  switchAnonymousChat (arg1: string, arg2: boolean): unknown;

  renameAnonyChatNick (arg: unknown): unknown;

  getAnonymousInfo (peer: Peer): unknown;

  updateAnonymousInfo (peer: Peer, arg2: unknown): unknown;

  sendSummonMsg (peer: Peer, MsgElement: unknown, MsgAttributeInfo: unknown): Promise<unknown>;// 频道的东西

  outputGuildUnreadInfo (arg: unknown): unknown;

  checkMsgWithUrl (arg: unknown): unknown;

  checkTabListStatus (): unknown;

  getABatchOfContactMsgBoxInfo (arg: unknown): unknown;

  insertMsgToMsgBox (peer: Peer, msgId: string, arg: 2006): unknown;

  isHitEmojiKeyword (arg: unknown): unknown;

  getKeyWordRelatedEmoji (arg: unknown): unknown;

  recordEmoji (type: number, emojiList: Array<unknown>): unknown;

  fetchGetHitEmotionsByWord (args: unknown): Promise<unknown>;// 表情推荐？

  deleteAllRoamMsgs (arg1: number, arg2: string): unknown;// 漫游消息？

  packRedBag (arg: unknown): unknown;

  grabRedBag (arg: unknown): unknown;

  pullDetail (arg: unknown): unknown;

  selectPasswordRedBag (arg: unknown): unknown;

  pullRedBagPasswordList (): unknown;

  requestTianshuAdv (arg: unknown): unknown;

  tianshuReport (arg: unknown): unknown;

  tianshuMultiReport (arg: unknown): unknown;

  GetMsgSubType (a0: number, a1: number): unknown;

  setIKernelPublicAccountAdapter (arg: unknown): unknown;

  // tempChatGameSession有关
  createUidFromTinyId (fromTinyId: string, toTinyId: string): string;

  dataMigrationGetDataAvaiableContactList (): unknown;

  dataMigrationGetMsgList (arg1: unknown, arg2: unknown): unknown;

  dataMigrationStopOperation (arg: unknown): unknown;

  dataMigrationImportMsgPbRecord (DataMigrationMsgInfo: Array<{
    extensionData: string;// "Hex"
    extraData: string; // ""
    chatType: number;
    chatUin: string;
    msgType: number;
    msgTime: string;
    msgSeq: string;
    msgRandom: string;
  }>, DataMigrationResourceInfo: {
    extraData: string;
    filePath: string;
    fileSize: string;
    msgRandom: string;
    msgSeq: string;
    msgSubType: number;
    msgType: number;
  }): unknown;

  dataMigrationGetResourceLocalDestinyPath (arg: unknown): unknown;

  dataMigrationSetIOSPathPrefix (arg: unknown): unknown;

  getServiceAssistantSwitch (arg: unknown): unknown;

  setServiceAssistantSwitch (arg: unknown): unknown;

  setSubscribeFolderUsingSmallRedPoint (arg: unknown): unknown;

  clearGuildNoticeRedPoint (arg: unknown): unknown;

  clearFeedNoticeRedPoint (arg: unknown): unknown;

  clearFeedSquareRead (arg: unknown): unknown;

  IsC2CStyleChatType (chatType: unknown): unknown;

  IsTempChatType (uin: number): unknown;// 猜的

  getGuildInteractiveNotification (arg: unknown): unknown;

  getGuildNotificationAbstract (arg: unknown): unknown;

  setFocusOnBase (arg: unknown): unknown;

  queryArkInfo (arg: unknown): unknown;

  queryUserSecQuality (): unknown;

  getGuildMsgAbFlag (arg: unknown): unknown;

  getGroupMsgStorageTime (): unknown;
}
