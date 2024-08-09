import { OB11GroupNoticeEvent } from './OB11GroupNoticeEvent';

export class OB11GroupTitleEvent extends OB11GroupNoticeEvent {
  notice_type = 'notify';
  sub_type = 'title';
  title: string;


  constructor(groupId: number, userId: number, title: string) {
    super();
    this.group_id = groupId;
    this.user_id = userId;
    this.title = title;
  }
}
