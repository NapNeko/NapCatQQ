import { OB11GroupNoticeEvent } from './OB11GroupNoticeEvent';
import { NapCatCore } from 'napcat-core';

export class OB11GroupTipsEvent extends OB11GroupNoticeEvent {
  notice_type = 'notify';
  sub_type = 'group_tips';
  content: string;

  constructor (core: NapCatCore, groupId: number, content: string) {
    super(core, groupId, 0);
    this.content = content;
  }
}
