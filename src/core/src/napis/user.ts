import type { ModifyProfileParams, User, UserDetailInfoByUin, UserDetailInfoByUinV2 } from '@/core/entities';
import type { ApiContext } from '../session';
import { friends, groupMembers, selfInfo } from '@/core/data';
import { CacheClassFuncAsync, CacheClassFuncAsyncExtend } from '@/common/utils/helper';
import { NodeIKernelProfileListener } from '@/core/listeners';
import { RequestUtil } from '@/common/utils/request';
import { logWarn } from '@/common/utils/log';
import { NodeIKernelProfileService, ProfileBizType, UserDetailSource } from '@/core/services';
import { requireMinNTQQBuild } from '@/common/utils/QQBasicInfo';


export class NTQQUserApi {
  private context: ApiContext;
  constructor(context: ApiContext) {
    this.context = context;
  }
  async getProfileLike(uid: string) {
    return this.context.core.session.getProfileLikeService().getBuddyProfileLike({
      friendUids: [
        uid
      ],
      basic: 1,
      vote: 1,
      favorite: 0,
      userProfile: 1,
      type: 2,
      start: 0,
      limit: 20
    });
  }
  async setLongNick(longNick: string) {
    return this.context.core.session.getProfileService().setLongNick(longNick);
  }
  async setSelfOnlineStatus(status: number, extStatus: number, batteryStatus: number) {
    return this.context.core.session.getMsgService().setStatus({ status: status, extStatus: extStatus, batteryStatus: batteryStatus });
  }
  async getBuddyRecommendContactArkJson(uin: string, sencenID = '') {
    return this.context.core.session.getBuddyService().getBuddyRecommendContactArkJson(uin, sencenID);
  }
  async like(uid: string, count = 1): Promise<{ result: number, errMsg: string, succCounts: number }> {
    return this.context.core.session.getProfileLikeService().setBuddyProfileLike({
      friendUid: uid,
      sourceId: 71,
      doLikeCount: count,
      doLikeTollCount: 0
    });
  }

  async setQQAvatar(filePath: string) {
    type setQQAvatarRet = { result: number, errMsg: string };
    const ret = await this.context.core.session.getProfileService().setHeader(filePath) as setQQAvatarRet;
    return { result: ret?.result, errMsg: ret?.errMsg };
  }
  async setGroupAvatar(gc: string, filePath: string) {
    return this.context.core.session.getGroupService().setHeader(gc, filePath);
  }

