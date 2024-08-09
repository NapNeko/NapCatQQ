import { GetFileBase, GetFilePayload, GetFileResponse } from './GetFile';
import { ActionName } from '../types';

interface Payload extends GetFilePayload {
    out_format: 'mp3' | 'amr' | 'wma' | 'm4a' | 'spx' | 'ogg' | 'wav' | 'flac'
}

export default class GetRecord extends GetFileBase {
  actionName = ActionName.GetRecord;

  protected async _handle(payload: Payload): Promise<GetFileResponse> {
    const res = super._handle(payload);
    return res;
  }
}