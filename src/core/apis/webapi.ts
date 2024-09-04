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
        } catch (e) {
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

    async getGroupMembers(GroupCode: string, cached: boolean = true): Promise<WebApiGroupMember[]> {
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
                memberData.push(fastRet.mems[key]);
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
                memberData.push(ret.mems[key]);
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
            let settings = JSON.stringify({
                is_show_edit_card: is_show_edit_card,
                tip_window_type: tip_window_type,
                confirm_required: confirm_required
            });
            const externalParam = {
                pic: picId,
                imgWidth: imgWidth.toString(),
                imgHeight: imgHeight.toString(),
            };
            let ret: SetNoticeRetSuccess = await RequestUtil.HttpGetJson<SetNoticeRetSuccess>(
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
        } catch (e) {
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
        } catch (e) {
            return undefined;
        }
    }

    async getGroupHonorInfo(groupCode: string, getType: WebHonorType) {
        const cookieObject = await this.core.apis.UserApi.getCookies('qun.qq.com');
        const getDataInternal = async (Internal_groupCode: string, Internal_type: number) => {
            let resJson;
            try {
                const res = await RequestUtil.HttpGetText(
                    `https://qun.qq.com/interactive/honorlist?${new URLSearchParams({
                        gc: Internal_groupCode,
                        type: Internal_type.toString(),
                    }).toString()}`,
                    'GET',
                    '',
                    { 'Cookie': this.cookieToString(cookieObject) }
                );
                const match = /window\.__INITIAL_STATE__=(.*?);/.exec(res);
                if (match) {
                    resJson = JSON.parse(match[1].trim());
                }
                if (Internal_type === 1) {
                    return resJson?.talkativeList;
                } else {
                    return resJson?.actorList;
                }
            } catch (e) {
                this.context.logger.logDebug('获取当前群荣耀失败', e);
            }
            return undefined;
        };

        const HonorInfo: any = { group_id: groupCode };

        if (getType === WebHonorType.TALKATIVE || getType === WebHonorType.ALL) {
            const RetInternal = await getDataInternal(groupCode, 1);
            if (RetInternal) {
                HonorInfo.current_talkative = {
                    user_id: RetInternal[0]?.uin,
                    avatar: RetInternal[0]?.avatar,
                    nickname: RetInternal[0]?.name,
                    day_count: 0,
                    description: RetInternal[0]?.desc,
                };
                HonorInfo.talkative_list = [];
                for (const talkative_ele of RetInternal) {
                    HonorInfo.talkative_list.push({
                        user_id: talkative_ele?.uin,
                        avatar: talkative_ele?.avatar,
                        description: talkative_ele?.desc,
                        day_count: 0,
                        nickname: talkative_ele?.name,
                    });
                }
            } else {
                this.context.logger.logError('获取龙王信息失败');
            }
        }
        if (getType === WebHonorType.PERFORMER || getType === WebHonorType.ALL) {
            const RetInternal = await getDataInternal(groupCode, 2);
            if (RetInternal) {
                HonorInfo.performer_list = [];
                for (const performer_ele of RetInternal) {
                    HonorInfo.performer_list.push({
                        user_id: performer_ele?.uin,
                        nickname: performer_ele?.name,
                        avatar: performer_ele?.avatar,
                        description: performer_ele?.desc,
                    });
                }
            } else {
                this.context.logger.logError('获取群聊之火失败');
            }
        }
        if (getType === WebHonorType.PERFORMER || getType === WebHonorType.ALL) {
            const RetInternal = await getDataInternal(groupCode, 3);
            if (RetInternal) {
                HonorInfo.legend_list = [];
                for (const legend_ele of RetInternal) {
                    HonorInfo.legend_list.push({
                        user_id: legend_ele?.uin,
                        nickname: legend_ele?.name,
                        avatar: legend_ele?.avatar,
                        desc: legend_ele?.description,
                    });
                }
            } else {
                this.context.logger.logError('获取群聊炽焰失败');
            }
        }
        if (getType === WebHonorType.EMOTION || getType === WebHonorType.ALL) {
            const RetInternal = await getDataInternal(groupCode, 6);
            if (RetInternal) {
                HonorInfo.emotion_list = [];
                for (const emotion_ele of RetInternal) {
                    HonorInfo.emotion_list.push({
                        user_id: emotion_ele.uin,
                        nickname: emotion_ele.name,
                        avatar: emotion_ele.avatar,
                        desc: emotion_ele.description,
                    });
                }
            } else {
                this.context.logger.logError('获取快乐源泉失败');
            }
        }

        // 冒尖小春笋好像已经被tx扬了 R.I.P.
        if (getType === WebHonorType.EMOTION || getType === WebHonorType.ALL) {
            HonorInfo.strong_newbie_list = [];
        }

        return HonorInfo;
    }

    private cookieToString(cookieObject: any) {
        return Object.entries(cookieObject).map(([key, value]) => `${key}=${value}`).join('; ');
    }

    public getBknFromCookie(cookieObject: any) {
        const sKey = cookieObject.skey as string;

        let hash = 5381;
        for (let i = 0; i < sKey.length; i++) {
            const code = sKey.charCodeAt(i);
            hash = hash + (hash << 5) + code;
        }
        return (hash & 0x7FFFFFFF).toString();
    }
}
