import { FriendRequest, SimpleInfo, User } from '@/core/entities';
import { BuddyListReqType, napCatCore, NodeIKernelBuddyListener, NodeIKernelProfileService, OnBuddyChangeParams } from '@/core';
import { NTEventDispatch } from '@/common/utils/EventTask';

export class NTQQFriendApi {
  static async getBuddyV2(refresh = false): Promise<SimpleInfo[]> {
    // NTEventDispatch.RegisterListen<NodeIKernelBuddyListener['onBuddyListChange']>('NodeIKernelBuddyListener/onBuddyListChange', 1, 5000, (arg: OnBuddyChangeParams) => {
    //   console.log(arg);
    //   return true;
    // }).catch().then();
    let uids: string[];
    if (!refresh) {
      uids = (await napCatCore.session.getBuddyService().getBuddyListFromCache('0')).flatMap((item) => item.buddyUids);
    }
    uids = (await (napCatCore.session.getBuddyService().getBuddyListV2('0', BuddyListReqType.KNOMAL))).data.flatMap((item) => item.buddyUids);
    let data = await NTEventDispatch.CallNoListenerEvent<NodeIKernelProfileService['getCoreAndBaseInfo']>('NodeIKernelProfileService/getCoreAndBaseInfo', 5000, 'nodeStore', uids);
    //遍历data
    let retArr = Array.from(data.values());
    return retArr;
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
