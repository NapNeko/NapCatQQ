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
        console.log('onDelBatchBuddyInfos not implemented', ...arguments);
    }

    onDoubtBuddyReqChange(_arg:
        {
            reqId: string;
            cookie: string;
            doubtList: Array<{
                uid: string;
                nick: string;
                age: number,
                sex: number;
                commFriendNum: number;
                reqTime: string;
                msg: string;
                source: string;
                reason: string;
                groupCode: string;
                nameMore?: null;
            }>;
        }): void | Promise<void> {
    }

    onDoubtBuddyReqUnreadNumChange(_num: number): void | Promise<void> {
    }

    onNickUpdated(arg: unknown): any {
    }

    onSmartInfos(arg: unknown): any {
    }

    onSpacePermissionInfos(arg: unknown): any {
    }
}
