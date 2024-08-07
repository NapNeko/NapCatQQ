import { Friend } from '@/core/entities';
import { GeneralCallResult } from '@/core/services/common';
import { NodeIKernelBuddyListener } from '@/core/listeners';
export enum BuddyListReqType {
  KNOMAL,
  KLETTER
}
export interface NodeIKernelBuddyService {
  // 26702 以上
  getBuddyListV2(callFrom: string, reqType: BuddyListReqType): Promise<GeneralCallResult & {
    data: Array<{
      categoryId: number,
      categorySortId: number,
      categroyName: string,
      categroyMbCount: number,
      onlineCount: number,
      buddyUids: Array<string>
    }>
  }>;
  //26702 以上
  getBuddyListFromCache(callFrom: string): Promise<Array<
    {
      categoryId: number,//9999应该跳过 那是兜底数据吧
      categorySortId: number,//排序方式
      categroyName: string,//分类名
      categroyMbCount: number,//不懂
      onlineCount: number,//在线数目
      buddyUids: Array<string>//Uids
    }>>;
  // 以下为原生方法
  addKernelBuddyListener(listener: NodeIKernelBuddyListener): number;

  getAllBuddyCount(): number;

  removeKernelBuddyListener(listener: unknown): void;

  /**
   * @deprecated
   * @param nocache 使用缓存
   */
  getBuddyList(nocache: boolean): Promise<GeneralCallResult>;

  getBuddyNick(uid: number): string;

  getBuddyRemark(uid: number): string;

  setBuddyRemark(uid: number, remark: string): void;

  getAvatarUrl(uid: number): string;

  isBuddy(uid: string): boolean;

  getCategoryNameWithUid(uid: number): string;

  getTargetBuddySetting(uid: number): unknown;

  getTargetBuddySettingByType(uid: number, type: number): unknown;

  getBuddyReqUnreadCnt(): number;

  getBuddyReq(): unknown;

  delBuddyReq(uid: number): void;

  clearBuddyReqUnreadCnt(): void;

  reqToAddFriends(uid: number, msg: string): void;

  setSpacePermission(uid: number, permission: number): void;

  approvalFriendRequest(arg: {
    friendUid: string;
    reqTime: string;
    accept: boolean;
  }): Promise<void>;

  delBuddy(uid: number): void;

  delBatchBuddy(uids: number[]): void;

  getSmartInfos(uid: number): unknown;

  setBuddyCategory(uid: number, category: number): void;

  setBatchBuddyCategory(uids: number[], category: number): void;

  addCategory(category: string): void;

  delCategory(category: string): void;

  renameCategory(oldCategory: string, newCategory: string): void;

  resortCategory(categorys: string[]): void;

  pullCategory(uid: number, category: string): void;

  setTop(uid: number, isTop: boolean): void;

  SetSpecialCare(uid: number, isSpecialCare: boolean): void;

  setMsgNotify(uid: number, isNotify: boolean): void;

  hasBuddyList(): boolean;

  setBlock(uid: number, isBlock: boolean): void;

  isBlocked(uid: number): boolean;

  modifyAddMeSetting(setting: unknown): void;

  getAddMeSetting(): unknown;

  getDoubtBuddyReq(): unknown;

  getDoubtBuddyUnreadNum(): number;

  approvalDoubtBuddyReq(uid: number, isAgree: boolean): void;

  delDoubtBuddyReq(uid: number): void;

  delAllDoubtBuddyReq(): void;

  reportDoubtBuddyReqUnread(): void;

  getBuddyRecommendContactArkJson(uid: string, phoneNumber: string): Promise<unknown>;

  isNull(): boolean;
}
