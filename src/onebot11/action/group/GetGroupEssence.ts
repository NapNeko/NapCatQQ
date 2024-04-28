import { getGroup } from '@/core/data';
import { OB11Group } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQMsgApi } from '@/core/apis/msg';

interface PayloadType {
  group_id: number
}

export class GetGroupEssence extends BaseAction<PayloadType, null> {
  actionName = ActionName.GoCQHTTP_GetEssenceMsg;

  protected async _handle(payload: PayloadType) {
    //await NTQQMsgApi.GetEssenceMsg()
    return null;
  }
}
