import { OB11Group } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { groups } from '@/core/data';
import { NTQQGroupApi } from '@/core/apis';
import { Group } from '@/core/entities';
import { log } from '@/common/utils/log';

interface Payload {
  no_cache: boolean;
}

class GetGroupList extends BaseAction<Payload, OB11Group[]> {
  actionName = ActionName.GetGroupList;

  protected async _handle(payload: Payload) {
    let groupList: Group[] = Array.from(groups.values());
    if (groupList.length === 0 || payload?.no_cache === true) {
      groupList = await NTQQGroupApi.getGroups(true);
      // log('get groups', groups);
    }
    return OB11Constructor.groups(groupList);
  }
}

export default GetGroupList;
