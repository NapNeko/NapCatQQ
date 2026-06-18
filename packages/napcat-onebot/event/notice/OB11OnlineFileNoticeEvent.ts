import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';
import { NapCatCore } from 'napcat-core';

export abstract class OB11OnlineFileNoticeEvent extends OB11BaseNoticeEvent {
  peer_id: number;

  protected constructor (core: NapCatCore, peer_id: number) {
    super(core);
    this.peer_id = peer_id;
  }
}
