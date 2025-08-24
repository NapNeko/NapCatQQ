import { ReadStream } from "node:fs";
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
    [property: string]: any;
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
    sExif_CameraMaker: string;
    sExif_CameraModel: string;
    sExif_Latitude: string;
    sExif_LatitudeRef: string;
    sExif_Longitude: string;
    sExif_LongitudeRef: string;
    sExif_Time: string;
    sPicDesc: string;
    sPicPath: string;
    sPicTitle: string;
    [property: string]: any;
}

export interface MapExt {
    appid: string;
    userid: string;
    [property: string]: any;
}

export interface Env {
    deviceInfo: string;
    refer: string;
    [property: string]: any;
}

export interface Token {
    appid: number;
    data: string;
    type: number;
    [property: string]: any;
}

export function qunAlbumControl({
    uin,
    group_id,
    pskey,
    pic_md5,
    img_size,
    img_name,
    sAlbumName,
    sAlbumID
}: {
    uin: string,
    group_id: string,
    pskey: string,
    pic_md5: string,
    img_size: number,
    img_name: string,
    sAlbumName: string,
    sAlbumID: string,
}
): {
    control_req: ControlReq[]
} {
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
                    iUploadType: 3,
                    iUpPicType: 0,
                    iBatchID: +(Date.now().toString() + '4000'),//17位时间戳
                    sPicPath: "",
                    iPicWidth: 0,
                    iPicHight: 0,
                    iWaterType: 0,
                    iDistinctUse: 0,
                    iNeedFeeds: 1,
                    iUploadTime: +(Math.floor(Date.now() / 1000).toString()),
                    mapExt: {
                        appid: "qun",
                        userid: group_id
                    },
                    sExif_CameraMaker: "",
                    sExif_CameraModel: "",
                    sExif_Time: "",
                    sExif_LatitudeRef: "",
                    sExif_Latitude: "",
                    sExif_LongitudeRef: "",
                    sExif_Longitude: ""
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

class ChunkData {
    private reader: ReadStream;
    private uin: string;
    private chunkSize: number;
    private offset: number = 0;
    private seq: number = 0;
    private buffer: Uint8Array = new Uint8Array(0);
    private isCompleted: boolean = false;
    private session: string;

    constructor(file: ReadStream, uin: string, chunkSize: number = 16384, session: string = '') {
        this.reader = file;
        this.uin = uin;
        this.chunkSize = chunkSize;
        this.session = session;
    }

    async getNextChunk(): Promise<ReturnType<typeof createStreamUpload> | null> {
        if (this.isCompleted && this.buffer.length === 0) {
            return null;
        }

        try {
            return new Promise((resolve, reject) => {
                const processChunk = () => {
                    // 如果没有数据了，返回 null
                    if (this.buffer.length === 0) {
                        resolve(null);
                        return;
                    }

                    // 准备当前块数据
                    const chunkToSend = this.buffer.slice(0, Math.min(this.chunkSize, this.buffer.length));
                    this.buffer = this.buffer.slice(chunkToSend.length);

                    // 计算位置信息
                    const start = this.offset;
                    this.offset += chunkToSend.length;
                    const end = this.offset;

                    // 转换为 Base64
                    const base64Data = Buffer.from(chunkToSend).toString('base64');

                    // 创建上传数据对象
                    const uploadData = createStreamUpload({
                        uin: this.uin,
                        session: this.session,
                        offset: start,
                        seq: this.seq,
                        end: end,
                        slice_size: this.chunkSize,
                        data: base64Data
                    });

                    this.seq++;

                    resolve(uploadData);
                };

                // 如果缓冲区已经有足够数据，直接处理
                if (this.buffer.length >= this.chunkSize) {
                    processChunk();
                    return;
                }

                // 否则，从流中读取更多数据
                const dataHandler = (chunk: string | Buffer) => {
                    // 确保处理的是 Buffer
                    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

                    // 合并缓冲区
                    const newBuffer = new Uint8Array(this.buffer.length + bufferChunk.length);
                    newBuffer.set(this.buffer);
                    newBuffer.set(new Uint8Array(bufferChunk), this.buffer.length);
                    this.buffer = newBuffer;

                    // 如果有足够的数据，处理并返回
                    if (this.buffer.length >= this.chunkSize) {
                        this.reader.removeListener('data', dataHandler);
                        this.reader.removeListener('end', endHandler);
                        this.reader.removeListener('error', errorHandler);
                        processChunk();
                    }
                };

                const endHandler = () => {
                    this.isCompleted = true;
                    this.reader.removeListener('data', dataHandler);
                    this.reader.removeListener('end', endHandler);
                    this.reader.removeListener('error', errorHandler);

                    // 处理剩余数据
                    processChunk();
                };

                const errorHandler = (err: Error) => {
                    this.reader.removeListener('data', dataHandler);
                    this.reader.removeListener('end', endHandler);
                    this.reader.removeListener('error', errorHandler);
                    reject(err);
                };

                // 添加事件监听器
                this.reader.on('data', dataHandler);
                this.reader.on('end', endHandler);
                this.reader.on('error', errorHandler);
            });
        } catch (error) {
            console.error('Error getting next chunk:', error);
            throw error;
        }
    }

    setSession(session: string): void {
        this.session = session;
    }

    getProgress(): number {
        return this.offset;
    }

    isFinished(): boolean {
        return this.isCompleted && this.buffer.length === 0;
    }
}


// 根据文件流 按chunk持续函数
export function createStreamUploadChunk(file: ReadStream, uin: string, session: string, chunk: number = 16384): ChunkData {
    return new ChunkData(file, uin, chunk, session);
}