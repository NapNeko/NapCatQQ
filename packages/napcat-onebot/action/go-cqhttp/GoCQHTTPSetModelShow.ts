import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null();

type ReturnType = Static<typeof ReturnSchema>;

// 兼容性代码
export class GoCQHTTPSetModelShow extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GoCQHTTP_SetModelShow;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '设置机型';
  override actionDescription = '设置当前账号的设备机型名称；当前兼容实现不执行实际切换';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = {};
  override returnExample = null;

  async _handle (): Promise<ReturnType> {
    return null;
  }
}
