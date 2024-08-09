import { OB11Group } from '../../types';
import { OB11Constructor } from '../../helper/constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { Group } from '@/core/entities';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
// no_cache get时传字符串
const SchemaData = {
  type: 'object',
  properties: {
    no_cache: { type: ['boolean', 'string'] },
  }
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class GetGroupList extends BaseAction<Payload, OB11Group[]> {
  actionName = ActionName.GetGroupList;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    const NTQQGroupApi = this.CoreContext.getApiContext().GroupApi;
    const groupList: Group[]  = await NTQQGroupApi.getGroups(payload?.no_cache === true || payload.no_cache === 'true');
    return OB11Constructor.groups(groupList);
  }
}

export default GetGroupList;
