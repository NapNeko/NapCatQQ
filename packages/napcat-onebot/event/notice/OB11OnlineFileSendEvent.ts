import { OB11OnlineFileNoticeEvent } from './OB11OnlineFileNoticeEvent';
import { NapCatCore } from '@/napcat-core';

export class OB11OnlineFileSendEvent extends OB11OnlineFileNoticeEvent {
  notice_type = 'online_file_send';
  sub_type: 'receive' | 'refuse';

  constructor (core: NapCatCore, peer_id: number, sub_type: 'receive' | 'refuse') {
    super(core, peer_id);
    this.sub_type = sub_type;
  }
}
