import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';

export class OB11FriendAddNoticeEvent extends OB11BaseNoticeEvent {
    notice_type = 'friend_add';
    user_id: number;

    public constructor(user_Id: number) {
        super();
        this.user_id = user_Id;
    }
}