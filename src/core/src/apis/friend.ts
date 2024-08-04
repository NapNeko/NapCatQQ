import { FriendRequest, FriendV2, SimpleInfo, User } from '@/core/entities';
import { BuddyListReqType, napCatCore, NodeIKernelBuddyListener, NodeIKernelProfileService, OnBuddyChangeParams } from '@/core';
import { NTEventDispatch } from '@/common/utils/EventTask';

export class NTQQFriendApi {
  static async getBuddyV2(refresh = false): Promise<FriendV2[]> {
    let uids: string[] = [];
    const buddyService = napCatCore.session.getBuddyService();
    const buddyListV2 = refresh ? await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL) : await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL);
    uids.push(...buddyListV2.data.flatMap(item => item.buddyUids));
    const data = await NTEventDispatch.CallNoListenerEvent<NodeIKernelProfileService['getCoreAndBaseInfo']>(
      'NodeIKernelProfileService/getCoreAndBaseInfo', 5000, 'nodeStore', uids
    );
    return Array.from(data.values());
  }
  static async getBuddyV2ExWithCate(refresh = false) {
    let uids: string[] = [];
    let categoryMap: Map<string, any> = new Map();
    const buddyService = napCatCore.session.getBuddyService();
    const buddyListV2 = refresh ? (await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL)).data : (await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL)).data;
    uids.push(
      ...buddyListV2.flatMap(item => {
        item.buddyUids.forEach(uid => {
          categoryMap.set(uid, { categoryId: item.categoryId, categroyName: item.categroyName });
        });
        return item.buddyUids
      }));
    const data = await NTEventDispatch.CallNoListenerEvent<NodeIKernelProfileService['getCoreAndBaseInfo']>(
      'NodeIKernelProfileService/getCoreAndBaseInfo', 5000, 'nodeStore', uids
    );
    return Array.from(data).map(([key, value]) => {
      const category = categoryMap.get(key);
      return category ? { ...value, categoryId: category.categoryId, categroyName: category.categroyName } : value;
    });
  }
  static async isBuddy(uid: string) {
    return napCatCore.session.getBuddyService().isBuddy(uid);
  }
  /**
   * @deprecated
   * @param forced 
   * @returns 
   */
  static async getFriends(forced = false): Promise<User[]> {
    let [_retData, _BuddyArg] = await NTEventDispatch.CallNormalEvent
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

  static async handleFriendRequest(flag: string, accept: boolean) {
    let data = flag.split('|');
    if (data.length < 2) {
      return;
    }
    let friendUid = data[0];
    let reqTime = data[1];
    napCatCore.session.getBuddyService()?.approvalFriendRequest({
      friendUid: friendUid,
      reqTime: reqTime,
      accept
    });
  }
}
