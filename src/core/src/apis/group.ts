import { GroupMember, GroupRequestOperateTypes, GroupMemberRole, GroupNotify, Group, MemberExtSourceType, GroupNotifyTypes, ChatType, Peer } from '../entities';
import { GeneralCallResult, NTQQUserApi, napCatCore } from '@/core';
import { NTEventDispatch } from '@/common/utils/EventTask';
import { log } from '@/common/utils/log';
import { groupMembers } from '../data';
import { CacheClassFuncAsyncExtend, runAllWithTimeout } from '@/common/utils/helper';
export class NTQQGroupApi {
  static async setGroupAvatar(gc: string, filePath: string) {
    return napCatCore.session.getGroupService().setHeader(gc, filePath);
  }
  static async getGroups(forced = false) {
    let [_retData, _updateType, groupList] = await NTEventDispatch.CallNormalEvent
      <(force: boolean) => Promise<any>, (updateType: number, groupList: Group[]) => void>
      (
        'NodeIKernelGroupService/getGroupList',
        'NodeIKernelGroupListener/onGroupListUpdate',
        1,
        5000,
        () => true,
        forced
      );
    return groupList;
  }

  @CacheClassFuncAsyncExtend(600, "LastestSendTime", () => true)
  static async getGroupMemberLastestSendTimeCache(GroupCode: string) {
    return NTQQGroupApi.getGroupMemberLastestSendTime(GroupCode);
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
  static async getGroupMemberLastestSendTime(GroupCode: string) {
    async function getdata(uid: string) {
      let NTRet = await NTQQGroupApi.getLastestMsgByUids(GroupCode, [uid]);
      if (NTRet.result != 0 && NTRet.msgList.length < 1) {
        return undefined;
      }
      return { sendUin: NTRet.msgList[0].senderUin, sendTime: NTRet.msgList[0].msgTime }
    }
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
      PromiseData.push(getdata(member.uid).catch(() => undefined));
    }
    let allRet = await runAllWithTimeout(PromiseData, 2500);
    for (let PromiseDo of allRet) {
      if (PromiseDo) {
        ret.set(PromiseDo.sendUin, PromiseDo.sendTime);
      }
    }
    return ret;
  }
  static async getLastestMsgByUids(GroupCode: string, uids: string[]) {
    let ret = await napCatCore.session.getMsgService().queryMsgsWithFilterEx('0', '0', '0', {
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
  static async getLastestMsg(GroupCode: string, uins: string[]) {
    let uids: Array<string> = [];
    for (let uin of uins) {
      let uid = await NTQQUserApi.getUidByUin(uin)
      if (uid) {
        uids.push(uid);
      }
    }
    let ret = await napCatCore.session.getMsgService().queryMsgsWithFilterEx('0', '0', '0', {
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
  static async getGroupRecommendContactArkJson(GroupCode: string) {
    return napCatCore.session.getGroupService().getGroupRecommendContactArkJson(GroupCode);
  }
  static async CreatGroupFileFolder(groupCode: string, folderName: string) {
    return napCatCore.session.getRichMediaService().createGroupFolder(groupCode, folderName);
  }
  static async DelGroupFile(groupCode: string, files: string[]) {
    return napCatCore.session.getRichMediaService().deleteGroupFile(groupCode, [102], files);
  }
  static async DelGroupFileFolder(groupCode: string, folderId: string) {
    return napCatCore.session.getRichMediaService().deleteGroupFolder(groupCode, folderId);
  }
  static async addGroupEssence(GroupCode: string, msgId: string) {
    // 代码没测过
    // 需要 ob11msgid->msgId + (peer) -> msgSeq + msgRandom
    let MsgData = await napCatCore.session.getMsgService().getMsgsIncludeSelf({ chatType: 2, guildId: '', peerUid: GroupCode }, msgId, 1, false);
    let param = {
      groupCode: GroupCode,
      msgRandom: parseInt(MsgData.msgList[0].msgRandom),
      msgSeq: parseInt(MsgData.msgList[0].msgSeq)
    };
    // GetMsgByShoretID(ShoretID); -> MsgService.getMsgs(Peer,MsgId,1,false); -> 组出参数
    return napCatCore.session.getGroupService().addGroupEssence(param);
  }
  static async removeGroupEssence(GroupCode: string, msgId: string) {
    // 代码没测过
    // 需要 ob11msgid->msgId + (peer) -> msgSeq + msgRandom
    let MsgData = await napCatCore.session.getMsgService().getMsgsIncludeSelf({ chatType: 2, guildId: '', peerUid: GroupCode }, msgId, 1, false);
    let param = {
      groupCode: GroupCode,
      msgRandom: parseInt(MsgData.msgList[0].msgRandom),
      msgSeq: parseInt(MsgData.msgList[0].msgSeq)
    };
    // GetMsgByShoretID(ShoretID); -> MsgService.getMsgs(Peer,MsgId,1,false); -> 组出参数
    return napCatCore.session.getGroupService().removeGroupEssence(param);
  }
  static async getSingleScreenNotifies(num: number) {
    let [_retData, _doubt, _seq, notifies] = await NTEventDispatch.CallNormalEvent
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
  static async getGroupMembers(groupQQ: string, num = 3000): Promise<Map<string, GroupMember>> {
    const groupService = napCatCore.session.getGroupService();
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

  static async getGroupNotifies() {
    // 获取管理员变更
    // 加群通知，退出通知，需要管理员权限

  }
  static async GetGroupFileCount(Gids: Array<string>) {
    return napCatCore.session.getRichMediaService().batchGetGroupFileCount(Gids);
  }
  static async getGroupIgnoreNotifies() {
  }
  static async getArkJsonGroupShare(GroupCode: string) {
    let ret = await NTEventDispatch.CallNoListenerEvent
      <(GroupId: string) => Promise<GeneralCallResult & { arkJson: string }>>(
        'NodeIKernelGroupService/getGroupRecommendContactArkJson',
        5000,
        GroupCode
      );
    return ret.arkJson;
  }
  //需要异常处理
  static async uploadGroupBulletinPic(GroupCode: string, imageurl: string) {
    const _Pskey = (await NTQQUserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com')!;
    return napCatCore.session.getGroupService().uploadGroupBulletinPic(GroupCode, _Pskey, imageurl);
  }
  static async handleGroupRequest(flag: string, operateType: GroupRequestOperateTypes, reason?: string) {
    let flagitem = flag.split('|');
    let groupCode = flagitem[0];
    let seq = flagitem[1];
    let type = parseInt(flagitem[2]);

    return napCatCore.session.getGroupService().operateSysNotify(
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

  static async quitGroup(groupQQ: string) {
    return napCatCore.session.getGroupService().quitGroup(groupQQ);
  }

  static async kickMember(groupQQ: string, kickUids: string[], refuseForever: boolean = false, kickReason: string = '') {
    return napCatCore.session.getGroupService().kickMember(groupQQ, kickUids, refuseForever, kickReason);
  }

  static async banMember(groupQQ: string, memList: Array<{ uid: string, timeStamp: number }>) {
    // timeStamp为秒数, 0为解除禁言
    return napCatCore.session.getGroupService().setMemberShutUp(groupQQ, memList);
  }

  static async banGroup(groupQQ: string, shutUp: boolean) {
    return napCatCore.session.getGroupService().setGroupShutUp(groupQQ, shutUp);
  }

  static async setMemberCard(groupQQ: string, memberUid: string, cardName: string) {
    return napCatCore.session.getGroupService().modifyMemberCardName(groupQQ, memberUid, cardName);
  }

  static async setMemberRole(groupQQ: string, memberUid: string, role: GroupMemberRole) {
    return napCatCore.session.getGroupService().modifyMemberRole(groupQQ, memberUid, role);
  }

  static async setGroupName(groupQQ: string, groupName: string) {
    return napCatCore.session.getGroupService().modifyGroupName(groupQQ, groupName, false);
  }

  // 头衔不可用
  static async setGroupTitle(groupQQ: string, uid: string, title: string) {

  }

  static async publishGroupBulletin(groupQQ: string, content: string, picInfo: { id: string, width: number, height: number } | undefined = undefined, pinned: number = 0, confirmRequired: number = 0,) {
    const _Pskey = (await NTQQUserApi.getPSkey(['qun.qq.com'])).domainPskeyMap.get('qun.qq.com');
    //text是content内容url编码
    let data = {
      text: encodeURI(content),
      picInfo: picInfo,
      oldFeedsId: '',
      pinned: pinned,
      confirmRequired: confirmRequired
    };
    return napCatCore.session.getGroupService().publishGroupBulletin(groupQQ, _Pskey!, data);
  }
  static async getGroupRemainAtTimes(GroupCode: string) {
    napCatCore.session.getGroupService().getGroupRemainAtTimes(GroupCode);
  }
  static async getMemberExtInfo(groupCode: string, uin: string) {
    // 仅NTQQ 9.9.11 24568测试 容易炸开谨慎使用
    return napCatCore.session.getGroupService().getMemberExtInfo(
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