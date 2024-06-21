import { BuddyCategoryType, FriendRequestNotify } from '@/core/entities';
export type OnBuddyChangeParams = BuddyCategoryType[];
interface IBuddyListener {
    onBuddyListChange(arg: BuddyCategoryType[]): void;
    onBuddyInfoChange(arg: unknown): void;
    onBuddyDetailInfoChange(arg: unknown): void;
    onNickUpdated(arg: unknown): void;
    onBuddyRemarkUpdated(arg: unknown): void;
    onAvatarUrlUpdated(arg: unknown): void;
    onBuddyReqChange(arg: FriendRequestNotify): void;
    onBuddyReqUnreadCntChange(arg: unknown): void;
    onCheckBuddySettingResult(arg: unknown): void;
    onAddBuddyNeedVerify(arg: unknown): void;
    onSmartInfos(arg: unknown): void;
    onSpacePermissionInfos(arg: unknown): void;
    onDoubtBuddyReqChange(arg: unknown): void;
    onDoubtBuddyReqUnreadNumChange(arg: unknown): void;
    onBlockChanged(arg: unknown): void;
    onAddMeSettingChanged(arg: unknown): void;
    onDelBatchBuddyInfos(arg: unknown): void;
}
export interface NodeIKernelBuddyListener extends IBuddyListener {
    new (listener: IBuddyListener): NodeIKernelBuddyListener;
}
export declare class BuddyListener implements IBuddyListener {
    onAddBuddyNeedVerify(arg: unknown): void;
    onAddMeSettingChanged(arg: unknown): void;
    onAvatarUrlUpdated(arg: unknown): void;
    onBlockChanged(arg: unknown): void;
    onBuddyDetailInfoChange(arg: unknown): void;
    onBuddyInfoChange(arg: unknown): void;
    onBuddyListChange(arg: OnBuddyChangeParams): void;
    onBuddyRemarkUpdated(arg: unknown): void;
    onBuddyReqChange(arg: FriendRequestNotify): void;
    onBuddyReqUnreadCntChange(arg: unknown): void;
    onCheckBuddySettingResult(arg: unknown): void;
    onDelBatchBuddyInfos(arg: unknown): void;
    onDoubtBuddyReqChange(arg: unknown): void;
    onDoubtBuddyReqUnreadNumChange(arg: unknown): void;
    onNickUpdated(arg: unknown): void;
    onSmartInfos(arg: unknown): void;
    onSpacePermissionInfos(arg: unknown): void;
}
export {};
