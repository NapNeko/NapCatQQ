import { selfInfo } from '@/core/data';
import { log, logDebug } from '@/common/utils/log';
import { NTQQUserApi } from './user';
import { RequestUtil } from '@/common/utils/request';
import { CacheClassFuncAsync } from '@/common/utils/helper';
export enum WebHonorType {
  ALL = 'all',
  TALKACTIVE = 'talkative',
  PERFROMER = 'performer',
  LEGEND = 'legend',
  STORONGE_NEWBI = 'strong_newbie',
  EMOTION = 'emotion'
}
export interface WebApiGroupMember {
  uin: number
  role: number
  g: number
  join_time: number
  last_speak_time: number
  lv: {
    point: number
    level: number
  }
  card: string
  tags: string
  flag: number
  nick: string
  qage: number
  rm: number
}
interface WebApiGroupMemberRet {
  ec: number
  errcode: number
  em: string
  cache: number
  adm_num: number
  levelname: any
  mems: WebApiGroupMember[]
  count: number
  svr_time: number
  max_count: number
  search_count: number
  extmode: number
}
export interface WebApiGroupNoticeFeed {
  u: number//发送者
  fid: string//fid
  pubt: number//时间
  msg: {
    text: string
    text_face: string
    title: string,
    pics?: {
      id: string,
      w: string,
      h: string
    }[]
  }
  type: number
  fn: number
  cn: number
  vn: number
  settings: {
    is_show_edit_card: number
    remind_ts: number
    tip_window_type: number
    confirm_required: number
  }
  read_num: number
  is_read: number
  is_all_confirm: number
}
export interface WebApiGroupNoticeRet {
  ec: number
  em: string
  ltsm: number
  srv_code: number
  read_only: number
  role: number
  feeds: WebApiGroupNoticeFeed[]
  group: {
    group_id: number
    class_ext: number
  }
  sta: number,
  gln: number
  tst: number,
  ui: any
  server_time: number
  svrt: number
  ad: number
}
interface GroupEssenceMsg {
  group_code: string
  msg_seq: number
  msg_random: number
  sender_uin: string
  sender_nick: string
  sender_time: number
  add_digest_uin: string
  add_digest_nick: string
  add_digest_time: number
  msg_content: any[]
  can_be_removed: true
}
export interface GroupEssenceMsgRet {
  retcode: number
  retmsg: string
  data: {
    msg_list: GroupEssenceMsg[]
    is_end: boolean
    group_role: number
    config_page_url: string
  }
}
export class WebApi {
  static async shareDigest(groupCode: string, msgSeq: string, msgRandom: string, targetGroupCode: string) {
    const CookiesObject = await NTQQUserApi.getCookies('qun.qq.com');
    const CookieValue = Object.entries(CookiesObject).map(([key, value]) => `${key}=${value}`).join('; ');
    const Bkn = WebApi.genBkn(CookiesObject.skey);
    let ret: any = undefined;
    const data = 'group_code=' + groupCode + '&msg_seq=' + msgSeq + '&msg_random=' + msgRandom + '&target_group_code=' + targetGroupCode;
    const url = 'https://qun.qq.com/cgi-bin/group_digest/share_digest?bkn=' + Bkn + "&" + data;
    //console.log(url);
    try {
      ret = await RequestUtil.HttpGetText(url, 'GET', '', { 'Cookie': CookieValue });
      return ret;
    } catch (e) {
      return undefined;
    }
    return undefined;
  }
  @CacheClassFuncAsync(3600 * 1000, 'webapi_get_group_members')
  static async getGroupEssenceMsg(GroupCode: string, page_start: string) {
    const CookiesObject = await NTQQUserApi.getCookies('qun.qq.com');
    const CookieValue = Object.entries(CookiesObject).map(([key, value]) => `${key}=${value}`).join('; ');
    const Bkn = WebApi.genBkn(CookiesObject.skey);
    const url = 'https://qun.qq.com/cgi-bin/group_digest/digest_list?bkn=' + Bkn + '&group_code=' + GroupCode + '&page_start=' + page_start + '&page_limit=20';
    let ret;
    try {
      ret = await RequestUtil.HttpGetJson<GroupEssenceMsgRet>(url, 'GET', '', { 'Cookie': CookieValue });
    } catch {
      return undefined;
    }
    //console.log(url, CookieValue);
    if (ret.retcode !== 0) {
      return undefined;
    }
    return ret;
  }
  @CacheClassFuncAsync(3600 * 1000, 'webapi_get_group_members')
  static async getGroupMembers(GroupCode: string, cached: boolean = true): Promise<WebApiGroupMember[]> {
    //logDebug('webapi 获取群成员', GroupCode);
    let MemberData: Array<WebApiGroupMember> = new Array<WebApiGroupMember>();
    try {
      const CookiesObject = await NTQQUserApi.getCookies('qun.qq.com');
      const CookieValue = Object.entries(CookiesObject).map(([key, value]) => `${key}=${value}`).join('; ');
      const Bkn = WebApi.genBkn(CookiesObject.skey);
      const retList: Promise<WebApiGroupMemberRet>[] = [];
      const fastRet = await RequestUtil.HttpGetJson<WebApiGroupMemberRet>('https://qun.qq.com/cgi-bin/qun_mgr/search_group_members?st=0&end=40&sort=1&gc=' + GroupCode + '&bkn=' + Bkn, 'POST', '', { 'Cookie': CookieValue });
      if (!fastRet?.count || fastRet?.errcode !== 0 || !fastRet?.mems) {
        return [];
      } else {
        for (const key in fastRet.mems) {
          MemberData.push(fastRet.mems[key]);
        }
      }
      //初始化获取PageNum
      const PageNum = Math.ceil(fastRet.count / 40);
      //遍历批量请求
      for (let i = 2; i <= PageNum; i++) {
        const ret: Promise<WebApiGroupMemberRet> = RequestUtil.HttpGetJson<WebApiGroupMemberRet>('https://qun.qq.com/cgi-bin/qun_mgr/search_group_members?st=' + (i - 1) * 40 + '&end=' + i * 40 + '&sort=1&gc=' + GroupCode + '&bkn=' + Bkn, 'POST', '', { 'Cookie': CookieValue });
        retList.push(ret);
      }
      //批量等待
      for (let i = 1; i <= PageNum; i++) {
        const ret = await (retList[i]);
        if (!ret?.count || ret?.errcode !== 0 || !ret?.mems) {
          continue;
        }
        for (const key in ret.mems) {
          MemberData.push(ret.mems[key]);
        }
      }
    } catch {
      return MemberData;
    }
    return MemberData;
  }
  // public static async addGroupDigest(groupCode: string, msgSeq: string) {
  //   const url = `https://qun.qq.com/cgi-bin/group_digest/cancel_digest?random=665&X-CROSS-ORIGIN=fetch&group_code=${groupCode}&msg_seq=${msgSeq}&msg_random=444021292`;
  //   const res = await this.request(url);
  //   return await res.json();
  // }

