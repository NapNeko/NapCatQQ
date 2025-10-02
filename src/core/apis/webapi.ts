import { RequestUtil } from '@/common/request';
import {
    GroupEssenceMsgRet,
    InstanceContext,
    WebApiGroupMember,
    WebApiGroupMemberRet,
    WebApiGroupNoticeRet,
    WebHonorType,
} from '@/core';
import { NapCatCore } from '..';
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename } from 'node:path';
import { qunAlbumControl } from '../data/webapi';
import { createAlbumCommentRequest, createAlbumFeedPublish, createAlbumMediaFeed } from '../data/album';
export class NTQQWebApi {
    context: InstanceContext;
    core: NapCatCore;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
    }

    async shareDigest(groupCode: string, msgSeq: string, msgRandom: string, targetGroupCode: string) {
        const cookieObject = await this.core.apis.UserApi.getCookies('qun.qq.com');
        const url = `https://qun.qq.com/cgi-bin/group_digest/share_digest?${new URLSearchParams({
            bkn: this.getBknFromCookie(cookieObject),
            group_code: groupCode,
            msg_seq: msgSeq,
            msg_random: msgRandom,
            target_group_code: targetGroupCode,
        }).toString()}`;
        try {
            return RequestUtil.HttpGetText(url, 'GET', '', { 'Cookie': this.cookieToString(cookieObject) });
        } catch {
            return undefined;
        }
    }
    async getGroupEssenceMsgAll(GroupCode: string) {
        const ret: GroupEssenceMsgRet[] = [];
        for (let i = 0; i < 20; i++) {
            const data = await this.getGroupEssenceMsg(GroupCode, i, 50);
            if (!data) break;
            ret.push(data);
            if (data.data.is_end) break;
        }
        return ret;
    }
    async getGroupEssenceMsg(GroupCode: string, page_start: number = 0, page_limit: number = 50) {
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
                { 'Cookie': this.cookieToString(cookieObject) }
            );
            return ret.retcode === 0 ? ret : undefined;
        } catch {
            return undefined;
        }
    }

    async getGroupMembers(GroupCode: string): Promise<WebApiGroupMember[]> {
        //logDebug('webapi 获取群成员', GroupCode);
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
            { 'Cookie': this.cookieToString(cookieObject) }
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
        //初始化获取PageNum
        const PageNum = Math.ceil(fastRet.count / 40);
        //遍历批量请求
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
                { 'Cookie': this.cookieToString(cookieObject) }
            );
            retList.push(ret);
        }
        //批量等待
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

    async setGroupNotice(
        GroupCode: string,
        Content: string,
        pinned: number = 0,
        type: number = 1,
        is_show_edit_card: number = 1,
        tip_window_type: number = 1,
        confirm_required: number = 1,
        picId: string = '',
        imgWidth: number = 540,
        imgHeight: number = 300,
    ) {
        interface SetNoticeRetSuccess {
            ec: number;
            em: string;
            id: number;
            ltsm: number;
            new_fid: string;
            read_only: number;
            role: number;
            srv_code: number;
        }

        const cookieObject = await this.core.apis.UserApi.getCookies('qun.qq.com');

        try {
            const settings = JSON.stringify({
                is_show_edit_card: is_show_edit_card,
                tip_window_type: tip_window_type,
                confirm_required: confirm_required
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
                    settings: settings,
                    ...(picId === '' ? {} : externalParam)
                }).toString()}`,
                'POST',
                '',
                { 'Cookie': this.cookieToString(cookieObject) }
            );
            return ret;
        } catch {
            return undefined;
        }
    }

    async getGroupNotice(GroupCode: string): Promise<undefined | WebApiGroupNoticeRet> {
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
                { 'Cookie': this.cookieToString(cookieObject) }
            );
            return ret?.ec === 0 ? ret : undefined;
        } catch {
            return undefined;
        }
    }

    private async getDataInternal(cookieObject: { [key: string]: string }, groupCode: string, type: number) {
        let resJson;
        try {
            const res = await RequestUtil.HttpGetText(
                `https://qun.qq.com/interactive/honorlist?${new URLSearchParams({
                    gc: groupCode,
                    type: type.toString(),
                }).toString()}`,
                'GET',
                '',
                { 'Cookie': this.cookieToString(cookieObject) }
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

    private async getHonorList(cookieObject: { [key: string]: string }, groupCode: string, type: number) {
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

    async getGroupHonorInfo(groupCode: string, getType: WebHonorType) {
        const cookieObject = await this.core.apis.UserApi.getCookies('qun.qq.com');
        let HonorInfo = {
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

    private cookieToString(cookieObject: { [key: string]: string }) {
        return Object.entries(cookieObject).map(([key, value]) => `${key}=${value}`).join('; ');
    }

    public getBknFromCookie(cookieObject: { [key: string]: string }) {
        const sKey = cookieObject['skey'] as string;

        let hash = 5381;
        for (let i = 0; i < sKey.length; i++) {
            const code = sKey.charCodeAt(i);
            hash = hash + (hash << 5) + code;
        }
        return (hash & 0x7FFFFFFF).toString();
    }
    public getBknFromSKey(sKey: string) {
        let hash = 5381;
        for (let i = 0; i < sKey.length; i++) {
            const code = sKey.charCodeAt(i);
            hash = hash + (hash << 5) + code;
        }
        return (hash & 0x7FFFFFFF).toString();
    }
    async getAlbumListByNTQQ(gc: string) {
        return await this.context.session.getAlbumService().getAlbumList({
            qun_id: gc,
            attach_info: '',
            seq: 3331,
            request_time_line: {
                request_invoke_time: "0"
            }
        })
    }
    async getAlbumList(gc: string) {
        const skey = await this.core.apis.UserApi.getSKey() || '';
        const pskey = (await this.core.apis.UserApi.getPSkey(['qzone.qq.com'])).domainPskeyMap.get('qzone.qq.com') || '';
        const bkn = this.getBknFromSKey(skey);
        const uin = this.core.selfInfo.uin || '10001';
        const cookies = `p_uin=o${this.core.selfInfo.uin}; p_skey=${pskey}; skey=${skey}; uin=o${uin} `;
        const api = `https://h5.qzone.qq.com/proxy/domain/u.photo.qzone.qq.com/cgi-bin/upp/qun_list_album_v2?`;
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
            uin: uin,
            getMemberRole: '0'
        });
        const response = await RequestUtil.HttpGetJson<{ data: { album: Array<{ id: string, title: string }> } }>(api + params.toString(), 'GET', '', {
            'Cookie': cookies
        });
        return response.data.album;
    }

    async createQunAlbumSession(gc: string, sAlbumID: string, sAlbumName: string, path: string, skey: string, pskey: string, img_md5: string, uin: string) {
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
            sAlbumName: sAlbumName,
            sAlbumID: sAlbumID
        });
        const api = `https://h5.qzone.qq.com/webapp/json/sliceUpload/FileBatchControl/${img_md5}?g_tk=${GTK}`;
        const post = await RequestUtil.HttpGetJson<{ data: { session: string }, ret: number, msg: string }>(api, 'POST', body, {
            'Cookie': cookie,
            'Content-Type': 'application/json'
        });
        return post;
    }

    async uploadQunAlbumSlice(path: string, session: string, skey: string, pskey: string, uin: string, slice_size: number) {
        const img_size = statSync(path).size;
        let seq = 0;
        let offset = 0;
        const GTK = this.getBknFromSKey(skey);
        const cookie = `p_uin=o${uin}; p_skey=${pskey}; skey=${skey}; uin=o${uin}`;

        const stream = createReadStream(path, { highWaterMark: slice_size });

        for await (const chunk of stream) {
            const end = Math.min(offset + chunk.length, img_size);
            const form = new FormData();
            form.append('uin', uin);
            form.append('appid', 'qun');
            form.append('session', session);
            form.append('offset', offset.toString());
            form.append('data', new Blob([chunk], { type: 'application/octet-stream' }), 'blob');
            form.append('checksum', '');
            form.append('check_type', '0');
            form.append('retry', '0');
            form.append('seq', seq.toString());
            form.append('end', end.toString());
            form.append('cmd', 'FileUpload');
            form.append('slice_size', slice_size.toString());
            form.append('biz_req.iUploadType', '0');

            const api = `https://h5.qzone.qq.com/webapp/json/sliceUpload/FileUpload?seq=${seq}&retry=0&offset=${offset}&end=${end}&total=${img_size}&type=form&g_tk=${GTK}`;
            const response = await fetch(api, {
                method: 'POST',
                headers: {
                    'Cookie': cookie,
                },
                body: form
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const post = await response.json() as { ret: number, msg: string }; if (post.ret !== 0) {
                throw new Error(`分片 ${seq} 上传失败: ${post.msg}`);
            }
            offset += chunk.length;
            seq++;
        }

        return { success: true, message: '上传完成' };
    }

    async uploadImageToQunAlbum(gc: string, sAlbumID: string, sAlbumName: string, path: string) {
        const skey = await this.core.apis.UserApi.getSKey() || '';
        const pskey = (await this.core.apis.UserApi.getPSkey(['qzone.qq.com'])).domainPskeyMap.get('qzone.qq.com') || '';
        const img_md5 = createHash('md5').update(readFileSync(path)).digest('hex');
        const uin = this.core.selfInfo.uin || '10001';
        const session = (await this.createQunAlbumSession(gc, sAlbumID, sAlbumName, path, skey, pskey, img_md5, uin)).data.session;
        if (!session) throw new Error('创建群相册会话失败');
        await this.uploadQunAlbumSlice(path, session, skey, pskey, uin, 16384);
    }
    async getAlbumMediaListByNTQQ(gc: string, albumId: string, attach_info: string = '') {
        return (await this.context.session.getAlbumService().getMediaList({
            qun_id: gc,
            attach_info: attach_info,
            seq: 0,
            request_time_line: {
                request_invoke_time: "0"
            },
            album_id: albumId,
            lloc: '',
            batch_id: ''
        })).response;
    }

    async doAlbumMediaPlainCommentByNTQQ(
        qunId: string,
        albumId: string,
        lloc: string,
        content: string) {
        const random_seq = Math.floor(Math.random() * 9000) + 1000;
        const uin = this.core.selfInfo.uin || '10001';
        //16位number数字
        const client_key = Date.now() * 1000
        return await this.context.session.getAlbumService().doQunComment(
            random_seq, {
            map_info: [],
            map_bytes_info: [],
            map_user_account: []
        },
            qunId,
            2,
            createAlbumMediaFeed(uin, albumId, lloc),
            createAlbumCommentRequest(uin, content, client_key)
        );
    }

    async deleteAlbumMediaByNTQQ(
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

    async doAlbumMediaLikeByNTQQ(
        qunId: string,
        albumId: string,
        lloc: string,
        id: string) {
        const random_seq = Math.floor(Math.random() * 9000) + 1000;
        const uin = this.core.selfInfo.uin || '10001';
        return await this.context.session.getAlbumService().doQunLike(
            random_seq, {
            map_info: [],
            map_bytes_info: [],
            map_user_account: []
        }, {
            id: id,
            status: 1
        },
            createAlbumFeedPublish(qunId, uin, albumId, lloc)
        )
    }
}