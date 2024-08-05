import { GetFileListParam, Peer, RawMessage, SendMessageElement, SendMsgElementConstructor } from '@/core/entities';
import { friends, groups, selfInfo } from '@/core/data';
import { log, logWarn } from '@/common/utils/log';
import { sleep } from '@/common/utils/helper';
import { napCatCore, NTQQUserApi } from '@/core';
import { onGroupFileInfoUpdateParamType } from '@/core/listeners';
import { GeneralCallResult } from '@/core/services/common';
import { MessageUnique } from '../../../common/utils/MessageUnique';
import { NTEventDispatch } from '@/common/utils/EventTask';
import { requireMinNTQQBuild } from '@/common/utils/QQBasicInfo';

async function LoadMessageIdList(Peer: Peer, msgId: string) {
  let msgList = await NTQQMsgApi.getMsgHistory(Peer, msgId, 50);
  for (let j = 0; j < msgList.msgList.length; j++) {
    let shortId = MessageUnique.createMsg(Peer, msgList.msgList[j].msgId);
  }
}
async function loadMessageUnique() {
  if (groups.size > 100) {
    logWarn('[性能检测] 群数量大于100，可能会导致性能问题');
  }
  let predict = (groups.size + friends.size / 2) / 5;
  predict = predict < 20 ? 20 : predict;
  predict = predict > 50 ? 50 : predict;
  //let waitpromise: Array<Promise<{ msgList: RawMessage[]; }>> = [];
  predict = Math.floor(predict * 50);
  MessageUnique.resize(predict);
  let RecentContact = await NTQQUserApi.getRecentContactListSnapShot(predict);
  let LoadMessageIdDo: Array<Promise<void>> = new Array<Promise<void>>();
  if (RecentContact?.info?.changedList && RecentContact?.info?.changedList?.length > 0) {
    for (let i = 0; i < RecentContact.info.changedList.length; i++) {
      let Peer: Peer = { chatType: RecentContact.info.changedList[i].chatType, peerUid: RecentContact.info.changedList[i].peerUid, guildId: '' };
      LoadMessageIdDo.push(LoadMessageIdList(Peer, RecentContact.info.changedList[i].msgId));
    }
  }
  await Promise.all(LoadMessageIdDo).then(() => {
    log(`[消息序列] 加载 ${predict} 条历史消息记录完成`);
  });
}

setTimeout(() => {
  napCatCore.onLoginSuccess(async () => {
    await sleep(100);
    // NTQQMsgApi.CheckSendMode().then().catch();
    loadMessageUnique().then().catch();
    //let data  = await napCatCore.session.getMsgService().sendSsoCmdReqByContend("LightAppSvc.mini_app_growguard.ReportExecute","1124343");
    //console.log(data);
  });
}, 100);
//歇菜LocalMsg压根不写Db
// setTimeout(async () => {
//   let ele: MessageElement = { extBufForUI: '0x', ...SendMsgElementConstructor.text('测试消息') };
//   let MsgId = await NTQQMsgApi.getMsgUniqueEx();
//   let peer = { chatType: 2, peerUid: '', guildId: '' };
//   console.log(await napCatCore.session.getTestPerformanceService().insertMsg(
//     {
//       peer: peer,
//       msgTime: Math.floor(Date.now() / 1000).toString(),
//       msgId: MsgId,
//       msgSeq: '56564',
//       batchNums: 1,
//       timesPerBatch: 1,
//       numPerTime: 1
//     }, [ele]
//   ));
//   console.log(await NTQQMsgApi.multiForwardMsg(peer, peer, [MsgId]));
// }, 25000)