  // public async getGroupDigest(groupCode: string) {
  //   const url = `https://qun.qq.com/cgi-bin/group_digest/digest_list?random=665&X-CROSS-ORIGIN=fetch&group_code=${groupCode}&page_start=0&page_limit=20`;
  //   const res = await this.request(url);
  //   return await res.json();
  // }
  static async setGroupNotice(GroupCode: string, Content: string = '') {
    //https://web.qun.qq.com/cgi-bin/announce/add_qun_notice?bkn=${bkn}
    //qid=${群号}&bkn=${bkn}&text=${内容}&pinned=0&type=1&settings={"is_show_edit_card":1,"tip_window_type":1,"confirm_required":1}

    const CookiesObject = await NTQQUserApi.getCookies('qun.qq.com');
    const CookieValue = Object.entries(CookiesObject).map(([key, value]) => `${key}=${value}`).join('; ');
    const Bkn = WebApi.genBkn(CookiesObject.skey);
    let ret: any = undefined;
    const data = 'qid=' + GroupCode + '&bkn=' + Bkn + '&text=' + Content + '&pinned=0&type=1&settings={"is_show_edit_card":1,"tip_window_type":1,"confirm_required":1}';
    const url = 'https://web.qun.qq.com/cgi-bin/announce/add_qun_notice?bkn=' + Bkn;
    try {
      ret = await RequestUtil.HttpGetJson<any>(url, 'GET', '', { 'Cookie': CookieValue });
      return ret;
    } catch (e) {
      return undefined;
    }
    return undefined;
  }
  static async getGrouptNotice(GroupCode: string): Promise<undefined | WebApiGroupNoticeRet> {
    const CookiesObject = await NTQQUserApi.getCookies('qun.qq.com');
    const CookieValue = Object.entries(CookiesObject).map(([key, value]) => `${key}=${value}`).join('; ');
    const Bkn = WebApi.genBkn(CookiesObject.skey);
    let ret: WebApiGroupNoticeRet | undefined = undefined;
    //console.log(CookieValue);
    const url = 'https://web.qun.qq.com/cgi-bin/announce/get_t_list?bkn=' + Bkn + '&qid=' + GroupCode + '&ft=23&ni=1&n=1&i=1&log_read=1&platform=1&s=-1&n=20';
    try {
      ret = await RequestUtil.HttpGetJson<WebApiGroupNoticeRet>(url, 'GET', '', { 'Cookie': CookieValue });
      if (ret?.ec !== 0) {
        return undefined;
      }
      return ret;
    } catch (e) {
      return undefined;
    }
    return undefined;
  }
  static genBkn(sKey: string) {
    sKey = sKey || '';
    let hash = 5381;

    for (let i = 0; i < sKey.length; i++) {
      const code = sKey.charCodeAt(i);
      hash = hash + (hash << 5) + code;
    }

    return (hash & 0x7FFFFFFF).toString();
  }

