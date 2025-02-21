import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const OidbSvcTrpcTcp0xE07_0 = {
    version: ProtoField(1, ScalarType.UINT32),
    client: ProtoField(2, ScalarType.UINT32),
    entrance: ProtoField(3, ScalarType.UINT32),
    ocrReqBody: ProtoField(10, () => OcrReqBody, true),
};

export const OcrReqBody = {
    imageUrl: ProtoField(1, ScalarType.STRING),
    languageType: ProtoField(2, ScalarType.UINT32),
    scene: ProtoField(3, ScalarType.UINT32),
    originMd5: ProtoField(10, ScalarType.STRING),
    afterCompressMd5: ProtoField(11, ScalarType.STRING),
    afterCompressFileSize: ProtoField(12, ScalarType.STRING),
    afterCompressWeight: ProtoField(13, ScalarType.STRING),
    afterCompressHeight: ProtoField(14, ScalarType.STRING),
    isCut: ProtoField(15, ScalarType.BOOL),
};

export const OidbSvcTrpcTcp0xE07_0_Response = {
    retCode: ProtoField(1, ScalarType.INT32),
    errMsg: ProtoField(2, ScalarType.STRING),
    wording: ProtoField(3, ScalarType.STRING),
    ocrRspBody: ProtoField(10, () => OcrRspBody),
};

export const OcrRspBody = {
    textDetections: ProtoField(1, () => TextDetection, false, true),
    language: ProtoField(2, ScalarType.STRING),
    requestId: ProtoField(3, ScalarType.STRING),
    ocrLanguageList: ProtoField(101, ScalarType.STRING, false, true),
    dstTranslateLanguageList: ProtoField(102, ScalarType.STRING, false, true),
    languageList: ProtoField(103, () => Language, false, true),
    afterCompressWeight: ProtoField(111, ScalarType.UINT32),
    afterCompressHeight: ProtoField(112, ScalarType.UINT32),
};

export const TextDetection = {
    detectedText: ProtoField(1, ScalarType.STRING),
    confidence: ProtoField(2, ScalarType.UINT32),
    polygon: ProtoField(3, () => Polygon),
    advancedInfo: ProtoField(4, ScalarType.STRING),
};

export const Polygon = {
    coordinates: ProtoField(1, () => Coordinate, false, true),
};

export const Coordinate = {
    x: ProtoField(1, ScalarType.INT32),
    y: ProtoField(2, ScalarType.INT32),
};

export const Language = {
    languageCode: ProtoField(1, ScalarType.STRING),
    languageDesc: ProtoField(2, ScalarType.STRING),
};
