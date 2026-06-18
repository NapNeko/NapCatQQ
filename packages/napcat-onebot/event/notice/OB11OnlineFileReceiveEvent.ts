import { OB11OnlineFileNoticeEvent } from './OB11OnlineFileNoticeEvent';
import { NapCatCore } from '@/napcat-core';

export class OB11OnlineFileReceiveEvent extends OB11OnlineFileNoticeEvent {
  notice_type: string;
  sub_type: string;

  constructor (core: NapCatCore, peer_id: number) {
    super(core, peer_id);
    this.notice_type = 'online_file_receive';
    this.sub_type = 'cancel';
  }
}
