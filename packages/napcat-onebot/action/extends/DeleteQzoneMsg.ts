import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ExtendsActionsExamples } from '../example/ExtendsActionsExamples';

const PayloadSchema = Type.Object({
  tid: Type.String({ description: '说说 tid (来自 get_qzone_msg_list / send_qzone_msg)' }),
});

type PayloadType = Static<typeof PayloadSchema>;

export class DeleteQzoneMsg extends OneBotAction<PayloadType, void> {
  override actionName = ActionName.DeleteQzoneMsg;
  override actionSummary = '删除QQ空间说说';
  override actionDescription = '删除QQ空间(Qzone)的一条说说, 按 tid 删除';
  override actionTags = ['扩展接口'];
  override payloadExample = ExtendsActionsExamples.DeleteQzoneMsg.payload;
  override returnExample = ExtendsActionsExamples.DeleteQzoneMsg.response;

  override payloadSchema = PayloadSchema;
  override returnSchema = Type.Null();

  async _handle (payload: PayloadType): Promise<void> {
    await this.core.apis.WebApi.deleteQzoneMsg(payload.tid);
  }
}
