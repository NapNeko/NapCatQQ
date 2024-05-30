import BaseAction from '../BaseAction';
import { OB11User } from '../../types';
import { getUidByUin, uid2UinMap } from '@/core/data';
import { OB11Constructor } from '../../constructor';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis/user';
import { log, logDebug } from '@/common/utils/log';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    user_id: { type: [ 'number' , 'string' ] },
  },
  required: ['user_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class GoCQHTTPGetStrangerInfo extends BaseAction<Payload, OB11User> {
  actionName = ActionName.GoCQHTTP_GetStrangerInfo;

  protected async _handle(payload: Payload): Promise<OB11User> {
    const user_id = payload.user_id.toString();
    //logDebug('uidMaps', uidMaps);
    const uid = getUidByUin(user_id);
    if (!uid) {
      throw new Error('查无此人');
    }
    return OB11Constructor.stranger(await NTQQUserApi.getUserDetailInfo(uid));
  }
}
