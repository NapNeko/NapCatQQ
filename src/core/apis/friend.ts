import { Friend, FriendV2, User } from '@/core/entities';
import { BuddyListReqType, InstanceContext, NapCatCore, NodeIKernelProfileService, OnBuddyChangeParams } from '@/core';
import { LimitedHashTable } from '@/common/utils/MessageUnique';

export class NTQQFriendApi {
    context: InstanceContext;
    core: NapCatCore;
    //friends: Map<string, Friend> = new Map<string, FriendV2>();

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
    }

    async getBuddyV2(refresh = false): Promise<FriendV2[]> {
        const uids: string[] = [];
        const buddyService = this.context.session.getBuddyService();
        const buddyListV2 = refresh ? await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL) : await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL);
        uids.push(...buddyListV2.data.flatMap(item => item.buddyUids));
        const data = await this.core.eventWrapper.callNoListenerEvent<NodeIKernelProfileService['getCoreAndBaseInfo']>(
            'NodeIKernelProfileService/getCoreAndBaseInfo', 5000, 'nodeStore', uids,
        );
        return Array.from(data.values());
    }

    async getBuddyIdMapCache(refresh = false): Promise<LimitedHashTable<string, string>> {
        return await this.getBuddyIdMap(refresh);
    }

    async getBuddyIdMap(refresh = false): Promise<LimitedHashTable<string, string>> {
        const uids: string[] = [];
        const retMap: LimitedHashTable<string, string> = new LimitedHashTable<string, string>(5000);
        const buddyService = this.context.session.getBuddyService();
        const buddyListV2 = refresh ? await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL) : await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL);
        uids.push(...buddyListV2.data.flatMap(item => item.buddyUids));
        const data = await this.core.eventWrapper.callNoListenerEvent<NodeIKernelProfileService['getCoreAndBaseInfo']>(
            'NodeIKernelProfileService/getCoreAndBaseInfo', 5000, 'nodeStore', uids,
        );
        data.forEach((value, key) => {
            retMap.set(value.uin!, value.uid!);
        });
        //console.log('getBuddyIdMap', retMap.getValue);
        return retMap;
    }

    async getBuddyV2ExWithCate(refresh = false) {
        const uids: string[] = [];
        const categoryMap: Map<string, any> = new Map();
        const buddyService = this.context.session.getBuddyService();
        const buddyListV2 = refresh ? (await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL)).data : (await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL)).data;
        uids.push(
            ...buddyListV2.flatMap(item => {
                item.buddyUids.forEach(uid => {
                    categoryMap.set(uid, { categoryId: item.categoryId, categroyName: item.categroyName });
                });
                return item.buddyUids;
            }));
        const data = await this.core.eventWrapper.callNoListenerEvent<NodeIKernelProfileService['getCoreAndBaseInfo']>(
            'NodeIKernelProfileService/getCoreAndBaseInfo', 5000, 'nodeStore', uids,
        );
        return Array.from(data).map(([key, value]) => {
            const category = categoryMap.get(key);
            return category ? {
                ...value,
                categoryId: category.categoryId,
                categroyName: category.categroyName,
            } : value;
        });
    }

    async isBuddy(uid: string) {
        return this.context.session.getBuddyService().isBuddy(uid);
    }

    /**
     * @deprecated
     * @param forced
     * @returns
     */
    async getFriends(forced = false): Promise<User[]> {
        const [_retData, _BuddyArg] = await this.core.eventWrapper.CallNormalEvent<(force: boolean) => Promise<any>, (arg: OnBuddyChangeParams) => void>
            (
            'NodeIKernelBuddyService/getBuddyList',
            'NodeIKernelBuddyListener/onBuddyListChange',
            1,
            5000,
            () => true,
            forced,
            );
        const friends: User[] = [];
        for (const categoryItem of _BuddyArg) {
            for (const friend of categoryItem.buddyList) {
                friends.push(friend);
            }
        }
        return friends;
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
