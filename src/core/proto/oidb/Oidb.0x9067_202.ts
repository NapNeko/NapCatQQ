import { ScalarType } from "@protobuf-ts/runtime";
import { ProtoField } from "../NapProto";
import { MultiMediaReqHead } from "./common/Ntv2.RichMedia";

export const OidbSvcTrpcTcp0X9067_202 = {
    ReqHead: ProtoField(1, () => MultiMediaReqHead),
    DownloadRKeyReq: ProtoField(4, ScalarType.BYTES),
}