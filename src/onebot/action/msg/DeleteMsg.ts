import { ActionName } from '@/onebot/action/router';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { MessageUnique } from '@/common/message-unique';
import { z } from 'zod';

const SchemaData = z.object({
    message_id: z.coerce.string(),
});

type Payload = z.infer<typeof SchemaData>;

class DeleteMsg extends OneBotAction<Payload, void> {
    override actionName = ActionName.DeleteMsg;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const msg = MessageUnique.getMsgIdAndPeerByShortId(Number(payload.message_id));
        if (msg) {
            await this.core.apis.MsgApi.recallMsg(msg.Peer, msg.MsgId);
        } else {
            throw new Error('Recall failed');
        }
    }
}

export default DeleteMsg;
