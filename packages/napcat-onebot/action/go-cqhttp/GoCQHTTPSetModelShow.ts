import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from './examples';

// 兼容性代码
export class GoCQHTTPSetModelShow extends OneBotAction<void, void> {
  override actionName = ActionName.GoCQHTTP_SetModelShow;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();
  override actionDescription = '设置模型显示';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.GoCQHTTPSetModelShow.payload;

  async _handle () {

  }
}
