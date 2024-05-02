import { getGroup } from '@/core/data';
import { OB11Group } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQMsgApi } from '@/core/apis/msg';
import { GroupEssenceMsgRet, WebApi } from '@/core/apis/webapi';

interface PayloadType {
    group_id: number;
    pages: number;
}

export class GetGroupEssence extends BaseAction<PayloadType, GroupEssenceMsgRet> {
  actionName = ActionName.GoCQHTTP_GetEssenceMsg;

  protected async _handle(payload: PayloadType) {
    const ret = await WebApi.getGroupEssenceMsg(payload.group_id.toString(), payload.pages.toString());
    if (!ret) {
      throw new Error('获取失败');
    }
    return ret;
  }
}
