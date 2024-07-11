import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';
import { selfInfo } from '@/core/data';
import { OB11BaseEvent } from '../OB11BaseEvent';

class OB11PokeEvent extends OB11BaseNoticeEvent {
  notice_type = 'notify';
  sub_type = 'poke';
  target_id = 0;
  user_id = 0;
}

export class OB11FriendPokeEvent extends OB11PokeEvent {
  sender_id: number;
  constructor(user_id: number, sender_id: number) {
    super();
    this.user_id = user_id;
    this.sender_id = sender_id;
  }
}

export class OB11GroupPokeEvent extends OB11PokeEvent {
  group_id: number;

  constructor(group_id: number, target_id: number = 0, user_id: number = 0,) {
    super();
    this.group_id = group_id;
    this.target_id = target_id;
    this.user_id = user_id;
  }
}