  async fetchUserDetailInfos(uids: string[]) {
    //26702 以上使用新接口 .Dev Mlikiowa
    type EventService = NodeIKernelProfileService['fetchUserDetailInfo'];
    type EventListener = NodeIKernelProfileListener['onUserDetailInfoChanged'];
    let retData: User[] = [];
    let [_retData, _retListener] = await this.context.event.CallNormalEvent
      <EventService, EventListener>
      (
        'NodeIKernelProfileService/fetchUserDetailInfo',
        'NodeIKernelProfileListener/onUserDetailInfoChanged',
        uids.length,
        5000,
        (profile) => {
          if (uids.includes(profile.uid)) {
            let RetUser: User = {
              ...profile.simpleInfo.coreInfo,
              ...profile.simpleInfo.status,
              ...profile.simpleInfo.vasInfo,
              ...profile.commonExt,
              ...profile.simpleInfo.baseInfo,
              qqLevel: profile.commonExt.qqLevel,
              pendantId: ""
            };
            retData.push(RetUser);
            return true;
          }
          return false;
        },
        "BuddyProfileStore",
        uids,
        UserDetailSource.KSERVER,
        [
          ProfileBizType.KALL
        ]
      );

    return retData;
  }
  async fetchUserDetailInfo(uid: string) {
    type EventService = NodeIKernelProfileService['fetchUserDetailInfo'];
    type EventListener = NodeIKernelProfileListener['onUserDetailInfoChanged'];
    let [_retData, profile] = await this.context.event.CallNormalEvent
      <EventService, EventListener>
      (
        'NodeIKernelProfileService/fetchUserDetailInfo',
        'NodeIKernelProfileListener/onUserDetailInfoChanged',
        1,
        5000,
        (profile) => {
          if (profile.uid === uid) {
            return true;
          }
          return false;
        },
        "BuddyProfileStore",
        [
          uid
        ],
        UserDetailSource.KSERVER,
        [
          ProfileBizType.KALL
        ]
      );
    let RetUser: User = {
      ...profile.simpleInfo.coreInfo,
      ...profile.simpleInfo.status,
      ...profile.simpleInfo.vasInfo,
      ...profile.commonExt,
      ...profile.simpleInfo.baseInfo,
      qqLevel: profile.commonExt.qqLevel,
      pendantId: ""
    };
    return RetUser;
  }
  async getUserDetailInfo(uid: string) {
    if (requireMinNTQQBuild('26702')) {
      return this.fetchUserDetailInfo(uid);
    }
    return this.getUserDetailInfoOld(uid);
  }
  async getUserDetailInfoOld(uid: string) {
    type EventService = NodeIKernelProfileService['getUserDetailInfoWithBizInfo'];
    type EventListener = NodeIKernelProfileListener['onProfileDetailInfoChanged'];
    let [_retData, profile] = await this.context.event.CallNormalEvent
      <EventService, EventListener>
      (
        'NodeIKernelProfileService/getUserDetailInfoWithBizInfo',
        'NodeIKernelProfileListener/onProfileDetailInfoChanged',
        2,
        5000,
        (profile: User) => {
          if (profile.uid === uid) {
            return true;
          }
          return false;
        },
        uid,
        [0]
      );
    return profile;
  }
  async modifySelfProfile(param: ModifyProfileParams) {
    return this.context.core.session.getProfileService().modifyDesktopMiniProfile(param);
  }
  //需要异常处理
  @CacheClassFuncAsync(1800 * 1000)
  async getCookies(domain: string) {
    const ClientKeyData = await this.context.core.getApiUser().forceFetchClientKey();
    const requestUrl = 'https://ssl.ptlogin2.qq.com/jump?ptlang=1033&clientuin=' + selfInfo.uin + '&clientkey=' + ClientKeyData.clientKey + '&u1=https%3A%2F%2F' + domain + '%2F' + selfInfo.uin + '%2Finfocenter&keyindex=19%27'
    let cookies: { [key: string]: string; } = await RequestUtil.HttpsGetCookies(requestUrl);
    return cookies;
  }
  @CacheClassFuncAsync(1800 * 1000)
  async getPSkey(domainList: string[]) {
    return await this.context.core.session.getTipOffService().getPskey(domainList, true);
  }
  async getRobotUinRange(): Promise<Array<any>> {
    const robotUinRanges = await this.context.core.session.getRobotService().getRobotUinRange({
      justFetchMsgConfig: '1',
      type: 1,
      version: 0,
      aioKeywordVersion: 0
    });
    // console.log(robotUinRanges?.response?.robotUinRanges);
    return robotUinRanges?.response?.robotUinRanges;
  }
  //需要异常处理
  @CacheClassFuncAsync(1800 * 1000)
  async getQzoneCookies() {
    const ClientKeyData = await this.context.core.getApiUser().forceFetchClientKey();
    const requestUrl = 'https://ssl.ptlogin2.qq.com/jump?ptlang=1033&clientuin=' + selfInfo.uin + '&clientkey=' + ClientKeyData.clientKey + '&u1=https%3A%2F%2Fuser.qzone.qq.com%2F' + selfInfo.uin + '%2Finfocenter&keyindex=19%27'
    let cookies: { [key: string]: string; } = await RequestUtil.HttpsGetCookies(requestUrl);
    return cookies;
  }
  //需要异常处理
  @CacheClassFuncAsync(1800 * 1000)
  async getSkey(): Promise<string | undefined> {
    const ClientKeyData = await this.context.core.getApiUser().forceFetchClientKey();
    if (ClientKeyData.result !== 0) {
      throw new Error('getClientKey Error');
    }
    const clientKey = ClientKeyData.clientKey;
    const keyIndex = ClientKeyData.keyIndex;
    const requestUrl = 'https://ssl.ptlogin2.qq.com/jump?ptlang=1033&clientuin=' + selfInfo.uin + '&clientkey=' + clientKey + '&u1=https%3A%2F%2Fh5.qzone.qq.com%2Fqqnt%2Fqzoneinpcqq%2Ffriend%3Frefresh%3D0%26clientuin%3D0%26darkMode%3D0&keyindex=19%27';
    let cookies: { [key: string]: string; } = await RequestUtil.HttpsGetCookies(requestUrl);
    const skey = cookies['skey'];
    if (!skey) {
      throw new Error('getSkey Skey is Empty');
    }
    return skey;
  }
  @CacheClassFuncAsyncExtend(3600 * 1000, 'Uin2Uid', (Uin: string, Uid: string | undefined) => {
    if (Uid && Uid.indexOf('u_') != -1) {
      return true
    }
    logWarn("uin转换到uid时异常", Uin, Uid);
    return false;
  })
  async getUidByUin(Uin: string) {
    //此代码仅临时使用，后期会被废弃
    if (requireMinNTQQBuild('26702')) {
      return await this.context.core.getApiUser().getUidByUinV2(Uin);
    }
    return await this.context.core.getApiUser().getUidByUinV1(Uin);
  }
  @CacheClassFuncAsyncExtend(3600 * 1000, 'Uid2Uin', (Uid: string | undefined, Uin: number | undefined) => {
    if (Uin && Uin != 0 && !isNaN(Uin)) {
      return true
    }
    logWarn("uid转换到uin时异常", Uid, Uin);
    return false;
  })
  async getUinByUid(Uid: string) {
    //此代码仅临时使用，后期会被废弃
    if (requireMinNTQQBuild('26702')) {
      return await this.context.core.getApiUser().getUinByUidV2(Uid);
    }
    return await this.context.core.getApiUser().getUinByUidV1(Uid);
  }

