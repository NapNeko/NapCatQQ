import { OB11Group } from '@/onebot';
import { OB11Construct } from '@/onebot/helper/data';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';
import { coerce } from '@/common/coerce';

const SchemaData = z.object({
    no_cache: coerce.boolean().default(false),
});

type Payload = z.infer<typeof SchemaData>;

class GetGroupList extends OneBotAction<Payload, OB11Group[]> {
    override actionName = ActionName.GetGroupList;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return OB11Construct.groups(
            await this.core.apis.GroupApi.getGroups(
                typeof payload.no_cache === 'string' ? payload.no_cache === 'true' : !!payload.no_cache));
    }
}

export default GetGroupList;
