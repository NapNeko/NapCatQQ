import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';

export class OB11FriendRecallNoticeEvent extends OB11BaseNoticeEvent {
    notice_type = 'friend_recall';
    user_id: number;
    message_id: number;

    public constructor(userId: number, messageId: number) {
        super();
        this.user_id = userId;
        this.message_id = messageId;
    }
}