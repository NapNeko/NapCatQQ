import { RequestUtil } from 'napcat-common/src/request';
import {
  GroupEssenceMsgRet,
  InstanceContext,
  WebApiGroupMember,
  WebApiGroupMemberRet,
  WebApiGroupNoticeRet,
  WebHonorType, NapCatCore,
} from '@/napcat-core/index';

import { existsSync, readFileSync } from 'node:fs';
import { writeFile, unlink } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { basename, join } from 'node:path';
import { qunAlbumControl, qunAlbumVideoControl, qunAlbumVideoCoverControl, QunAlbumBatch } from '../data/webapi';
import { createAlbumCommentRequest, createAlbumFeedPublish, createAlbumMediaFeed } from '../data/album';
import { FFmpegService } from '../helper/ffmpeg/ffmpeg';
import { defaultVideoThumbB64 } from '../helper/ffmpeg/video';
import {
  buildQzoneDeleteBody,
  buildQzonePublishBody,
  buildQzoneUploadImageBody,
  parseQzoneDeleteResponse,
  parseQzonePublishResponse,
  parseQzoneUploadImageResponseText,
  toQzoneRichval,
  QzoneDeleteResponse,
  QzonePublishResponse,
} from '../data/qzone';
export interface SetNoticeRetSuccess {
  ec: number;
  em: string;
  id: number;
  ltsm: number;
  new_fid: string;
  read_only: number;
  role: number;
  srv_code: number;
}

// 群相册分片上传的并发数
const QUN_ALBUM_SLICE_CONCURRENCY = 8;
// 服务端没给分片大小时的下限，以及防止异常值的上限
const QUN_ALBUM_SLICE_MIN = 16384;
const QUN_ALBUM_SLICE_MAX = 4 * 1024 * 1024;

export class NTQQWebApi {
  context: InstanceContext;
  core: NapCatCore;

  constructor (context: InstanceContext, core: NapCatCore) {
    this.context = context;
    this.core = core;
  }

  async shareDigest (groupCode: string, msgSeq: string, msgRandom: string, targetGroupCode: string) {
    const cookieObject = await this.core.apis.UserApi.getCookies('qun.qq.com');
    const url = `https://qun.qq.com/cgi-bin/group_digest/share_digest?${new URLSearchParams({
      bkn: this.getBknFromCookie(cookieObject),
      group_code: groupCode,
      msg_seq: msgSeq,
      msg_random: msgRandom,
      target_group_code: targetGroupCode,
    }).toString()}`;
    try {
      return RequestUtil.HttpGetText(url, 'GET', '', { Cookie: this.cookieToString(cookieObject) });
    } catch {
      return undefined;
    }
  }

  async getGroupEssenceMsgAll (GroupCode: string) {
    const ret: GroupEssenceMsgRet[] = [];
    for (let i = 0; i < 20; i++) {
      const data = await this.getGroupEssenceMsg(GroupCode, i, 50);
      if (!data) break;
      ret.push(data);
      if (data.data.is_end) break;
    }
    return ret;
  }

  async getGroupEssenceMsg (GroupCode: string, page_start: number = 0, page_limit: number = 50) {
    const cookieObject = await this.core.apis.UserApi.getCookies('qun.qq.com');
    const url = `https://qun.qq.com/cgi-bin/group_digest/digest_list?${new URLSearchParams({
      bkn: this.getBknFromCookie(cookieObject),
      page_start: page_start.toString(),
      page_limit: page_limit.toString(),
      group_code: GroupCode,
    }).toString()}`;
    try {
      const ret = await RequestUtil.HttpGetJson<GroupEssenceMsgRet>(
        url,
        'GET',
        '',
        { Cookie: this.cookieToString(cookieObject) }
      );
      return ret.retcode === 0 ? ret : undefined;
    } catch {
      return undefined;
    }
  }

