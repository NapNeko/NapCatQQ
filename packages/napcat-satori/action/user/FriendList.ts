import { SatoriAction } from '../SatoriAction';
import { SatoriUser, SatoriPageResult } from '../../types';

interface FriendListPayload {
  next?: string;
}

export class FriendListAction extends SatoriAction<FriendListPayload, SatoriPageResult<SatoriUser>> {
  actionName = 'friend.list';

  async handle (_payload: FriendListPayload): Promise<SatoriPageResult<SatoriUser>> {
    const friends = await this.core.apis.FriendApi.getBuddy();

    const friendList: SatoriUser[] = friends.map((friend) => ({
      id: friend.uin || '',
      name: friend.coreInfo?.nick || '',
      nick: friend.coreInfo?.remark || friend.coreInfo?.nick || '',
      avatar: `https://q1.qlogo.cn/g?b=qq&nk=${friend.uin}&s=640`,
    }));

    return {
      data: friendList,
    };
  }
}
