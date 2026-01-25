import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type } from '@sinclair/typebox';

// 兼容性代码
export class GoCQHTTPSetModelShow extends OneBotAction<void, void> {
  override actionName = ActionName.GoCQHTTP_SetModelShow;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();

  async _handle () {

  }
}
