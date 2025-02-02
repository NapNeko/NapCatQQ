import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const GroupRecallMsg = {
    type: ProtoField(1, ScalarType.UINT32),
    groupUin: ProtoField(2, ScalarType.UINT32),
    field3: ProtoField(3, () => GroupRecallMsgField3),
    field4: ProtoField(4, () => GroupRecallMsgField4),
};

export const GroupRecallMsgField3 = {
    sequence: ProtoField(1, ScalarType.UINT32),
    random: ProtoField(2, ScalarType.UINT32),
    field3: ProtoField(3, ScalarType.UINT32),
};

export const GroupRecallMsgField4 = {
    field1: ProtoField(1, ScalarType.UINT32),
};
