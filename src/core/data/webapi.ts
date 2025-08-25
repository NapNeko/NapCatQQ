
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
    iNeedFeeds: number;
    iPicHight: number;
    iPicWidth: number;
    iUploadTime: number;
    iUploadType: number;
    iUpPicType: number;
    iWaterType: number;
    mapExt: MapExt;
    sAlbumID: string;
    sAlbumName: string;
    sPicDesc: string;
    sPicPath: string;
    sPicTitle: string;
    stExtendInfo: StExtendInfo;
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

export function qunAlbumControl({
    uin,
    group_id,
    pskey,
    pic_md5,
    img_size,
    img_name,
    sAlbumName,
    sAlbumID,
    photo_num = "1",
    video_num = "0",
    batch_num = "1"
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
    batch_num?: string
}
): {
    control_req: ControlReq[]
} {
    const timestamp = Math.floor(Date.now() / 1000);

    return {
        control_req: [
            {
                uin: uin,
                token: {
                    type: 4,
                    data: pskey,
                    appid: 5
                },
                appid: "qun",
                checksum: pic_md5,
                check_type: 0,
                file_len: img_size,
                env: {
                    refer: "qzone",
                    deviceInfo: "h5"
                },
                model: 0,
                biz_req: {
                    sPicTitle: img_name,
                    sPicDesc: "",
                    sAlbumName: sAlbumName,
                    sAlbumID: sAlbumID,
                    iAlbumTypeID: 0,
                    iBitmap: 0,
                    iUploadType: 0,
                    iUpPicType: 0,
                    iBatchID: timestamp,
                    sPicPath: "",
                    iPicWidth: 0,
                    iPicHight: 0,
                    iWaterType: 0,
                    iDistinctUse: 0,
                    iNeedFeeds: 1,
                    iUploadTime: timestamp,
                    mapExt: {
                        appid: "qun",
                        userid: group_id
                    },
                    stExtendInfo: {
                        mapParams: {
                            photo_num: photo_num,
                            video_num: video_num,
                            batch_num: batch_num
                        }
                    }
                },
                session: "",
                asy_upload: 0,
                cmd: "FileUpload"
            }]
    }
}

export function createStreamUpload(
    {
        uin,
        session,
        offset,
        seq,
        end,
        slice_size,
        data

    }: { uin: string, session: string, offset: number, seq: number, end: number, slice_size: number, data: string }
) {
    return {
        uin: uin,
        appid: "qun",
        session: session,
        offset: offset,//分片起始位置
        data: data,//base64编码数据
        checksum: "",
        check_type: 0,
        retry: 0,//重试次数
        seq: seq,//分片序号
        end: end,//分片结束位置 文件总大小
        cmd: "FileUpload",
        slice_size: slice_size,//分片大小16KB 16384
        biz_req: {
            iUploadType: 3
        }
    };
}