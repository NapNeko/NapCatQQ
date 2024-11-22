import { OB11BaseMetaEvent } from '@/onebot/event/meta/OB11BaseMetaEvent';
import { OB11BaseNoticeEvent } from '@/onebot/event/notice/OB11BaseNoticeEvent';
import { OB11Message } from '@/onebot/types/message';

export type QuickActionEvent = OB11Message | OB11BaseMetaEvent | OB11BaseNoticeEvent;
export type PostEventType = OB11Message | OB11BaseMetaEvent | OB11BaseNoticeEvent;

export interface QuickActionPrivateMessage {
    reply?: string;
    auto_escape?: boolean;
}

export interface QuickActionGroupMessage extends QuickActionPrivateMessage {
    // 回复群消息
    at_sender?: boolean;
    delete?: boolean;
    kick?: boolean;
    ban?: boolean;
    ban_duration?: number;
}

export interface QuickActionFriendRequest {
    approve?: boolean;
    remark?: string;
}

export interface QuickActionGroupRequest {
    approve?: boolean;
    reason?: string;
}

export type QuickAction =
    QuickActionPrivateMessage
    & QuickActionGroupMessage
    & QuickActionFriendRequest
    & QuickActionGroupRequest;
