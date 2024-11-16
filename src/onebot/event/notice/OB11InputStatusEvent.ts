import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';
import { NapCatCore } from '@/core';

//TODO: 输入状态事件 初步完成 Mlikiowa 需要做一些过滤
export class OB11InputStatusEvent extends OB11BaseNoticeEvent {
    notice_type = 'notify';
    sub_type = 'input_status';
    status_text = '对方正在输入...';
    event_type = 1;
    user_id = 0;
    group_id = 0;

    constructor(core: NapCatCore, user_id: number, eventType: number, status_text: string) {
        super(core);
        this.user_id = user_id;
        this.event_type = eventType;
        this.status_text = status_text;
    }
}

