import { AnyCnameRecord } from 'node:dns';
import { BizKey, ModifyProfileParams, NodeIKernelProfileListener, SimpleInfo, UserDetailInfoByUinV2 } from '@/core';
import { GeneralCallResult } from '@/core/services/common';

export interface NodeIKernelProfileService {

    getUidByUin(callfrom: string, uin: Array<string>): Promise<Map<string, string>>;

    getUinByUid(callfrom: string, uid: Array<string>): Promise<Map<string, string>>;

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

    modifySelfProfile(...args: unknown[]): Promise<unknown>;

    modifyDesktopMiniProfile(param: ModifyProfileParams): Promise<GeneralCallResult>;

    setNickName(nickName: string): Promise<unknown>;

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

    setdisableEmojiShortCuts(...args: unknown[]): unknown;

    getProfileQzonePicInfo(uid: string, type: number, force: boolean): Promise<unknown>;

    // UserRemarkServiceImpl::getStrangerRemarkByUid []
    getCoreInfo(sceneId: string, arg: any[]): unknown;

    isNull(): boolean;
}
