import { ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { PushMsgBody } from '@/core/packet/transformer/proto';

export const LongMsgResult = {
    action: ProtoField(2, () => LongMsgAction, false, true)
};

export const LongMsgAction = {
    actionCommand: ProtoField(1, ScalarType.STRING),
    actionData: ProtoField(2, () => LongMsgContent)
};

export const LongMsgContent = {
    msgBody: ProtoField(1, () => PushMsgBody, false, true)
};

export const RecvLongMsgReq = {
    info: ProtoField(1, () => RecvLongMsgInfo, true),
    settings: ProtoField(15, () => LongMsgSettings, true)
};

export const RecvLongMsgInfo = {
    uid: ProtoField(1, () => LongMsgUid, true),
    resId: ProtoField(2, ScalarType.STRING, true),
    acquire: ProtoField(3, ScalarType.BOOL)
};

export const LongMsgUid = {
    uid: ProtoField(2, ScalarType.STRING, true)
};

export const LongMsgSettings = {
    field1: ProtoField(1, ScalarType.UINT32),
    field2: ProtoField(2, ScalarType.UINT32),
    field3: ProtoField(3, ScalarType.UINT32),
    field4: ProtoField(4, ScalarType.UINT32)
};

export const RecvLongMsgResp = {
    result: ProtoField(1, () => RecvLongMsgResult),
    settings: ProtoField(15, () => LongMsgSettings)
};

export const RecvLongMsgResult = {
    resId: ProtoField(3, ScalarType.STRING),
    payload: ProtoField(4, ScalarType.BYTES)
};

export const SendLongMsgReq = {
    info: ProtoField(2, () => SendLongMsgInfo),
    settings: ProtoField(15, () => LongMsgSettings)
};

export const SendLongMsgInfo = {
    type: ProtoField(1, ScalarType.UINT32),
    uid: ProtoField(2, () => LongMsgUid, true),
    groupUin: ProtoField(3, ScalarType.UINT32, true),
    payload: ProtoField(4, ScalarType.BYTES, true)
};

export const SendLongMsgResp = {
    result: ProtoField(2, () => SendLongMsgResult),
    settings: ProtoField(15, () => LongMsgSettings)
};

export const SendLongMsgResult = {
    resId: ProtoField(3, ScalarType.STRING)
};

export const SsoGetGroupMsg = {
    info: ProtoField(1, () => SsoGetGroupMsgInfo),
    direction: ProtoField(2, ScalarType.BOOL)
};

export const SsoGetGroupMsgInfo = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    startSequence: ProtoField(2, ScalarType.UINT32),
    endSequence: ProtoField(3, ScalarType.UINT32)
};

export const SsoGetGroupMsgResponse = {
    body: ProtoField(3, () => SsoGetGroupMsgResponseBody)
};

export const SsoGetGroupMsgResponseBody = {
    groupUin: ProtoField(3, ScalarType.UINT32),
    startSequence: ProtoField(4, ScalarType.UINT32),
    endSequence: ProtoField(5, ScalarType.UINT32),
    messages: ProtoField(6, () => PushMsgBody, false, true)
};

export const SsoGetRoamMsg = {
    friendUid: ProtoField(1, ScalarType.STRING, true),
    time: ProtoField(2, ScalarType.UINT32),
    random: ProtoField(3, ScalarType.UINT32),
    count: ProtoField(4, ScalarType.UINT32),
    direction: ProtoField(5, ScalarType.BOOL)
};

export const SsoGetRoamMsgResponse = {
    friendUid: ProtoField(3, ScalarType.STRING),
    timestamp: ProtoField(5, ScalarType.UINT32),
    random: ProtoField(6, ScalarType.UINT32),
    messages: ProtoField(7, () => PushMsgBody, false, true)
};

export const SsoGetC2cMsg = {
    friendUid: ProtoField(2, ScalarType.STRING, true),
    startSequence: ProtoField(3, ScalarType.UINT32),
    endSequence: ProtoField(4, ScalarType.UINT32)
};

export const SsoGetC2cMsgResponse = {
    friendUid: ProtoField(4, ScalarType.STRING),
    messages: ProtoField(7, () => PushMsgBody, false, true)
};
