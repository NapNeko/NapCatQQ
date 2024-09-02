import { FriendV2 } from '@/core/entities';
import { BuddyListReqType, InstanceContext, NapCatCore } from '@/core';
import { LimitedHashTable } from '@/common/message-unique';

export class NTQQFriendApi {
    context: InstanceContext;
    core: NapCatCore;

    // friends: Map<string, Friend> = new Map<string, FriendV2>();

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
        // if (!this.context.basicInfoWrapper.requireMinNTQQBuild('26702')) {
        //     this.getFriends(true);
        // }
    }

    async getBuddyV2SimpleInfoMap(refresh = false) {
        const buddyService = this.context.session.getBuddyService();
        const buddyListV2 = refresh ? await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL) : await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL);
        const uids = buddyListV2.data.flatMap(item => item.buddyUids);
        return await this.core.eventWrapper.callNoListenerEvent(
            'NodeIKernelProfileService/getCoreAndBaseInfo',
            'nodeStore',
            uids,
        );
    }

    async getBuddyV2(refresh = false): Promise<FriendV2[]> {
        return Array.from((await this.getBuddyV2SimpleInfoMap(refresh)).values());
    }

    async getBuddyIdMap(refresh = false): Promise<LimitedHashTable<string, string>> {
        const retMap: LimitedHashTable<string, string> = new LimitedHashTable<string, string>(5000);
        const data = await this.getBuddyV2SimpleInfoMap(refresh);
        data.forEach((value) => retMap.set(value.uin!, value.uid!));
        return retMap;
    }

    async getBuddyV2ExWithCate(refresh = false) {
        const categoryMap: Map<string, any> = new Map();
        const buddyService = this.context.session.getBuddyService();
        const buddyListV2 = refresh ? (await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL)).data : (await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL)).data;
        const uids = buddyListV2.flatMap(item => {
            item.buddyUids.forEach(uid => {
                categoryMap.set(uid, { categoryId: item.categoryId, categoryName: item.categroyName });
            });
            return item.buddyUids;
        });
        const data = await this.core.eventWrapper.callNoListenerEvent(
            'NodeIKernelProfileService/getCoreAndBaseInfo',
            'nodeStore',
            uids,
        );
        return buddyListV2.map(category => ({
            categoryId: category.categoryId,
            categorySortId: category.categorySortId,
            categoryName: category.categroyName,
            categoryMbCount: category.categroyMbCount,
            onlineCount: category.onlineCount,
            buddyList: category.buddyUids.map(uid => data.get(uid)!).filter(value => value),
        }));
    }

    async isBuddy(uid: string) {
        return this.context.session.getBuddyService().isBuddy(uid);
    }

    async clearBuddyReqUnreadCnt() {
        return this.context.session.getBuddyService().clearBuddyReqUnreadCnt();
    }

    async getBuddyReq() {
        const [, ret] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelBuddyService/getBuddyReq',
            'NodeIKernelBuddyListener/onBuddyReqChange',
            [],
        );
        return ret;
    }

    async handleFriendRequest(flag: string, accept: boolean) {
        const data = flag.split('|');
        if (data.length < 2) {
            return;
        }
        const friendUid = data[0];
        const reqTime = data[1];
        this.context.session.getBuddyService()?.approvalFriendRequest({
            friendUid: friendUid,
            reqTime: reqTime,
            accept,
        });
    }
}
