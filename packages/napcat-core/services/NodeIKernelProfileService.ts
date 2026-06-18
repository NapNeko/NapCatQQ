import { AnyCnameRecord } from 'node:dns';
import { BizKey, ModifyProfileParams, NodeIKernelProfileListener, ProfileBizType, SimpleInfo, UserDetailInfoByUin, UserDetailInfoListenerArg, UserDetailSource } from '@/napcat-core/index';
import { GeneralCallResult } from '@/napcat-core/services/common';

export interface NodeIKernelProfileService {
  getOtherFlag (callfrom: string, uids: string[]): Promise<Map<string, unknown>>;

  getVasInfo (callfrom: string, uids: string[]): Promise<Map<string, unknown>>;

  getRelationFlag (callfrom: string, uids: string[]): Promise<Map<string, unknown>>;

  getUidByUin (callfrom: string, uin: Array<string>): Map<string, string>;

  getUinByUid (callfrom: string, uid: Array<string>): Map<string, string>;

  getCoreAndBaseInfo (callfrom: string, uids: string[]): Promise<Map<string, SimpleInfo>>;

  fetchUserDetailInfo (trace: string, uids: string[], source: UserDetailSource, bizType: ProfileBizType[]): Promise<GeneralCallResult &
  {
    source: UserDetailSource,
    // uid -> detail
    detail: Map<string, UserDetailInfoListenerArg>,
  }
  >;

  addKernelProfileListener (listener: NodeIKernelProfileListener): number;

  removeKernelProfileListener (listenerId: number): void;

  prepareRegionConfig (): unknown;

  getLocalStrangerRemark (): Promise<AnyCnameRecord>;

  enumCountryOptions (): Array<string>;

  enumProvinceOptions (country: string): Array<string>;

  enumCityOptions (country: string, province: string): unknown;

  enumAreaOptions (arg1: string, arg2: string, arg3: string): unknown;

  modifySelfProfile (param: unknown): Promise<unknown>;

  modifyDesktopMiniProfile (param: ModifyProfileParams): Promise<GeneralCallResult>;

  setNickName (nickName: string): Promise<unknown>;

  setLongNick (longNick: string): Promise<unknown>;

  setBirthday (year: number, month: number, day: number): Promise<unknown>;

  setGander (gender: unknown): Promise<unknown>;

  setHeader (arg: string): Promise<GeneralCallResult>;

  setRecommendImgFlag (flag: unknown): Promise<unknown>;

  getUserSimpleInfo (force: boolean, uids: string[]): Promise<unknown>;

  getUserDetailInfo (uid: string): Promise<unknown>;

  getUserDetailInfoWithBizInfo (uid: string, Biz: BizKey[]): Promise<GeneralCallResult>;

  getUserDetailInfoByUin (uin: string): Promise<UserDetailInfoByUin>;

  getZplanAvatarInfos (args: string[]): Promise<unknown>;

  getStatus (uid: string): Promise<unknown>;

  startStatusPolling (isForceReset: boolean): Promise<unknown>;

  getSelfStatus (): Promise<unknown>;

  setdisableEmojiShortCuts (arg: unknown): unknown;

  getProfileQzonePicInfo (uid: string, type: number, force: boolean): Promise<unknown>;

  // UserRemarkServiceImpl::getStrangerRemarkByUid []
  getCoreInfo (sceneId: string, arg: unknown[]): unknown;

  isNull (): boolean;

  addKernelProfileListenerForUICache (listener: unknown): number;

  asyncGetCoreInfo (callfrom: string, uids: string[]): unknown;

  getIntimate (uid: string, arg: unknown): unknown;

  getStatusInfo (uid: string, arg: unknown): unknown;

  getStockLocalData (key: string, arg: unknown): unknown;

  updateProfileData (uid: string, data: unknown): unknown;

  updateStockLocalData (key: string, data: unknown): unknown;
}
