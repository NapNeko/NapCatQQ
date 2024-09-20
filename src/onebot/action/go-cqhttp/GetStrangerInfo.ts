import BaseAction from '../BaseAction';
import { OB11User, OB11UserSex } from '@/onebot';
import { OB11Entities } from '@/onebot/entities';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { calcQQLevel } from '@/common/helper';

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
        const user_id = payload.user_id.toString();
        const extendData = await this.core.apis.UserApi.getUserDetailInfoByUin(user_id);
        let uid = (await this.core.apis.UserApi.getUidByUinV2(user_id));
        if (!uid) uid = extendData.detail.uid;
        const info = (await this.core.apis.UserApi.getUserDetailInfo(uid));
        return {
            user_id: parseInt(extendData.detail.uin) ?? 0,
            uid: info.uid ?? uid,
            nickname: extendData.detail.simpleInfo.coreInfo.nick,
            age: extendData.detail.simpleInfo.baseInfo.age ?? info.age,
            qid: extendData.detail.simpleInfo.baseInfo.qid,
            qqLevel: calcQQLevel(extendData.detail.commonExt?.qqLevel ?? info.qqLevel),
            sex: OB11Entities.sex(extendData.detail.simpleInfo.baseInfo.sex) ?? OB11UserSex.unknown,
            long_nick: extendData.detail.simpleInfo.baseInfo.longNick ?? info.longNick,
            reg_time: extendData.detail.commonExt.regTime ?? info.regTime,
            is_vip: extendData.detail.simpleInfo.vasInfo?.svipFlag,
            is_years_vip: extendData.detail.simpleInfo.vasInfo?.yearVipFlag,
            vip_level: extendData.detail.simpleInfo.vasInfo?.vipLevel,
            remark: extendData.detail.simpleInfo.coreInfo.remark ?? info.remark,
            status: extendData.detail.simpleInfo.status?.status ?? info.status,
            login_days: 0,//失效
        };
    }
}
