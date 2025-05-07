import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const FileId = {
    appid: ProtoField(4, ScalarType.UINT32, true),
    ttl: ProtoField(10, ScalarType.UINT32, true),
};
