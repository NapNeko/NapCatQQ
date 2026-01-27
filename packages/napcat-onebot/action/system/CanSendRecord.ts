import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

export const CanSendReturnSchema = Type.Object({
  yes: Type.Boolean({ description: '是否可以发送' }),
});

export type CanSendReturnType = Static<typeof CanSendReturnSchema>;

export class CanSend extends OneBotAction<void, CanSendReturnType> {
  override payloadSchema = Type.Object({});
  override returnSchema = CanSendReturnSchema;
  override actionTags = ['系统接口'];

  async _handle (): Promise<CanSendReturnType> {
    return {
      yes: true,
    };
  }
}

export default class CanSendRecord extends CanSend {
  override actionName = ActionName.CanSendRecord;
  override actionSummary = '是否可以发送语音';
  override actionDescription = '检查是否可以发送语音';
  override actionTags = ['系统接口'];
  override payloadExample = {};
  override returnExample = { yes: true };
}
