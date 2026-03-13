import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from '../example/GoCQHTTPActionsExamples';

// 兼容性代码
export class GoCQHTTPSetModelShow extends OneBotAction<void, void> {
  override actionName = ActionName.GoCQHTTP_SetModelShow;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();
  override actionSummary = '设置机型';
  override actionDescription = '设置当前账号的设备机型名称';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.GoCQHTTPSetModelShow.payload;
  override returnExample = GoCQHTTPActionsExamples.GoCQHTTPSetModelShow.response;

  async _handle () {

  }
}
