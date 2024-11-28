import {
    NapCatOneBot11Adapter,
    OB11Message,
    OB11MessageAt,
    OB11MessageData,
    OB11MessageReply,
    QuickAction,
    QuickActionEvent,
    QuickActionFriendRequest,
    QuickActionGroupMessage,
    QuickActionGroupRequest,
} from '@/onebot';
import { NTGroupRequestOperateTypes, NapCatCore, Peer } from '@/core';
import { OB11FriendRequestEvent } from '@/onebot/event/request/OB11FriendRequest';
import { OB11GroupRequestEvent } from '@/onebot/event/request/OB11GroupRequest';
import { ContextMode, createContext, normalize } from '@/onebot/action/msg/SendMsg';
import { isNull } from '@/common/helper';

export class OneBotQuickActionApi {
    constructor(
        public obContext: NapCatOneBot11Adapter,
        public core: NapCatCore,
    ) {
    }

    async handleQuickOperation(eventContext: QuickActionEvent, quickAction: QuickAction) {
        if (eventContext.post_type === 'message') {
            await this.handleMsg(eventContext as OB11Message, quickAction)
                .catch(e => this.core.context.logger.logError(e));
        }
        if (eventContext.post_type === 'request') {
            const friendRequest = eventContext as OB11FriendRequestEvent;
            const groupRequest = eventContext as OB11GroupRequestEvent;
            if ((friendRequest).request_type === 'friend') {
                await this.handleFriendRequest(friendRequest, quickAction)
                    .catch(e => this.core.context.logger.logError(e));
            } else if (groupRequest.request_type === 'group') {
                await this.handleGroupRequest(groupRequest, quickAction)
                    .catch(e => this.core.context.logger.logError(e));
            }
        }
    }

    async handleMsg(msg: OB11Message, quickAction: QuickAction) {
        const reply = quickAction.reply;
        const peerContextMode = msg.message_type == 'private' ? ContextMode.Private : ContextMode.Group;

        const peer: Peer = await createContext(this.core, {
            message_type: undefined,
            group_id: msg.group_id?.toString(),
            user_id: msg.user_id?.toString(),
        }, peerContextMode);

        if (reply) {
            // let group: Group | undefined;
            let replyMessage: OB11MessageData[] = [];

            if (msg.message_type == 'group') {
                // group = await core.apis.GroupApi.getGroup(msg.group_id!.toString());
                replyMessage.push({
                    type: 'reply',
                    data: {
                        id: msg.message_id.toString(),
                    },
                } as OB11MessageReply);
                if ((quickAction as QuickActionGroupMessage).at_sender) {
                    replyMessage.push({
                        type: 'at',
                        data: {
                            qq: msg.user_id.toString(),
                        },
                    } as OB11MessageAt);
                }
            }
            replyMessage = replyMessage.concat(normalize(reply, quickAction.auto_escape));
            const {
                sendElements,
                deleteAfterSentFiles,
            } = await this.obContext.apis.MsgApi.createSendElements(replyMessage, peer);
            this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(peer, sendElements, deleteAfterSentFiles, false).then().catch(e => this.core.context.logger.logError(e));
        }
    }

    async handleGroupRequest(request: OB11GroupRequestEvent, quickAction: QuickActionGroupRequest) {
        if (!isNull(quickAction.approve)) {
            this.core.apis.GroupApi.handleGroupRequest(
                request.flag,
                quickAction.approve ? NTGroupRequestOperateTypes.KAGREE : NTGroupRequestOperateTypes.KREFUSE,
                quickAction.reason,
            ).catch(e => this.core.context.logger.logError(e));
        }
    }

    async handleFriendRequest(request: OB11FriendRequestEvent, quickAction: QuickActionFriendRequest) {
        if (!isNull(quickAction.approve)) {
            this.core.apis.FriendApi.handleFriendRequest(request.flag, !!quickAction.approve).then().catch(e => this.core.context.logger.logError(e));
        }
    }
}
