import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { NTQQWebApi } from '@/napcat-core/apis/webapi';
import { qunAlbumControl, qunAlbumVideoControl, qunAlbumVideoCoverControl } from '@/napcat-core/data/webapi';

const GROUP_ID = '2161015335';
const ALBUM_ID = 'V624Oe3c1Dk7pX4et6lh4703uM49iGAR';
const ALBUM_NAME = '水哥';
const UIN = '2965296625';

// control_req 在严格模式（noUncheckedIndexedAccess）下是可选元素，这里统一收敛掉
const firstReq = (body: { control_req: unknown[] }) => {
  const req = body.control_req[0];
  if (!req) throw new Error('control_req 为空');
  return req as NonNullable<ReturnType<typeof qunAlbumControl>['control_req'][0]>;
};

const imageReq = (overrides: Record<string, unknown> = {}) => firstReq(qunAlbumControl({
  uin: UIN,
  group_id: GROUP_ID,
  pskey: 'PSKEY',
  pic_md5: 'MD5A',
  img_size: 12345,
  img_name: 'a.jpg',
  sAlbumName: ALBUM_NAME,
  sAlbumID: ALBUM_ID,
  ...overrides,
}));

describe('群相册图片组包', () => {
  it('单图：字段与改动前一致，批次号为秒级时间戳', () => {
    const req = imageReq();

    expect(req.appid).toBe('qun');
    expect(req.cmd).toBe('FileUpload');
    expect(req.check_type).toBe(0);
    expect(req.checksum).toBe('MD5A');
    expect(req.env).toEqual({ refer: 'qzone', deviceInfo: 'h5' });
    expect(req.biz_req?.sPicTitle).toBe('a.jpg');
    expect(req.biz_req?.sAlbumID).toBe(ALBUM_ID);
    expect(req.biz_req?.sAlbumName).toBe(ALBUM_NAME);
    expect(req.biz_req?.iUploadType).toBe(0);
    expect(req.biz_req?.iNeedFeeds).toBe(1);
    expect(req.biz_req?.stExtendInfo?.mapParams).toEqual({ photo_num: '1', video_num: '0', batch_num: '1' });
    // 每张图各自成批时，批次号仍是 10 位秒级时间戳
    expect(String(req.biz_req?.iBatchID)).toHaveLength(10);
  });

  it('多图同批：共用批次号，张数与序号按批上报', () => {
    const batchId = 1791038000;
    const total = '3';
    const reqs = [0, 1, 2].map(i => imageReq({
      pic_md5: `MD5${i}`,
      batchId,
      batchIndex: String(i),
      photo_num: total,
      batch_num: total,
    }));

    expect(new Set(reqs.map(r => r.biz_req?.iBatchID)).size).toBe(1);
    expect(reqs[0]?.biz_req?.iBatchID).toBe(batchId);
    reqs.forEach((req, i) => {
      expect(req.biz_req?.stExtendInfo?.mapParams).toEqual({ photo_num: total, video_num: '0', batch_num: total });
      expect(req.biz_req?.mutliPicInfo).toEqual({
        iBatUploadNum: total,
        iCurUpload: String(i),
        iSuccNum: 0,
        iFailNum: 0,
      });
      expect(req.checksum).toBe(`MD5${i}`);
    });
  });
});

