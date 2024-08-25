import { BuddyCategoryType, FriendRequestNotify } from '@/core/entities';

export type OnBuddyChangeParams = BuddyCategoryType[];

export class NodeIKernelBuddyListener {
    onBuddyListChangedV2(arg: unknown): void {
    }

    onAddBuddyNeedVerify(arg: unknown) {
    }

    onAddMeSettingChanged(arg: unknown) {
    }

    onAvatarUrlUpdated(arg: unknown) {
    }

    onBlockChanged(arg: unknown) {
    }

    onBuddyDetailInfoChange(arg: unknown) {
    }

    onBuddyInfoChange(arg: unknown) {
    }

    onBuddyListChange(arg: OnBuddyChangeParams): void {
    }

    onBuddyRemarkUpdated(arg: unknown): void {
    }

    onBuddyReqChange(arg: FriendRequestNotify): void {
    }

    onBuddyReqUnreadCntChange(arg: unknown): void {
    }

    onCheckBuddySettingResult(arg: unknown): void {
    }

    onDelBatchBuddyInfos(arg: unknown): void {
    }

    onDoubtBuddyReqChange(arg: unknown): void {
    }

    onDoubtBuddyReqUnreadNumChange(arg: unknown): void {
    }

    onNickUpdated(arg: unknown): void {
    }

    onSmartInfos(arg: unknown): void {
    }

    onSpacePermissionInfos(arg: unknown): void {
    }
}
