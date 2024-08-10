import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';
import { NapCatCore } from '@/core';

class OB11PokeEvent extends OB11BaseNoticeEvent {
    notice_type = 'notify';
    sub_type = 'poke';
    target_id = 0;
    user_id = 0;
}

export class OB11FriendPokeEvent extends OB11PokeEvent {
    raw_info: any;

    //raw_message nb等框架标准为string
    constructor(core: NapCatCore, user_id: number, target_id: number, raw_message: any) {
        super(core);
        this.target_id = target_id;
        this.user_id = user_id;
        this.raw_info = raw_message;
    }
}

export class OB11GroupPokeEvent extends OB11PokeEvent {
    group_id: number;
    raw_info: any;

    //raw_message nb等框架标准为string
    constructor(core: NapCatCore, group_id: number, user_id: number = 0, target_id: number = 0, raw_message: any) {
        super(core);
        this.group_id = group_id;
        this.target_id = target_id;
        this.user_id = user_id;
        this.raw_info = raw_message;
    }
}
