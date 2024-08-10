import { ChatType, Group, GroupRequestOperateTypes, NapCatCore, Peer } from "@/core";
import { OB11FriendRequestEvent } from "../event/request/OB11FriendRequest";
import { OB11GroupRequestEvent } from "../event/request/OB11GroupRequest";
import { OB11Message, OB11MessageAt, OB11MessageData, OB11MessageReply, QuickAction, QuickActionEvent, QuickActionFriendRequest, QuickActionGroupMessage, QuickActionGroupRequest } from "../types";
import { isNull } from "@/common/utils/helper";
import { createSendElements, normalize, sendMsg } from "../action/msg/SendMsg";

async function handleMsg(coreContext: NapCatCore, msg: OB11Message, quickAction: QuickAction) {
    msg = msg as OB11Message;
    const reply = quickAction.reply;
    const peer: Peer = {
        chatType: ChatType.friend,
        peerUid: await coreContext.getApiContext().UserApi.getUidByUin(msg.user_id.toString()) as string
    };
    if (msg.message_type == 'private') {
        if (msg.sub_type === 'group') {
            peer.chatType = ChatType.temp;
        }
    } else {
        peer.chatType = ChatType.group;
        peer.peerUid = msg.group_id!.toString();
    }
    if (reply) {
        let group: Group | undefined;
        let replyMessage: OB11MessageData[] = [];

        if (msg.message_type == 'group') {
            group = await getGroup(msg.group_id!.toString());
            replyMessage.push({
                type: 'reply',
                data: {
                    id: msg.message_id.toString()
                }
            } as OB11MessageReply);
            if ((quickAction as QuickActionGroupMessage).at_sender) {
                replyMessage.push({
                    type: 'at',
                    data: {
                        qq: msg.user_id.toString()
                    }
                } as OB11MessageAt);
            }
        }
        replyMessage = replyMessage.concat(normalize(reply, quickAction.auto_escape));
        const { sendElements, deleteAfterSentFiles } = await createSendElements(coreContext, replyMessage, peer);
        sendMsg(coreContext, peer, sendElements, deleteAfterSentFiles, false).then().catch(coreContext.context.logger.logError);
    }
}
async function handleGroupRequest(coreContext: NapCatCore, request: OB11GroupRequestEvent, quickAction: QuickActionGroupRequest) {
    if (!isNull(quickAction.approve)) {
        coreContext.getApiContext().GroupApi.handleGroupRequest(
            request.flag,
            quickAction.approve ? GroupRequestOperateTypes.approve : GroupRequestOperateTypes.reject,
            quickAction.reason,
        ).then().catch(coreContext.context.logger.logError);
    }
}
async function handleFriendRequest(coreContext: NapCatCore, request: OB11FriendRequestEvent, quickAction: QuickActionFriendRequest) {
    if (!isNull(quickAction.approve)) {
        coreContext.getApiContext().FriendApi.handleFriendRequest(request.flag, !!quickAction.approve).then().catch(coreContext.context.logger.logError);
    }
}
export async function handleQuickOperation(coreContext: NapCatCore, context: QuickActionEvent, quickAction: QuickAction) {
    if (context.post_type === 'message') {
        handleMsg(coreContext, context as OB11Message, quickAction).then().catch(coreContext.context.logger.logError);
    }
    if (context.post_type === 'request') {
        const friendRequest = context as OB11FriendRequestEvent;
        const groupRequest = context as OB11GroupRequestEvent;
        if ((friendRequest).request_type === 'friend') {
            handleFriendRequest(coreContext, friendRequest, quickAction).then().catch(coreContext.context.logger.logError);
        }
        else if (groupRequest.request_type === 'group') {
            handleGroupRequest(coreContext, groupRequest, quickAction).then().catch(coreContext.context.logger.logError);
        }
    }
}