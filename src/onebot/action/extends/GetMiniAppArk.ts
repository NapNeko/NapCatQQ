import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { MiniAppInfo, MiniAppInfoHelper } from '@/core/packet/utils/helper/miniAppHelper';
import { MiniAppData, MiniAppRawData, MiniAppReqCustomParams, MiniAppReqParams } from '@/core/packet/entities/miniApp';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Union([
    Type.Object({
        type: Type.Union([Type.Literal('bili'), Type.Literal('weibo')]),
        title: Type.String(),
        desc: Type.String(),
        picUrl: Type.String(),
        jumpUrl: Type.String(),
        webUrl: Type.Optional(Type.String()),
        rawArkData: Type.Optional(Type.Union([Type.String()]))
    }),
    Type.Object({
        title: Type.String(),
        desc: Type.String(),
        picUrl: Type.String(),
        jumpUrl: Type.String(),
        iconUrl: Type.String(),
        webUrl: Type.Optional(Type.String()),
        appId: Type.String(),
        scene: Type.Union([Type.Number(), Type.String()]),
        templateType: Type.Union([Type.Number(), Type.String()]),
        businessType: Type.Union([Type.Number(), Type.String()]),
        verType: Type.Union([Type.Number(), Type.String()]),
        shareType: Type.Union([Type.Number(), Type.String()]),
        versionId: Type.String(),
        sdkId: Type.String(),
        withShareTicket: Type.Union([Type.Number(), Type.String()]),
        rawArkData: Type.Optional(Type.Union([Type.String()]))
    })
]);
type Payload = Static<typeof SchemaData>;

export class GetMiniAppArk extends GetPacketStatusDepends<Payload, {
    data: MiniAppData | MiniAppRawData
}> {
    override actionName = ActionName.GetMiniAppArk;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        let reqParam: MiniAppReqParams;
        const customParams = {
            title: payload.title,
            desc: payload.desc,
            picUrl: payload.picUrl,
            jumpUrl: payload.jumpUrl,
            webUrl: payload.webUrl,
        } as MiniAppReqCustomParams;
        if ('type' in payload) {
            reqParam = MiniAppInfoHelper.generateReq(customParams, MiniAppInfo.get(payload.type)!.template);
        } else {
            const { appId, scene, iconUrl, templateType, businessType, verType, shareType, versionId, withShareTicket } = payload;
            reqParam = MiniAppInfoHelper.generateReq(
                customParams,
                {
                    sdkId: payload.sdkId ?? MiniAppInfo.sdkId,
                    appId: appId,
                    scene: +scene,
                    iconUrl: iconUrl,
                    templateType: +templateType,
                    businessType: +businessType,
                    verType: +verType,
                    shareType: +shareType,
                    versionId: versionId,
                    withShareTicket: +withShareTicket,
                }
            );
        }
        const arkData = await this.core.apis.PacketApi.pkt.operation.GetMiniAppAdaptShareInfo(reqParam);
        return {
            data: payload.rawArkData === 'true' ? arkData : MiniAppInfoHelper.RawToSend(arkData)
        };
    }
}
