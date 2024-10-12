import { ScalarType } from "@protobuf-ts/runtime";
import { ProtoField } from "../../NapProto";


export const NTV2RichMediaReq = {
    ReqHead: ProtoField(1, ScalarType.BYTES),
    DownloadRKeyReq: ProtoField(4, ScalarType.BYTES),
}
export const MultiMediaReqHead = {
    Common: ProtoField(1, () => CommonHead),
    Scene: ProtoField(2, () => SceneInfo),
    Clent: ProtoField(3, () => ClientMeta),
}
export const CommonHead = {
    RequestId: ProtoField(1, ScalarType.UINT32),
    Command: ProtoField(2, ScalarType.UINT32),
}
export const SceneInfo = {
    RequestType: ProtoField(101, ScalarType.UINT32),
    BusinessType: ProtoField(102, ScalarType.UINT32),
    SceneType: ProtoField(200, ScalarType.UINT32),
}
export const C2CUserInfo = {
    AccountType: ProtoField(1, ScalarType.UINT32),
    TargetUid: ProtoField(2, ScalarType.STRING),
}
export const GroupInfo = {
    GroupUin: ProtoField(1, ScalarType.UINT32),
}
export const ClientMeta = {
    AgentType: ProtoField(1, ScalarType.UINT32),
}
export const DownloadReq = {
    Node: ProtoField(1, ScalarType.BYTES),
    Download: ProtoField(2, ScalarType.BYTES),
}
export const FileInfo = {
    FileSize: ProtoField(1, ScalarType.UINT32),
    FileHash: ProtoField(2, ScalarType.STRING),
    FileSha1: ProtoField(3, ScalarType.STRING),
    FileName: ProtoField(4, ScalarType.STRING),
    Type: ProtoField(5, ScalarType.BYTES),
    Width: ProtoField(6, ScalarType.UINT32),
    Height: ProtoField(7, ScalarType.UINT32),
    Time: ProtoField(8, ScalarType.UINT32),
    Original: ProtoField(9, ScalarType.UINT32),
}
export const IndexNode = {
    Info: ProtoField(1, ScalarType.BYTES),
    FileUuid: ProtoField(2, ScalarType.STRING),
    StoreId: ProtoField(3, ScalarType.UINT32),
    UploadTime: ProtoField(4, ScalarType.UINT32),
    Ttl: ProtoField(5, ScalarType.UINT32),
    subType: ProtoField(6, ScalarType.UINT32),
}
export const FileType = {
    Type: ProtoField(1, ScalarType.UINT32),
    PicFormat: ProtoField(2, ScalarType.UINT32),
    VideoFormat: ProtoField(3, ScalarType.UINT32),
    VoiceFormat: ProtoField(4, ScalarType.UINT32),
}
export const DownloadExt = {
    Pic: ProtoField(1, ScalarType.BYTES),
    Video: ProtoField(2, ScalarType.BYTES),
    Ptt: ProtoField(3, ScalarType.BYTES),
}
export const VideoDownloadExt = {
    BusiType: ProtoField(1, ScalarType.UINT32),
    SceneType: ProtoField(2, ScalarType.UINT32),
    SubBusiType: ProtoField(3, ScalarType.UINT32),
}
export const PicDownloadExt = {}
export const PttDownloadExt = {}
export const PicUrlExtInfo = {
    OriginalParameter: ProtoField(1, ScalarType.STRING),
    BigParameter: ProtoField(2, ScalarType.STRING),
    ThumbParameter: ProtoField(3, ScalarType.STRING),
}
export const VideoExtInfo = {
    VideoCodecFormat: ProtoField(1, ScalarType.UINT32),
}
export const MsgInfo = {

}