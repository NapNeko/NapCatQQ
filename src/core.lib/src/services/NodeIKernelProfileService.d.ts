/// <reference types="node" />
import { AnyCnameRecord } from 'node:dns';
import { BizKey, ModifyProfileParams, UserDetailInfoByUin } from '../entities';
import { NodeIKernelProfileListener } from '../listeners';
import { GeneralCallResult } from '@/core/services/common';
export interface NodeIKernelProfileService {
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
    setNickName(NickName: string): Promise<unknown>;
    setLongNick(longNick: string): Promise<unknown>;
    setBirthday(...args: unknown[]): Promise<unknown>;
    setGander(...args: unknown[]): Promise<unknown>;
    setHeader(arg: string): Promise<unknown>;
    setRecommendImgFlag(...args: unknown[]): Promise<unknown>;
    getUserSimpleInfo(force: boolean, uids: string[]): Promise<unknown>;
    getUserDetailInfo(uid: string): Promise<unknown>;
    getUserDetailInfoWithBizInfo(uid: string, Biz: BizKey[]): Promise<GeneralCallResult>;
    getUserDetailInfoByUin(uin: string): Promise<UserDetailInfoByUin>;
    getZplanAvatarInfos(args: string[]): Promise<unknown>;
    getStatus(uid: string): Promise<unknown>;
    startStatusPolling(isForceReset: boolean): Promise<unknown>;
    getSelfStatus(): Promise<unknown>;
    setdisableEmojiShortCuts(...args: unknown[]): unknown;
    getProfileQzonePicInfo(uid: string, type: number, force: boolean): Promise<unknown>;
    getCoreInfo(name: string, arg: any[]): unknown;
    isNull(): boolean;
}
