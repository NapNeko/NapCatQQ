import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const NTV2RichMediaReq = {
    ReqHead: ProtoField(1, () => MultiMediaReqHead),
    Upload: ProtoField(2, () => UploadReq),
    Download: ProtoField(3, () => DownloadReq),
    DownloadRKey: ProtoField(4, () => DownloadRKeyReq),
    Delete: ProtoField(5, () => DeleteReq),
    UploadCompleted: ProtoField(6, () => UploadCompletedReq),
    MsgInfoAuth: ProtoField(7, () => MsgInfoAuthReq),
    UploadKeyRenewal: ProtoField(8, () => UploadKeyRenewalReq),
    DownloadSafe: ProtoField(9, () => DownloadSafeReq),
    Extension: ProtoField(99, ScalarType.BYTES, true),
};

export const MultiMediaReqHead = {
    Common: ProtoField(1, () => CommonHead),
    Scene: ProtoField(2, () => SceneInfo),
    Client: ProtoField(3, () => ClientMeta),
};

export const CommonHead = {
    RequestId: ProtoField(1, ScalarType.UINT32),
    Command: ProtoField(2, ScalarType.UINT32),
};

export const SceneInfo = {
    RequestType: ProtoField(101, ScalarType.UINT32),
    BusinessType: ProtoField(102, ScalarType.UINT32),
    SceneType: ProtoField(200, ScalarType.UINT32),
    C2C: ProtoField(201, () => C2CUserInfo, true),
    Group: ProtoField(202, () => NTGroupInfo, true),
};

export const C2CUserInfo = {
    AccountType: ProtoField(1, ScalarType.UINT32),
    TargetUid: ProtoField(2, ScalarType.STRING),
};

export const NTGroupInfo = {
    GroupUin: ProtoField(1, ScalarType.UINT32),
};

export const ClientMeta = {
    AgentType: ProtoField(1, ScalarType.UINT32),
};

export const DownloadReq = {
    Node: ProtoField(1, () => IndexNode),
    Download: ProtoField(2, () => DownloadExt),
};

export const IndexNode = {
    Info: ProtoField(1, () => FileInfo),
    FileUuid: ProtoField(2, ScalarType.STRING),
    StoreId: ProtoField(3, ScalarType.UINT32),
    UploadTime: ProtoField(4, ScalarType.UINT32),
    Ttl: ProtoField(5, ScalarType.UINT32),
    SubType: ProtoField(6, ScalarType.UINT32),
};

export const FileInfo = {
    FileSize: ProtoField(1, ScalarType.UINT32),
    FileHash: ProtoField(2, ScalarType.STRING),
    FileSha1: ProtoField(3, ScalarType.STRING),
    FileName: ProtoField(4, ScalarType.STRING),
    Type: ProtoField(5, () => FileType),
    Width: ProtoField(6, ScalarType.UINT32),
    Height: ProtoField(7, ScalarType.UINT32),
    Time: ProtoField(8, ScalarType.UINT32),
    Original: ProtoField(9, ScalarType.UINT32),
};

export const FileType = {
    Type: ProtoField(1, ScalarType.UINT32),
    PicFormat: ProtoField(2, ScalarType.UINT32),
    VideoFormat: ProtoField(3, ScalarType.UINT32),
    VoiceFormat: ProtoField(4, ScalarType.UINT32),
};

export const DownloadExt = {
    Pic: ProtoField(1, () => PicDownloadExt),
    Video: ProtoField(2, () => VideoDownloadExt),
    Ptt: ProtoField(3, () => PttDownloadExt),
};

export const VideoDownloadExt = {
    BusiType: ProtoField(1, ScalarType.UINT32),
    SceneType: ProtoField(2, ScalarType.UINT32),
    SubBusiType: ProtoField(3, ScalarType.UINT32),
};

export const PicDownloadExt = {};

export const PttDownloadExt = {};

export const DownloadRKeyReq = {
    Types: ProtoField(1, ScalarType.INT32, false, true),
};

export const DeleteReq = {
    Index: ProtoField(1, () => IndexNode, false, true),
    NeedRecallMsg: ProtoField(2, ScalarType.BOOL),
    MsgSeq: ProtoField(3, ScalarType.UINT64),
    MsgRandom: ProtoField(4, ScalarType.UINT64),
    MsgTime: ProtoField(5, ScalarType.UINT64),
};

export const UploadCompletedReq = {
    SrvSendMsg: ProtoField(1, ScalarType.BOOL),
    ClientRandomId: ProtoField(2, ScalarType.UINT64),
    MsgInfo: ProtoField(3, () => MsgInfo),
    ClientSeq: ProtoField(4, ScalarType.UINT32),
};

export const MsgInfoAuthReq = {
    Msg: ProtoField(1, ScalarType.BYTES),
    AuthTime: ProtoField(2, ScalarType.UINT64),
};

export const DownloadSafeReq = {
    Index: ProtoField(1, () => IndexNode),
};

export const UploadKeyRenewalReq = {
    OldUKey: ProtoField(1, ScalarType.STRING),
    SubType: ProtoField(2, ScalarType.UINT32),
};