export class NTQQMsgApi {
  static async getMsgEmojiLikesList(peer: Peer, msgSeq: string, emojiId: string, emojiType: string, count: number = 20) {
    //console.log(peer, msgSeq, emojiId, emojiType, count);
    return napCatCore.session.getMsgService().getMsgEmojiLikesList(peer, msgSeq, emojiId, emojiType, "", false, 20)
  }
  // static napCatCore: NapCatCore | null = null;
  //   enum BaseEmojiType {
  //     NORMAL_EMOJI,
  //     SUPER_EMOJI,
  //     RANDOM_SUPER_EMOJI,
  //     CHAIN_SUPER_EMOJI,
  //     EMOJI_EMOJI
  // }
  static async setEmojiLike(peer: Peer, msgSeq: string, emojiId: string, set: boolean = true) {
    // nt_qq//global//nt_data//Emoji//emoji-resource//sysface_res/apng/ 下可以看到所有QQ表情预览
    // nt_qq\global\nt_data\Emoji\emoji-resource\face_config.json 里面有所有表情的id, 自带表情id是QSid, 标准emoji表情id是QCid
    // 其实以官方文档为准是最好的，https://bot.q.qq.com/wiki/develop/api-v2/openapi/emoji/model.html#EmojiType
    emojiId = emojiId.toString();
    return napCatCore.session.getMsgService().setMsgEmojiLikes(peer, msgSeq, emojiId, emojiId.length > 3 ? '2' : '1', set);
  }
  static async getMultiMsg(peer: Peer, rootMsgId: string, parentMsgId: string): Promise<GeneralCallResult & {
    msgList: RawMessage[]
  } | undefined> {
    return napCatCore.session.getMsgService().getMultiMsg(peer, rootMsgId, parentMsgId);
  }
  static async getLastestMsgByUids(peer: Peer, count: number = 20) {
    let ret = await napCatCore.session.getMsgService().queryMsgsWithFilterEx('0', '0', '0', {
      chatInfo: peer,
      filterMsgType: [],
      filterSendersUid: [],
      filterMsgToTime: '0',
      filterMsgFromTime: '0',
      isReverseOrder: false,
      isIncludeCurrent: true,
      pageLimit: 1,
    });
    return ret;
  }
  static async getMsgsByMsgId(peer: Peer, msgIds: string[]) {
    return await napCatCore.session.getMsgService().getMsgsByMsgId(peer, msgIds);
  }
  static async getSingleMsg(peer: Peer, seq: string) {
    return await napCatCore.session.getMsgService().getSingleMsg(peer, seq);
  }
  static async fetchFavEmojiList(num: number) {
    return napCatCore.session.getMsgService().fetchFavEmojiList("", num, true, true)
  }
  static async queryMsgsWithFilterExWithSeq(peer: Peer, msgSeq: string) {
    let ret = await napCatCore.session.getMsgService().queryMsgsWithFilterEx('0', '0', msgSeq, {
      chatInfo: peer,
      filterMsgType: [],
      filterSendersUid: [],
      filterMsgToTime: '0',
      filterMsgFromTime: '0',
      isReverseOrder: false,
      isIncludeCurrent: true,
      pageLimit: 1,
    });
    return ret;
  }
  static async getMsgsBySeqAndCount(peer: Peer, seq: string, count: number, desc: boolean, z: boolean) {
    return await napCatCore.session.getMsgService().getMsgsBySeqAndCount(peer, seq, count, desc, z);
  }
  static async setMsgRead(peer: Peer) {
    return napCatCore.session.getMsgService().setMsgRead(peer);
  }
  static async getGroupFileList(GroupCode: string, params: GetFileListParam) {
    let data = await NTEventDispatch.CallNormalEvent<
      (GroupCode: string, params: GetFileListParam) => Promise<unknown>,
      (groupFileListResult: onGroupFileInfoUpdateParamType) => void
    >(
      'NodeIKernelRichMediaService/getGroupFileList',
      'NodeIKernelMsgListener/onGroupFileInfoUpdate',
      1,
      5000,
      (groupFileListResult: onGroupFileInfoUpdateParamType) => {
        return true;
      },
      GroupCode,
      params
    );
    return data[1].item;
  }
  static async getMsgHistory(peer: Peer, msgId: string, count: number) {
    // 消息时间从旧到新
    return napCatCore.session.getMsgService().getMsgsIncludeSelf(peer, msgId, count, true);
  }
  static async recallMsg(peer: Peer, msgIds: string[]) {
    await napCatCore.session.getMsgService().recallMsg({
      chatType: peer.chatType,
      peerUid: peer.peerUid
    }, msgIds);
  }
  static async sendMsgV2(peer: Peer, msgElements: SendMessageElement[], waitComplete = true, timeout = 10000) {
    // function generateMsgId() {
    //   const timestamp = Math.floor(Date.now() / 1000);
    //   const random = Math.floor(Math.random() * Math.pow(2, 32));
    //   const buffer = Buffer.alloc(8);
    //   buffer.writeUInt32BE(timestamp, 0);
    //   buffer.writeUInt32BE(random, 4);
    //   const msgId = BigInt("0x" + buffer.toString('hex')).toString();
    //   return msgId;
    // }
    // 此处有采用Hack方法 利用数据返回正确得到对应消息
    // 与之前 Peer队列 MsgSeq队列 真正的MsgId并发不同
    // 谨慎采用 目前测试暂无问题  Developer.Mlikiowa
    let msgId = await NTQQMsgApi.getMsgUnique(peer.chatType, await NTQQMsgApi.getServerTime());
    let data = await NTEventDispatch.CallNormalEvent<
      (msgId: string, peer: Peer, msgElements: SendMessageElement[], map: Map<any, any>) => Promise<unknown>,
      (msgList: RawMessage[]) => void
    >(
      'NodeIKernelMsgService/sendMsg',
      'NodeIKernelMsgListener/onMsgInfoListUpdate',
      1,
      timeout,
      (msgRecords: RawMessage[]) => {
        for (let msgRecord of msgRecords) {
          if (msgRecord.msgId === msgId && msgRecord.sendStatus === 2) {
            return true;
          }
        }
        return false;
      },
      msgId,
      peer,
      msgElements,
      new Map()
    );
    let retMsg = data[1].find(msgRecord => {
      if (msgRecord.msgId === msgId) {
        return true;
      }
    });
    return retMsg;
  }
  static sendMsgEx(peer: Peer, msgElements: SendMessageElement[], waitComplete = true, timeout = 10000) {
    //return NTQQMsgApi.sendMsgV1(peer, msgElements, waitComplete, timeout);
  }
  static async sendMsg(peer: Peer, msgElements: SendMessageElement[], waitComplete = true, timeout = 10000) {
    //唉？ ！我有个想法
    let msgId = await NTQQMsgApi.getMsgUnique(peer.chatType, await NTQQMsgApi.getServerTime());
    peer.guildId = msgId;
    let data = await NTEventDispatch.CallNormalEvent<
      (msgId: string, peer: Peer, msgElements: SendMessageElement[], map: Map<any, any>) => Promise<unknown>,
      (msgList: RawMessage[]) => void
    >(
      'NodeIKernelMsgService/sendMsg',
      'NodeIKernelMsgListener/onMsgInfoListUpdate',
      1,
      timeout,
      (msgRecords: RawMessage[]) => {
        for (let msgRecord of msgRecords) {
          if (msgRecord.guildId === msgId && msgRecord.sendStatus === 2) {
            return true;
          }
        }
        return false;
      },
      "0",
      peer,
      msgElements,
      new Map()
    );
    let retMsg = data[1].find(msgRecord => {
      if (msgRecord.guildId === msgId) {
        return true;
      }
    });
    return retMsg;
  }
  static async getMsgUnique(chatType: number, time: string) {
    if (requireMinNTQQBuild('26702')) {
      return napCatCore.session.getMsgService().generateMsgUniqueId(chatType, time);
    }
    return napCatCore.session.getMsgService().getMsgUniqueId(time);
  }
  static async getServerTime() {
    return napCatCore.session.getMSFService().getServerTime();
  }
  static async getServerTimeV2() {
    return NTEventDispatch.CallNoListenerEvent<() => string>('NodeIKernelMsgService/getServerTime', 5000);
  }
  static async forwardMsg(srcPeer: Peer, destPeer: Peer, msgIds: string[]) {
    return napCatCore.session.getMsgService().forwardMsg(msgIds, srcPeer, [destPeer], new Map());
  }
  static async multiForwardMsg(srcPeer: Peer, destPeer: Peer, msgIds: string[]): Promise<RawMessage> {
    const msgInfos = msgIds.map(id => {
      return { msgId: id, senderShowName: selfInfo.nick };
    });
    let data = await NTEventDispatch.CallNormalEvent<
      (msgInfo: typeof msgInfos, srcPeer: Peer, destPeer: Peer, comment: Array<any>, attr: Map<any, any>,) => Promise<unknown>,
      (msgList: RawMessage[]) => void
    >(
      'NodeIKernelMsgService/multiForwardMsgWithComment',
      'NodeIKernelMsgListener/onMsgInfoListUpdate',
      1,
      5000,
      (msgRecords: RawMessage[]) => {
        for (let msgRecord of msgRecords) {
          if (msgRecord.peerUid == destPeer.peerUid && msgRecord.senderUid == selfInfo.uid) {
            return true;
          }
        }
        return false;
      },
      msgInfos,
      srcPeer,
      destPeer,
      [],
      new Map()
    );
    for (let msg of data[1]) {
      const arkElement = msg.elements.find(ele => ele.arkElement);
      if (!arkElement) {
        continue;
      }
      const forwardData: any = JSON.parse(arkElement.arkElement.bytesData);
      if (forwardData.app != 'com.tencent.multimsg') {
        continue;
      }
      if (msg.peerUid == destPeer.peerUid && msg.senderUid == selfInfo.uid) {
        return msg;
      }
    }
    throw new Error('转发消息超时');
  }
  static async markallMsgAsRead() {
    return napCatCore.session.getMsgService().setAllC2CAndGroupMsgRead();
  }
}
