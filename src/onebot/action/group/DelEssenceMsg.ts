import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { MessageUnique } from '@/common/message-unique';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    message_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;
export default class DelEssenceMsg extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.DelEssenceMsg;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<unknown> {
        const msg = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id);
        if (!msg) {
            const data = this.core.apis.GroupApi.essenceLRU.getValue(+payload.message_id);
            if(!data) throw new Error('消息不存在');
            const { msg_seq, msg_random, group_id } = JSON.parse(data) as { msg_seq: string, msg_random: string, group_id: string };
            return await this.core.apis.GroupApi.removeGroupEssenceBySeq(group_id, msg_seq, msg_random);
        }
        return await this.core.apis.GroupApi.removeGroupEssence(
            msg.Peer.peerUid,
            msg.MsgId,
        );
    }
}
