import { ActionName } from '@/napcat-onebot/action/router';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

import { PacketActionsExamples } from './examples';

export const SendPokePayloadSchema = Type.Object({
  group_id: Type.Optional(Type.String({ description: '群号' })),
  user_id: Type.Optional(Type.String({ description: '用户QQ' })),
  target_id: Type.Optional(Type.String({ description: '目标QQ' })),
});

export type SendPokePayload = Static<typeof SendPokePayloadSchema>;
export class SendPokeBase extends GetPacketStatusDepends<SendPokePayload, void> {
  override payloadSchema = SendPokePayloadSchema;
  override returnSchema = Type.Null();
  override actionSummary = '发送戳一戳';
  override actionDescription = '在群聊或私聊中发送戳一戳动作';
  override actionTags = ['核心接口'];
  override payloadExample = PacketActionsExamples.SendPoke.payload;
  override returnExample = PacketActionsExamples.SendPoke.response;

  async _handle (payload: SendPokePayload) {
    // 这里的 !! 可以传入空字符串 忽略这些数据有利用接口统一接口
    const target_id = payload.target_id?.toString() || payload.user_id?.toString();
    const peer_id = payload.group_id?.toString() || payload.user_id?.toString();

    const is_group = !!payload.group_id;
    if (!target_id || !peer_id) {
      throw new Error('请检查参数，缺少 user_id 或 group_id');
    }

    await this.core.apis.PacketApi.pkt.operation.SendPoke(is_group, +peer_id, +target_id);
  }
}

export class SendPoke extends SendPokeBase {
  override actionName = ActionName.SendPoke;
}
export class GroupPoke extends SendPokeBase {
  override actionName = ActionName.GroupPoke;
}
export class FriendPoke extends SendPokeBase {
  override actionName = ActionName.FriendPoke;
}
