import { ScalarType } from '@protobuf-ts/runtime';
import { ProtoField } from '@napneko/nap-proto-core';
import { ContentHead, MessageBody, MessageControl, RoutingHead } from '@/core/packet/transformer/proto';

export const FaceRoamRequest = {
    comm: ProtoField(1, () => PlatInfo, true),
    selfUin: ProtoField(2, ScalarType.UINT32),
    subCmd: ProtoField(3, ScalarType.UINT32),
    field6: ProtoField(6, ScalarType.UINT32),
};

export const PlatInfo = {
    imPlat: ProtoField(1, ScalarType.UINT32),
    osVersion: ProtoField(2, ScalarType.STRING, true),
    qVersion: ProtoField(3, ScalarType.STRING, true),
};

export const FaceRoamResponse = {
    retCode: ProtoField(1, ScalarType.UINT32),
    errMsg: ProtoField(2, ScalarType.STRING),
    subCmd: ProtoField(3, ScalarType.UINT32),
    userInfo: ProtoField(6, () => FaceRoamUserInfo),
};

export const FaceRoamUserInfo = {
    fileName: ProtoField(1, ScalarType.STRING, false, true),
    deleteFile: ProtoField(2, ScalarType.STRING, false, true),
    bid: ProtoField(3, ScalarType.STRING),
    maxRoamSize: ProtoField(4, ScalarType.UINT32),
    emojiType: ProtoField(5, ScalarType.UINT32, false, true),
};

export const SendMessageRequest = {
    state: ProtoField(1, ScalarType.INT32),
    sizeCache: ProtoField(2, ScalarType.INT32),
    unknownFields: ProtoField(3, ScalarType.BYTES),
    routingHead: ProtoField(4, () => RoutingHead),
    contentHead: ProtoField(5, () => ContentHead),
    messageBody: ProtoField(6, () => MessageBody),
    msgSeq: ProtoField(7, ScalarType.INT32),
    msgRand: ProtoField(8, ScalarType.INT32),
    syncCookie: ProtoField(9, ScalarType.BYTES),
    msgVia: ProtoField(10, ScalarType.INT32),
    dataStatist: ProtoField(11, ScalarType.INT32),
    messageControl: ProtoField(12, () => MessageControl),
    multiSendSeq: ProtoField(13, ScalarType.INT32),
};

export const SendMessageResponse = {
    result: ProtoField(1, ScalarType.INT32),
    errMsg: ProtoField(2, ScalarType.STRING, true),
    timestamp1: ProtoField(3, ScalarType.UINT32),
    field10: ProtoField(10, ScalarType.UINT32),
    groupSequence: ProtoField(11, ScalarType.UINT32, true),
    timestamp2: ProtoField(12, ScalarType.UINT32),
    privateSequence: ProtoField(14, ScalarType.UINT32),
};

export const SetStatus = {
    status: ProtoField(1, ScalarType.UINT32),
    extStatus: ProtoField(2, ScalarType.UINT32),
    batteryStatus: ProtoField(3, ScalarType.UINT32),
    customExt: ProtoField(4, () => SetStatusCustomExt, true),
};

export const SetStatusCustomExt = {
    faceId: ProtoField(1, ScalarType.UINT32),
    text: ProtoField(2, ScalarType.STRING, true),
    field3: ProtoField(3, ScalarType.UINT32),
};

export const SetStatusResponse = {
    message: ProtoField(2, ScalarType.STRING),
};

export const HttpConn = {
    field1: ProtoField(1, ScalarType.INT32),
    field2: ProtoField(2, ScalarType.INT32),
    field3: ProtoField(3, ScalarType.INT32),
    field4: ProtoField(4, ScalarType.INT32),
    tgt: ProtoField(5, ScalarType.STRING),
    field6: ProtoField(6, ScalarType.INT32),
    serviceTypes: ProtoField(7, ScalarType.INT32, false, true),
    field9: ProtoField(9, ScalarType.INT32),
    field10: ProtoField(10, ScalarType.INT32),
    field11: ProtoField(11, ScalarType.INT32),
    ver: ProtoField(15, ScalarType.STRING),
};

export const HttpConn0x6ff_501 = {
    httpConn: ProtoField(0x501, () => HttpConn),
};

export const HttpConn0x6ff_501Response = {
    httpConn: ProtoField(0x501, () => HttpConnResponse),
};

export const HttpConnResponse = {
    sigSession: ProtoField(1, ScalarType.BYTES),
    sessionKey: ProtoField(2, ScalarType.BYTES),
    serverInfos: ProtoField(3, () => ServerInfo, false, true),
};

export const ServerAddr = {
    type: ProtoField(1, ScalarType.UINT32),
    ip: ProtoField(2, ScalarType.FIXED32),
    port: ProtoField(3, ScalarType.UINT32),
    area: ProtoField(4, ScalarType.UINT32),
};

export const ServerInfo = {
    serviceType: ProtoField(1, ScalarType.UINT32),
    serverAddrs: ProtoField(2, () => ServerAddr, false, true),
};
