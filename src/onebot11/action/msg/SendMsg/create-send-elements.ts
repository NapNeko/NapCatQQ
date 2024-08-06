import { OB11MessageData, OB11MessageDataType, OB11MessageFileBase } from '@/onebot11/types';
import {
  AtType,
  CustomMusicSignPostData,
  Group,
  IdMusicSignPostData,
  NTQQFileApi,
  NTQQMsgApi,
  Peer,
  SendArkElement,
  SendMessageElement,
  SendMsgElementConstructor,
  SignMusicWrapper
} from '@/core';
import { getGroupMember } from '@/core/data';
import { logError, logWarn } from '@/common/utils/log';
import { uri2local } from '@/common/utils/file';
import { ob11Config } from '@/onebot11/config';
import { RequestUtil } from '@/common/utils/request';
import { MessageUnique } from '@/common/utils/MessageUnique';
console.log(process.pid)
export type MessageContext = {
  deleteAfterSentFiles: string[],
  peer:Peer
}
async function handleOb11FileLikeMessage(
  { data: inputdata }: OB11MessageFileBase,
  { deleteAfterSentFiles }: MessageContext
) {
  //有的奇怪的框架将url作为参数 而不是file 此时优先url
  const { path, isLocal, fileName, errMsg,success } = (await uri2local(inputdata?.url || inputdata.file));

  if (!success) {
    logError('文件下载失败', errMsg);
    throw Error('文件下载失败' + errMsg);
  }

  if (!isLocal) { // 只删除http和base64转过来的文件
    deleteAfterSentFiles.push(path);
  }

  return { path, fileName: inputdata.name || fileName };
}