  async getGroupMembers (GroupCode: string): Promise<WebApiGroupMember[]> {
    // logDebug('webapi 获取群成员', GroupCode);
    const memberData: Array<WebApiGroupMember> = new Array<WebApiGroupMember>();
    const cookieObject = await this.core.apis.UserApi.getCookies('qun.qq.com');
    const retList: Promise<WebApiGroupMemberRet>[] = [];
    const fastRet = await RequestUtil.HttpGetJson<WebApiGroupMemberRet>(
      `https://qun.qq.com/cgi-bin/qun_mgr/search_group_members?${new URLSearchParams({
        st: '0',
        end: '40',
        sort: '1',
        gc: GroupCode,
        bkn: this.getBknFromCookie(cookieObject),
      }).toString()}`,
      'POST',
      '',
      { Cookie: this.cookieToString(cookieObject) }
    );
    if (!fastRet?.count || fastRet?.errcode !== 0 || !fastRet?.mems) {
      return [];
    } else {
      for (const key in fastRet.mems) {
        if (fastRet.mems[key]) {
          memberData.push(fastRet.mems[key]);
        }
      }
    }
    // 初始化获取PageNum
    const PageNum = Math.ceil(fastRet.count / 40);
    // 遍历批量请求
    for (let i = 2; i <= PageNum; i++) {
      const ret = RequestUtil.HttpGetJson<WebApiGroupMemberRet>(
        `https://qun.qq.com/cgi-bin/qun_mgr/search_group_members?${new URLSearchParams({
          st: ((i - 1) * 40).toString(),
          end: (i * 40).toString(),
          sort: '1',
          gc: GroupCode,
          bkn: this.getBknFromCookie(cookieObject),
        }).toString()}`,
        'POST',
        '',
        { Cookie: this.cookieToString(cookieObject) }
      );
      retList.push(ret);
    }
    // 批量等待
    for (let i = 1; i <= PageNum; i++) {
      const ret = await (retList[i]);
      if (!ret?.count || ret?.errcode !== 0 || !ret?.mems) {
        continue;
      }
      for (const key in ret.mems) {
        if (ret.mems[key]) {
          memberData.push(ret.mems[key]);
        }
      }
    }
    return memberData;
  }

  // public  async addGroupDigest(groupCode: string, msgSeq: string) {
  //   const url = `https://qun.qq.com/cgi-bin/group_digest/cancel_digest?random=665&X-CROSS-ORIGIN=fetch&group_code=${groupCode}&msg_seq=${msgSeq}&msg_random=444021292`;
  //   const res = await this.request(url);
  //   return await res.json();
  // }

  // public async getGroupDigest(groupCode: string) {
  //   const url = `https://qun.qq.com/cgi-bin/group_digest/digest_list?random=665&X-CROSS-ORIGIN=fetch&group_code=${groupCode}&page_start=0&page_limit=20`;
  //   const res = await this.request(url);
  //   return await res.json();
  // }

  async setGroupNotice (
    GroupCode: string,
    Content: string,
    pinned: number = 0,
    type: number = 1,
    is_show_edit_card: number = 1,
    tip_window_type: number = 1,
    confirm_required: number = 1,
    picId: string = '',
    imgWidth: number = 540,
    imgHeight: number = 300
  ) {
    const cookieObject = await this.core.apis.UserApi.getCookies('qun.qq.com');

    try {
      const settings = JSON.stringify({
        is_show_edit_card,
        tip_window_type,
        confirm_required,
      });
      const externalParam = {
        pic: picId,
        imgWidth: imgWidth.toString(),
        imgHeight: imgHeight.toString(),
      };
      const ret: SetNoticeRetSuccess = await RequestUtil.HttpGetJson<SetNoticeRetSuccess>(
        `https://web.qun.qq.com/cgi-bin/announce/add_qun_notice?${new URLSearchParams({
          bkn: this.getBknFromCookie(cookieObject),
          qid: GroupCode,
          text: Content,
          pinned: pinned.toString(),
          type: type.toString(),
          settings,
          ...(picId === '' ? {} : externalParam),
        }).toString()}`,
        'POST',
        '',
        { Cookie: this.cookieToString(cookieObject) }
      );
      return ret;
    } catch {
      return undefined;
    }
  }

