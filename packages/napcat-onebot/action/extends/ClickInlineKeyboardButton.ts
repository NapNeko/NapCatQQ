import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '../OneBotAction';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.Union([Type.Number(), Type.String()], { description: '群号' }),
  bot_appid: Type.String({ description: '机器人AppID' }),
  button_id: Type.String({ default: '', description: '按钮ID' }),
  callback_data: Type.String({ default: '', description: '回调数据' }),
  msg_seq: Type.String({ default: '10086', description: '消息序列号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '点击结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class ClickInlineKeyboardButton extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.ClickInlineKeyboardButton;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    return await this.core.apis.MsgApi.clickInlineKeyboardButton({
      buttonId: payload.button_id,
      peerId: payload.group_id.toString(),
      botAppid: payload.bot_appid,
      msgSeq: payload.msg_seq,
      callback_data: payload.callback_data,
      dmFlag: 0,
      chatType: 2,
    });
  }
}
