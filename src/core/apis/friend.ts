import { FriendRequest, FriendV2 } from '@/core/types';
import { BuddyListReqType, InstanceContext, NapCatCore } from '@/core';
import { LimitedHashTable } from '@/common/message-unique';

export class NTQQFriendApi {
    context: InstanceContext;
    core: NapCatCore;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
    }
    async setBuddyRemark(uid: string, remark: string) {
        return this.context.session.getBuddyService().setBuddyRemark({ uid, remark });
    }
    async getBuddyV2SimpleInfoMap() {
        const buddyService = this.context.session.getBuddyService();
        const buddyListV2 = await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL);
        const uids = buddyListV2.data.flatMap(item => item.buddyUids);
        return await this.core.eventWrapper.callNoListenerEvent(
            'NodeIKernelProfileService/getCoreAndBaseInfo',
            'nodeStore',
            uids,
        );
    }

    async getBuddy(): Promise<FriendV2[]> {
        return Array.from((await this.getBuddyV2SimpleInfoMap()).values());
    }

    async getBuddyIdMap(): Promise<LimitedHashTable<string, string>> {
        const retMap: LimitedHashTable<string, string> = new LimitedHashTable<string, string>(5000);
        const data = await this.getBuddyV2SimpleInfoMap();
        data.forEach((value) => retMap.set(value.uin!, value.uid!));
        return retMap;
    }
    async delBuudy(uid: string, tempBlock = false, tempBothDel = false) {
        return this.context.session.getBuddyService().delBuddy({
            friendUid: uid,
            tempBlock: tempBlock,
            tempBothDel: tempBothDel
        });
    }
    async getBuddyV2ExWithCate() {
        const buddyService = this.context.session.getBuddyService();
        const buddyListV2 = (await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL)).data;
        const uids = buddyListV2.flatMap(item => {
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
            buddyList: category.buddyUids.map(uid => data.get(uid)).filter(value => !!value),
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

    async handleFriendRequest(notify: FriendRequest, accept: boolean) {
        this.context.session.getBuddyService()?.approvalFriendRequest({
            friendUid: notify.friendUid,
            reqTime: notify.reqTime,
            accept,
        });
    }
    async handleDoubtFriendRequest(friendUid: string, str1: string = '', str2: string = '') {
        this.context.session.getBuddyService().approvalDoubtBuddyReq(friendUid, str1, str2);
    }
    async getDoubtFriendRequest(count: number) {
        let date = Date.now().toString();
        const [, ret] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelBuddyService/getDoubtBuddyReq',
            'NodeIKernelBuddyListener/onDoubtBuddyReqChange',
            [date, count, ''],
            () => true,
            (data) => data.reqId === date
        );
        let requests = Promise.all(ret.doubtList.map(async (item) => {
            return {
                flag: item.uid, //注意强制String 非isNumeric 不遵守则不符合设计
                uin: await this.core.apis.UserApi.getUinByUidV2(item.uid) ?? 0,// 信息字段
                nick: item.nick, // 信息字段 这个不是nickname 可能是来源的群内的昵称
                source: item.source, // 信息字段
                reason: item.reason, // 信息字段
                msg: item.msg, // 信息字段
                group_code: item.groupCode, // 信息字段
                time: item.reqTime, // 信息字段
                type: 'doubt' //保留字段
            };
        }))
        return requests;
    }
}