  async getGroupNotice (GroupCode: string): Promise<undefined | WebApiGroupNoticeRet> {
    const cookieObject = await this.core.apis.UserApi.getCookies('qun.qq.com');
    try {
      const ret = await RequestUtil.HttpGetJson<WebApiGroupNoticeRet>(
        `https://web.qun.qq.com/cgi-bin/announce/get_t_list?${new URLSearchParams({
          bkn: this.getBknFromCookie(cookieObject),
          qid: GroupCode,
          ft: '23',
          ni: '1',
          n: '1',
          i: '1',
          log_read: '1',
          platform: '1',
          s: '-1',
        }).toString()}&n=20`,
        'GET',
        '',
        { Cookie: this.cookieToString(cookieObject) }
      );
      return ret?.ec === 0 ? ret : undefined;
    } catch {
      return undefined;
    }
  }

  private async getDataInternal (cookieObject: { [key: string]: string; }, groupCode: string, type: number) {
    let resJson;
    try {
      const res = await RequestUtil.HttpGetText(
        `https://qun.qq.com/interactive/honorlist?${new URLSearchParams({
          gc: groupCode,
          type: type.toString(),
        }).toString()}`,
        'GET',
        '',
        { Cookie: this.cookieToString(cookieObject) }
      );
      const match = /window\.__INITIAL_STATE__=(.*?);/.exec(res);
      if (match?.[1]) {
        resJson = JSON.parse(match[1].trim());
      }
      return type === 1 ? resJson?.talkativeList : resJson?.actorList;
    } catch (e) {
      this.context.logger.logDebug('获取当前群荣耀失败', e);
      return undefined;
    }
  }

  private async getHonorList (cookieObject: { [key: string]: string; }, groupCode: string, type: number) {
    const data = await this.getDataInternal(cookieObject, groupCode, type);
    if (!data) {
      this.context.logger.logError(`获取类型 ${type} 的荣誉信息失败`);
      return [];
    }
    return data.map((item: {
      uin: string,
      name: string,
      avatar: string,
      desc: string,
    }) => ({
      user_id: item?.uin,
      nickname: item?.name,
      avatar: item?.avatar,
      description: item?.desc,
    }));
  }

  async getGroupHonorInfo (groupCode: string, getType: WebHonorType) {
    const cookieObject = await this.core.apis.UserApi.getCookies('qun.qq.com');
    const HonorInfo = {
      group_id: Number(groupCode),
      current_talkative: {},
      talkative_list: [],
      performer_list: [],
      legend_list: [],
      emotion_list: [],
      strong_newbie_list: [],
    };

    if (getType === WebHonorType.TALKATIVE || getType === WebHonorType.ALL) {
      const talkativeList = await this.getHonorList(cookieObject, groupCode, 1);
      if (talkativeList.length > 0) {
        HonorInfo.current_talkative = talkativeList[0];
        HonorInfo.talkative_list = talkativeList;
      }
    }

    if (getType === WebHonorType.PERFORMER || getType === WebHonorType.ALL) {
      HonorInfo.performer_list = await this.getHonorList(cookieObject, groupCode, 2);
    }

    if (getType === WebHonorType.LEGEND || getType === WebHonorType.ALL) {
      HonorInfo.legend_list = await this.getHonorList(cookieObject, groupCode, 3);
    }

    if (getType === WebHonorType.EMOTION || getType === WebHonorType.ALL) {
      HonorInfo.emotion_list = await this.getHonorList(cookieObject, groupCode, 6);
    }

    // 冒尖小春笋好像已经被tx扬了 R.I.P.
    if (getType === WebHonorType.EMOTION || getType === WebHonorType.ALL) {
      HonorInfo.strong_newbie_list = [];
    }

    return HonorInfo;
  }

  private cookieToString (cookieObject: { [key: string]: string; }) {
    return Object.entries(cookieObject).map(([key, value]) => `${key}=${value}`).join('; ');
  }

