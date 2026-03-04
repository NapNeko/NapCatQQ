import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
export const SendLikePayloadSchema = Type.Object({
  user_id: Type.String({ description: '对方 QQ 号' }),
  times: Type.Union([Type.Number(), Type.String()], { default: 1, description: '点赞次数' }),
});

export type SendLikePayload = Static<typeof SendLikePayloadSchema>;

export default class SendLike extends OneBotAction<SendLikePayload, void> {
  override actionName = ActionName.SendLike;
  override payloadSchema = SendLikePayloadSchema;
  override returnSchema = Type.Null();
  override actionSummary = '点赞';
  override actionDescription = '给指定用户点赞';
  override actionTags = ['用户接口'];
  override payloadExample = {
    user_id: '123456',
    times: 10
  };
  override returnExample = {};
  override errorExamples = [
    { code: 1400, description: '点赞失败（频率过快或用户不存在）' }
  ];

  async _handle (payload: SendLikePayload): Promise<void> {
    const qq = payload.user_id.toString();
    const uid: string = await this.core.apis.UserApi.getUidByUinV2(qq) ?? '';
    const result = await this.core.apis.UserApi.like(uid, +payload.times);
    if (result.result !== 0) {
      throw new Error(`点赞失败 ${result.errMsg}`);
    }
  }
}
