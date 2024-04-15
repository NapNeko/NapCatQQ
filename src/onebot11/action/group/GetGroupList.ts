import { OB11Group } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { groups } from '@/common/data';
import {NTQQGroupApi} from "@/core/qqnt/apis";


class GetGroupList extends BaseAction<null, OB11Group[]> {
  actionName = ActionName.GetGroupList;

  protected async _handle(payload: null) {
    if (groups.size === 0) {
      //todo: get groups
        // const groups = await NTQQGroupApi.getGroups(true)
        // log("get groups", groups)
    }
    return OB11Constructor.groups(Array.from(groups.values()));
  }
}

export default GetGroupList;
