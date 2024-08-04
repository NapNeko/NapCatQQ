import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import { friends } from '@/core/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQFriendApi } from '@/core';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';


// no_cache get时传字符串
const SchemaData = {
  type: 'object',
  properties: {
    no_cache: { type: ['boolean', 'string'] },
  }
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;
export default class GetFriendList extends BaseAction<Payload, OB11User[]> {
  actionName = ActionName.GetFriendList;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
   let data = await NTQQFriendApi.getBuddyV2(payload?.no_cache === true || payload?.no_cache=== 'true');
    if (friends.size === 0 || payload?.no_cache === true || payload?.no_cache === 'true') {
      const _friends = await NTQQFriendApi.getFriends(true);
      // log('强制刷新好友列表，结果: ', _friends)
      if (_friends.length > 0) {
        friends.clear();
        for (const friend of _friends) {
          friends.set(friend.uid, friend);
        }
      }
    }
    return OB11Constructor.friends(Array.from(friends.values()));
  }
}
