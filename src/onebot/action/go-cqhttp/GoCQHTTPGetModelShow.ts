import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    model:  Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class GoCQHTTPGetModelShow extends OneBotAction<Payload, any> {
    actionName = ActionName.GoCQHTTP_GetModelShow;
    payloadSchema = SchemaData;

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
