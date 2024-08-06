import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';

export class OB11InputStatusEvent extends OB11BaseNoticeEvent {
  notice_type = 'notify';
  sub_type = 'input_status';
  status_text = "对方正在输入..."
  eventType = 1;
  user_id = 0;
  constructor(user_id: number, eventType: number, status_text: string) {
    super();
    this.user_id = user_id;
    this.eventType = eventType;
    this.status_text = status_text;
  }
}