  //后期改成流水线处理
  async getUidByUinV2(Uin: string) {
    let uid = (await this.context.core.session.getProfileService().getUidByUin('FriendsServiceImpl', [Uin])).get(Uin);
    if (uid) return uid;
    uid = (await this.context.core.session.getGroupService().getUidByUins([Uin])).uids.get(Uin);
    if (uid) return uid;
    uid = (await this.context.core.session.getUixConvertService().getUid([Uin])).uidInfo.get(Uin);
    if (uid) return uid;
    console.log((await this.context.core.getApiFriend().getBuddyIdMapCache(true)));
    uid = (await this.context.core.getApiFriend().getBuddyIdMapCache(true)).getValue(Uin);//从Buddy缓存获取Uid
    if (uid) return uid;
    uid = (await this.context.core.getApiFriend().getBuddyIdMap(true)).getValue(Uin);
    if (uid) return uid;
    let unveifyUid = (await this.context.core.getApiUser().getUserDetailInfoByUinV2(Uin)).detail.uid;//从QQ Native 特殊转换
    if (unveifyUid.indexOf("*") == -1) uid = unveifyUid;
    //if (uid) return uid;
    return uid;
  }
  //后期改成流水线处理
  async getUinByUidV2(Uid: string) {
    let uin = (await this.context.core.session.getProfileService().getUinByUid('FriendsServiceImpl', [Uid])).get(Uid);
    if (uin) return uin;
    uin = (await this.context.core.session.getGroupService().getUinByUids([Uid])).uins.get(Uid);
    if (uin) return uin;
    uin = (await this.context.core.session.getUixConvertService().getUin([Uid])).uinInfo.get(Uid);
    if (uin) return uin;
    uin = (await this.context.core.getApiFriend().getBuddyIdMapCache(true)).getKey(Uid);//从Buddy缓存获取Uin
    if (uin) return uin;
    uin = (await this.context.core.getApiFriend().getBuddyIdMap(true)).getKey(Uid);
    if (uin) return uin;
    uin = (await this.context.core.getApiUser().getUserDetailInfo(Uid)).uin; //从QQ Native 转换
    return uin;
  }

