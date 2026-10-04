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
  batchId = Math.floor(Date.now() / 1000),
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
  const timestamp = Math.floor(Date.now() / 1000);

  return {
    control_req: [
      {
        uin,
        token: {
          type: 4,
          data: pskey,
          appid: 5,
        },
        appid: 'qun',
        checksum: pic_md5,
        check_type: 0,
        file_len: img_size,
        env: {
          refer: 'qzone',
          deviceInfo: 'h5',
        },
        model: 0,
        biz_req: {
          sPicTitle: img_name,
          sPicDesc: '',
          sAlbumName,
          sAlbumID,
          iAlbumTypeID: 0,
          iBitmap: 0,
          iUploadType: 0,
          iUpPicType: 0,
          iBatchID: batchId,
          sPicPath: '',
          iPicWidth: 0,
          iPicHight: 0,
          iWaterType: 0,
          iDistinctUse: 0,
          iNeedFeeds: 1,
          iUploadTime: timestamp,
          mapExt: {
            appid: 'qun',
            userid: group_id,
          },
          stExtendInfo: {
            mapParams: {
              photo_num,
              video_num,
              batch_num,
            },
          },
          mutliPicInfo: {
            iBatUploadNum: batch_num,
            iCurUpload: batchIndex,
            iSuccNum: 0,
            iFailNum: 0,
          },
        },
        session: '',
        asy_upload: 0,
        cmd: 'FileUpload',
      }],
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
 * 注意：视频这一步**不带相册**（sAlbumID / sAlbumName 留空，iBatchID 为 0），
 * 它只是先把视频传成一份素材，拿到分片响应里的 sVid 之后，
 * 再由封面二段上传（qunAlbumVideoCoverControl）把视频挂进相册。
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
  const timestamp = Math.floor(Date.now() / 1000);

  return {
    control_req: [
      {
        uin,
        token: {
          type: 4,
          data: pskey,
          appid: 5,
        },
        appid: 'video_qun',
        checksum: video_sha1,
        check_type: 1,
        file_len: video_size,
        env: {
          refer: 'qzone',
          deviceInfo: 'h5',
        },
        model: 0,
        biz_req: {
          sPicTitle: '',
          sPicDesc: '',
          sAlbumName: '',
          sAlbumID: '',
          iAlbumTypeID: 0,
          iBitmap: 0,
          iUploadType: 3,
          iUpPicType: 0,
          iBatchID: 0,
          sPicPath: '',
          iPicWidth: 0,
          iPicHight: 0,
          iWaterType: 0,
          iDistinctUse: 0,
          sTitle: '',
          sDesc: '',
          iFlag: 0,
          iUploadTime: timestamp,
          iPlayTime: play_time,
          sCoverUrl: '',
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
        },
        session: '',
        asy_upload: 0,
        cmd: 'FileUploadVideo',
      }],
  };
}

/**
 * 视频封面二段上传的控制体。
 *
 * 这一步走图片口径（appid=qun / cmd=FileUpload），但：
 * - 用 stExtendInfo.mapParams.vid 把封面挂到已上传的视频上
 * - 只有这一步带相册（sAlbumID / sAlbumName）与批次号（iBatchID），视频正是靠它进相册
 * - stExternalMapExt 声明这是客户端上传的封面，并允许与图片混在同一条动态里
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
  batchId = Math.floor(Date.now() / 1000),
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
  const timestamp = Math.floor(Date.now() / 1000);

  return {
    control_req: [
      {
        uin,
        token: {
          type: 4,
          data: pskey,
          appid: 5,
        },
        appid: 'qun',
        checksum: cover_md5,
        check_type: 0,
        file_len: cover_size,
        env: {
          refer: 'huodong',
          deviceInfo: 'h5',
        },
        model: 0,
        biz_req: {
          sPicTitle: '',
          sPicDesc: '',
          sAlbumName,
          sAlbumID,
          iAlbumTypeID: 0,
          iBitmap: 0,
          iUploadType: 2,
          iUpPicType: 0,
          iBatchID: batchId,
          sPicPath: '',
          iPicWidth: 0,
          iPicHight: 0,
          iWaterType: 0,
          iDistinctUse: 0,
          iNeedFeeds: 1,
          iUploadTime: timestamp,
          mutliPicInfo: {
            iBatUploadNum: batch_num,
            iCurUpload: batchIndex,
            iSuccNum: 0,
            iFailNum: 0,
          },
          stExtendInfo: {
            mapParams: {
              vid,
              photo_num,
              video_num,
              batch_num,
            },
          },
          stExternalMapExt: {
            is_client_upload_cover: '1',
            is_pic_video_mix_feeds: '1',
          },
          mapExt: {
            appid: 'qun',
            userid: group_id,
          },
          sExif_CameraMaker: '',
          sExif_CameraModel: '',
          sExif_Time: '',
          sExif_LatitudeRef: '',
          sExif_Latitude: '',
          sExif_LongitudeRef: '',
          sExif_Longitude: '',
        },
        session: '',
        asy_upload: 0,
      }],
  };
}
