
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.union([z.number(), z.string()]),
    group_name: z.string(),
});

type Payload = z.infer<typeof SchemaData>;

export default class SetGroupName extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupName;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const ret = await this.core.apis.GroupApi.setGroupName(payload.group_id.toString(), payload.group_name);
        if (ret.result !== 0) {
            throw new Error(`设置群名称失败 ErrCode: ${ret.result} ErrMsg: ${ret.errMsg}`);
        }
        return null;
    }
}
