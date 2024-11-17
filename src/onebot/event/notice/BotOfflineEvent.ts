import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';
import { NapCatCore } from '@/core';

export class BotOfflineEvent extends OB11BaseNoticeEvent {
    notice_type = 'bot_offline';
    user_id: number;
    tag: string = 'BotOfflineEvent';
    message: string = 'BotOfflineEvent';

    public constructor(core: NapCatCore, tag: string, message: string) {
        super(core);
        this.user_id = +core.selfInfo.uin;
        this.tag = tag;
        this.message = message;
    }
}
