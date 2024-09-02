import { OB11User } from '@/onebot';
import { OB11Entities } from '@/onebot/entities';
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
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        //全新逻辑
        return OB11Entities.friendsV2(await this.core.apis.FriendApi.getBuddyV2(typeof payload.no_cache === 'string' ? payload.no_cache === 'true' : !!payload.no_cache));
    }
}
