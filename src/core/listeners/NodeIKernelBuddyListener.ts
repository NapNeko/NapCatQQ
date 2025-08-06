import { BuddyCategoryType, FriendRequestNotify } from '@/core/types';

export type OnBuddyChangeParams = BuddyCategoryType[];

export class NodeIKernelBuddyListener {
    onBuddyListChangedV2(_arg: unknown): any {
    }

    onAddBuddyNeedVerify(_arg: unknown): any {
    }

    onAddMeSettingChanged(_arg: unknown): any {
    }

    onAvatarUrlUpdated(_arg: unknown): any {
    }

    onBlockChanged(_arg: unknown): any {
    }

    onBuddyDetailInfoChange(_arg: unknown): any {
    }

    onBuddyInfoChange(_arg: unknown): any {
    }

    onBuddyListChange(_arg: OnBuddyChangeParams): any {
    }

    onBuddyRemarkUpdated(_arg: unknown): any {
    }

    onBuddyReqChange(_arg: FriendRequestNotify): any {
    }

    onBuddyReqUnreadCntChange(_arg: unknown): any {
    }

    onCheckBuddySettingResult(_arg: unknown): any {
    }

    onDelBatchBuddyInfos(_arg: unknown): any {
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

    onNickUpdated(_arg: unknown): any {
    }

    onSmartInfos(_arg: unknown): any {
    }

    onSpacePermissionInfos(_arg: unknown): any {
    }
}
