import { BuddyCategoryType, FriendRequestNotify } from '@/core/types';

export type OnBuddyChangeParams = BuddyCategoryType[];

export class NodeIKernelBuddyListener {
    onBuddyListChangedV2(arg: unknown): any {
    }

    onAddBuddyNeedVerify(arg: unknown): any {
    }

    onAddMeSettingChanged(arg: unknown): any {
    }

    onAvatarUrlUpdated(arg: unknown): any {
    }

    onBlockChanged(arg: unknown): any {
    }

    onBuddyDetailInfoChange(arg: unknown): any {
    }

    onBuddyInfoChange(arg: unknown): any {
    }

    onBuddyListChange(arg: OnBuddyChangeParams): any {
    }

    onBuddyRemarkUpdated(arg: unknown): any {
    }

    onBuddyReqChange(arg: FriendRequestNotify): any {
    }

    onBuddyReqUnreadCntChange(arg: unknown): any {
    }

    onCheckBuddySettingResult(arg: unknown): any {
    }

    onDelBatchBuddyInfos(arg: unknown): any {
    }

    onDoubtBuddyReqChange(arg: unknown): any {
    }

    onDoubtBuddyReqUnreadNumChange(arg: unknown): any {
    }

    onNickUpdated(arg: unknown): any {
    }

    onSmartInfos(arg: unknown): any {
    }

    onSpacePermissionInfos(arg: unknown): any {
    }
}