  @CacheClassFuncAsync(3600 * 1000, 'GroupHonorInfo')
  static async getGroupHonorInfo(groupCode: string, getType: WebHonorType) {
    const CookiesObject = await NTQQUserApi.getCookies('qun.qq.com');
    const CookieValue = Object.entries(CookiesObject).map(([key, value]) => `${key}=${value}`).join('; ');
    const Bkn = WebApi.genBkn(CookiesObject.skey);
    async function getDataInternal(Internal_groupCode: string, Internal_type: number) {
      let url = 'https://qun.qq.com/interactive/honorlist?gc=' + Internal_groupCode + '&type=' + Internal_type.toString();
      let res = '';
      let resJson;
      try {
        res = await RequestUtil.HttpGetText(url, 'GET', '', { 'Cookie': CookieValue });
        const match = res.match(/window\.__INITIAL_STATE__=(.*?);/);
        if (match) {
          resJson = JSON.parse(match[1].trim());
        }
        if (Internal_type === 1) {
          return resJson?.talkativeList;
        } else {
          return resJson?.actorList;
        }
      } catch (e) {
        logDebug('获取当前群荣耀失败', url, e);
      }
      return undefined;
    }

    let HonorInfo: any = { group_id: groupCode };

    if (getType === WebHonorType.TALKACTIVE || getType === WebHonorType.ALL) {
      try {
        let RetInternal = await getDataInternal(groupCode, 1);
        if (!RetInternal) {
          throw new Error('获取龙王信息失败');
        }
        HonorInfo.current_talkative = {
          user_id: RetInternal[0]?.uin,
          avatar: RetInternal[0]?.avatar,
          nickname: RetInternal[0]?.name,
          day_count: 0,
          description: RetInternal[0]?.desc
        }
        HonorInfo.talkative_list = [];
        for (const talkative_ele of RetInternal) {
          HonorInfo.talkative_list.push({
            user_id: talkative_ele?.uin,
            avatar: talkative_ele?.avatar,
            description: talkative_ele?.desc,
            day_count: 0,
            nickname: talkative_ele?.name
          });
        }
      } catch (e) {
        logDebug(e);
      }
    }
    if (getType === WebHonorType.PERFROMER || getType === WebHonorType.ALL) {
      try {
        let RetInternal = await getDataInternal(groupCode, 2);
        if (!RetInternal) {
          throw new Error('获取群聊之火失败');
        }
        HonorInfo.performer_list = [];
        for (const performer_ele of RetInternal) {
          HonorInfo.performer_list.push({
            user_id: performer_ele?.uin,
            nickname: performer_ele?.name,
            avatar: performer_ele?.avatar,
            description: performer_ele?.desc
          });
        }
      } catch (e) {
        logDebug(e);
      }
    }
    if (getType === WebHonorType.PERFROMER || getType === WebHonorType.ALL) {
      try {
        let RetInternal = await getDataInternal(groupCode, 3);
        if (!RetInternal) {
          throw new Error('获取群聊炽焰失败');
        }
        HonorInfo.legend_list = [];
        for (const legend_ele of RetInternal) {
          HonorInfo.legend_list.push({
            user_id: legend_ele?.uin,
            nickname: legend_ele?.name,
            avatar: legend_ele?.avatar,
            desc: legend_ele?.description
          });
        }
      } catch (e) {
        logDebug('获取群聊炽焰失败', e);
      }
    }
    if (getType === WebHonorType.EMOTION || getType === WebHonorType.ALL) {
      try {
        let RetInternal = await getDataInternal(groupCode, 6);
        if (!RetInternal) {
          throw new Error('获取快乐源泉失败');
        }
        HonorInfo.emotion_list = [];
        for (const emotion_ele of RetInternal) {
          HonorInfo.emotion_list.push({
            user_id: emotion_ele?.uin,
            nickname: emotion_ele?.name,
            avatar: emotion_ele?.avatar,
            desc: emotion_ele?.description
          });
        }
      } catch (e) {
        logDebug('获取快乐源泉失败', e);
      }
    }
    //冒尖小春笋好像已经被tx扬了
    if (getType === WebHonorType.EMOTION || getType === WebHonorType.ALL) {
      HonorInfo.strong_newbie_list = [];
    }
    return HonorInfo;
  }
}
