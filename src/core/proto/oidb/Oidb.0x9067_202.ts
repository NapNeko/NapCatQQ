import { ScalarType } from "@protobuf-ts/runtime";
import { ProtoField } from "../NapProto";
import { MultiMediaReqHead } from "./common/Ntv2.RichMedia";

//Req
export const OidbSvcTrpcTcp0X9067_202 = {
    ReqHead: ProtoField(1, () => MultiMediaReqHead),
    DownloadRKeyReq: ProtoField(4, () => OidbSvcTrpcTcp0X9067_202Key),
}
export const OidbSvcTrpcTcp0X9067_202Key = {
    key: ProtoField(1, ScalarType.INT32, false, true),
}

//Rsp
export const OidbSvcTrpcTcp0X9067_202_RkeyList = {
    rkey: ProtoField(1, ScalarType.STRING),
    time: ProtoField(4, ScalarType.UINT32),
    type: ProtoField(5, ScalarType.UINT32),

}
export const OidbSvcTrpcTcp0X9067_202_Data = {
    rkeyList: ProtoField(1, () => OidbSvcTrpcTcp0X9067_202_RkeyList, false, true),
}
export const OidbSvcTrpcTcp0X9067_202_Rsp_Body = {
    data: ProtoField(4, () => OidbSvcTrpcTcp0X9067_202_Data),
}