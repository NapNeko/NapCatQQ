import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  face_id: Type.Union([Type.Number(), Type.String()], { description: '图标ID' }), // 参考 face_config.json 的 QSid
  face_type: Type.Union([Type.Number(), Type.String()], { default: '1', description: '图标类型' }),
  wording: Type.String({ default: ' ', description: '状态文字内容' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.String({ description: '错误信息（如果有）' });

type ReturnType = Static<typeof ReturnSchema>;

export class SetDiyOnlineStatus extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetDiyOnlineStatus;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema; override actionSummary = '设置自定义在线状态';
  override actionDescription = '设置自定义在线状态';
  override actionTags = ['用户扩展'];
  override payloadExample = {
    status: 11
  };
  override returnExample = {
    result: 0
  };
  async _handle (payload: PayloadType) {
    const ret = await this.core.apis.UserApi.setDiySelfOnlineStatus(
      payload.face_id.toString(),
      payload.wording,
      payload.face_type.toString()
    );
    if (ret.result !== 0) {
      throw new Error('设置在线状态失败');
    }
    return ret.errMsg;
  }
}
