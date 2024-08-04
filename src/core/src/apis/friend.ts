import { FriendRequest, User } from '@/core/entities';
import { BuddyListReqType, napCatCore, NodeIKernelBuddyListener, OnBuddyChangeParams } from '@/core';
import { NTEventDispatch } from '@/common/utils/EventTask';

export class NTQQFriendApi {
  static async getBuddyV2(refresh = false) {
    // NTEventDispatch.RegisterListen<NodeIKernelBuddyListener['onBuddyListChange']>('NodeIKernelBuddyListener/onBuddyListChange', 1, 5000, (arg: OnBuddyChangeParams) => {
    //   console.log(arg);
    //   return true;
    // }).catch().then();
    if (!refresh) {
      return await napCatCore.session.getBuddyService().getBuddyListFromCache('0');
    }
    return (await (napCatCore.session.getBuddyService().getBuddyListV2('0', BuddyListReqType.KNOMAL))).data;
  }
  static async isBuddy(uid: string) {
    return napCatCore.session.getBuddyService().isBuddy(uid);
  }
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