  public getBknFromCookie (cookieObject: { [key: string]: string; }) {
    const sKey = cookieObject['skey'] as string;

    let hash = 5381;
    for (let i = 0; i < sKey.length; i++) {
      const code = sKey.charCodeAt(i);
      hash = hash + (hash << 5) + code;
    }
    return (hash & 0x7FFFFFFF).toString();
  }

  public getBknFromSKey (sKey: string) {
    let hash = 5381;
    for (let i = 0; i < sKey.length; i++) {
      const code = sKey.charCodeAt(i);
      hash = hash + (hash << 5) + code;
    }
    return (hash & 0x7FFFFFFF).toString();
  }

  public getBknFromPSKey (psKey: string) {
    return this.getBknFromSKey(psKey);
  }

  async getAlbumListByNTQQ (gc: string, attach_info: string = '') {
    return await this.context.session.getAlbumService().getAlbumList({
      qun_id: gc,
      attach_info,
      seq: 3331,
      request_time_line: {
        request_invoke_time: '0',
      },
    });
  }

  async getAlbumList (gc: string) {
    const skey = await this.core.apis.UserApi.getSKey() || '';
    const pskey = (await this.core.apis.UserApi.getPSkey(['qzone.qq.com'])).domainPskeyMap.get('qzone.qq.com') || '';
    const bkn = this.getBknFromSKey(skey);
    const uin = this.core.selfInfo.uin || '10001';
    const cookies = `p_uin=o${this.core.selfInfo.uin}; p_skey=${pskey}; skey=${skey}; uin=o${uin} `;
    const api = 'https://h5.qzone.qq.com/proxy/domain/u.photo.qzone.qq.com/cgi-bin/upp/qun_list_album_v2?';
    const params = new URLSearchParams({
      random: '7570',
      g_tk: bkn,
      format: 'json',
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      qua: 'V1_IPH_SQ_6.2.0_0_HDBM_T',
      cmd: 'qunGetAlbumList',
      qunId: gc,
      qunid: gc,
      start: '0',
      num: '1000',
      uin,
      getMemberRole: '0',
    });
    const response = await RequestUtil.HttpGetJson<{ data: { album: Array<{ id: string, title: string; }>; }; }>(api + params.toString(), 'GET', '', {
      Cookie: cookies,
    });
    return response.data.album;
  }

  async createQunAlbumSession (
    gc: string, sAlbumID: string, sAlbumName: string, path: string,
    skey: string, pskey: string, img_md5: string, uin: string, batch?: QunAlbumBatch
  ) {
    const img = readFileSync(path);
    const img_size = img.length;
    const img_name = basename(path);
    const GTK = this.getBknFromSKey(skey);
    const cookie = `p_uin=o${uin}; p_skey=${pskey}; skey=${skey}; uin=o${uin}`;
    const body = qunAlbumControl({
      uin,
      group_id: gc,
      pskey,
      pic_md5: img_md5,
      img_size,
      img_name,
      sAlbumName,
      sAlbumID,
      // 同批多图共用 batchId，并按「第几张 / 共几张」上报，相册里才会合并成同一条
      batchId: batch?.batchId,
      batchIndex: batch?.index,
      photo_num: batch?.count,
      batch_num: batch?.count,
    });
    const api = `https://h5.qzone.qq.com/webapp/json/sliceUpload/FileBatchControl/${img_md5}?g_tk=${GTK}`;
    const post = await RequestUtil.HttpGetJson<{
      data: { session: string; slice_size?: number | string; },
      ret: number,
      msg: string;
    }>(api, 'POST', body, {
      Cookie: cookie,
      'Content-Type': 'application/json',
    });
    return post;
  }

