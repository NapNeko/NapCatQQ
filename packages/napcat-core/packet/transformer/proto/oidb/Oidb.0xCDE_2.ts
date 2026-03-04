import { ProtoField, ScalarType } from 'napcat-protobuf';

// OidbSvcTrpcTcp.0xcde_2 响应体
// body.field2.field1 为目标字符串值
export const OidbSvcTrpcTcp0XCDE_2RespBodyInner = {
  value: ProtoField(1, ScalarType.STRING),
};

export const OidbSvcTrpcTcp0XCDE_2RespBody = {
  inner: ProtoField(2, () => OidbSvcTrpcTcp0XCDE_2RespBodyInner),
};
