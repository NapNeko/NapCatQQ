import type { FriendV2, User } from '@/core/entities';
import { BuddyListReqType, NodeIKernelProfileService, OnBuddyChangeParams } from '@/core';
import { LimitedHashTable } from '@/common/utils/MessageUnique';
import { CacheClassFuncAsyncExtend } from '@/common/utils/helper';
import { ApiContext } from '../session';

export class NTQQFriendApi {
  private context: ApiContext;
  constructor(context: ApiContext) {
    this.context = context;
  }
  async getBuddyV2(refresh = false): Promise<FriendV2[]> {
    let uids: string[] = [];
    const buddyService = this.context.core.session.getBuddyService();
    const buddyListV2 = refresh ? await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL) : await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL);
    uids.push(...buddyListV2.data.flatMap(item => item.buddyUids));
    const data = await this.context.event.CallNoListenerEvent<NodeIKernelProfileService['getCoreAndBaseInfo']>(
      'NodeIKernelProfileService/getCoreAndBaseInfo', 5000, 'nodeStore', uids
    );
    return Array.from(data.values());
  }
  @CacheClassFuncAsyncExtend(3600 * 1000, 'getBuddyIdMap', () => true)
  async getBuddyIdMapCache(refresh = false): Promise<LimitedHashTable<string, string>> {
    return await this.getBuddyIdMap(refresh);
  }
  async getBuddyIdMap(refresh = false): Promise<LimitedHashTable<string, string>> {
    let uids: string[] = [];
    let retMap: LimitedHashTable<string, string> = new LimitedHashTable<string, string>(5000);
    const buddyService = this.context.core.session.getBuddyService();
    const buddyListV2 = refresh ? await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL) : await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL);
    uids.push(...buddyListV2.data.flatMap(item => item.buddyUids));
    const data = await this.context.event.CallNoListenerEvent<NodeIKernelProfileService['getCoreAndBaseInfo']>(
      'NodeIKernelProfileService/getCoreAndBaseInfo', 5000, 'nodeStore', uids
    );
    data.forEach((value, key) => {
      retMap.set(value.uin!, value.uid!);
    });
    //console.log('getBuddyIdMap', retMap.getValue);
    return retMap;
  }
  async getBuddyV2ExWithCate(refresh = false) {
    let uids: string[] = [];
    let categoryMap: Map<string, any> = new Map();
    const buddyService = this.context.core.session.getBuddyService();
    const buddyListV2 = refresh ? (await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL)).data : (await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL)).data;
    uids.push(
      ...buddyListV2.flatMap(item => {
        item.buddyUids.forEach(uid => {
          categoryMap.set(uid, { categoryId: item.categoryId, categroyName: item.categroyName });
        });
        return item.buddyUids
      }));
    const data = await this.context.event.CallNoListenerEvent<NodeIKernelProfileService['getCoreAndBaseInfo']>(
      'NodeIKernelProfileService/getCoreAndBaseInfo', 5000, 'nodeStore', uids
    );
    return Array.from(data).map(([key, value]) => {
      const category = categoryMap.get(key);
      return category ? { ...value, categoryId: category.categoryId, categroyName: category.categroyName } : value;
    });
  }
  async isBuddy(uid: string) {
    return this.context.core.session.getBuddyService().isBuddy(uid);
  }
  /**
   * @deprecated
   * @param forced 
   * @returns 
   */
  async getFriends(forced = false): Promise<User[]> {
    let [_retData, _BuddyArg] = await this.context.event.CallNormalEvent
      <(force: boolean) => Promise<any>, (arg: OnBuddyChangeParams) => void>
      (
        'NodeIKernelBuddyService/getBuddyList',
        'NodeIKernelBuddyListener/onBuddyListChange',
        1,
        5000,
        () => true,
        forced
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
    let data = flag.split('|');
    if (data.length < 2) {
      return;
    }
    let friendUid = data[0];
    let reqTime = data[1];
    this.context.core.session.getBuddyService()?.approvalFriendRequest({
      friendUid: friendUid,
      reqTime: reqTime,
      accept
    });
  }
}
