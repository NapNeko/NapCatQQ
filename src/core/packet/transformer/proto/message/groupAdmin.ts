import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const GroupAdminExtra = {
    adminUid: ProtoField(1, ScalarType.STRING),
    isPromote: ProtoField(2, ScalarType.BOOL),
};

export const GroupAdminBody = {
    extraDisable: ProtoField(1, () => GroupAdminExtra),
    extraEnable: ProtoField(2, () => GroupAdminExtra),
};

export const GroupAdmin = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    flag: ProtoField(2, ScalarType.UINT32),
    isPromote: ProtoField(3, ScalarType.BOOL),
    body: ProtoField(4, () => GroupAdminBody),
};