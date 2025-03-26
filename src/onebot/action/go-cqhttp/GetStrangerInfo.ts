import { OneBotAction } from '@/onebot/action/OneBotAction';
import { OB11User, OB11UserSex } from '@/onebot';
import { OB11Construct } from '@/onebot/helper/data';
import { ActionName } from '@/onebot/action/router';
import { calcQQLevel } from '@/common/helper';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    user_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

export default class GoCQHTTPGetStrangerInfo extends OneBotAction<Payload, OB11User & { uid: string }> {
    override actionName = ActionName.GoCQHTTP_GetStrangerInfo;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        const user_id = payload.user_id.toString();
        const extendData = await this.core.apis.UserApi.getUserDetailInfoByUin(user_id);
        let uid = (await this.core.apis.UserApi.getUidByUinV2(user_id));
        if (!uid) uid = extendData.detail.uid;
        const info = (await this.core.apis.UserApi.getUserDetailInfoV2(uid));
        return {
            ...extendData.detail.simpleInfo.coreInfo,
            ...extendData.detail.commonExt ?? {},
            ...extendData.detail.simpleInfo.baseInfo,
            ...extendData.detail.simpleInfo.relationFlags ?? {},
            ...extendData.detail.simpleInfo.status ?? {},
            user_id: parseInt(extendData.detail.uin) ?? 0,
            uid: info.uid ?? uid,
            nickname: extendData.detail.simpleInfo.coreInfo.nick ?? '',
            age: extendData.detail.simpleInfo.baseInfo.age ?? info.simpleInfo?.baseInfo.age,
            qid: extendData.detail.simpleInfo.baseInfo.qid,
            qqLevel: calcQQLevel(extendData.detail.commonExt?.qqLevel ?? info.commonExt?.qqLevel),
            sex: OB11Construct.sex(extendData.detail.simpleInfo.baseInfo.sex) ?? OB11UserSex.unknown,
            long_nick: extendData.detail.simpleInfo.baseInfo.longNick ?? info.simpleInfo?.baseInfo.longNick,
            reg_time: extendData.detail.commonExt?.regTime ?? info.commonExt?.regTime,
            is_vip: extendData.detail.simpleInfo.vasInfo?.svipFlag,
            is_years_vip: extendData.detail.simpleInfo.vasInfo?.yearVipFlag,
            vip_level: extendData.detail.simpleInfo.vasInfo?.vipLevel,
            remark: extendData.detail.simpleInfo.coreInfo.remark ?? info.simpleInfo?.coreInfo.remark,
            status: extendData.detail.simpleInfo.status?.status ?? info.simpleInfo?.status?.status,
            login_days: 0,//失效
        };
    }
}
