import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type } from '@sinclair/typebox';

// 兼容性代码
export class GoCQHTTPSetModelShow extends OneBotAction<void, void> {
  override actionName = ActionName.GoCQHTTP_SetModelShow;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();
  override actionSummary = '设置机型';
  override actionDescription = '兼容接口，当前版本未实现 _set_model_show';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = {};
  override returnExample = null;
  override supported = false;
  override unsupportedReason = '当前版本未实现 _set_model_show';

  async _handle () {
    throw new Error('当前版本未实现 _set_model_show');
  }
}