export const MsgInfo = {
    MsgInfoBody: ProtoField(1, () => MsgInfoBody, false, true),
    ExtBizInfo: ProtoField(2, () => ExtBizInfo),
};

export const MsgInfoBody = {
    Index: ProtoField(1, () => IndexNode),
    Picture: ProtoField(2, () => PictureInfo),
    Video: ProtoField(3, () => VideoInfo),
    Audio: ProtoField(4, () => AudioInfo),
    FileExist: ProtoField(5, ScalarType.BOOL),
    HashSum: ProtoField(6, ScalarType.BYTES),
};

export const VideoInfo = {};

export const AudioInfo = {};

export const PictureInfo = {
    UrlPath: ProtoField(1, ScalarType.STRING),
    Ext: ProtoField(2, () => PicUrlExtInfo),
    Domain: ProtoField(3, ScalarType.STRING),
};

export const PicUrlExtInfo = {
    OriginalParameter: ProtoField(1, ScalarType.STRING),
    BigParameter: ProtoField(2, ScalarType.STRING),
    ThumbParameter: ProtoField(3, ScalarType.STRING),
};

export const VideoExtInfo = {
    VideoCodecFormat: ProtoField(1, ScalarType.UINT32),
};

export const ExtBizInfo = {
    Pic: ProtoField(1, () => PicExtBizInfo),
    Video: ProtoField(2, () => VideoExtBizInfo),
    Ptt: ProtoField(3, () => PttExtBizInfo),
    BusiType: ProtoField(10, ScalarType.UINT32),
};

export const PttExtBizInfo = {
    SrcUin: ProtoField(1, ScalarType.UINT64),
    PttScene: ProtoField(2, ScalarType.UINT32),
    PttType: ProtoField(3, ScalarType.UINT32),
    ChangeVoice: ProtoField(4, ScalarType.UINT32),
    Waveform: ProtoField(5, ScalarType.BYTES),
    AutoConvertText: ProtoField(6, ScalarType.UINT32),
    BytesReserve: ProtoField(11, ScalarType.BYTES),
    BytesPbReserve: ProtoField(12, ScalarType.BYTES),
    BytesGeneralFlags: ProtoField(13, ScalarType.BYTES),
};

export const VideoExtBizInfo = {
    FromScene: ProtoField(1, ScalarType.UINT32),
    ToScene: ProtoField(2, ScalarType.UINT32),
    BytesPbReserve: ProtoField(3, ScalarType.BYTES),
};

export const PicExtBizInfo = {
    BizType: ProtoField(1, ScalarType.UINT32),
    TextSummary: ProtoField(2, ScalarType.STRING),
    BytesPbReserveC2c: ProtoField(11, () => BytesPbReserveC2c),
    BytesPbReserveTroop: ProtoField(12, () => BytesPbReserveTroop),
    FromScene: ProtoField(1001, ScalarType.UINT32),
    ToScene: ProtoField(1002, ScalarType.UINT32),
    OldFileId: ProtoField(1003, ScalarType.UINT32),
};

export const UploadReq = {
    UploadInfo: ProtoField(1, () => UploadInfo, false, true),
    TryFastUploadCompleted: ProtoField(2, ScalarType.BOOL),
    SrvSendMsg: ProtoField(3, ScalarType.BOOL),
    ClientRandomId: ProtoField(4, ScalarType.UINT64),
    CompatQMsgSceneType: ProtoField(5, ScalarType.UINT32),
    ExtBizInfo: ProtoField(6, () => ExtBizInfo),
    ClientSeq: ProtoField(7, ScalarType.UINT32),
    NoNeedCompatMsg: ProtoField(8, ScalarType.BOOL),
};

export const UploadInfo = {
    FileInfo: ProtoField(1, () => FileInfo),
    SubFileType: ProtoField(2, ScalarType.UINT32),
};

export const BytesPbReserveC2c = {
    subType: ProtoField(1, ScalarType.UINT32),
    field3: ProtoField(3, ScalarType.UINT32),
    field4: ProtoField(4, ScalarType.UINT32),
    field8: ProtoField(8, ScalarType.STRING),
    field10: ProtoField(10, ScalarType.UINT32),
    field12: ProtoField(12, ScalarType.STRING),
    field18: ProtoField(18, ScalarType.STRING),
    field19: ProtoField(19, ScalarType.STRING),
    field20: ProtoField(20, ScalarType.BYTES),
};

export const BytesPbReserveTroop = {
    subType: ProtoField(1, ScalarType.UINT32),
    field3: ProtoField(3, ScalarType.UINT32),
    field4: ProtoField(4, ScalarType.UINT32),
    field9: ProtoField(9, ScalarType.STRING),
    field10: ProtoField(10, ScalarType.UINT32),
    field12: ProtoField(12, ScalarType.STRING),
    field18: ProtoField(18, ScalarType.STRING),
    field19: ProtoField(19, ScalarType.STRING),
    field21: ProtoField(21, ScalarType.BYTES),
};
