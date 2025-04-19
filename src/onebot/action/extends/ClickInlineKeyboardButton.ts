import { ActionName } from '@/onebot/action/router';
import { OneBotAction } from '../OneBotAction';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.coerce.string(),
    bot_appid: z.coerce.string(),
    button_id: z.coerce.string().default(''),
    callback_data: z.coerce.string().default(''),
    msg_seq: z.coerce.string().default('10086'),
});
type Payload = z.infer<typeof SchemaData>;

export class ClickInlineKeyboardButton extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.ClickInlineKeyboardButton;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.MsgApi.clickInlineKeyboardButton({
            buttonId: payload.button_id,
            peerId: payload.group_id.toString(),
            botAppid: payload.bot_appid,
            msgSeq: payload.msg_seq,
            callback_data: payload.callback_data,
            dmFlag: 0,
            chatType: 2
        });
    }
}
