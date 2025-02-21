import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const ForwardHead = {
    field1: ProtoField(1, ScalarType.UINT32, true),
    field2: ProtoField(2, ScalarType.UINT32, true),
    field3: ProtoField(3, ScalarType.UINT32, true),
    unknownBase64: ProtoField(5, ScalarType.STRING, true),
    avatar: ProtoField(6, ScalarType.STRING, true),
};

export const Grp = {
    groupCode: ProtoField(1, ScalarType.UINT32, true),
};

export const GrpTmp = {
    groupUin: ProtoField(1, ScalarType.UINT32, true),
    toUin: ProtoField(2, ScalarType.UINT32, true),
};

export const ResponseForward = {
    friendName: ProtoField(6, ScalarType.STRING, true),
};

export const ResponseGrp = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    memberName: ProtoField(4, ScalarType.STRING),
    unknown5: ProtoField(5, ScalarType.UINT32),
    groupName: ProtoField(7, ScalarType.STRING),
};

export const Trans0X211 = {
    toUin: ProtoField(1, ScalarType.UINT64, true),
    ccCmd: ProtoField(2, ScalarType.UINT32, true),
    uid: ProtoField(8, ScalarType.STRING, true),
};

export const WPATmp = {
    toUin: ProtoField(1, ScalarType.UINT64),
    sig: ProtoField(2, ScalarType.BYTES),
};
