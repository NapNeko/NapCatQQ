import { ModifyProfileParams, User, UserDetailSource } from '@/core/entities';
import { RequestUtil } from '@/common/request';
import { InstanceContext, NapCatCore, ProfileBizType } from '..';
import { solveAsyncProblem } from '@/common/helper';

export class NTQQUserApi {
    context: InstanceContext;
    core: NapCatCore;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
    }
    //self_tind格式
    async createUidFromTinyId(tinyId: string) {
        return this.context.session.getMsgService().createUidFromTinyId(this.core.selfInfo.uin, tinyId);
    }
    async getStatusByUid(uid: string) {
        return this.context.session.getProfileService().getStatus(uid);
    }
    async getProfileLike(uid: string) {
        return this.context.session.getProfileLikeService().getBuddyProfileLike({
            friendUids: [uid],
            basic: 1,
            vote: 1,
            favorite: 0,
            userProfile: 1,
            type: 2,
            start: 0,
            limit: 20,
        });
    }
    async fetchOtherProfileLike(uid: string) {
        return this.context.session.getProfileLikeService().getBuddyProfileLike({
            friendUids: [uid],
            basic: 1,
            vote: 1,
            favorite: 0,
            userProfile: 0,
            type: 1,
            start: 0,
            limit: 20,
        });
    }
    async setLongNick(longNick: string) {
        return this.context.session.getProfileService().setLongNick(longNick);
    }

    async setSelfOnlineStatus(status: number, extStatus: number, batteryStatus: number) {
        return this.context.session.getMsgService().setStatus({
            status: status,
            extStatus: extStatus,
            batteryStatus: batteryStatus,
        });
    }

    async getBuddyRecommendContactArkJson(uin: string, sencenID = '') {
        return this.context.session.getBuddyService().getBuddyRecommendContactArkJson(uin, sencenID);
    }

    async like(uid: string, count = 1): Promise<{ result: number, errMsg: string, succCounts: number }> {
        return this.context.session.getProfileLikeService().setBuddyProfileLike({
            friendUid: uid,
            sourceId: 71,
            doLikeCount: count,
            doLikeTollCount: 0,
        });
    }

    async setQQAvatar(filePath: string) {
        type setQQAvatarRet = { result: number, errMsg: string };
        const ret = await this.context.session.getProfileService().setHeader(filePath) as setQQAvatarRet;
        return { result: ret?.result, errMsg: ret?.errMsg };
    }

    async setGroupAvatar(gc: string, filePath: string) {
        return this.context.session.getGroupService().setHeader(gc, filePath);
    }

    async fetchUserDetailInfo(uid: string, mode: UserDetailSource = UserDetailSource.KDB) {
        const [_retData, profile] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelProfileService/fetchUserDetailInfo',
            'NodeIKernelProfileListener/onUserDetailInfoChanged',
            [
                'BuddyProfileStore',
                [uid],
                mode,
                [ProfileBizType.KALL],
            ],
            () => true,
            (profile) => profile.uid === uid,
        );
        const RetUser: User = {
            ...profile.simpleInfo.status,
            ...profile.simpleInfo.vasInfo,
            ...profile.commonExt,
            ...profile.simpleInfo.baseInfo,
            qqLevel: profile.commonExt?.qqLevel,
            age: profile.simpleInfo.baseInfo.age,
            pendantId: '',
            ...profile.simpleInfo.coreInfo
        };
        return RetUser;
    }

    async getUserDetailInfo(uid: string): Promise<User> {
        let retUser = await solveAsyncProblem(async (uid) => this.fetchUserDetailInfo(uid, UserDetailSource.KDB), uid);
        if (retUser && retUser.uin !== '0') {
            return retUser;
        }
        this.context.logger.logDebug('[NapCat] [Mark] getUserDetailInfo Mode1 Failed.');
        retUser = await this.fetchUserDetailInfo(uid, UserDetailSource.KSERVER);
        if (retUser && retUser.uin === '0') {
            retUser.uin = await this.core.apis.UserApi.getUidByUinV2(uid) ?? '0';
        }
        return retUser;
    }

    async modifySelfProfile(param: ModifyProfileParams) {
        return this.context.session.getProfileService().modifyDesktopMiniProfile(param);
    }

    async getCookies(domain: string) {
        const ClientKeyData = await this.forceFetchClientKey();
        const requestUrl = 'https://ssl.ptlogin2.qq.com/jump?ptlang=1033&clientuin=' + this.core.selfInfo.uin +
            '&clientkey=' + ClientKeyData.clientKey + '&u1=https%3A%2F%2F' + domain + '%2F' + this.core.selfInfo.uin + '%2Finfocenter&keyindex=19%27';
        let data = await RequestUtil.HttpsGetCookies(requestUrl);
        if (!data.p_skey || data.p_skey.length == 0) {
            try {
                let pskey = (await this.getPSkey([domain])).domainPskeyMap.get(domain);
                if (pskey) data.p_skey = pskey;
            } catch {
                return data;
            }
        }
        return data;
    }

    async getPSkey(domainList: string[]) {
        return await this.context.session.getTipOffService().getPskey(domainList, true);
    }

    async getRobotUinRange(): Promise<Array<any>> {
        const robotUinRanges = await this.context.session.getRobotService().getRobotUinRange({
            justFetchMsgConfig: '1',
            type: 1,
            version: 0,
            aioKeywordVersion: 0,
        });
        return robotUinRanges?.response?.robotUinRanges;
    }

    //需要异常处理

    async getQzoneCookies() {
        const ClientKeyData = await this.forceFetchClientKey();
        const requestUrl = 'https://ssl.ptlogin2.qq.com/jump?ptlang=1033&clientuin=' + this.core.selfInfo.uin + '&clientkey=' + ClientKeyData.clientKey + '&u1=https%3A%2F%2Fuser.qzone.qq.com%2F' + this.core.selfInfo.uin + '%2Finfocenter&keyindex=19%27';
        return await RequestUtil.HttpsGetCookies(requestUrl);
    }

    //需要异常处理

    async getSKey(): Promise<string | undefined> {
        const ClientKeyData = await this.forceFetchClientKey();
        if (ClientKeyData.result !== 0) {
            throw new Error('getClientKey Error');
        }
        const clientKey = ClientKeyData.clientKey;
        // const keyIndex = ClientKeyData.keyIndex;
        const requestUrl = 'https://ssl.ptlogin2.qq.com/jump?ptlang=1033&clientuin=' + this.core.selfInfo.uin + '&clientkey=' + clientKey + '&u1=https%3A%2F%2Fh5.qzone.qq.com%2Fqqnt%2Fqzoneinpcqq%2Ffriend%3Frefresh%3D0%26clientuin%3D0%26darkMode%3D0&keyindex=19%27';
        const cookies: { [key: string]: string; } = await RequestUtil.HttpsGetCookies(requestUrl);
        const skey = cookies['skey'];
        if (!skey) {
            throw new Error('SKey is Empty');
        }
        return skey;
    }

    //后期改成流水线处理
    async getUidByUinV2(Uin: string) {
        let uid = (await this.context.session.getGroupService().getUidByUins([Uin])).uids.get(Uin);
        if (uid) return uid;
        uid = (await this.context.session.getProfileService().getUidByUin('FriendsServiceImpl', [Uin])).get(Uin);
        if (uid) return uid;
        uid = (await this.context.session.getUixConvertService().getUid([Uin])).uidInfo.get(Uin);
        if (uid) return uid;
        const unverifiedUid = (await this.getUserDetailInfoByUin(Uin)).detail.uid;//从QQ Native 特殊转换
        if (unverifiedUid.indexOf('*') == -1) uid = unverifiedUid;
        //if (uid) return uid;
        return uid;
    }

    //后期改成流水线处理
    async getUinByUidV2(Uid: string) {
        let uin = (await this.context.session.getGroupService().getUinByUids([Uid])).uins.get(Uid);
        if (uin) return uin;
        uin = (await this.context.session.getProfileService().getUinByUid('FriendsServiceImpl', [Uid])).get(Uid);
        if (uin) return uin;
        uin = (await this.context.session.getUixConvertService().getUin([Uid])).uinInfo.get(Uid);
        if (uin) return uin;
        uin = (await this.core.apis.FriendApi.getBuddyIdMap(true)).getKey(Uid);
        if (uin) return uin;
        uin = (await this.getUserDetailInfo(Uid)).uin; //从QQ Native 转换
        return uin;
    }

    async getRecentContactListSnapShot(count: number) {
        return await this.context.session.getRecentContactService().getRecentContactListSnapShot(count);
    }

    async getRecentContactListSyncLimit(count: number) {
        return await this.context.session.getRecentContactService().getRecentContactListSyncLimit(count);
    }

    async getRecentContactListSync() {
        return await this.context.session.getRecentContactService().getRecentContactListSync();
    }

    async getRecentContactList() {
        return await this.context.session.getRecentContactService().getRecentContactList();
    }

    async getUserDetailInfoByUin(Uin: string) {
        return await this.core.eventWrapper.callNoListenerEvent(
            'NodeIKernelProfileService/getUserDetailInfoByUin',
            Uin
        );
    }

    async forceFetchClientKey() {
        return await this.context.session.getTicketService().forceFetchClientKey('');
    }
}
