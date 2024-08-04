import { FriendRequest, FriendV2, SimpleInfo, User } from '@/core/entities';
import { BuddyListReqType, napCatCore, NodeIKernelBuddyListener, NodeIKernelProfileService, OnBuddyChangeParams } from '@/core';
import { NTEventDispatch } from '@/common/utils/EventTask';

export class NTQQFriendApi {
  static async getBuddyV2(refresh = false): Promise<FriendV2[]> {
    let uids: string[];
    let categoryMap: Map<string, any> = new Map();
    if (!refresh) {
      uids = (await napCatCore.session.getBuddyService().getBuddyListFromCache('0')).flatMap((item) => {
        for (let i = 0; i < item.buddyUids.length; i++) {
          categoryMap.set(item.buddyUids[i], { categoryId: item.categoryId, categroyName: item.categroyName });
        }
        return item.buddyUids;
      });
    }
    uids = (await (napCatCore.session.getBuddyService().getBuddyListV2('0', BuddyListReqType.KNOMAL))).data.flatMap((item) => item.buddyUids);
    let data = await NTEventDispatch.CallNoListenerEvent<NodeIKernelProfileService['getCoreAndBaseInfo']>('NodeIKernelProfileService/getCoreAndBaseInfo', 5000, 'nodeStore', uids);
    //遍历data
    let retArr: FriendV2[] = [];
    data.forEach((value, key) => {
      let category = categoryMap.get(key);
      if (category) {
        retArr.push({
          ...value,
          categoryId: category.categoryId,
          categroyName: category.categroyName
        });
      }
    })
    return retArr;
  }
  static async getBuddyV2Ex(refresh = false): Promise<FriendV2[]> {
    let uids: string[] = [];
    let categoryMap: Map<string, any> = new Map();

    const buddyService = napCatCore.session.getBuddyService();

    if (!refresh) {
        const cachedBuddyList = await buddyService.getBuddyListFromCache('0');
        cachedBuddyList.forEach(item => {
            item.buddyUids.forEach(uid => {
                categoryMap.set(uid, { categoryId: item.categoryId, categroyName: item.categroyName });
            });
            uids.push(...item.buddyUids);
        });
    }

    const buddyListV2 = await buddyService.getBuddyListV2('0', BuddyListReqType.KNOMAL);
    uids.push(...buddyListV2.data.flatMap(item => item.buddyUids));

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
