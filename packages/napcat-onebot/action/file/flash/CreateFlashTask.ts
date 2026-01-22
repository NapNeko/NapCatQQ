import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

// 不全部使用json因为：一个文件解析Form-data会变字符串！！！  但是api文档就写List
const SchemaData = Type.Object({
  files: Type.Union([
    Type.Array(Type.String()),
    Type.String(),
  ]),
});
type Payload = Static<typeof SchemaData>;

export class CreateFlashTask extends OneBotAction<Payload, unknown> {
  override actionName = ActionName.CreateFlashTask;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    // todo  fileset的名字和缩略图还没实现！！
    const fileList = Array.isArray(payload.files) ? payload.files : [payload.files];

    return await this.core.apis.FlashApi.createFlashTransferUploadTask(fileList);
  }
}
