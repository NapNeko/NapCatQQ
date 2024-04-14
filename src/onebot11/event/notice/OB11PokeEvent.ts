import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';
import { selfInfo } from '../../../common/data';
import { OB11BaseEvent } from '../OB11BaseEvent';

class OB11PokeEvent extends OB11BaseNoticeEvent{
  notice_type = 'notify';
  sub_type = 'poke';
  target_id = parseInt(selfInfo.uin);
  user_id: number;
}

export class OB11FriendPokeEvent extends OB11PokeEvent{
  sender_id: number;
  constructor(user_id: number) {
    super();
    this.user_id = user_id;
    this.sender_id = user_id;
  }
}

export class OB11GroupPokeEvent extends OB11PokeEvent{
  group_id: number;

  constructor(group_id: number, user_id: number=0) {
    super();
    this.group_id = group_id;
    this.target_id = user_id;
    this.user_id = user_id;
  }
}
