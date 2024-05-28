import { OB11MessageData, OB11MessageDataType, OB11MessageFileBase } from '@/onebot11/types';
import {
  AtType,
  CustomMusicSignPostData,
  Group,
  IdMusicSignPostData,
  NTQQFileApi,
  SendArkElement,
  SendMessageElement,
  SendMsgElementConstructor
} from '@/core';
import { getGroupMember } from '@/core/data';
import { dbUtil } from '@/common/utils/db';
import { logDebug, logError } from '@/common/utils/log';
import { uri2local } from '@/common/utils/file';
import { ob11Config } from '@/onebot11/config';
import { RequestUtil } from '@/common/utils/request';
import fs from 'node:fs';

export type MessageContext = {
  group?: Group,
  deleteAfterSentFiles: string[],
}

async function handleOb11FileLikeMessage(
  { data: { file, name: payloadFileName } }: OB11MessageFileBase,
  { deleteAfterSentFiles }: MessageContext
) {
  let uri = file;

  const cache = await dbUtil.getFileCacheByName(file);
  if (cache) {
    if (fs.existsSync(cache.path)) {
      uri = 'file://' + cache.path;
    } else if (cache.url) {
      uri = cache.url;
    } else {
      const fileMsg = await dbUtil.getMsgByLongId(cache.msgId);
      if (fileMsg) {
        cache.path = await NTQQFileApi.downloadMedia(
          fileMsg.msgId, fileMsg.chatType, fileMsg.peerUid,
          cache.elementId, '', ''
        );
        uri = 'file://' + cache.path;
        dbUtil.updateFileCache(cache);
      }
    }
    logDebug('找到文件缓存', uri);
  }

  const { path, isLocal, fileName, errMsg } = (await uri2local(uri));

  if (errMsg) {
    logError('文件下载失败', errMsg);
    throw Error('文件下载失败' + errMsg);
  }

  if (!isLocal) { // 只删除http和base64转过来的文件
    deleteAfterSentFiles.push(path);
  }

  return { path, fileName: payloadFileName || fileName };
}

const _handlers: {
  [Key in OB11MessageDataType]: (
    sendMsg: Extract<OB11MessageData, { type: Key }>,
    // This picks the correct message type out
    // How great the type system of TypeScript is!
    context: MessageContext
  ) => SendMessageElement | undefined | Promise<SendMessageElement | undefined>
} = {
  [OB11MessageDataType.text]: ({ data: { text } }) => SendMsgElementConstructor.text(text),

  [OB11MessageDataType.at]: async ({ data: { qq: atQQ } }, context) => {
    if (!context.group) return undefined;

    if (atQQ === 'all') return SendMsgElementConstructor.at(atQQ, atQQ, AtType.atAll, '全体成员');

    // then the qq is a group member
    const atMember = await getGroupMember(context.group.groupCode, atQQ);
    return atMember ?
      SendMsgElementConstructor.at(atQQ, atMember.uid, AtType.atUser, atMember.cardName || atMember.nick) :
      undefined;
  },

  [OB11MessageDataType.reply]: async ({ data: { id } }) => {
    const replyMsg = await dbUtil.getMsgByShortId(parseInt(id));
    return replyMsg ?
      SendMsgElementConstructor.reply(replyMsg.msgSeq, replyMsg.msgId, replyMsg.senderUin!, replyMsg.senderUin!) :
      undefined;
  },

  [OB11MessageDataType.face]: ({ data: { id } }) => SendMsgElementConstructor.face(parseInt(id)),

  [OB11MessageDataType.mface]: ({
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
    return SendMsgElementConstructor.file(path, fileName);
  },

  [OB11MessageDataType.video]: async (sendMsg, context) => {
    const { path, fileName } = await handleOb11FileLikeMessage(sendMsg, context);

    //logDebug('发送视频', path, fileName);
    let thumb = sendMsg.data.thumb;
    if (thumb) {
      const uri2LocalRes = await uri2local(thumb);
      if (uri2LocalRes.success) thumb = uri2LocalRes.path;
    }

    return SendMsgElementConstructor.video(path, fileName, thumb);
  },
  [OB11MessageDataType.miniapp]: async ({ data: any }) => SendMsgElementConstructor.miniapp(),

  [OB11MessageDataType.voice]: async (sendMsg, context) =>
    SendMsgElementConstructor.ptt((await handleOb11FileLikeMessage(sendMsg, context)).path),

  [OB11MessageDataType.json]: ({ data: { data } }) => SendMsgElementConstructor.ark(data),

  [OB11MessageDataType.dice]: ({ data: { result } }) => SendMsgElementConstructor.dice(result),

  [OB11MessageDataType.RPS]: ({ data: { result } }) => SendMsgElementConstructor.rps(result),

  [OB11MessageDataType.markdown]: ({ data: { content } }) => SendMsgElementConstructor.markdown(content),

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
      throw Error('音乐消息签名地址未配置');
    }
    try {
      const musicJson = await RequestUtil.HttpGetJson<any>(signUrl, 'POST', postData);
      return SendMsgElementConstructor.ark(musicJson);
    } catch (e) {
      logError('生成音乐消息失败', e);
    }
  },

  [OB11MessageDataType.node]: () => undefined,

  [OB11MessageDataType.forward]: () => undefined,

  [OB11MessageDataType.xml]: () => undefined,

  [OB11MessageDataType.poke]: () => undefined,
};

const handlers = <{
  [Key in OB11MessageDataType]: (
    sendMsg: OB11MessageData,
    context: MessageContext
  ) => SendMessageElement | undefined | Promise<SendMessageElement | undefined>
}>_handlers;

export default async function createSendElements(
  messageData: OB11MessageData[],
  group?: Group,
  ignoreTypes: OB11MessageDataType[] = []
) {
  const sendElements: SendMessageElement[] = [];
  const deleteAfterSentFiles: string[] = [];
  for (const sendMsg of messageData) {
    if (ignoreTypes.includes(sendMsg.type)) {
      continue;
    }
    const callResult = await handlers[sendMsg.type](
      sendMsg,
      { group, deleteAfterSentFiles }
    );
    if (callResult) sendElements.push(callResult);
  }
  return { sendElements, deleteAfterSentFiles };
}

export async function createSendElementsParallel(
  messageData: OB11MessageData[],
  group?: Group,
  ignoreTypes: OB11MessageDataType[] = []
) {
  const deleteAfterSentFiles: string[] = [];
  const sendElements = <SendMessageElement[]>(
    await Promise.all(
      messageData.map(async sendMsg => ignoreTypes.includes(sendMsg.type) ?
        undefined :
        handlers[sendMsg.type](sendMsg, { group, deleteAfterSentFiles }))
    ).then(
      results => results.filter(
        element => element !== undefined
      )
    )
  );
  return { sendElements, deleteAfterSentFiles };
}
