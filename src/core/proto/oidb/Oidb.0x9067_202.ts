import { ScalarType } from "@protobuf-ts/runtime";
import { ProtoField } from "../NapProto";
import { MultiMediaReqHead } from "./common/Ntv2.RichMedia";

export const OidbSvcTrpcTcp0X9067_202 = {
    ReqHead: ProtoField(1, () => MultiMediaReqHead),
    DownloadRKeyReq: ProtoField(4, () => OidbSvcTrpcTcp0X9067_202Key, true, false),
}
export const OidbSvcTrpcTcp0X9067_202Key = {
    key: ProtoField(1, ScalarType.UINT32)
}
