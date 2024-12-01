import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()])
});

type Payload = Static<typeof SchemaData>;

export class GetGroupFileSystemInfo extends OneBotAction<Payload, {
    file_count: number,
    limit_count: number, // unimplemented
    used_space: number, // TODO:unimplemented, but can be implemented later
    total_space: number, // unimplemented, 10 GB by default
}> {
    actionName = ActionName.GoCQHTTP_GetGroupFileSystemInfo;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return {
            file_count:
                (await this.core.apis.GroupApi
                    .getGroupFileCount([payload.group_id.toString()]))
                    .groupFileCounts[0],
            limit_count: 10000,
            used_space: 0,
            total_space: 10 * 1024 * 1024 * 1024,
        };
    }
}
