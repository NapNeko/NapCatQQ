import { ChatType, GetFileListParam, Peer, RawMessage, SendMessageElement } from '@/core/entities';
import { friends, groups, selfInfo } from '@/core/data';
import { log, logError, logWarn } from '@/common/utils/log';
import { sleep } from '@/common/utils/helper';
import { napCatCore, NTQQUserApi } from '@/core';
import { MsgListener, onGroupFileInfoUpdateParamType } from '@/core/listeners';
import { GeneralCallResult } from '@/core/services/common';
import { randomUUID } from 'crypto';
import { MessageUnique } from '../../../common/utils/MessageUnique';
import { NTEventDispatch } from '@/common/utils/EventTask';

setTimeout(() => {
  napCatCore.onLoginSuccess(() => {
    setTimeout(async () => {
      if (groups.size > 100) {
        logWarn('群数量大于100，可能会导致性能问题');
      }
      let predict = (groups.size + friends.size) / 5;
      predict = predict < 20 ? 20 : predict;
      predict = predict > 50 ? 50 : predict;
      //let waitpromise: Array<Promise<{ msgList: RawMessage[]; }>> = [];
      MessageUnique.resize(predict * 50);
      let RecentContact = await NTQQUserApi.getRecentContactListSnapShot(predict);
      if (RecentContact?.info?.changedList && RecentContact?.info?.changedList?.length > 0) {
        for (let i = 0; i < RecentContact.info.changedList.length; i++) {
          let Peer: Peer = { chatType: RecentContact.info.changedList[i].chatType, peerUid: RecentContact.info.changedList[i].peerUid, guildId: '' };
          let msgList = await NTQQMsgApi.getMsgHistory(Peer, RecentContact.info.changedList[i].msgId, 50);
          for (let j = 0; j < msgList.msgList.length; j++) {
            let shortId = MessageUnique.createMsg(Peer, msgList.msgList[j].msgId);
            //console.log(`开始创建 ${shortId}<------>${msgList.msgList[j].msgId}`)
          }
        }
      }
    }, 500);
  });
}, 100);

// const sendMessagePool: Record<string, ((sendSuccessMsg: RawMessage) => void | Promise<void>) | null> = {};// peerUid: callbackFunc

const sendSuccessCBMap: Record<string, ((sendSuccessMsg: RawMessage) => boolean | Promise<boolean>) | null> = {};// uuid: callbackFunc

const GroupFileInfoUpdateTasks: Map<string, ((groupFileListResult: onGroupFileInfoUpdateParamType) => void)> = new Map();

const sentMsgTasks: Map<string, (msg: RawMessage) => void> = new Map();

const msgListener = new MsgListener();

msgListener.onGroupFileInfoUpdate = (groupFileListResult: onGroupFileInfoUpdateParamType) => {
  for (const [uuid, cb] of GroupFileInfoUpdateTasks) {
    cb(groupFileListResult);
    GroupFileInfoUpdateTasks.delete(uuid);
  }
};

// msgListener.onAddSendMsg = (msgRecord: RawMessage) => {
//   // console.log("sent msg", msgRecord, sendMessagePool);
//   for (const [uuid, cb] of sentMsgTasks) {
//     cb(msgRecord);
//     sentMsgTasks.delete(uuid);
//   }
//   if (sendMessagePool[msgRecord.peerUid]) {
//     const r = sendMessagePool[msgRecord.peerUid]?.(msgRecord);
//     if (r instanceof Promise) {
//       r.then().catch(logError);
//     }
//   }
// };

msgListener.onMsgInfoListUpdate = (msgInfoList: RawMessage[]) => {
  msgInfoList.forEach(msg => {
    new Promise((resolve, reject) => {
      for (const cbId in sendSuccessCBMap) {
        const cb = sendSuccessCBMap[cbId]!;
        const cbResult = cb(msg);
        const checkResult = (result: boolean) => {
          if (result) {
            delete sendSuccessCBMap[cbId];
          }
        };
        if (cbResult instanceof Promise) {
          cbResult.then(checkResult);
        } else {
          checkResult(cbResult);
        }
      }
    }).then().catch(log);
  });
};



setTimeout(() => {
  napCatCore.onLoginSuccess(() => {
    napCatCore.addListener(msgListener);
  });
}, 100);


export class NTQQMsgApi {
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

  static async getMsgsByMsgId(peer: Peer, msgIds: string[]) {
    return await napCatCore.session.getMsgService().getMsgsByMsgId(peer, msgIds);
  }
  static async getMsgsBySeqAndCount(peer: Peer, seq: string, count: number, desc: boolean, z: boolean) {
    return await napCatCore.session.getMsgService().getMsgsBySeqAndCount(peer, seq, count, desc, z);
  }

  static async activateChat(peer: Peer) {
    // await this.fetchRecentContact();
    // await sleep(500);
  }

