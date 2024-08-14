import { OB11User } from '../../types';
import { OB11Constructor } from '../../helper/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

// no_cache get时传字符串
const SchemaData = {
    type: 'object',
    properties: {
        no_cache: { type: ['boolean', 'string'] },
    },
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;
export default class GetFriendList extends BaseAction<Payload, OB11User[]> {
    actionName = ActionName.GetFriendList;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload) {
        //全新逻辑
        const NTQQFriendApi = this.CoreContext.apis.FriendApi;
        return OB11Constructor.friendsV2(await NTQQFriendApi.getBuddyV2(typeof payload.no_cache === 'string' ? payload.no_cache === 'true' : !!payload.no_cache));
    }
}