  async getUidByUinV1(Uin: string) {
    // 通用转换开始尝试
    let uid = (await this.context.core.session.getUixConvertService().getUid([Uin])).uidInfo.get(Uin);
    // Uid 好友转
    if (!uid) {
      Array.from(friends.values()).forEach((t) => {
        if (t.uin == Uin) {
          uid = t.uid;
        }
      });
    }
    //Uid 群友列表转
    if (!uid) {
      for (let groupMembersList of groupMembers.values()) {
        for (let GroupMember of groupMembersList.values()) {
          if (GroupMember.uin == Uin) {
            uid = GroupMember.uid;
          }
        }
      }
    }
    if (!uid) {
      let unveifyUid = (await this.context.core.getApiUser().getUserDetailInfoByUin(Uin)).info.uid;//从QQ Native 特殊转换 方法三
      if (unveifyUid.indexOf("*") == -1) {
        uid = unveifyUid;
      }
    }
    return uid;
  }
  async getUinByUidV1(Uid: string) {
    let ret = await this.context.event.CallNoListenerEvent
      <(Uin: string[]) => Promise<{ uinInfo: Map<string, string> }>>(
        'NodeIKernelUixConvertService/getUin',
        5000,
        [Uid]
      );
    let uin = ret.uinInfo.get(Uid);
    if (!uin) {
      //从Buddy缓存获取Uin
      Array.from(friends.values()).forEach((t) => {
        if (t.uid == Uid) {
          uin = t.uin;
        }
      })
    }
    if (!uin) {
      uin = (await this.context.core.getApiUser().getUserDetailInfo(Uid)).uin; //从QQ Native 转换
    }

    // if (!uin) {
    //   uin = (await NTQQFriendApi.getFriends(false)).find((t) => { t.uid == Uid })?.uin;  //从QQ Native 缓存转换
    // }
    // if (!uin) {
    //   uin = (await NTQQFriendApi.getFriends(true)).find((t) => { t.uid == Uid })?.uin;  //从QQ Native 非缓存转换
    // }
    return uin;
  }
  async getRecentContactListSnapShot(count: number) {
    return await this.context.core.session.getRecentContactService().getRecentContactListSnapShot(count);
  }
  async getRecentContactListSyncLimit(count: number) {
    return await this.context.core.session.getRecentContactService().getRecentContactListSyncLimit(count);
  }
  async getRecentContactListSync() {
    return await this.context.core.session.getRecentContactService().getRecentContactListSync();
  }
  async getRecentContactList() {
    return await this.context.core.session.getRecentContactService().getRecentContactList();
  }
  async getUserDetailInfoByUinV2(Uin: string) {
    return await this.context.event.CallNoListenerEvent
      <(Uin: string) => Promise<UserDetailInfoByUinV2>>(
        'NodeIKernelProfileService/getUserDetailInfoByUin',
        5000,
        Uin
      );
  }
  async getUserDetailInfoByUin(Uin: string) {
    return this.context.event.CallNoListenerEvent
      <(Uin: string) => Promise<UserDetailInfoByUin>>(
        'NodeIKernelProfileService/getUserDetailInfoByUin',
        5000,
        Uin
      );
  }
  @CacheClassFuncAsync(3600 * 1000, 'ClientKey')
  async forceFetchClientKey() {
    return await this.context.core.session.getTicketService().forceFetchClientKey('');
  }
}
