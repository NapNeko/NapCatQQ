import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    model: z.string(),
});

type Payload = z.infer<typeof SchemaData>;

export class GoCQHTTPGetModelShow extends OneBotAction<Payload, Array<{
    variants: {
        model_show: string;
        need_pay: boolean;
    }
}>> {
    override actionName = ActionName.GoCQHTTP_GetModelShow;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (!payload.model) {
            payload.model = 'napcat';
        }
        return [{
            variants: {
                model_show: 'napcat',
                need_pay: false
            }
        }];
    }
}
