import { OB11User } from '@/onebot';
import { OB11Construct } from '@/onebot/helper/data';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    no_cache: Type.Optional(Type.Union([Type.Boolean(), Type.String()])),
});

type Payload = Static<typeof SchemaData>;

export default class GetFriendList extends OneBotAction<Payload, OB11User[]> {
    override actionName = ActionName.GetFriendList;
    override payloadSchema = SchemaData;

    async _handle(_payload: Payload) {
        //全新逻辑
        return OB11Construct.friends(await this.core.apis.FriendApi.getBuddy());
    }
}
