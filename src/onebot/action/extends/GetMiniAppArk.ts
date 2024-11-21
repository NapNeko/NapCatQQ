import { ActionName } from '@/onebot/action/router';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";
import { MiniAppInfo, MiniAppInfoHelper } from "@/core/packet/utils/helper/miniAppHelper";
import { MiniAppData, MiniAppRawData, MiniAppReqCustomParams, MiniAppReqParams } from "@/core/packet/entities/miniApp";

const SchemaData = {
    type: 'object',
    properties: {
        type: {
            type: 'string',
            enum: ['bili', 'weibo']
        },
        title: { type: 'string' },
        desc: { type: 'string' },
        picUrl: { type: 'string' },
        jumpUrl: { type: 'string' },
        iconUrl: { type: 'string' },
        sdkId: { type: 'string' },
        appId: { type: 'string' },
        scene: { type: ['number', 'string'] },
        templateType: { type: ['number', 'string'] },
        businessType: { type: ['number', 'string'] },
        verType: { type: ['number', 'string'] },
        shareType: { type: ['number', 'string'] },
        versionId: { type: 'string' },
        withShareTicket: { type: ['number', 'string'] },
        rawArkData: { type: ['boolean', 'string'] }
    },
    oneOf: [
        {
            required: ['type', 'title', 'desc', 'picUrl', 'jumpUrl']
        },
        {
            required: [
                'title', 'desc', 'picUrl', 'jumpUrl',
                'iconUrl', 'appId', 'scene', 'templateType', 'businessType',
                'verType', 'shareType', 'versionId', 'withShareTicket'
            ]
        }
    ]
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

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
