import { OB11Group } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { groups } from '@/common/data';
import { NTQQGroupApi } from '@/core/qqnt/apis';
import { Group } from '@/core/qqnt/entities';
import { log } from '@/common/utils/log';

interface Payload {
  no_cache: boolean;
}

class GetGroupList extends BaseAction<Payload, OB11Group[]> {
  actionName = ActionName.GetGroupList;

  protected async _handle(payload: Payload) {
    let groupList: Group[] = Array.from(groups.values());
    if (groupList.length === 0) {
      groupList = await NTQQGroupApi.getGroups(payload.no_cache === true);
      // log('get groups', groups);
    }
    return OB11Constructor.groups(groupList);
  }
}

export default GetGroupList;
