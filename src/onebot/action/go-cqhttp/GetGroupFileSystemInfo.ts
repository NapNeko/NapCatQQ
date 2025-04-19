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
    override actionName = ActionName.GoCQHTTP_GetGroupFileSystemInfo;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const groupFileCount = (await this.core.apis.GroupApi.getGroupFileCount([payload.group_id.toString()])).groupFileCounts[0];
        if (!groupFileCount) {
            throw new Error('Group not found');
        }
        return {
            file_count: groupFileCount,
            limit_count: 10000,
            used_space: 0,
            total_space: 10 * 1024 * 1024 * 1024,
        };
    }
}
