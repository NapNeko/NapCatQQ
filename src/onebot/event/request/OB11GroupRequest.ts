import { NapCatCore } from '@/core';
import { OB11BaseRequestEvent } from './OB11BaseRequestEvent';

export class OB11GroupRequestEvent extends OB11BaseRequestEvent {
    override readonly request_type = 'group' as const;

    group_id: number;
    user_id: number;
    comment: string;
    flag: string;
    sub_type: string;

    constructor(core: NapCatCore, groupId: number, userId: number, sub_type: string, comment: string, flag: string) {
        super(core);
        this.group_id = groupId;
        this.user_id = userId;
        this.sub_type = sub_type;
        this.comment = comment;
        this.flag = flag;
    }
}
