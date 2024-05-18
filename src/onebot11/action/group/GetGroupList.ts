import { OB11Group } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { groups } from '@/core/data';
import { NTQQGroupApi } from '@/core/apis';
import { Group } from '@/core/entities';
import { log } from '@/common/utils/log';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
// no_cache get时传字符串
const SchemaData = {
  type: 'object',
  properties: {
    no_cache: { type: 'boolean' },
  }
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class GetGroupList extends BaseAction<Payload, OB11Group[]> {
  actionName = ActionName.GetGroupList;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    let groupList: Group[] = Array.from(groups.values());
    if (groupList.length === 0 || payload?.no_cache === true /*|| payload.no_cache === 'true'*/) {
      groupList = await NTQQGroupApi.getGroups(true);
      // log('get groups', groups);
    }
    return OB11Constructor.groups(groupList);
  }
}

export default GetGroupList;
