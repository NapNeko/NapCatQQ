export interface ControlReq {
  appid?: string;
  asy_upload?: number;
  biz_req?: BizReq;
  check_type?: number;
  checksum?: string;
  cmd?: string;
  env?: Env;
  file_len?: number;
  model?: number;
  session?: string;
  token?: Token;
  uin?: string;
}

export interface BizReq {
  iAlbumTypeID: number;
  iBatchID: number;
  iBitmap: number;
  iDistinctUse: number;
  iNeedFeeds?: number;
  iPicHight: number;
  iPicWidth: number;
  iUploadTime: number;
  iUploadType: number;
  iUpPicType: number;
  iWaterType: number;
  mapExt?: MapExt;
  mutliPicInfo?: MutliPicInfo;
  sAlbumID: string;
  sAlbumName: string;
  sPicDesc: string;
  sPicPath: string;
  sPicTitle: string;
  stExtendInfo?: StExtendInfo;
  // 视频主体上传专用
  extend_info?: VideoExtendInfo;
  iFlag?: number;
  iIsFormatF20?: number;
  iIsNew?: number;
  iIsOriginalVideo?: number;
  iPlayTime?: number;
  sCoverUrl?: string;
  sDesc?: string;
  sTitle?: string;
  // 视频封面二段上传专用
  stExternalMapExt?: StExternalMapExt;
  sExif_CameraMaker?: string;
  sExif_CameraModel?: string;
  sExif_Latitude?: string;
  sExif_LatitudeRef?: string;
  sExif_Longitude?: string;
  sExif_LongitudeRef?: string;
  sExif_Time?: string;
}

// 多图同批上传时描述「本批共几张 / 当前第几张」，相册里据此合并成同一条
export interface MutliPicInfo {
  iBatUploadNum: string;
  iCurUpload: string;
  iSuccNum: number;
  iFailNum: number;
}

// 视频主体上传用（视频不走 stExtendInfo.mapParams，而是这段扩展信息）
export interface VideoExtendInfo {
  video_type: string;
  domainid: string;
  photo_num: string;
  video_num: string;
  batch_num: string;
  qun_id: string;
}

// 视频封面二段上传用：声明这是客户端上传的封面，且与图片混合在同一条动态里
export interface StExternalMapExt {
  is_client_upload_cover: string;
  is_pic_video_mix_feeds: string;
}

export interface MapExt {
  appid: string;
  userid: string;
}

export interface StExtendInfo {
  mapParams: MapParams;
}

export interface MapParams {
  batch_num: string;
  photo_num: string;
  video_num: string;
  // 视频封面二段上传时用它把封面挂到已上传的视频上
  vid?: string;
}

export interface Env {
  deviceInfo: string;
  refer: string;
}

export interface Token {
  appid: number;
  data: string;
  type: number;
}

// 一次上传的批次信息：同批的多张图必须共用 batchId，相册里才会显示成同一条。
export interface QunAlbumBatch {
  batchId: number,
  count: string,
  index: string
}

let lastQunAlbumBatchId = 0;

// 批次号取秒级时间戳。同一秒里发起的两次上传要错开，不然会被相册并成同一条
export function nextQunAlbumBatchId () {
  lastQunAlbumBatchId = Math.max(Math.floor(Date.now() / 1000), lastQunAlbumBatchId + 1);
  return lastQunAlbumBatchId;
}

// control_req 的外层（鉴权、来源、会话），图片、视频、封面都一样
function buildQunAlbumControlReq (
  { uin, pskey, appid, checksum, check_type, file_len, refer = 'qzone', cmd }: {
    uin: string,
    pskey: string,
    appid: string,
    checksum: string,
    check_type: number,
    file_len: number,
    refer?: string,
    cmd?: string
  },
  biz_req: BizReq
): ControlReq {
  const req: ControlReq = {
    uin,
    token: { type: 4, data: pskey, appid: 5 },
    appid,
    checksum,
    check_type,
    file_len,
    env: { refer, deviceInfo: 'h5' },
    model: 0,
    biz_req,
    session: '',
    asy_upload: 0,
  };
  if (cmd) req.cmd = cmd;
  return req;
}

// biz_req 里三种上传都要带的基础字段
function buildQunAlbumBizBase (
  { iUploadType, sAlbumName = '', sAlbumID = '', iBatchID = 0, sPicTitle = '' }: {
    iUploadType: number,
    sAlbumName?: string,
    sAlbumID?: string,
    iBatchID?: number,
    sPicTitle?: string
  }
): BizReq {
  return {
    sPicTitle,
    sPicDesc: '',
    sAlbumName,
    sAlbumID,
    iAlbumTypeID: 0,
    iBitmap: 0,
    iUploadType,
    iUpPicType: 0,
    iBatchID,
    sPicPath: '',
    iPicWidth: 0,
    iPicHight: 0,
    iWaterType: 0,
    iDistinctUse: 0,
    iUploadTime: Math.floor(Date.now() / 1000),
  };
}

// 进相册的那一步（图片、视频封面）要带的群与批次信息
function buildQunAlbumFeedFields (group_id: string, mapParams: MapParams, batchIndex: string) {
  return {
    iNeedFeeds: 1,
    mapExt: { appid: 'qun', userid: group_id },
    stExtendInfo: { mapParams },
    mutliPicInfo: {
      iBatUploadNum: mapParams.batch_num,
      iCurUpload: batchIndex,
      iSuccNum: 0,
      iFailNum: 0,
    },
  };
}

