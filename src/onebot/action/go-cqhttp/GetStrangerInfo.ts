import BaseAction from '../BaseAction';
import { OB11User, OB11UserSex } from '../../types';
import { OB11Constructor } from '../../helper/data';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { calcQQLevel } from '@/common/utils/helper';

const SchemaData = {
    type: 'object',
    properties: {
        user_id: { type: ['number', 'string'] },
    },
    required: ['user_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class GoCQHTTPGetStrangerInfo extends BaseAction<Payload, OB11User> {
    actionName = ActionName.GoCQHTTP_GetStrangerInfo;

    async _handle(payload: Payload): Promise<OB11User> {
        const NTQQUserApi = this.CoreContext.apis.UserApi;
        const user_id = payload.user_id.toString();
        const extendData = await NTQQUserApi.getUserDetailInfoByUinV2(user_id);
        const uid = (await NTQQUserApi.getUidByUinV2(user_id))!;
        if (!uid || uid.indexOf('*') != -1) {
            const ret = {
                ...extendData.detail.simpleInfo.coreInfo,
                ...extendData.detail.commonExt,
                ...extendData.detail.simpleInfo.baseInfo,
                ...extendData.detail.simpleInfo.relationFlags,
                user_id: parseInt(extendData.detail.uin) || 0,
                nickname: extendData.detail.simpleInfo.coreInfo.nick,
                sex: OB11UserSex.unknown,
                age: extendData.detail.simpleInfo.baseInfo.age || 0,
                qid: extendData.detail.simpleInfo.baseInfo.qid,
                level: calcQQLevel(extendData.detail.commonExt?.qqLevel ?? 0) || 0,
                login_days: 0,
                uid: ''
              };
            return ret;
        }
        const data = { ...extendData, ...(await NTQQUserApi.getUserDetailInfo(uid)) };
        return OB11Constructor.stranger(data);
    }
}