  // 服务端会在会话响应里给出建议的分片大小；取不到或异常时退回 16384。
  private resolveQunAlbumSliceSize (raw: unknown) {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < QUN_ALBUM_SLICE_MIN) return QUN_ALBUM_SLICE_MIN;
    return Math.min(value, QUN_ALBUM_SLICE_MAX);
  }

  async uploadQunAlbumSlice (
    path: string, session: string, skey: string, pskey: string, uin: string, slice_size: number,
    options: { appid?: string, cmd?: string, buffer?: Buffer; } = {}
  ) {
    const appid = options.appid ?? 'qun';
    const cmd = options.cmd ?? 'FileUpload';
    // 调用方已经读过文件时（如视频要算 SHA1）直接复用，避免大文件读两遍
    const buffer = options.buffer ?? readFileSync(path);
    const img_size = buffer.length;
    const GTK = this.getBknFromSKey(skey);
    const cookie = `p_uin=o${uin}; p_skey=${pskey}; skey=${skey}; uin=o${uin}`;

    // 先把分片切好，再分批并发上传：串行上传在几 MB 的图上要几十秒
    const slices: { seq: number, offset: number, end: number, chunk: Buffer; }[] = [];
    let seq = 0;
    let offset = 0;
    while (offset < img_size) {
      const end = Math.min(offset + slice_size, img_size);
      slices.push({ seq, offset, end, chunk: buffer.subarray(offset, end) });
      offset = end;
      seq++;
    }

    // 视频分片响应里会带 sVid，封面二段上传要靠它把封面挂到视频上
    let sVid: string | undefined;

    for (let i = 0; i < slices.length; i += QUN_ALBUM_SLICE_CONCURRENCY) {
      await Promise.all(slices.slice(i, i + QUN_ALBUM_SLICE_CONCURRENCY).map(async (slice) => {
        const form = new FormData();
        form.append('uin', uin);
        form.append('appid', appid);
        form.append('session', session);
        form.append('offset', slice.offset.toString());
        form.append('data', new Blob([slice.chunk], { type: 'application/octet-stream' }), 'blob');
        form.append('checksum', '');
        form.append('check_type', '0');
        form.append('retry', '0');
        form.append('seq', slice.seq.toString());
        form.append('end', slice.end.toString());
        form.append('cmd', cmd);
        form.append('slice_size', slice_size.toString());
        form.append('biz_req.iUploadType', '0');

        const api = `https://h5.qzone.qq.com/webapp/json/sliceUpload/FileUpload?seq=${slice.seq}&retry=0&offset=${slice.offset}&end=${slice.end}&total=${img_size}&type=form&g_tk=${GTK}`;
        const response = await fetch(api, {
          method: 'POST',
          headers: {
            Cookie: cookie,
          },
          body: form,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const post = await response.json() as { ret: number, msg: string, data?: { biz?: { sVid?: string; }; }; };
        if (post.ret !== 0) {
          throw new Error(`分片 ${slice.seq} 上传失败: ${post.msg}`);
        }
        if (!sVid && typeof post.data?.biz?.sVid === 'string' && post.data.biz.sVid) {
          sVid = post.data.biz.sVid;
        }
      }));
    }

    return { success: true, message: '上传完成', sVid };
  }

  // 多张图片一次上传：共用同一个 batchId，相册里显示为同一条
  async uploadImagesToQunAlbum (gc: string, sAlbumID: string, sAlbumName: string, paths: string[]) {
    if (!paths.length) throw new Error('上传列表为空');
    const skey = await this.core.apis.UserApi.getSKey() || '';
    const pskey = (await this.core.apis.UserApi.getPSkey(['qzone.qq.com'])).domainPskeyMap.get('qzone.qq.com') || '';
    const uin = this.core.selfInfo.uin || '10001';
    const batchId = Math.floor(Date.now() / 1000);
    const count = paths.length.toString();

    for (const [index, path] of paths.entries()) {
      const img_md5 = createHash('md5').update(readFileSync(path)).digest('hex');
      const data = (await this.createQunAlbumSession(
        gc, sAlbumID, sAlbumName, path, skey, pskey, img_md5, uin,
        { batchId, count, index: index.toString() }
      )).data;
      if (!data?.session) throw new Error('创建群相册会话失败');
      await this.uploadQunAlbumSlice(path, data.session, skey, pskey, uin, this.resolveQunAlbumSliceSize(data.slice_size));
    }
  }

  async uploadImageToQunAlbum (gc: string, sAlbumID: string, sAlbumName: string, path: string) {
    await this.uploadImagesToQunAlbum(gc, sAlbumID, sAlbumName, [path]);
  }

  /**
   * 上传视频到群相册。
   *
   * 分三段（字段依据见 docs/group-album-speedup-and-video-upload.md 第 4 节）：
   * 1. 视频主体：appid=video_qun / cmd=FileUploadVideo / SHA1 校验，此时**不带相册**
   * 2. 分片上传，从响应里拿 sVid
   * 3. 封面二段：走图片口径，用 vid 把封面挂到视频上——**相册与批次号都在这一步**
   */
  async uploadVideoToQunAlbum (gc: string, sAlbumID: string, sAlbumName: string, path: string) {
    const skey = await this.core.apis.UserApi.getSKey() || '';
    const pskey = (await this.core.apis.UserApi.getPSkey(['qzone.qq.com'])).domainPskeyMap.get('qzone.qq.com') || '';
    const uin = this.core.selfInfo.uin || '10001';
    const GTK = this.getBknFromSKey(skey);
    const cookie = `p_uin=o${uin}; p_skey=${pskey}; skey=${skey}; uin=o${uin}`;
    const videoBuffer = readFileSync(path);
    const video_sha1 = createHash('sha1').update(videoBuffer).digest('hex');

    // 时长：ffmpeg 不可用时回落 0（与 LLOneBot 一致）
    let playTime = 0;
    try {
      playTime = Math.max(0, Math.round(await FFmpegService.getDuration(path)));
    } catch (e) {
      this.context.logger.logWarn('获取视频时长失败，iPlayTime 上报 0', e);
    }

    // 1) 视频主体（不带相册，只传成素材）
    const videoSession = await RequestUtil.HttpGetJson<{
      data: { session: string; slice_size?: number | string; },
      ret: number,
      msg: string;
    }>(`https://h5.qzone.qq.com/webapp/json/sliceUpload/FileBatchControl/${video_sha1}?g_tk=${GTK}`, 'POST', qunAlbumVideoControl({
      uin,
      group_id: gc,
      pskey,
      video_sha1,
      video_size: videoBuffer.length,
      play_time: playTime,
    }), {
      Cookie: cookie,
      'Content-Type': 'application/json',
    });
    if (!videoSession.data?.session) throw new Error('创建群相册视频会话失败');

    const uploaded = await this.uploadQunAlbumSlice(path, videoSession.data.session, skey, pskey, uin,
      this.resolveQunAlbumSliceSize(videoSession.data.slice_size), { appid: 'video_qun', cmd: 'FileUploadVideo', buffer: videoBuffer });
    if (!uploaded.sVid) throw new Error('视频上传完成但未取得 sVid，无法挂进相册');

    // 2) 封面：抽首帧，失败（含 ffmpeg 不可用）回落内置默认封面
    //    用 .png：Native Addon 路径产出的就是 png（日志里可见 Detected format: png），
    //    而命令行路径会按扩展名编码，两条路都能得到真正的 PNG
    const coverPath = join(this.core.NapCatTempPath, `${randomUUID()}.png`);
    try {
      try {
        await FFmpegService.extractThumbnail(path, coverPath);
      } catch (e) {
        this.context.logger.logWarn('提取视频封面失败，使用默认封面', e);
        await writeFile(coverPath, Buffer.from(defaultVideoThumbB64, 'base64'));
      }

      // 3) 封面二段上传：这一步才带相册和批次号，视频靠它进相册
      const coverBuffer = readFileSync(coverPath);
      const cover_md5 = createHash('md5').update(coverBuffer).digest('hex');
      const coverSession = await RequestUtil.HttpGetJson<{
        data: { session: string; slice_size?: number | string; },
        ret: number,
        msg: string;
      }>(`https://h5.qzone.qq.com/webapp/json/sliceUpload/FileBatchControl/${cover_md5}?g_tk=${GTK}`, 'POST', qunAlbumVideoCoverControl({
        uin,
        group_id: gc,
        pskey,
        sAlbumName,
        sAlbumID,
        cover_md5,
        cover_size: coverBuffer.length,
        vid: uploaded.sVid,
      }), {
        Cookie: cookie,
        'Content-Type': 'application/json',
      });
      if (!coverSession.data?.session) throw new Error('创建群相册视频封面会话失败');

      await this.uploadQunAlbumSlice(coverPath, coverSession.data.session, skey, pskey, uin,
        this.resolveQunAlbumSliceSize(coverSession.data.slice_size), { buffer: coverBuffer });
    } finally {
      if (existsSync(coverPath)) {
        await unlink(coverPath);
      }
    }
  }

  async getAlbumMediaListByNTQQ (gc: string, albumId: string, attach_info: string = '') {
    return (await this.context.session.getAlbumService().getMediaList({
      qun_id: gc,
      attach_info,
      seq: 0,
      request_time_line: {
        request_invoke_time: '0',
      },
      album_id: albumId,
      lloc: '',
      batch_id: '',
    })).response;
  }

  async doAlbumMediaPlainCommentByNTQQ (
    qunId: string,
    albumId: string,
    lloc: string,
    content: string) {
    const random_seq = Math.floor(Math.random() * 9000) + 1000;
    const uin = this.core.selfInfo.uin || '10001';
    // 16位number数字
    const client_key = Date.now() * 1000;
    return await this.context.session.getAlbumService().doQunComment(
      random_seq, {
      map_info: [],
      map_bytes_info: [],
      map_user_account: [],
    },
      qunId,
      2,
      createAlbumMediaFeed(uin, albumId, lloc),
      createAlbumCommentRequest(uin, content, client_key)
    );
  }

  async deleteAlbumMediaByNTQQ (
    qunId: string,
    albumId: string,
    lloc: string) {
    const random_seq = Math.floor(Math.random() * 9000) + 1000;
    return await this.context.session.getAlbumService().deleteMedias(
      random_seq,
      qunId,
      albumId,
      [lloc],
      []
    );
  }

  async doAlbumMediaLikeByNTQQ (
    qunId: string,
    albumId: string,
    batchId: string,
    lloc: string | undefined,
    isLike: boolean
  ) {
    const random_seq = Math.floor(Math.random() * 9000) + 1000;
    const uin = this.core.selfInfo.uin || '10001';

    const type = isLike ? 2 : 1;
    const status = isLike ? 0 : 1;

    let id = '';
    if (lloc) {
      id = `421_1_0_${qunId}|${albumId}|${batchId}^||^421_1_0_${qunId}|${albumId}|${lloc}^||^0`;
    } else {
      id = `421_1_0_${qunId}|${albumId}|${batchId}`;
    }

    return await this.context.session.getAlbumService().doQunLike(
      random_seq,
      {
        map_info: [],
        map_bytes_info: [],
        map_user_account: [],
      },
      type,
      {
        id,
        status,
      },
      createAlbumFeedPublish(qunId, uin, albumId, batchId)
    );
  }

  private async getQzoneAuth () {
    const skey = await this.core.apis.UserApi.getSKey() || '';
    const pskey = (await this.core.apis.UserApi.getPSkey(['qzone.qq.com'])).domainPskeyMap.get('qzone.qq.com') || '';
    const uin = this.core.selfInfo.uin || '10001';
    const g_tk = this.getBknFromSKey(skey);
    const cookie = `p_uin=o${uin}; p_skey=${pskey}; skey=${skey}; uin=o${uin}`;
    return { skey, pskey, uin, g_tk, cookie };
  }

  /**
   * 上传图片到 QQ 空间相册, 返回可用于发说说的 richval 字符串
   * @param base64 图片Base64编码内容(不带data:前缀)
   */
  async uploadImageToQzone (base64: string): Promise<string> {
    const { skey, pskey, uin, g_tk, cookie } = await this.getQzoneAuth();
    const body = buildQzoneUploadImageBody({ uin, skey, pskey, g_tk, base64 });
    const api = `https://up.qzone.qq.com/cgi-bin/upload/cgi_upload_image?g_tk=${g_tk}`;
    const resultText = await RequestUtil.HttpGetText(api, 'POST', body, {
      Cookie: cookie,
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const parsed = parseQzoneUploadImageResponseText(resultText);
    if (parsed.code !== undefined && parsed.code !== 0) {
      throw new Error(parsed.msg || `QQ空间图片上传失败, code=${parsed.code}`);
    }
    if (!parsed.data) {
      throw new Error('QQ空间图片上传失败, 响应缺少data字段');
    }
    return toQzoneRichval(parsed.data);
  }

  /**
   * 发表QQ空间说说
   * @param content 说说正文
   * @param richvals 每张图片对应的richval数组, 为空表示纯文字说说
   * @param ugcRight 查看权限 1所有人可见 4好友可见 16部分好友可见 64仅自己可见 128部分好友不可见
   * @param targetUins 权限作用QQ号数组, ugcRight为16/128时使用
   */
  async publishQzoneMsg (content: string, richvals: string[], ugcRight: number, targetUins?: number[]) {
    const { uin, g_tk, cookie } = await this.getQzoneAuth();
    const richval = richvals.length > 0 ? richvals.join('\t') : undefined;
    const allowUins = targetUins && targetUins.length > 0 ? targetUins.join('|') : undefined;
    const body = buildQzonePublishBody({
      hostuin: uin,
      content,
      richval,
      ugcRight,
      allowUins,
    });
    const api = `https://user.qzone.qq.com/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_publish_v6?g_tk=${g_tk}`;
    const result = await RequestUtil.HttpGetJson<QzonePublishResponse>(api, 'POST', body, {
      Cookie: cookie,
      'Content-Type': 'application/x-www-form-urlencoded',
    }, true, false);
    return parseQzonePublishResponse(result);
  }

  /**
   * 删除QQ空间说说
   * @param tid 说说Tid, 来自 publishQzoneMsg 的返回值
   */
  async deleteQzoneMsg (tid: string) {
    const { uin, g_tk, cookie } = await this.getQzoneAuth();
    const body = buildQzoneDeleteBody({ hostuin: uin, tid });
    const api = `https://user.qzone.qq.com/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_delete_v6?g_tk=${g_tk}`;
    const result = await RequestUtil.HttpGetJson<QzoneDeleteResponse>(api, 'POST', body, {
      Cookie: cookie,
      'Content-Type': 'application/x-www-form-urlencoded',
    }, true, false);
    return parseQzoneDeleteResponse(result);
  }

  async getDaySignedList (groupCode: string) {
    const pSkey = (await this.core.apis.UserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com')!;
    const selfUin = this.core.selfInfo.uin;
    const cookie = `p_uin=o${selfUin}; p_skey=${pSkey}; uin=o${selfUin}`;
    const post = await RequestUtil.HttpGetJson<{
      retCode: number,
      costTime: number,
      response: {
        ret?: {
          code: string,
          msg: string,
        },
        page?: {
          infos?: {
            uid: string,
            uidGroupNick: string,
            signedTimeStamp: string,
            signInRank: number,
          }[],
          offset: number,
          total: number,
        }[],
      },
      funcCode: number,
    }>(`https://qun.qq.com/v2/signin/trpc/GetDaySignedList?g_tk=${this.getBknFromPSKey(pSkey)}`, 'POST', {
      dayYmd: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      offset: 0,
      limit: 100,
      uid: selfUin,
      groupId: groupCode,
    }, {
      Cookie: cookie,
      'Content-Type': 'application/json',
    });
    return post;
  }
}
