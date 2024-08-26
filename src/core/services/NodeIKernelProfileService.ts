import { AnyCnameRecord } from 'node:dns';
import { BizKey, ModifyProfileParams, SimpleInfo, UserDetailInfoByUin, UserDetailInfoByUinV2 } from '@/core';
import { NodeIKernelProfileListener } from '@/core';
import { GeneralCallResult } from '@/core/services/common';

export enum UserDetailSource {
    KDB,
    KSERVER
}

export enum ProfileBizType {
    KALL,
    KBASEEXTEND,
    KVAS,
    KQZONE,
    KOTHER
}

export interface NodeIKernelProfileService {

    getUidByUin(callfrom: string, uin: Array<string>): Promise<Map<string, string>>;//uin->uid

    getUinByUid(callfrom: string, uid: Array<string>): Promise<Map<string, string>>;

    // {
    //   coreInfo: CoreInfo,
    //   baseInfo: BaseInfo,
    //   status: null,
    //   vasInfo: null,
    //   relationFlags: null,
    //   otherFlags: null,
    //   intimate: null
    // }
    getCoreAndBaseInfo(callfrom: string, uids: string[]): Promise<Map<string, SimpleInfo>>;

    fetchUserDetailInfo(trace: string, uids: string[], arg2: number, arg3: number[]): Promise<unknown>;

    addKernelProfileListener(listener: NodeIKernelProfileListener): number;

    removeKernelProfileListener(listenerId: number): void;

    prepareRegionConfig(...args: unknown[]): unknown;

    getLocalStrangerRemark(): Promise<AnyCnameRecord>;

    enumCountryOptions(): Array<string>;

    enumProvinceOptions(Country: string): Array<string>;

    enumCityOptions(Country: string, Province: string): unknown;

    enumAreaOptions(...args: unknown[]): unknown;

    //SimpleInfo
    // this.uid = "";
    // this.uid = str;
    // this.uin = j2;
    // this.isBuddy = z;
    // this.coreInfo = coreInfo;
    // this.baseInfo = baseInfo;
    // this.status = statusInfo;
    // this.vasInfo = vasInfo;
    // this.relationFlags = relationFlag;
    // this.otherFlags = otherFlag;
    // this.intimate = intimate;

    modifySelfProfile(...args: unknown[]): Promise<unknown>;

    modifyDesktopMiniProfile(param: ModifyProfileParams): Promise<GeneralCallResult>;

    setNickName(NickName: string): Promise<unknown>;

    setLongNick(longNick: string): Promise<unknown>;

    setBirthday(...args: unknown[]): Promise<unknown>;

    setGander(...args: unknown[]): Promise<unknown>;

    setHeader(arg: string): Promise<unknown>;

    setRecommendImgFlag(...args: unknown[]): Promise<unknown>;

    getUserSimpleInfo(force: boolean, uids: string[]): Promise<unknown>;

    getUserDetailInfo(uid: string): Promise<unknown>;

    getUserDetailInfoWithBizInfo(uid: string, Biz: BizKey[]): Promise<GeneralCallResult>;

    getUserDetailInfoByUin(uin: string): Promise<UserDetailInfoByUinV2>;

    getZplanAvatarInfos(args: string[]): Promise<unknown>;

    getStatus(uid: string): Promise<unknown>;

    startStatusPolling(isForceReset: boolean): Promise<unknown>;

    getSelfStatus(): Promise<unknown>;

    //
    setdisableEmojiShortCuts(...args: unknown[]): unknown;

    getProfileQzonePicInfo(uid: string, type: number, force: boolean): Promise<unknown>;

    //profileService.getCoreInfo("UserRemarkServiceImpl::getStrangerRemarkByUid", arrayList);
    getCoreInfo(name: string, arg: any[]): unknown;

    //m429253e12.getOtherFlag("FriendListInfoCache_getKernelDataAndPutCache", new ArrayList<>());
    isNull(): boolean;
}
