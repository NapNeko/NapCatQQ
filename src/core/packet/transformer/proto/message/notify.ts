import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const FriendRecall = {
    info: ProtoField(1, () => FriendRecallInfo),
    instId: ProtoField(2, ScalarType.UINT32),
    appId: ProtoField(3, ScalarType.UINT32),
    longMessageFlag: ProtoField(4, ScalarType.UINT32),
    reserved: ProtoField(5, ScalarType.BYTES),
};

export const FriendRecallInfo = {
    fromUid: ProtoField(1, ScalarType.STRING),
    toUid: ProtoField(2, ScalarType.STRING),
    sequence: ProtoField(3, ScalarType.UINT32),
    newId: ProtoField(4, ScalarType.UINT64),
    time: ProtoField(5, ScalarType.UINT32),
    random: ProtoField(6, ScalarType.UINT32),
    pkgNum: ProtoField(7, ScalarType.UINT32),
    pkgIndex: ProtoField(8, ScalarType.UINT32),
    divSeq: ProtoField(9, ScalarType.UINT32),
};