const _handlers: {
  [Key in OB11MessageDataType]: (
    sendMsg: Extract<OB11MessageData, { type: Key }>,
    // This picks the correct message type out
    // How great the type system of TypeScript is!
    context: MessageContext
  ) => Promise<SendMessageElement | undefined>
} = {
  [OB11MessageDataType.text]: async ({ data: { text } }) => SendMsgElementConstructor.text(text),

  [OB11MessageDataType.at]: async ({ data: { qq: atQQ } }, context) => {
    if (!context.peer) return undefined;

    if (atQQ === 'all') return SendMsgElementConstructor.at(atQQ, atQQ, AtType.atAll, '全体成员');

    // then the qq is a group member
    const atMember = await getGroupMember(context.peer.peerUid, atQQ);
    return atMember ?
      SendMsgElementConstructor.at(atQQ, atMember.uid, AtType.atUser, atMember.cardName || atMember.nick) :
      undefined;
  },
  [OB11MessageDataType.reply]: async ({ data: { id } }) => {
    const replyMsgM = MessageUnique.getMsgIdAndPeerByShortId(parseInt(id));
    if (!replyMsgM) {
      logWarn('回复消息不存在', id);
      return undefined;
    }
    const replyMsg = (await NTQQMsgApi.getMsgsByMsgId(replyMsgM?.Peer!, [replyMsgM?.MsgId!])).msgList[0];
    return replyMsg ?
      SendMsgElementConstructor.reply(replyMsg.msgSeq, replyMsg.msgId, replyMsg.senderUin!, replyMsg.senderUin!) :
      undefined;
  },

  [OB11MessageDataType.face]: async ({ data: { id } }) => SendMsgElementConstructor.face(parseInt(id)),

  [OB11MessageDataType.mface]: async ({
    data: {
      emoji_package_id,
      emoji_id,
      key,
      summary
    }
  }) => SendMsgElementConstructor.mface(emoji_package_id, emoji_id, key, summary),

  // File service

  [OB11MessageDataType.image]: async (sendMsg, context) => {
    const PicEle = await SendMsgElementConstructor.pic(
      (await handleOb11FileLikeMessage(sendMsg, context)).path,
      sendMsg.data.summary || '',
      sendMsg.data.subType || 0
    );
    context.deleteAfterSentFiles.push(PicEle.picElement.sourcePath);
    return PicEle;
  }
  , // currently not supported

  [OB11MessageDataType.file]: async (sendMsg, context) => {
    const { path, fileName } = await handleOb11FileLikeMessage(sendMsg, context);
    //logDebug('发送文件', path, fileName);
    const FileEle = await SendMsgElementConstructor.file(path, fileName);
    // 清除Upload的应该
    // context.deleteAfterSentFiles.push(fileName || FileEle.fileElement.filePath);
    return FileEle;
  },

  [OB11MessageDataType.video]: async (sendMsg, context) => {
    const { path, fileName } = await handleOb11FileLikeMessage(sendMsg, context);

    //logDebug('发送视频', path, fileName);
    let thumb = sendMsg.data.thumb;
    if (thumb) {
      const uri2LocalRes = await uri2local(thumb);
      if (uri2LocalRes.success) thumb = uri2LocalRes.path;
    }
    const videoEle = await SendMsgElementConstructor.video(path, fileName, thumb);
    //未测试
    context.deleteAfterSentFiles.push(videoEle.videoElement.filePath);
    return videoEle;
  },
  [OB11MessageDataType.miniapp]: async ({ data: any }) => SendMsgElementConstructor.miniapp(),

  [OB11MessageDataType.voice]: async (sendMsg, context) =>
    SendMsgElementConstructor.ptt((await handleOb11FileLikeMessage(sendMsg, context)).path),

  [OB11MessageDataType.json]: async ({ data: { data } }) => SendMsgElementConstructor.ark(data),

  [OB11MessageDataType.dice]: async ({ data: { result } }) => SendMsgElementConstructor.dice(result),

  [OB11MessageDataType.RPS]: async ({ data: { result } }) => SendMsgElementConstructor.rps(result),

  [OB11MessageDataType.markdown]: async ({ data: { content } }) => SendMsgElementConstructor.markdown(content),

  [OB11MessageDataType.music]: async ({ data }) => {
    // 保留, 直到...找到更好的解决方案
    if (data.type === 'custom') {
      if (!data.url) {
        logError('自定义音卡缺少参数url');
        return undefined;
      }
      if (!data.audio) {
        logError('自定义音卡缺少参数audio');
        return undefined;
      }
      if (!data.title) {
        logError('自定义音卡缺少参数title');
        return undefined;
      }
    } else {
      if (!['qq', '163'].includes(data.type)) {
        logError('音乐卡片type错误, 只支持qq、163、custom，当前type:', data.type);
        return undefined;
      }
      if (!data.id) {
        logError('音乐卡片缺少参数id');
        return undefined;
      }
    }

    let postData: IdMusicSignPostData | CustomMusicSignPostData;
    if (data.type === 'custom' && data.content) {
      const { content, ...others } = data;
      postData = { singer: content, ...others };
    } else {
      postData = data;
    }

    const signUrl = ob11Config.musicSignUrl;
    if (!signUrl) {
      if (data.type === 'qq') {
        const musicJson = (await SignMusicWrapper(data.id.toString())).data.arkResult.slice(0, -1);
        return SendMsgElementConstructor.ark(musicJson);
      }
      throw Error('音乐消息签名地址未配置');
    }
    try {
      const musicJson = await RequestUtil.HttpGetJson<any>(signUrl, 'POST', postData);
      return SendMsgElementConstructor.ark(musicJson);
    } catch (e) {
      logError('生成音乐消息失败', e);
    }
  },

  [OB11MessageDataType.node]: async () => undefined,

  [OB11MessageDataType.forward]: async () => undefined,

  [OB11MessageDataType.xml]: async () => undefined,

  [OB11MessageDataType.poke]: async () => undefined,

  [OB11MessageDataType.Location]: async () => {
    return SendMsgElementConstructor.location();
  }
};

const handlers = <{
  [Key in OB11MessageDataType]: (
    sendMsg: OB11MessageData,
    context: MessageContext
  ) => Promise<SendMessageElement | undefined>
}>_handlers;

export default async function createSendElements(
  messageData: OB11MessageData[],
  peer: Peer,
  ignoreTypes: OB11MessageDataType[] = []
) {
  const deleteAfterSentFiles: string[] = [];
  const callResultList: Array<Promise<SendMessageElement | undefined>> = [];
  for (const sendMsg of messageData) {
    if (ignoreTypes.includes(sendMsg.type)) {
      continue;
    }
    const callResult = handlers[sendMsg.type](
      sendMsg,
      { peer, deleteAfterSentFiles }
    )?.catch(undefined);
    callResultList.push(callResult);
  }
  const ret = await Promise.all(callResultList);
  const sendElements: SendMessageElement[] = ret.filter(ele => ele) as SendMessageElement[];
  return { sendElements, deleteAfterSentFiles };
}

export async function createSendElementsParallel(
  messageData: OB11MessageData[],
  peer: Peer,
  ignoreTypes: OB11MessageDataType[] = []
) {
  const deleteAfterSentFiles: string[] = [];
  const sendElements = <SendMessageElement[]>(
    await Promise.all(
      messageData.map(async sendMsg => ignoreTypes.includes(sendMsg.type) ?
        undefined :
        handlers[sendMsg.type](sendMsg, { peer, deleteAfterSentFiles }))
    ).then(
      results => results.filter(
        element => element !== undefined
      )
    )
  );
  return { sendElements, deleteAfterSentFiles };
}
