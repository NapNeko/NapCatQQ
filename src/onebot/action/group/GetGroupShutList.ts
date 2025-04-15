import { ShutUpGroupMember } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.union([z.coerce.number(), z.coerce.string()]),
});

type Payload = z.infer<typeof SchemaData>;

export class GetGroupShutList extends OneBotAction<Payload, ShutUpGroupMember[]> {
    override actionName = ActionName.GetGroupShutList;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.GroupApi.getGroupShutUpMemberList(payload.group_id.toString());
    }
}

