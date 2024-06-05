import BaseAction from '../BaseAction';
import { OB11User, OB11UserSex } from '../../types';
import { OB11Constructor } from '../../constructor';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis/user';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { calcQQLevel } from '@/common/utils/qqlevel';

const SchemaData = {
  type: 'object',
  properties: {
    user_id: { type: ['number', 'string'] },
  },
  required: ['user_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class GoCQHTTPGetStrangerInfo extends BaseAction<Payload, OB11User> {
  actionName = ActionName.GoCQHTTP_GetStrangerInfo;

  protected async _handle(payload: Payload): Promise<OB11User> {
    const user_id = payload.user_id.toString();
    let extendData = await NTQQUserApi.getUserDetailInfoByUin(user_id);
    let uid = (await NTQQUserApi.getUidByUin(user_id))!;
    if (!uid || uid.indexOf('*') != -1) {
      let ret = {
        ...extendData,
        user_id: parseInt(extendData.info.uin) || 0,
        nickname: extendData.info.nick,
        sex: OB11UserSex.unknown,
        age: (extendData.info.birthday_year == 0) ? 0 : new Date().getFullYear() - extendData.info.birthday_year,
        qid: extendData.info.qid,
        level: extendData.info.qqLevel && calcQQLevel(extendData.info.qqLevel) || 0,
        login_days: 0,
        uid: ''
      }
      return ret;
    }
    let data = { ...extendData, ...(await NTQQUserApi.getUserDetailInfo(uid)) };
    return OB11Constructor.stranger(data);
  }
}
