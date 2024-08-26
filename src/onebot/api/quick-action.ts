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
import { ChatType, GroupRequestOperateTypes, NapCatCore, Peer } from '@/core';
import { OB11FriendRequestEvent } from '@/onebot/event/request/OB11FriendRequest';
import { OB11GroupRequestEvent } from '@/onebot/event/request/OB11GroupRequest';
import { normalize } from '@/onebot/action/msg/SendMsg';
import { isNull } from '@/common/utils/helper';

export class OneBotQuickActionApi {
    constructor(
        public obContext: NapCatOneBot11Adapter,
        public core: NapCatCore,
    ) {
    }

    async handleQuickOperation(eventContext: QuickActionEvent, quickAction: QuickAction) {
        if (eventContext.post_type === 'message') {
            await this.handleMsg(eventContext as OB11Message, quickAction)
                .catch(this.core.context.logger.logError);
        }
        if (eventContext.post_type === 'request') {
            const friendRequest = eventContext as OB11FriendRequestEvent;
            const groupRequest = eventContext as OB11GroupRequestEvent;
            if ((friendRequest).request_type === 'friend') {
                await this.handleFriendRequest(friendRequest, quickAction)
                    .catch(this.core.context.logger.logError);
            } else if (groupRequest.request_type === 'group') {
                await this.handleGroupRequest(groupRequest, quickAction)
                    .catch(this.core.context.logger.logError);
            }
        }
    }

    async handleMsg(msg: OB11Message, quickAction: QuickAction) {
        const reply = quickAction.reply;
        const peer: Peer = {
            chatType: ChatType.KCHATTYPEC2C,
            peerUid: await this.core.apis.UserApi.getUidByUinV2(msg.user_id.toString()) as string,
        };
        if (msg.message_type == 'private') {
            if (msg.sub_type === 'group') {
                peer.chatType = ChatType.KCHATTYPETEMPC2CFROMGROUP;
            }
        } else {
            peer.chatType = ChatType.KCHATTYPETEMPC2CFROMGROUP;
            peer.peerUid = msg.group_id!.toString();
        }
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
            this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(peer, sendElements, deleteAfterSentFiles, false).then().catch(this.core.context.logger.logError);
        }
    }

    async handleGroupRequest(request: OB11GroupRequestEvent, quickAction: QuickActionGroupRequest) {
        if (!isNull(quickAction.approve)) {
            this.core.apis.GroupApi.handleGroupRequest(
                request.flag,
                quickAction.approve ? GroupRequestOperateTypes.approve : GroupRequestOperateTypes.reject,
                quickAction.reason,
            ).catch(this.core.context.logger.logError);
        }
    }

    async handleFriendRequest(request: OB11FriendRequestEvent, quickAction: QuickActionFriendRequest) {
        if (!isNull(quickAction.approve)) {
            this.core.apis.FriendApi.handleFriendRequest(request.flag, !!quickAction.approve).then().catch(this.core.context.logger.logError);
        }
    }
}
