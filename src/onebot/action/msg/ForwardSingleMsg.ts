import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ChatType, Peer } from '@/core/types';
import { ActionName } from '@/onebot/action/router';
import { MessageUnique } from '@/common/message-unique';
import { z } from 'zod';

const SchemaData = z.object({
    message_id: z.union([z.number(), z.string()]),
    group_id: z.string().optional(),
    user_id: z.string().optional(),
});

type Payload = z.infer<typeof SchemaData>;

class ForwardSingleMsg extends OneBotAction<Payload, null> {
    protected async getTargetPeer(payload: Payload): Promise<Peer> {
        if (payload.user_id) {
            const peerUid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
            if (!peerUid) {
                throw new Error(`无法找到私聊对象${payload.user_id}`);
            }
            return { chatType: ChatType.KCHATTYPEC2C, peerUid };
        }
        return { chatType: ChatType.KCHATTYPEGROUP, peerUid: payload.group_id!.toString() };
    }

    async _handle(payload: Payload): Promise<null> {
        const msg = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id);
        if (!msg) {
            throw new Error(`无法找到消息${payload.message_id}`);
        }
        const peer = await this.getTargetPeer(payload);
        const ret = await this.core.apis.MsgApi.forwardMsg(msg.Peer,
            peer,
            [msg.MsgId],
        );
        if (ret.result !== 0) {
            throw new Error(`转发消息失败 ${ret.errMsg}`);
        }
        return null;
    }
}

export class ForwardFriendSingleMsg extends ForwardSingleMsg {
    override payloadSchema = SchemaData;
    override actionName = ActionName.ForwardFriendSingleMsg;
}

export class ForwardGroupSingleMsg extends ForwardSingleMsg {
    override payloadSchema = SchemaData;
    override actionName = ActionName.ForwardGroupSingleMsg;
}
