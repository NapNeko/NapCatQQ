import { ActionName } from '@/napcat-onebot/action/router';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Type, Static } from '@sinclair/typebox';

export const GetRkeyExReturnSchema = Type.Array(Type.Object({
  type: Type.String({ description: '类型 (private/group)' }),
  rkey: Type.String({ description: 'RKey' }),
  created_at: Type.Number({ description: '创建时间' }),
  ttl: Type.Number({ description: '有效期' }),
}), { description: 'RKey 列表' });

export type GetRkeyExReturn = Static<typeof GetRkeyExReturnSchema>;

export class GetRkeyEx extends GetPacketStatusDepends<void, GetRkeyExReturn> {
  override actionName = ActionName.GetRkeyEx;
  override payloadSchema = Type.Object({});
  override returnSchema = GetRkeyExReturnSchema;

  async _handle () {
    const rkeys = await this.core.apis.PacketApi.pkt.operation.FetchRkey();
    return rkeys.map(rkey => {
      return {
        type: rkey.type === 10 ? 'private' : 'group',
        rkey: rkey.rkey,
        created_at: Number(rkey.time),
        ttl: Number(rkey.ttl),
      };
    });
  }
}
