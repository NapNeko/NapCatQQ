import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';

export abstract class OB11GroupNoticeEvent extends OB11BaseNoticeEvent {
  group_id: number = 0;
  user_id: number = 0;
}