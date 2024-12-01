import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";
import { MiniAppInfo, MiniAppInfoHelper } from "@/core/packet/utils/helper/miniAppHelper";
import { MiniAppData, MiniAppRawData, MiniAppReqCustomParams, MiniAppReqParams } from "@/core/packet/entities/miniApp";
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    type: Type.Optional(Type.Union([Type.Literal('bili'), Type.Literal('weibo')])),
    title: Type.String(),
    desc: Type.String(),
    picUrl: Type.String(),
    jumpUrl: Type.String(),
    iconUrl: Type.Optional(Type.String()),
    sdkId: Type.Optional(Type.String()),
    appId: Type.Optional(Type.String()),
    scene: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    templateType: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    businessType: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    verType: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    shareType: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    versionId: Type.Optional(Type.String()),
    withShareTicket: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    rawArkData: Type.Optional(Type.Union([Type.Boolean(), Type.String()]))
});

type Payload = Static<typeof SchemaData>;

export class GetMiniAppArk extends GetPacketStatusDepends<Payload, {
    data: MiniAppData | MiniAppRawData
}> {
    actionName = ActionName.GetMiniAppArk;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        let reqParam: MiniAppReqParams;
        const customParams = {
            title: payload.title,
            desc: payload.desc,
            picUrl: payload.picUrl,
            jumpUrl: payload.jumpUrl
        } as MiniAppReqCustomParams;
        if (payload.type) {
            reqParam = MiniAppInfoHelper.generateReq(customParams, MiniAppInfo.get(payload.type)!.template);
        } else {
            const { appId, scene, iconUrl, templateType, businessType, verType, shareType, versionId, withShareTicket } = payload;
            if (!appId || !scene || !iconUrl || !templateType || !businessType || !verType || !shareType || !versionId || !withShareTicket) {
                throw new Error('Missing required parameters');
            }
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
                    withShareTicket: +withShareTicket
                }
            );
        }
        const arkData = await this.core.apis.PacketApi.pkt.operation.GetMiniAppAdaptShareInfo(reqParam);
        return {
            data: payload.rawArkData ? arkData : MiniAppInfoHelper.RawToSend(arkData)
        };
    }
}
