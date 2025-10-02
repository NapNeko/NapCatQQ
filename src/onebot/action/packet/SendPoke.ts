import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Optional(Type.String()),
    user_id: Type.Optional(Type.String()),
    target_id: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;
export class SendPokeBase extends GetPacketStatusDepends<Payload, void> {
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        // 这里的 !! 可以传入空字符串 忽略这些数据有利用接口统一接口
        const target_id = !!payload.target_id ? payload.target_id : payload.user_id;
        const peer_id = !!payload.group_id ? payload.group_id : payload.user_id;

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
