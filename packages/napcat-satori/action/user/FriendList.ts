import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';
import { SatoriUser, SatoriPageResult } from '../../types';

const SchemaData = Type.Object({
  next: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;

export class FriendListAction extends SatoriAction<Payload, SatoriPageResult<SatoriUser>> {
  actionName = SatoriActionName.FriendList;
  override payloadSchema = SchemaData;

  protected async _handle (_payload: Payload): Promise<SatoriPageResult<SatoriUser>> {
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
