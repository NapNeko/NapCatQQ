import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    times: z.union([z.coerce.number(), z.coerce.string()]).default(1),
    user_id: z.union([z.coerce.number(), z.coerce.string()])
});

type Payload = z.infer<typeof SchemaData>;

export default class SendLike extends OneBotAction<Payload, null> {
    override actionName = ActionName.SendLike;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const qq = payload.user_id.toString();
        const uid: string = await this.core.apis.UserApi.getUidByUinV2(qq) ?? '';
        const result = await this.core.apis.UserApi.like(uid, +payload.times);
        if (result.result !== 0) {
            throw new Error(`点赞失败 ${result.errMsg}`);
        }
        return null;
    }
}
