import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ChatType } from 'napcat-core/types';

export const SendOnlineFilePayloadSchema = Type.Object({
  user_id: Type.Union([Type.Number(), Type.String()], { description: '用户 QQ' }),
  file_path: Type.String({ description: '本地文件路径' }),
  file_name: Type.Optional(Type.String({ description: '文件名 (可选)' })),
});

export type SendOnlineFilePayload = Static<typeof SendOnlineFilePayloadSchema>;

export class SendOnlineFile extends OneBotAction<SendOnlineFilePayload, any> {
  override actionName = ActionName.SendOnlineFile;
  override payloadSchema = SendOnlineFilePayloadSchema;
  override returnSchema = Type.Any({ description: '发送结果' });

  async _handle (payload: SendOnlineFilePayload) {
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('User not found');

    // 仅私聊
    const peer = { chatType: ChatType.KCHATTYPEC2C, peerUid: uid };
    const fileName = payload.file_name || '';

    return await this.core.apis.OnlineApi.sendOnlineFile(peer, payload.file_path, fileName);
  }
}
