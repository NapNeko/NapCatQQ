import BaseAction from '../BaseAction';
import { ChatType, Peer } from '@/core/entities';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/utils/MessageUnique';

const SchemaData = {
    type: 'object',
    properties: {
        message_id: { type: 'number' },
        group_id: { type: ['number', 'string'] },
        user_id: { type: ['number', 'string'] },
    },
    required: ['message_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class ForwardSingleMsg extends BaseAction<Payload, null> {
    protected async getTargetPeer(payload: Payload): Promise<Peer> {
        const NTQQUserApi = this.CoreContext.apis.UserApi;
        if (payload.user_id) {
            const peerUid = await NTQQUserApi.getUidByUinV2(payload.user_id.toString());
            if (!peerUid) {
                throw new Error(`无法找到私聊对象${payload.user_id}`);
            }
            return { chatType: ChatType.friend, peerUid };
        }
        return { chatType: ChatType.group, peerUid: payload.group_id!.toString() };
    }

    async _handle(payload: Payload): Promise<null> {
        const NTQQMsgApi = this.CoreContext.apis.MsgApi;
        const msg = MessageUnique.getMsgIdAndPeerByShortId(payload.message_id);
        if (!msg) {
            throw new Error(`无法找到消息${payload.message_id}`);
        }
        const peer = await this.getTargetPeer(payload);
        const ret = await NTQQMsgApi.forwardMsg(msg.Peer,
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
    PayloadSchema = SchemaData;
    actionName = ActionName.ForwardFriendSingleMsg;
}

export class ForwardGroupSingleMsg extends ForwardSingleMsg {
    PayloadSchema = SchemaData;
    actionName = ActionName.ForwardGroupSingleMsg;
}
