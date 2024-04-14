import { getGroup } from '@/common/data';
import { OB11Group } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

interface PayloadType {
  group_id: number
}

class GetGroupInfo extends BaseAction<PayloadType, OB11Group> {
  actionName = ActionName.GetGroupInfo;

  protected async _handle(payload: PayloadType) {
    const group = await getGroup(payload.group_id.toString());
    if (group) {
      return OB11Constructor.group(group);
    } else {
      throw `群${payload.group_id}不存在`;
    }
  }
}

export default GetGroupInfo;