describe('群相册视频组包', () => {
  it('视频主体：video_qun / FileUploadVideo / SHA1，且不带相册与批次号', () => {
    const req = firstReq(qunAlbumVideoControl({
      uin: UIN,
      group_id: GROUP_ID,
      pskey: 'PSKEY',
      video_sha1: 'SHA1A',
      video_size: 1048576,
      play_time: 37,
    }));

    expect(req.appid).toBe('video_qun');
    expect(req.cmd).toBe('FileUploadVideo');
    expect(req.check_type).toBe(1);
    expect(req.checksum).toBe('SHA1A');
    expect(req.file_len).toBe(1048576);
    expect(req.env).toEqual({ refer: 'qzone', deviceInfo: 'h5' });

    expect(req.biz_req?.iUploadType).toBe(3);
    expect(req.biz_req?.iPlayTime).toBe(37);
    expect(req.biz_req?.iIsNew).toBe(111);
    // 视频主体不参与批次：iBatchID 固定 0，相册留空，也没有 mutliPicInfo
    expect(req.biz_req?.iBatchID).toBe(0);
    expect(req.biz_req?.sAlbumID).toBe('');
    expect(req.biz_req?.sAlbumName).toBe('');
    expect(req.biz_req?.mutliPicInfo).toBeUndefined();
    expect(req.biz_req?.stExtendInfo).toBeUndefined();
    expect(req.biz_req?.mapExt).toBeUndefined();
    expect(req.biz_req?.extend_info).toEqual({
      video_type: '3',
      domainid: '5',
      photo_num: '0',
      video_num: '1',
      batch_num: '1',
      qun_id: GROUP_ID,
    });
  });

  it('封面二段：走图片口径带相册与批次号，并用 vid 绑定视频', () => {
    const batchId = 1791038000;
    const req = firstReq(qunAlbumVideoCoverControl({
      uin: UIN,
      group_id: GROUP_ID,
      pskey: 'PSKEY',
      sAlbumName: ALBUM_NAME,
      sAlbumID: ALBUM_ID,
      cover_md5: 'COVERMD5',
      cover_size: 20000,
      vid: 'SV123',
      batchId,
    }));

    expect(req.appid).toBe('qun');
    expect(req.cmd).toBeUndefined();
    expect(req.check_type).toBe(0);
    expect(req.checksum).toBe('COVERMD5');
    // 封面这一步才带相册和批次号——视频靠它进相册
    expect(req.env).toEqual({ refer: 'huodong', deviceInfo: 'h5' });
    expect(req.biz_req?.iUploadType).toBe(2);
    expect(req.biz_req?.iBatchID).toBe(batchId);
    expect(req.biz_req?.sAlbumID).toBe(ALBUM_ID);
    expect(req.biz_req?.sAlbumName).toBe(ALBUM_NAME);
    expect(req.biz_req?.iNeedFeeds).toBe(1);
    expect(req.biz_req?.stExtendInfo?.mapParams).toEqual({
      vid: 'SV123',
      photo_num: '0',
      video_num: '1',
      batch_num: '1',
    });
    expect(req.biz_req?.stExternalMapExt).toEqual({
      is_client_upload_cover: '1',
      is_pic_video_mix_feeds: '1',
    });
    expect(req.biz_req?.mutliPicInfo).toEqual({
      iBatUploadNum: '1',
      iCurUpload: '0',
      iSuccNum: 0,
      iFailNum: 0,
    });
    expect(req.biz_req?.mapExt).toEqual({ appid: 'qun', userid: GROUP_ID });
  });
});

describe('群相册分片上传', () => {
  let tempDir: string;
  let sliceFile: string;

  const createApi = () => new NTQQWebApi(
    { logger: { log: vi.fn(), logWarn: vi.fn(), logError: vi.fn(), logDebug: vi.fn() } } as never,
    { NapCatTempPath: tempDir } as never
  );

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), 'napcat-album-slice-'));
    sliceFile = path.join(tempDir, 'payload.bin');
    // 40000 字节 / 16384 分片 = 3 片
    await writeFile(sliceFile, Buffer.alloc(40000, 7));
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await rm(tempDir, { recursive: true, force: true });
  });

  it('按分片大小切片，把 appid/cmd 透传到每个分片请求，并回收 sVid', async () => {
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => new Response(JSON.stringify({
      ret: 0,
      msg: '',
      data: { biz: { sVid: 'SV123' } },
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await createApi().uploadQunAlbumSlice(
      sliceFile, 'SESSION', 'SKEY', 'PSKEY', UIN, 16384,
      { appid: 'video_qun', cmd: 'FileUploadVideo' }
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result).toMatchObject({ success: true, sVid: 'SV123' });

    const form = fetchMock.mock.calls[0]?.[1]?.body as unknown as FormData;
    expect(form.get('appid')).toBe('video_qun');
    expect(form.get('cmd')).toBe('FileUploadVideo');
    expect(form.get('session')).toBe('SESSION');
    expect(form.get('seq')).toBe('0');
    expect(form.get('offset')).toBe('0');
    expect(form.get('end')).toBe('16384');
    expect(form.get('slice_size')).toBe('16384');

    const urls = fetchMock.mock.calls.map(call => String(call[0]));
    expect(urls[0]).toContain('seq=0&retry=0&offset=0&end=16384&total=40000');
    expect(urls[2]).toContain('seq=2&retry=0&offset=32768&end=40000&total=40000');
  });

  it('不传 appid/cmd 时退回图片口径', async () => {
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => new Response(JSON.stringify({ ret: 0, msg: '' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await createApi().uploadQunAlbumSlice(sliceFile, 'SESSION', 'SKEY', 'PSKEY', UIN, 16384);

    const form = fetchMock.mock.calls[0]?.[1]?.body as unknown as FormData;
    expect(form.get('appid')).toBe('qun');
    expect(form.get('cmd')).toBe('FileUpload');
    expect(result.sVid).toBeUndefined();
  });

  it('分片失败时抛出带序号与原因的错误', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ret: -1, msg: 'boom' }), { status: 200 })));

    await expect(createApi().uploadQunAlbumSlice(sliceFile, 'SESSION', 'SKEY', 'PSKEY', UIN, 16384))
      .rejects.toThrow('分片 0 上传失败: boom');
  });
});
