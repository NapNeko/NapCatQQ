import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const MiniAppAdaptShareInfoReq = {
    appId: ProtoField(2, ScalarType.STRING),
    body: ProtoField(4, () => MiniAppAdaptShareInfoReqBody),
};

export const MiniAppAdaptShareInfoReqBody = {
    extInfo: ProtoField(1, () => ExtInfo),
    appid: ProtoField(2, ScalarType.STRING),
    title: ProtoField(3, ScalarType.STRING),
    desc: ProtoField(4, ScalarType.STRING),
    time: ProtoField(5, ScalarType.UINT64),
    scene: ProtoField(6, ScalarType.UINT32),
    templateType: ProtoField(7, ScalarType.UINT32),
    businessType: ProtoField(8, ScalarType.UINT32),
    picUrl: ProtoField(9, ScalarType.STRING),
    vidUrl: ProtoField(10, ScalarType.STRING),
    jumpUrl: ProtoField(11, ScalarType.STRING),
    iconUrl: ProtoField(12, ScalarType.STRING),
    verType: ProtoField(13, ScalarType.UINT32),
    shareType: ProtoField(14, ScalarType.UINT32),
    versionId: ProtoField(15, ScalarType.STRING),
    withShareTicket: ProtoField(16, ScalarType.UINT32),
    webURL: ProtoField(17, ScalarType.STRING),
    appidRich: ProtoField(18, ScalarType.BYTES),
    template: ProtoField(19, () => Template),
    field20: ProtoField(20, ScalarType.STRING),
};

export const ExtInfo = {
    field2: ProtoField(2, ScalarType.BYTES),
};

export const Template = {
    templateId: ProtoField(1, ScalarType.STRING),
    templateData: ProtoField(2, ScalarType.STRING),
};

export const MiniAppAdaptShareInfoResp = {
    field2: ProtoField(2, ScalarType.UINT32),
    field3: ProtoField(3, ScalarType.STRING),
    content: ProtoField(4, () => MiniAppAdaptShareInfoRespContent),
};

export const MiniAppAdaptShareInfoRespContent = {
    jsonContent: ProtoField(2, ScalarType.STRING),
};
