import { ActionName } from '@/napcat-onebot/action/router';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { MiniAppInfo, MiniAppInfoHelper } from 'napcat-core/packet/utils/helper/miniAppHelper';
import { MiniAppReqCustomParams, MiniAppReqParams } from 'napcat-core/packet/entities/miniApp';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Union([
  Type.Object({
    type: Type.Union([Type.Literal('bili'), Type.Literal('weibo')], { description: '模板类型' }),
    title: Type.String({ description: '标题' }),
    desc: Type.String({ description: '描述' }),
    picUrl: Type.String({ description: '图片URL' }),
    jumpUrl: Type.String({ description: '跳转URL' }),
    webUrl: Type.Optional(Type.String({ description: '网页URL' })),
    rawArkData: Type.Optional(Type.Union([Type.String()], { description: '是否返回原始Ark数据' })),
  }),
  Type.Object({
    title: Type.String({ description: '标题' }),
    desc: Type.String({ description: '描述' }),
    picUrl: Type.String({ description: '图片URL' }),
    jumpUrl: Type.String({ description: '跳转URL' }),
    iconUrl: Type.String({ description: '图标URL' }),
    webUrl: Type.Optional(Type.String({ description: '网页URL' })),
    appId: Type.String({ description: '小程序AppID' }),
    scene: Type.String({ description: '场景ID' }),
    templateType: Type.String({ description: '模板类型' }),
    businessType: Type.String({ description: '业务类型' }),
    verType: Type.String({ description: '版本类型' }),
    shareType: Type.String({ description: '分享类型' }),
    versionId: Type.String({ description: '版本ID' }),
    sdkId: Type.String({ description: 'SDK ID' }),
    withShareTicket: Type.String({ description: '是否携带分享票据' }),
    rawArkData: Type.Optional(Type.String({ description: '是否返回原始Ark数据' })),
  }),
], { description: '小程序Ark参数' });

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  data: Type.Any({ description: 'Ark数据' }),
}, { description: '获取小程序Ark结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetMiniAppArk extends GetPacketStatusDepends<PayloadType, ReturnType> {
  override actionName = ActionName.GetMiniAppArk;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    let reqParam: MiniAppReqParams;
    const customParams: MiniAppReqCustomParams = {
      title: payload.title,
      desc: payload.desc,
      picUrl: payload.picUrl,
      jumpUrl: payload.jumpUrl,
      webUrl: payload.webUrl ?? '',
    };
    if ('type' in payload) {
      const template = MiniAppInfo.get(payload.type)?.template;
      if (!template) {
        throw new Error('未知的模板类型');
      }
      reqParam = MiniAppInfoHelper.generateReq(customParams, template);
    } else {
      const { appId, scene, iconUrl, templateType, businessType, verType, shareType, versionId, withShareTicket } = payload;
      reqParam = MiniAppInfoHelper.generateReq(
        customParams,
        {
          sdkId: payload.sdkId ?? MiniAppInfo.sdkId,
          appId,
          scene: +scene,
          iconUrl,
          templateType: +templateType,
          businessType: +businessType,
          verType: +verType,
          shareType: +shareType,
          versionId,
          withShareTicket: +withShareTicket,
        }
      );
    }
    const arkData = await this.core.apis.PacketApi.pkt.operation.GetMiniAppAdaptShareInfo(reqParam);
    return {
      data: payload.rawArkData === 'true' ? arkData : MiniAppInfoHelper.RawToSend(arkData),
    };
  }
}
