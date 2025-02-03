import { ShutUpGroupMember } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

export class GetGroupShutList extends OneBotAction<Payload, ShutUpGroupMember[]> {
    override actionName = ActionName.GetGroupShutList;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.GroupApi.getGroupShutUpMemberList(payload.group_id.toString());
    }
}

