import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { OB11UserSex } from '@/napcat-onebot/index';
import { OB11Construct } from '@/napcat-onebot/helper/data';
import { ActionName } from '@/napcat-onebot/action/router';
import { calcQQLevel } from 'napcat-common/src/helper';
import { Static, Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  user_id: Type.String({ description: '用户QQ' }),
  no_cache: Type.Union([Type.Boolean(), Type.String()], { default: false, description: '是否不使用缓存' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  user_id: Type.Number({ description: '用户QQ' }),
  uid: Type.String({ description: 'UID' }),
  nickname: Type.String({ description: '昵称' }),
  age: Type.Number({ description: '年龄' }),
  qid: Type.String({ description: 'QID' }),
  qqLevel: Type.Number({ description: 'QQ等级' }),
  sex: Type.String({ description: '性别' }),
  long_nick: Type.String({ description: '个性签名' }),
  reg_time: Type.Number({ description: '注册时间' }),
  is_vip: Type.Boolean({ description: '是否VIP' }),
  is_years_vip: Type.Boolean({ description: '是否年费VIP' }),
  vip_level: Type.Number({ description: 'VIP等级' }),
  remark: Type.String({ description: '备注' }),
  status: Type.Number({ description: '状态' }),
  login_days: Type.Number({ description: '登录天数' }),
}, { description: '陌生人信息' });

type ReturnType = Static<typeof ReturnSchema>;

export default class GoCQHTTPGetStrangerInfo extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GoCQHTTP_GetStrangerInfo;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionDescription = '获取陌生人信息';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.GetStrangerInfo.payload;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const user_id = payload.user_id.toString();
    const isNocache = typeof payload.no_cache === 'string' ? payload.no_cache === 'true' : !!payload.no_cache;
    const extendData = await this.core.apis.UserApi.getUserDetailInfoByUin(user_id);
    let uid = (await this.core.apis.UserApi.getUidByUinV2(user_id));
    if (!uid) uid = extendData.detail.uid;
    const info = (await this.core.apis.UserApi.getUserDetailInfo(uid, isNocache));
    return {
      ...extendData.detail.simpleInfo.coreInfo,
      ...extendData.detail.commonExt ?? {},
      ...extendData.detail.simpleInfo.baseInfo,
      ...extendData.detail.simpleInfo.relationFlags ?? {},
      ...extendData.detail.simpleInfo.status ?? {},
      user_id: parseInt(extendData.detail.uin) ?? 0,
      uid: info.uid ?? uid,
      nickname: extendData.detail.simpleInfo.coreInfo.nick ?? '',
      age: extendData.detail.simpleInfo.baseInfo.age ?? info.age,
      qid: extendData.detail.simpleInfo.baseInfo.qid,
      qqLevel: calcQQLevel(extendData.detail.commonExt?.qqLevel ?? info.qqLevel),
      sex: OB11Construct.sex(extendData.detail.simpleInfo.baseInfo.sex) ?? OB11UserSex.unknown,
      long_nick: extendData.detail.simpleInfo.baseInfo.longNick ?? info.longNick,
      reg_time: extendData.detail.commonExt?.regTime ?? info.regTime,
      is_vip: extendData.detail.simpleInfo.vasInfo?.svipFlag ?? false,
      is_years_vip: extendData.detail.simpleInfo.vasInfo?.yearVipFlag ?? false,
      vip_level: extendData.detail.simpleInfo.vasInfo?.vipLevel ?? 0,
      remark: extendData.detail.simpleInfo.coreInfo.remark ?? info.remark ?? '',
      status: extendData.detail.simpleInfo.status?.status ?? info.status ?? 0,
      login_days: 0, // 失效
    };
  }
}