  static async activateChatAndGetHistory(peer: Peer) {

  }
  static async setMsgRead(peer: Peer) {
    return napCatCore.session.getMsgService().setMsgRead(peer);
  }
  static async getGroupFileList(GroupCode: string, params: GetFileListParam) {
    return new Promise<Array<any>>(async (resolve, reject) => {
      let complete = false;
      setTimeout(() => {
        if (!complete) {
          reject('获取群文件列表超时');
        }
      }, 5000);
      const GroupFileInfoUpdateCB = (groupFileListResult: onGroupFileInfoUpdateParamType) => {
        complete = true;
        resolve(groupFileListResult.item);
      };
      GroupFileInfoUpdateTasks.set(randomUUID(), GroupFileInfoUpdateCB);
      await napCatCore.session.getRichMediaService().getGroupFileList(GroupCode, params);
    });
  }
  static async getMsgHistory(peer: Peer, msgId: string, count: number) {
    // 消息时间从旧到新
    return napCatCore.session.getMsgService().getMsgsIncludeSelf(peer, msgId, count, true);
  }

  static async fetchRecentContact() {

  }

  static async recallMsg(peer: Peer, msgIds: string[]) {
    await napCatCore.session.getMsgService().recallMsg({
      chatType: peer.chatType,
      peerUid: peer.peerUid
    }, msgIds);
  }
  static async sendMsg(peer: Peer, msgElements: SendMessageElement[], waitComplete = true, timeout = 10000) {
    let msgId = await NTQQMsgApi.getMsgUnique(await NTQQMsgApi.getServerTime());
    let data = await NTEventDispatch.CallNormalEvent<(msgId: string, peer: Peer, msgElements: SendMessageElement[], map: Map<any, any>) => Promise<unknown>, (msgList: RawMessage[]) => void>(
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
    //const result = napCatCore.session.getMsgService().sendMsg(msgId, peer, msgElements, new Map());
  }
  // static async sendMsg(peer: Peer, msgElements: SendMessageElement[], waitComplete = true, timeout = 10000): Promise<RawMessage> {
  //   const peerUid = peer.peerUid;
  //   // 等待上一个相同的peer发送完
  //   let checkLastSendUsingTime = 0;
  //   const waitLastSend: () => Promise<void> = async () => {
  //     if (checkLastSendUsingTime > timeout) {
  //       throw ('发送超时');
  //     }
  //     const lastSending = sendMessagePool[peer.peerUid];
  //     if (lastSending) {
  //       // log("有正在发送的消息，等待中...")
  //       await sleep(500);
  //       checkLastSendUsingTime += 500;
  //       return await waitLastSend();
  //     } else {
  //       return;
  //     }
  //   };
  //   await waitLastSend();

  //   return new Promise(async (resolve, reject) => {
  //     let completed = false;
  //     let sentMessage: RawMessage | null = null;
  //     const sendSuccessCBId = randomUUID() as string;
  //     sendSuccessCBMap[sendSuccessCBId] = (msgRecord: RawMessage) => {
  //       if (msgRecord.msgId === sentMessage?.msgId) {
  //         if (msgRecord.sendStatus === 2) {
  //           delete sendSuccessCBMap[sendSuccessCBId];
  //           completed = true;
  //           resolve(msgRecord);
  //           return true;
  //         }
  //         return false;
  //       }
  //       return false;
  //     };
  //     sendMessagePool[peerUid] = async (rawMessage: RawMessage) => {
  //       // console.log('收到sent 消息', rawMessage.msgId);
  //       delete sendMessagePool[peerUid];
  //       sentMessage = rawMessage;
  //     };
  //     setTimeout(() => {
  //       if (completed) return;
  //       delete sendMessagePool[peerUid];
  //       delete sendSuccessCBMap[sendSuccessCBId];
  //       reject('发送超时');
  //     }, timeout);
  //     let msgId = await NTQQMsgApi.getMsgUnique(await NTQQMsgApi.getServerTime());
  //     const result = napCatCore.session.getMsgService().sendMsg(msgId, peer, msgElements, new Map());
  //   });
  // }
  static async getMsgUnique(time: string) {
    return napCatCore.session.getMsgService().getMsgUniqueId(time);
  }
  static async getServerTime() {
    return napCatCore.session.getMSFService().getServerTime();
  }
  static async forwardMsg(srcPeer: Peer, destPeer: Peer, msgIds: string[]) {
    return napCatCore.session.getMsgService().forwardMsg(msgIds, srcPeer, [destPeer], new Map());
  }

  static async multiForwardMsg(srcPeer: Peer, destPeer: Peer, msgIds: string[]): Promise<RawMessage> {
    const msgInfos = msgIds.map(id => {
      return { msgId: id, senderShowName: selfInfo.nick };
    });

    return new Promise((resolve, reject) => {
      let complete = false;
      const onSentCB = (msg: RawMessage) => {
        const arkElement = msg.elements.find(ele => ele.arkElement);
        if (!arkElement) {
          // log("收到的不是转发消息")
          return;
        }
        const forwardData: any = JSON.parse(arkElement.arkElement.bytesData);
        if (forwardData.app != 'com.tencent.multimsg') {
          return;
        }
        if (msg.peerUid == destPeer.peerUid && msg.senderUid == selfInfo.uid) {
          complete = true;
          resolve(msg);
        }
      };
      sentMsgTasks.set(randomUUID(), onSentCB);
      setTimeout(() => {
        if (!complete) {
          reject('转发消息超时');
        }
      }, 5000);
      napCatCore.session.getMsgService().multiForwardMsgWithComment(msgInfos, srcPeer, destPeer, [], new Map());
    }
    );
  }
  static async markallMsgAsRead() {
    return napCatCore.session.getMsgService().setAllC2CAndGroupMsgRead();
  }
}
