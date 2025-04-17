import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { MiniAppInfo, MiniAppInfoHelper } from '@/core/packet/utils/helper/miniAppHelper';
import { MiniAppData, MiniAppRawData, MiniAppReqCustomParams, MiniAppReqParams } from '@/core/packet/entities/miniApp';
import { z } from 'zod';
import { coerce } from '@/common/coerce';
const SchemaData = z.union([
    z.object({
        type: z.union([z.literal('bili'), z.literal('weibo')]),
        title: coerce.string(),
        desc: coerce.string(),
        picUrl: coerce.string(),
        jumpUrl: coerce.string(),
        webUrl: coerce.string().optional(),
        rawArkData: coerce.string().optional()
    }),
    z.object({
        title: coerce.string(),
        desc: coerce.string(),
        picUrl: coerce.string(),
        jumpUrl: coerce.string(),
        iconUrl: coerce.string(),
        webUrl: coerce.string().optional(),
        appId: coerce.string(),
        scene: z.union([coerce.number(), coerce.string()]),
        templateType: z.union([coerce.number(), coerce.string()]),
        businessType: z.union([coerce.number(), coerce.string()]),
        verType: z.union([coerce.number(), coerce.string()]),
        shareType: z.union([coerce.number(), coerce.string()]),
        versionId: coerce.string(),
        sdkId: coerce.string(),
        withShareTicket: z.union([coerce.number(), coerce.string()]),
        rawArkData: coerce.string().optional()
    })
]);
type Payload = z.infer<typeof SchemaData>;

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
