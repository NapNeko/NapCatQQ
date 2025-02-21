import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    user_id: Type.Union([Type.Number(), Type.String()]),
    card: Type.Optional(Type.String())
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupCard extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupCard;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const member = await this.core.apis.GroupApi.getGroupMember(payload.group_id.toString(), payload.user_id.toString());
        if (member) await this.core.apis.GroupApi.setMemberCard(payload.group_id.toString(), member.uid, payload.card || '');
        return null;
    }
}
