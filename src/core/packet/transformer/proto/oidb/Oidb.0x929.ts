import { ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { MsgInfo } from '@/core/packet/transformer/proto';


export const OidbSvcTrpcTcp0X929D_0 = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    chatType: ProtoField(2, ScalarType.UINT32),
};

export const OidbSvcTrpcTcp0X929D_0Resp = {
    content: ProtoField(1, () => OidbSvcTrpcTcp0X929D_0RespContent, false, true),
};

export const OidbSvcTrpcTcp0X929D_0RespContent = {
    category: ProtoField(1, ScalarType.STRING),
    voices: ProtoField(2, () => OidbSvcTrpcTcp0X929D_0RespContentVoice, false, true),
};

export const OidbSvcTrpcTcp0X929D_0RespContentVoice = {
    voiceId: ProtoField(1, ScalarType.STRING),
    voiceDisplayName: ProtoField(2, ScalarType.STRING),
    voiceExampleUrl: ProtoField(3, ScalarType.STRING),
};

export const OidbSvcTrpcTcp0X929B_0 = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    voiceId: ProtoField(2, ScalarType.STRING),
    text: ProtoField(3, ScalarType.STRING),
    chatType: ProtoField(4, ScalarType.UINT32),
    session: ProtoField(5, () => OidbSvcTrpcTcp0X929B_0_Session),
};

export const OidbSvcTrpcTcp0X929B_0_Session = {
    sessionId: ProtoField(1, ScalarType.UINT32),
};

export const OidbSvcTrpcTcp0X929B_0Resp = {
    statusCode: ProtoField(1, ScalarType.UINT32),
    field2: ProtoField(2, ScalarType.UINT32, true),
    field3: ProtoField(3, ScalarType.UINT32),
    msgInfo: ProtoField(4, () => MsgInfo, true),
};
