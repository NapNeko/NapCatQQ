import type { ApiContext } from '../session';
import { GroupMember, GroupRequestOperateTypes, GroupMemberRole, GroupNotify, MemberExtSourceType } from '../entities';
import { ChatType, GeneralCallResult, NTQQUserApi, NodeIKernelGroupListener, NodeIKernelGroupService } from '@/core';
import { CacheClassFuncAsyncExtend, runAllWithTimeout } from '@/common/utils/helper';
import { groupMembers } from '../data';

export class NTQQGroupApi {
  private context: ApiContext;
  constructor(context: ApiContext) {
    this.context = context;
  }
  async setGroupAvatar(gc: string, filePath: string) {
    return this.context.core.session.getGroupService().setHeader(gc, filePath);
  }
  async getGroups(forced = false) {
    type ListenerType = NodeIKernelGroupListener['onGroupListUpdate'];
    let [_retData, _updateType, groupList] = await this.context.event.CallNormalEvent
      <(force: boolean) => Promise<any>, ListenerType>
      (
        'NodeIKernelGroupService/getGroupList',
        'NodeIKernelGroupListener/onGroupListUpdate',
        1,
        5000,
        (updateType) => true,
        forced
      );
    return groupList;
  }

  @CacheClassFuncAsyncExtend(3600 * 1000, "LastestSendTime", () => true)
  async getGroupMemberLastestSendTimeCache(GroupCode: string) {
    return this.getGroupMemberLastestSendTime(GroupCode);
  }
  /**
   * 通过QQ自带数据库获取群成员最后发言时间(仅返回有效数据 且消耗延迟大 需要进行缓存)
   * @param GroupCode 群号
   * @returns Map<string, string> key: uin value: sendTime
   * @example
   * let ret = await NTQQGroupApi.getGroupMemberLastestSendTime('123456');
   * for (let [uin, sendTime] of ret) {
   *  console.log(uin, sendTime);
   * }
  */
  async getdata(GroupCode: string, uid: string) {
    let NTRet = await this.getLastestMsgByUids(GroupCode, [uid]);
    if (NTRet.result != 0 && NTRet.msgList.length < 1) {
      return undefined;
    }
    return { sendUin: NTRet.msgList[0].senderUin, sendTime: NTRet.msgList[0].msgTime }
  }
  async getGroupMemberLastestSendTime(GroupCode: string) {

    let currentGroupMembers = groupMembers.get(GroupCode);
    let PromiseData: Promise<({
      sendUin: string;
      sendTime: string;
    } | undefined)>[] = [];
    let ret: Map<string, string> = new Map();
    if (!currentGroupMembers) {
      return ret;
    }
    for (let member of currentGroupMembers.values()) {
      PromiseData.push(this.getdata(GroupCode, member.uid).catch(() => undefined));
    }
    let allRet = await runAllWithTimeout(PromiseData, 2500);
    for (let PromiseDo of allRet) {
      if (PromiseDo) {
        ret.set(PromiseDo.sendUin, PromiseDo.sendTime);
      }
    }
    return ret;
  }
  async getLastestMsgByUids(GroupCode: string, uids: string[]) {
    let ret = await this.context.core.session.getMsgService().queryMsgsWithFilterEx('0', '0', '0', {
      chatInfo: {
        peerUid: GroupCode,
        chatType: ChatType.group,
      },
      filterMsgType: [],
      filterSendersUid: uids,
      filterMsgToTime: '0',
      filterMsgFromTime: '0',
      isReverseOrder: false,
      isIncludeCurrent: true,
      pageLimit: 1,
    });
    return ret;
  }
  async getGroupMemberAll(GroupCode: string, forced = false) {
    return this.context.core.session.getGroupService().getAllMemberList(GroupCode, forced);
  }
  async getLastestMsg(GroupCode: string, uins: string[]) {
    let uids: Array<string> = [];
    for (let uin of uins) {
      let uid = await NTQQUserApi.getUidByUin(uin)
      if (uid) {
        uids.push(uid);
      }
    }
    let ret = await this.context.core.session.getMsgService().queryMsgsWithFilterEx('0', '0', '0', {
      chatInfo: {
        peerUid: GroupCode,
        chatType: ChatType.group,
      },
      filterMsgType: [],
      filterSendersUid: uids,
      filterMsgToTime: '0',
      filterMsgFromTime: '0',
      isReverseOrder: false,
      isIncludeCurrent: true,
      pageLimit: 1,
    });
    return ret;
  }
  async getGroupRecommendContactArkJson(GroupCode: string) {
    return this.context.core.session.getGroupService().getGroupRecommendContactArkJson(GroupCode);
  }
  async CreatGroupFileFolder(groupCode: string, folderName: string) {
    return this.context.core.session.getRichMediaService().createGroupFolder(groupCode, folderName);
  }
  async DelGroupFile(groupCode: string, files: string[]) {
    return this.context.core.session.getRichMediaService().deleteGroupFile(groupCode, [102], files);
  }
  async DelGroupFileFolder(groupCode: string, folderId: string) {
    return this.context.core.session.getRichMediaService().deleteGroupFolder(groupCode, folderId);
  }
  async addGroupEssence(GroupCode: string, msgId: string) {
    // 代码没测过
    // 需要 ob11msgid->msgId + (peer) -> msgSeq + msgRandom
    let MsgData = await this.context.core.session.getMsgService().getMsgsIncludeSelf({ chatType: 2, guildId: '', peerUid: GroupCode }, msgId, 1, false);
    let param = {
      groupCode: GroupCode,
      msgRandom: parseInt(MsgData.msgList[0].msgRandom),
      msgSeq: parseInt(MsgData.msgList[0].msgSeq)
    };
    // GetMsgByShoretID(ShoretID); -> MsgService.getMsgs(Peer,MsgId,1,false); -> 组出参数
    return this.context.core.session.getGroupService().addGroupEssence(param);
  }
  async removeGroupEssence(GroupCode: string, msgId: string) {
    // 代码没测过
    // 需要 ob11msgid->msgId + (peer) -> msgSeq + msgRandom
    let MsgData = await this.context.core.session.getMsgService().getMsgsIncludeSelf({ chatType: 2, guildId: '', peerUid: GroupCode }, msgId, 1, false);
    let param = {
      groupCode: GroupCode,
      msgRandom: parseInt(MsgData.msgList[0].msgRandom),
      msgSeq: parseInt(MsgData.msgList[0].msgSeq)
    };
    // GetMsgByShoretID(ShoretID); -> MsgService.getMsgs(Peer,MsgId,1,false); -> 组出参数
    return this.context.core.session.getGroupService().removeGroupEssence(param);
  }
  async getSingleScreenNotifies(num: number) {
    let [_retData, _doubt, _seq, notifies] = await this.context.event.CallNormalEvent
      <(arg1: boolean, arg2: string, arg3: number) => Promise<any>, (doubt: boolean, seq: string, notifies: GroupNotify[]) => void>
      (
        'NodeIKernelGroupService/getSingleScreenNotifies',
        'NodeIKernelGroupListener/onGroupSingleScreenNotifies',
        1,
        5000,
        () => true,
        false,
        '',
        num
      );
    return notifies;
  }
  async getGroupMemberV2(GroupCode: string, uid: string, forced = false) {
    type ListenerType = NodeIKernelGroupListener['onMemberInfoChange'];
    type EventType = NodeIKernelGroupService['getMemberInfo'];
    // NTEventDispatch.CreatListenerFunction('NodeIKernelGroupListener/onGroupMemberInfoUpdate', 
    //return napCatCore.session.getGroupService().getMemberInfo(GroupCode, [uid], forced);
    const [ret, _groupCode, _changeType, _members] = await this.context.event.CallNormalEvent
      <EventType, ListenerType>
      (
        'NodeIKernelGroupService/getMemberInfo',
        'NodeIKernelGroupListener/onMemberInfoChange',
        1,
        5000,
        (groupCode: string, changeType: number, members: Map<string, GroupMember>) => {
          return groupCode == GroupCode && members.has(uid);
        },
        GroupCode, [uid], forced
      );
    return _members.get(uid);
  }
  async getGroupMembers(groupQQ: string, num = 3000): Promise<Map<string, GroupMember>> {
    const groupService = this.context.core.session.getGroupService();
    const sceneId = groupService.createMemberListScene(groupQQ, 'groupMemberList_MainWindow');
    const result = await groupService.getNextMemberList(sceneId!, undefined, num);
    if (result.errCode !== 0) {
      throw ('获取群成员列表出错,' + result.errMsg);
    }

    //logDebug(`获取群(${groupQQ})成员列表结果:`, `finish: ${result.result.finish}`); //, Array.from(result.result.infos.values()));
    return result.result.infos;
    /*
    console.log(sceneId);
    const result = await napCatCore.getGroupService().getNextMemberList(sceneId, num);
    console.log(result);

    return result;
    */
  }

