import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ExtendsActionsExamples } from '../example/ExtendsActionsExamples';
import { checkQzoneFields, qzoneIdentity, qzonePayload, SlQzoneIdentitySchema } from './qzone/common-snowluma';

const PayloadSchema = Type.Object({
  tid: SlQzoneIdentitySchema,
});

type PayloadType = Static<typeof PayloadSchema>;

export class DeleteQzoneMsg extends OneBotAction<PayloadType, null> {
  override actionName = ActionName.DeleteQzoneMsg;
  override actionSummary = '删除QQ空间说说';
  override actionDescription = '删除QQ空间(Qzone)的一条说说, 按 tid 删除';
  override actionTags = ['扩展接口'];
  override payloadExample = ExtendsActionsExamples.DeleteQzoneMsg.payload;
  override returnExample = ExtendsActionsExamples.DeleteQzoneMsg.response;

  override payloadSchema = PayloadSchema;
  override returnSchema = Type.Null();

  protected override async check (payload: PayloadType): Promise<BaseCheckResult> {
    try {
      checkQzoneFields(qzonePayload(payload), ['tid'], false);
      qzoneIdentity(payload.tid, 'tid');
    } catch (error) { return { valid: false, message: (error as Error).message }; }
    return await super.check(payload);
  }

  async _handle (payload: PayloadType): Promise<null> {
    checkQzoneFields(qzonePayload(payload), ['tid'], false);
    await this.core.apis.WebApi.deleteQzoneMsg(qzoneIdentity(payload.tid, 'tid'));
    return null;
  }
}
