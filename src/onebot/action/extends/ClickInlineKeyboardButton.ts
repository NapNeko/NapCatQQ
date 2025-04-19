import { ActionName } from '@/onebot/action/router';
import { OneBotAction } from '../OneBotAction';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    bot_appid: Type.String(),
    button_id: Type.String({ default: '' }),
    callback_data: Type.String({ default: '' }),
    msg_seq: Type.String({ default: '10086' }),
});

type Payload = Static<typeof SchemaData>;

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
        })
    }
}
