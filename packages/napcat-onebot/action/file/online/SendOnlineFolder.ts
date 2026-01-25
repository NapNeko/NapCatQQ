import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ChatType } from 'napcat-core/types';

export const SendOnlineFolderPayloadSchema = Type.Object({
  user_id: Type.Union([Type.Number(), Type.String()], { description: '用户 QQ' }),
  folder_path: Type.String({ description: '本地文件夹路径' }),
  folder_name: Type.Optional(Type.String({ description: '文件夹名称 (可选)' })),
});

export type SendOnlineFolderPayload = Static<typeof SendOnlineFolderPayloadSchema>;

export class SendOnlineFolder extends OneBotAction<SendOnlineFolderPayload, any> {
  override actionName = ActionName.SendOnlineFolder;
  override payloadSchema = SendOnlineFolderPayloadSchema;
  override returnSchema = Type.Any({ description: '发送结果' });

  async _handle (payload: SendOnlineFolderPayload) {
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('User not found');

    const peer = { chatType: ChatType.KCHATTYPEC2C, peerUid: uid };

    return await this.core.apis.OnlineApi.sendOnlineFolder(peer, payload.folder_path, payload.folder_name);
  }
}
