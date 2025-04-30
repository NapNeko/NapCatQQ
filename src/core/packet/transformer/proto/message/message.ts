import { ProtoField, ScalarType } from '@napneko/nap-proto-core';
import {
    C2C,
    ForwardHead,
    Grp,
    GrpTmp,
    ResponseForward,
    ResponseGrp, RichText,
    Trans0X211,
    WPATmp
} from '@/core/packet/transformer/proto';

export const ContentHead = {
    type: ProtoField(1, ScalarType.UINT32),
    subType: ProtoField(2, ScalarType.UINT32, true),
    c2cCmd: ProtoField(3, ScalarType.UINT32, true),
    ranDom: ProtoField(4, ScalarType.UINT32, true),
    sequence: ProtoField(5, ScalarType.UINT32, true),
    timeStamp: ProtoField(6, ScalarType.UINT32, true),
    pkgNum: ProtoField(7, ScalarType.UINT64, true),
    pkgIndex: ProtoField(8, ScalarType.UINT32, true),
    divSeq: ProtoField(9, ScalarType.UINT32, true),
    autoReply: ProtoField(10, ScalarType.UINT32),
    ntMsgSeq: ProtoField(10, ScalarType.UINT32, true),
    newId: ProtoField(12, ScalarType.UINT64, true),
    forward: ProtoField(15, () => ForwardHead, true),
};

export const MessageBody = {
    richText: ProtoField(1, () => RichText, true),
    msgContent: ProtoField(2, ScalarType.BYTES, true),
    msgEncryptContent: ProtoField(3, ScalarType.BYTES, true),
};

export const Message = {
    routingHead: ProtoField(1, () => RoutingHead, true),
    contentHead: ProtoField(2, () => ContentHead, true),
    body: ProtoField(3, () => MessageBody, true),
    clientSequence: ProtoField(4, ScalarType.UINT32, true),
    random: ProtoField(5, ScalarType.UINT32, true),
    syncCookie: ProtoField(6, ScalarType.BYTES, true),
    via: ProtoField(8, ScalarType.UINT32, true),
    dataStatist: ProtoField(9, ScalarType.UINT32, true),
    ctrl: ProtoField(12, () => MessageControl, true),
    multiSendSeq: ProtoField(14, ScalarType.UINT32),
};

export const MessageControl = {
    msgFlag: ProtoField(1, ScalarType.INT32),
};

export const PushMsg = {
    message: ProtoField(1, () => PushMsgBody),
    status: ProtoField(3, ScalarType.INT32, true),
    pingFlag: ProtoField(5, ScalarType.INT32, true),
    generalFlag: ProtoField(9, ScalarType.INT32, true),
};

export const GroupChangeInfo = {
    operator: ProtoField(1, () => GroupChangeOperator, true),
};

export const GroupChangeOperator = {
    operatorUid: ProtoField(1, ScalarType.STRING, true),
};

export const GroupChange = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    flag: ProtoField(2, ScalarType.UINT32),
    memberUid: ProtoField(3, ScalarType.STRING, true),
    decreaseType: ProtoField(4, ScalarType.UINT32),
    operatorInfo: ProtoField(5, ScalarType.BYTES, true),
    increaseType: ProtoField(6, ScalarType.UINT32),
    field7: ProtoField(7, ScalarType.BYTES, true),
};

export const GroupInvite = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    field2: ProtoField(2, ScalarType.UINT32),
    field3: ProtoField(2, ScalarType.UINT32),
    field4: ProtoField(2, ScalarType.UINT32),
    invitorUid: ProtoField(5, ScalarType.STRING),
};

export const PushMsgBody = {
    responseHead: ProtoField(1, () => ResponseHead),
    contentHead: ProtoField(2, () => ContentHead),
    body: ProtoField(3, () => MessageBody, true),
};

export const ResponseHead = {
    fromUin: ProtoField(1, ScalarType.UINT32),
    fromUid: ProtoField(2, ScalarType.STRING, true),
    type: ProtoField(3, ScalarType.UINT32),
    sigMap: ProtoField(4, ScalarType.UINT32),
    toUin: ProtoField(5, ScalarType.UINT32),
    toUid: ProtoField(6, ScalarType.STRING, true),
    forward: ProtoField(7, () => ResponseForward, true),
    grp: ProtoField(8, () => ResponseGrp, true),
};

export const RoutingHead = {
    c2c: ProtoField(1, () => C2C, true),
    grp: ProtoField(2, () => Grp, true),
    grpTmp: ProtoField(3, () => GrpTmp, true),
    wpaTmp: ProtoField(6, () => WPATmp, true),
    trans0X211: ProtoField(15, () => Trans0X211, true),
};

