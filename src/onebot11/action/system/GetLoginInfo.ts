import { selfInfo } from '@/common/data';
import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { napCatCore } from '@/core';


class GetLoginInfo extends BaseAction<null, OB11User> {
  actionName = ActionName.GetLoginInfo;

  protected async _handle(payload: null) {
    return OB11Constructor.selfInfo(selfInfo);
  }
}

export default GetLoginInfo;
