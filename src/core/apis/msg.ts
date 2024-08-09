import { GetFileListParam, Peer, RawMessage, SendMessageElement } from '@/core/entities';
import { InstanceContext, NapCatCore, NTApiContext } from '@/core';
import { onGroupFileInfoUpdateParamType } from '@/core/listeners';
import { GeneralCallResult } from '@/core/services/common';

export class NTQQMsgApi {
  context: InstanceContext;
  core: NapCatCore;
  constructor(context: InstanceContext, core: NapCatCore) {
    this.context = context;
    this.core = core;
  }
  async FetchLongMsg(peer: Peer, msgId: string) {
    return this.context.session.getMsgService().fetchLongMsg(peer, msgId);
  }
  async getMsgEmojiLikesList(peer: Peer, msgSeq: string, emojiId: string, emojiType: string, count: number = 20) {
    //console.log(peer, msgSeq, emojiId, emojiType, count);
    //注意此处emojiType 可选值一般为1-2 2好像是unicode表情dec值 大部分情况 Taged M likiowa
    return this.context.session.getMsgService().getMsgEmojiLikesList(peer, msgSeq, emojiId, emojiType, "", false, 20)
  }
  //  napCatCore: NapCatCore | null = null;
  //   enum BaseEmojiType {
  //     NORMAL_EMOJI,
  //     SUPER_EMOJI,
  //     RANDOM_SUPER_EMOJI,
  //     CHAIN_SUPER_EMOJI,
  //     EMOJI_EMOJI
  // }
  async setEmojiLike(peer: Peer, msgSeq: string, emojiId: string, set: boolean = true) {
    // nt_qq//global//nt_data//Emoji//emoji-resource//sysface_res/apng/ 下可以看到所有QQ表情预览
    // nt_qq\global\nt_data\Emoji\emoji-resource\face_config.json 里面有所有表情的id, 自带表情id是QSid, 标准emoji表情id是QCid
    // 其实以官方文档为准是最好的，https://bot.q.qq.com/wiki/develop/api-v2/openapi/emoji/model.html#EmojiType
    emojiId = emojiId.toString();
    return this.context.session.getMsgService().setMsgEmojiLikes(peer, msgSeq, emojiId, emojiId.length > 3 ? '2' : '1', set);
  }
  async getMultiMsg(peer: Peer, rootMsgId: string, parentMsgId: string): Promise<GeneralCallResult & {
    msgList: RawMessage[]
  } | undefined> {
    return this.context.session.getMsgService().getMultiMsg(peer, rootMsgId, parentMsgId);
  }
  async ForwardMsg(peer: Peer, msgIds: string[]) {
    return this.context.session.getMsgService().forwardMsg(msgIds, peer, [peer], new Map());
  }
  async getLastestMsgByUids(peer: Peer, count: number = 20, isReverseOrder: boolean = false) {
    let ret = await this.context.session.getMsgService().queryMsgsWithFilterEx('0', '0', '0', {
      chatInfo: peer,
      filterMsgType: [],
      filterSendersUid: [],
      filterMsgToTime: '0',
      filterMsgFromTime: '0',
      isReverseOrder: isReverseOrder,//此参数有点离谱 注意不是本次查询的排序 而是全部消历史信息的排序 默认false 从新消息拉取到旧消息
      isIncludeCurrent: true,
      pageLimit: count,
    });
    return ret;
  }
  async getMsgsByMsgId(peer: Peer | undefined, msgIds: string[] | undefined) {
    if (!peer) throw new Error('peer is not allowed');
    if (!msgIds) throw new Error('msgIds is not allowed');
    //Mlikiowa： 参数不合规会导致NC异常崩溃 原因是TX未对进入参数判断 对应Android标记@NotNull AndroidJADX分析可得
    return await this.context.session.getMsgService().getMsgsByMsgId(peer, msgIds);
  }
  async getSingleMsg(peer: Peer, seq: string) {
    return await this.context.session.getMsgService().getSingleMsg(peer, seq);
  }
  async fetchFavEmojiList(num: number) {
    return this.context.session.getMsgService().fetchFavEmojiList("", num, true, true)
  }
  async queryMsgsWithFilterExWithSeq(peer: Peer, msgSeq: string) {
    let ret = await this.context.session.getMsgService().queryMsgsWithFilterEx('0', '0', msgSeq, {
      chatInfo: peer,//此处为Peer 为关键查询参数 没有啥也没有 by mlik iowa
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
  async getMsgsBySeqAndCount(peer: Peer, seq: string, count: number, desc: boolean, z: boolean) {
    return await this.context.session.getMsgService().getMsgsBySeqAndCount(peer, seq, count, desc, z);
  }
  async setMsgRead(peer: Peer) {
    return this.context.session.getMsgService().setMsgRead(peer);
  }
  async getGroupFileList(GroupCode: string, params: GetFileListParam) {
    let data = await this.core.eventWrapper.CallNormalEvent<
      (GroupCode: string, params: GetFileListParam) => Promise<unknown>,
      (groupFileListResult: onGroupFileInfoUpdateParamType) => void
    >(
      'NodeIKernelRichMediaService/getGroupFileList',
      'NodeIKernelMsgListener/onGroupFileInfoUpdate',
      1,
      5000,
      (groupFileListResult: onGroupFileInfoUpdateParamType) => {
        //Developer Mlikiowa Todo: 此处有问题 无法判断是否成功
        return true;
      },
      GroupCode,
      params
    );
    return data[1].item;
  }
  async getMsgHistory(peer: Peer, msgId: string, count: number, isReverseOrder: boolean = false) {
    // 消息时间从旧到新
    return this.context.session.getMsgService().getMsgsIncludeSelf(peer, msgId, count, isReverseOrder);
  }
  async recallMsg(peer: Peer, msgIds: string[]) {
    await this.context.session.getMsgService().recallMsg({
      chatType: peer.chatType,
      peerUid: peer.peerUid
    }, msgIds);
  }
  async sendMsgV2(peer: Peer, msgElements: SendMessageElement[], waitComplete = true, timeout = 10000) {
    function generateMsgId() {
      const timestamp = Math.floor(Date.now() / 1000);
      const random = Math.floor(Math.random() * Math.pow(2, 32));
      const buffer = Buffer.alloc(8);
      buffer.writeUInt32BE(timestamp, 0);
      buffer.writeUInt32BE(random, 4);
      const msgId = BigInt("0x" + buffer.toString('hex')).toString();
      return msgId;
    }
    // 此处有采用Hack方法 利用数据返回正确得到对应消息
    // 与之前 Peer队列 MsgSeq队列 真正的MsgId并发不同
    // 谨慎采用 目前测试暂无问题  Developer.Mlikiowa
    let msgId: string;
    try {
      msgId = await this.getMsgUnique(peer.chatType, await this.getServerTime());
    } catch (error) {
      //if (!napCatCore.session.getMsgService()['generateMsgUniqueId'])
      //兜底识别策略V2
      msgId = generateMsgId().toString();
    }
    let data = await this.core.eventWrapper.CallNormalEvent<
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
  sendMsgEx(peer: Peer, msgElements: SendMessageElement[], waitComplete = true, timeout = 10000) {
    //return NTQQMsgApi.sendMsgV1(peer, msgElements, waitComplete, timeout);
  }
  async sendMsg(peer: Peer, msgElements: SendMessageElement[], waitComplete = true, timeout = 10000) {
    //唉？ ！我有个想法
    let msgId = await this.getMsgUnique(peer.chatType, await this.getServerTime());
    peer.guildId = msgId;
    let data = await this.core.eventWrapper.CallNormalEvent<
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
  async getMsgUnique(chatType: number, time: string) {
    if (this.context.basicInfoWrapper.requireMinNTQQBuild('26702')) {
      return this.context.session.getMsgService().generateMsgUniqueId(chatType, time);
    }
    return this.context.session.getMsgService().getMsgUniqueId(time);
  }
  async getServerTime() {
    return this.context.session.getMSFService().getServerTime();
  }
  async getServerTimeV2() {
    return this.core.eventWrapper.callNoListenerEvent<() => string>('NodeIKernelMsgService/getServerTime', 5000);
  }
  async forwardMsg(srcPeer: Peer, destPeer: Peer, msgIds: string[]) {
    return this.context.session.getMsgService().forwardMsg(msgIds, srcPeer, [destPeer], new Map());
  }
  async multiForwardMsg(srcPeer: Peer, destPeer: Peer, msgIds: string[]): Promise<RawMessage> {
    const msgInfos = msgIds.map(id => {
      return { msgId: id, senderShowName: this.core.selfInfo.nick };
    });
    let data = await this.core.eventWrapper.CallNormalEvent<
      (msgInfo: typeof msgInfos, srcPeer: Peer, destPeer: Peer, comment: Array<any>, attr: Map<any, any>,) => Promise<unknown>,
      (msgList: RawMessage[]) => void
    >(
      'NodeIKernelMsgService/multiForwardMsgWithComment',
      'NodeIKernelMsgListener/onMsgInfoListUpdate',
      1,
      5000,
      (msgRecords: RawMessage[]) => {
        for (let msgRecord of msgRecords) {
          if (msgRecord.peerUid == destPeer.peerUid && msgRecord.senderUid == this.core.selfInfo.uid) {
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
      if (msg.peerUid == destPeer.peerUid && msg.senderUid == this.core.selfInfo.uid) {
        return msg;
      }
    }
    throw new Error('转发消息超时');
  }
  async markallMsgAsRead() {
    return this.context.session.getMsgService().setAllC2CAndGroupMsgRead();
  }
}