  async getGroupNotifies() {
    // 获取管理员变更
    // 加群通知，退出通知，需要管理员权限

  }
  async GetGroupFileCount(Gids: Array<string>) {
    return this.context.core.session.getRichMediaService().batchGetGroupFileCount(Gids);
  }
  async getGroupIgnoreNotifies() {
  }
  async getArkJsonGroupShare(GroupCode: string) {
    let ret = await this.context.event.CallNoListenerEvent
      <(GroupId: string) => Promise<GeneralCallResult & { arkJson: string }>>(
        'NodeIKernelGroupService/getGroupRecommendContactArkJson',
        5000,
        GroupCode
      );
    return ret.arkJson;
  }
  //需要异常处理
  async uploadGroupBulletinPic(GroupCode: string, imageurl: string) {
    const _Pskey = (await NTQQUserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com')!;
    return this.context.core.session.getGroupService().uploadGroupBulletinPic(GroupCode, _Pskey, imageurl);
  }
  async handleGroupRequest(flag: string, operateType: GroupRequestOperateTypes, reason?: string) {
    let flagitem = flag.split('|');
    let groupCode = flagitem[0];
    let seq = flagitem[1];
    let type = parseInt(flagitem[2]);

    return this.context.core.session.getGroupService().operateSysNotify(
      false,
      {
        'operateType': operateType, // 2 拒绝
        'targetMsg': {
          'seq': seq,  // 通知序列号
          'type': type,
          'groupCode': groupCode,
          'postscript': reason || ' ' // 仅传空值可能导致处理失败，故默认给个空格
        }
      });
  }

  async quitGroup(groupQQ: string) {
    return this.context.core.session.getGroupService().quitGroup(groupQQ);
  }

  async kickMember(groupQQ: string, kickUids: string[], refuseForever: boolean = false, kickReason: string = '') {
    return this.context.core.session.getGroupService().kickMember(groupQQ, kickUids, refuseForever, kickReason);
  }

  async banMember(groupQQ: string, memList: Array<{ uid: string, timeStamp: number }>) {
    // timeStamp为秒数, 0为解除禁言
    return this.context.core.session.getGroupService().setMemberShutUp(groupQQ, memList);
  }

  async banGroup(groupQQ: string, shutUp: boolean) {
    return this.context.core.session.getGroupService().setGroupShutUp(groupQQ, shutUp);
  }

  async setMemberCard(groupQQ: string, memberUid: string, cardName: string) {
    return this.context.core.session.getGroupService().modifyMemberCardName(groupQQ, memberUid, cardName);
  }

  async setMemberRole(groupQQ: string, memberUid: string, role: GroupMemberRole) {
    return this.context.core.session.getGroupService().modifyMemberRole(groupQQ, memberUid, role);
  }

  async setGroupName(groupQQ: string, groupName: string) {
    return this.context.core.session.getGroupService().modifyGroupName(groupQQ, groupName, false);
  }

  // 头衔不可用
  async setGroupTitle(groupQQ: string, uid: string, title: string) {

  }

  async publishGroupBulletin(groupQQ: string, content: string, picInfo: { id: string, width: number, height: number } | undefined = undefined, pinned: number = 0, confirmRequired: number = 0,) {
    const _Pskey = (await NTQQUserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com');
    //text是content内容url编码
    let data = {
      text: encodeURI(content),
      picInfo: picInfo,
      oldFeedsId: '',
      pinned: pinned,
      confirmRequired: confirmRequired
    };
    return this.context.core.session.getGroupService().publishGroupBulletin(groupQQ, _Pskey!, data);
  }
  async getGroupRemainAtTimes(GroupCode: string) {
    this.context.core.session.getGroupService().getGroupRemainAtTimes(GroupCode);
  }
  async getMemberExtInfo(groupCode: string, uin: string) {
    // 仅NTQQ 9.9.11 24568测试 容易炸开谨慎使用
    return this.context.core.session.getGroupService().getMemberExtInfo(
      {
        groupCode: groupCode,
        sourceType: MemberExtSourceType.TITLETYPE,
        beginUin: '0',
        dataTime: '0',
        uinList: [uin],
        uinNum: '',
        seq: '',
        groupType: '',
        richCardNameVer: '',
        memberExtFilter: {
          memberLevelInfoUin: 1,
          memberLevelInfoPoint: 1,
          memberLevelInfoActiveDay: 1,
          memberLevelInfoLevel: 1,
          memberLevelInfoName: 1,
          levelName: 1,
          dataTime: 1,
          userShowFlag: 1,
          sysShowFlag: 1,
          timeToUpdate: 1,
          nickName: 1,
          specialTitle: 1,
          levelNameNew: 1,
          userShowFlagNew: 1,
          msgNeedField: 1,
          cmdUinFlagExt3Grocery: 1,
          memberIcon: 1,
          memberInfoSeq: 1
        }
      }
    );
  }
}