export function qunAlbumControl ({
  uin,
  group_id,
  pskey,
  pic_md5,
  img_size,
  img_name,
  sAlbumName,
  sAlbumID,
  photo_num = '1',
  video_num = '0',
  batch_num = '1',
  batchId = nextQunAlbumBatchId(),
  batchIndex = '0',
}: {
  uin: string,
  group_id: string,
  pskey: string,
  pic_md5: string,
  img_size: number,
  img_name: string,
  sAlbumName: string,
  sAlbumID: string,
  photo_num?: string,
  video_num?: string,
  batch_num?: string,
  batchId?: number,
  batchIndex?: string
}
): {
    control_req: ControlReq[]
  } {
  return {
    control_req: [buildQunAlbumControlReq(
      { uin, pskey, appid: 'qun', checksum: pic_md5, check_type: 0, file_len: img_size, cmd: 'FileUpload' },
      {
        ...buildQunAlbumBizBase({ iUploadType: 0, sAlbumName, sAlbumID, iBatchID: batchId, sPicTitle: img_name }),
        ...buildQunAlbumFeedFields(group_id, { photo_num, video_num, batch_num }, batchIndex),
      }
    )],
  };
}

export function createStreamUpload (
  {
    uin,
    session,
    offset,
    seq,
    end,
    slice_size,
    data,

  }: { uin: string, session: string, offset: number, seq: number, end: number, slice_size: number, data: string }
) {
  return {
    uin,
    appid: 'qun',
    session,
    offset, // 分片起始位置
    data, // base64编码数据
    checksum: '',
    check_type: 0,
    retry: 0, // 重试次数
    seq, // 分片序号
    end, // 分片结束位置 文件总大小
    cmd: 'FileUpload',
    slice_size, // 分片大小16KB 16384
    biz_req: {
      iUploadType: 3,
    },
  };
}

/**
 * 视频主体上传的控制体。
 *
 * 视频这一步不进相册（相册留空，iBatchID 为 0），只是先把视频传成素材；
 * 分片响应里拿到 sVid 后，再由封面上传（qunAlbumVideoCoverControl）把视频挂进相册。
 */
export function qunAlbumVideoControl ({
  uin,
  group_id,
  pskey,
  video_sha1,
  video_size,
  play_time = 0,
  photo_num = '0',
  video_num = '1',
  batch_num = '1',
}: {
  uin: string,
  group_id: string,
  pskey: string,
  video_sha1: string,
  video_size: number,
  play_time?: number,
  photo_num?: string,
  video_num?: string,
  batch_num?: string
}): {
    control_req: ControlReq[]
  } {
  return {
    control_req: [buildQunAlbumControlReq(
      { uin, pskey, appid: 'video_qun', checksum: video_sha1, check_type: 1, file_len: video_size, cmd: 'FileUploadVideo' },
      {
        ...buildQunAlbumBizBase({ iUploadType: 3 }),
        sTitle: '',
        sDesc: '',
        sCoverUrl: '',
        iFlag: 0,
        iPlayTime: play_time,
        iIsNew: 111,
        iIsOriginalVideo: 0,
        iIsFormatF20: 0,
        extend_info: {
          video_type: '3',
          domainid: '5',
          photo_num,
          video_num,
          batch_num,
          qun_id: group_id,
        },
      }
    )],
  };
}

/**
 * 视频封面上传的控制体。
 *
 * 按图片上传，但 iUploadType 为 2，并用 mapParams.vid 指向已上传的视频。
 * 相册和批次号只在这一步出现，视频是靠封面进的相册。
 */
export function qunAlbumVideoCoverControl ({
  uin,
  group_id,
  pskey,
  sAlbumName,
  sAlbumID,
  cover_md5,
  cover_size,
  vid,
  batchId = nextQunAlbumBatchId(),
  batchIndex = '0',
  photo_num = '0',
  video_num = '1',
  batch_num = '1',
}: {
  uin: string,
  group_id: string,
  pskey: string,
  sAlbumName: string,
  sAlbumID: string,
  cover_md5: string,
  cover_size: number,
  vid: string,
  batchId?: number,
  batchIndex?: string,
  photo_num?: string,
  video_num?: string,
  batch_num?: string
}): {
    control_req: ControlReq[]
  } {
  return {
    control_req: [buildQunAlbumControlReq(
      { uin, pskey, appid: 'qun', checksum: cover_md5, check_type: 0, file_len: cover_size, refer: 'huodong' },
      {
        ...buildQunAlbumBizBase({ iUploadType: 2, sAlbumName, sAlbumID, iBatchID: batchId }),
        ...buildQunAlbumFeedFields(group_id, { vid, photo_num, video_num, batch_num }, batchIndex),
        // 标明封面由客户端上传，且允许和图片出现在同一条动态里
        stExternalMapExt: {
          is_client_upload_cover: '1',
          is_pic_video_mix_feeds: '1',
        },
        sExif_CameraMaker: '',
        sExif_CameraModel: '',
        sExif_Time: '',
        sExif_LatitudeRef: '',
        sExif_Latitude: '',
        sExif_LongitudeRef: '',
        sExif_Longitude: '',
      }
    )],
  };
}
