import { OB11MessageData, OB11MessageDataType, OB11MessageFileBase } from '@/onebot/types';
import { uri2local } from '@/common/utils/file';
import { RequestUtil } from '@/common/utils/request';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { AtType, CustomMusicSignPostData, IdMusicSignPostData, NapCatCore, Peer, SendMessageElement } from '@/core';
import { SendMsgElementConstructor } from '@/onebot/helper/msg';
import { NapCatOneBot11Adapter } from '@/onebot';

export type MessageContext = {
    deleteAfterSentFiles: string[],
    peer: Peer
}

async function handleOb11FileLikeMessage(
    coreContext: NapCatCore,
    obContext: NapCatOneBot11Adapter,
    { data: inputdata }: OB11MessageFileBase,
    { deleteAfterSentFiles }: MessageContext,
) {
    //有的奇怪的框架将url作为参数 而不是file 此时优先url 同时注意可能传入的是非file://开头的目录 By Mlikiowa
    const {
        path,
        isLocal,
        fileName,
        errMsg,
        success,
    } = (await uri2local(coreContext.NapCatTempPath, inputdata?.url || inputdata.file));

    if (!success) {
        coreContext.context.logger.logError('文件下载失败', errMsg);
        throw Error('文件下载失败' + errMsg);
    }

    if (!isLocal) { // 只删除http和base64转过来的文件
        deleteAfterSentFiles.push(path);
    }

    return { path, fileName: inputdata.name || fileName };
}

const _handlers: {
    [Key in OB11MessageDataType]: (
        CoreContext: NapCatCore,
        obContext: NapCatOneBot11Adapter,
        sendMsg: Extract<OB11MessageData, { type: Key }>,
        // This picks the correct message type out
        // How great the type system of TypeScript is!
        context: MessageContext,
    ) => Promise<SendMessageElement | undefined>
} = {
    [OB11MessageDataType.text]: async (coreContext, obContext: NapCatOneBot11Adapter, { data: { text } }) => SendMsgElementConstructor.text(coreContext, text),

    [OB11MessageDataType.at]: async (coreContext, obContext: NapCatOneBot11Adapter, { data: { qq: atQQ } }, context) => {
        if (!context.peer) return undefined;

        if (atQQ === 'all') return SendMsgElementConstructor.at(coreContext, atQQ, atQQ, AtType.atAll, '全体成员');

        // then the qq is a group member
        // Mlikiowa V2.0.26 Refactor Todo
        const uid = await coreContext.apis.UserApi.getUidByUinV2(`${atQQ}`);
        if (!uid) throw new Error('Get Uid Error');
        return SendMsgElementConstructor.at(coreContext, atQQ, uid, AtType.atUser, '');
    },
    [OB11MessageDataType.reply]: async (coreContext, obContext: NapCatOneBot11Adapter, { data: { id } }) => {
        const replyMsgM = MessageUnique.getMsgIdAndPeerByShortId(parseInt(id));
        if (!replyMsgM) {
            coreContext.context.logger.logWarn('回复消息不存在', id);
            return undefined;
        }
        const NTQQMsgApi = coreContext.apis.MsgApi;
        const replyMsg = (await NTQQMsgApi.getMsgsByMsgId(
            replyMsgM.Peer, [replyMsgM.MsgId!])).msgList[0];
        return replyMsg ?
            SendMsgElementConstructor.reply(coreContext, replyMsg.msgSeq, replyMsg.msgId, replyMsg.senderUin!, replyMsg.senderUin!) :
            undefined;
    },

    [OB11MessageDataType.face]: async (coreContext, obContext: NapCatOneBot11Adapter, { data: { id } }) => SendMsgElementConstructor.face(coreContext, parseInt(id)),

    [OB11MessageDataType.mface]: async (coreContext, obContext: NapCatOneBot11Adapter, {
        data: {
            emoji_package_id, emoji_id, key, summary,
        },
    }) => SendMsgElementConstructor.mface(coreContext, emoji_package_id, emoji_id, key, summary),

    // File service
    [OB11MessageDataType.image]: async (coreContext, obContext: NapCatOneBot11Adapter, sendMsg, context) => {
        const PicEle = await SendMsgElementConstructor.pic(
            coreContext,
            (await handleOb11FileLikeMessage(coreContext, obContext, sendMsg, context)).path,
            sendMsg.data.summary || '',
            sendMsg.data.subType || 0,
        );
        context.deleteAfterSentFiles.push(PicEle.picElement.sourcePath);
        return PicEle;
    }, // currently not supported
    [OB11MessageDataType.file]: async (coreContext, obContext: NapCatOneBot11Adapter, sendMsg, context) => {
        const { path, fileName } = await handleOb11FileLikeMessage(coreContext, obContext, sendMsg, context);
        //logDebug('发送文件', path, fileName);
        const FileEle = await SendMsgElementConstructor.file(coreContext, path, fileName);
        // 清除Upload的应该
        // context.deleteAfterSentFiles.push(fileName || FileEle.fileElement.filePath);
        return FileEle;
    },

    [OB11MessageDataType.video]: async (coreContext, obContext, sendMsg, context) => {
        const { path, fileName } = await handleOb11FileLikeMessage(coreContext, obContext, sendMsg, context);

        //logDebug('发送视频', path, fileName);
        let thumb = sendMsg.data.thumb;
        if (thumb) {
            const uri2LocalRes = await uri2local(coreContext.NapCatTempPath, thumb);
            if (uri2LocalRes.success) thumb = uri2LocalRes.path;
        }
        const videoEle = await SendMsgElementConstructor.video(coreContext, path, fileName, thumb);
        //未测试
        context.deleteAfterSentFiles.push(videoEle.videoElement.filePath);
        return videoEle;
    },

    [OB11MessageDataType.voice]: async (coreContext, obContext: NapCatOneBot11Adapter, sendMsg, context) => SendMsgElementConstructor.ptt(coreContext, (await handleOb11FileLikeMessage(coreContext, obContext, sendMsg, context)).path),

    [OB11MessageDataType.json]: async (coreContext, obContext: NapCatOneBot11Adapter, { data: { data } }) => SendMsgElementConstructor.ark(coreContext, data),

    [OB11MessageDataType.dice]: async (coreContext, obContext: NapCatOneBot11Adapter, { data: { result } }) => SendMsgElementConstructor.dice(coreContext, result),

    [OB11MessageDataType.RPS]: async (coreContext, obContext: NapCatOneBot11Adapter, { data: { result } }) => SendMsgElementConstructor.rps(coreContext, result),

    [OB11MessageDataType.markdown]: async (coreContext, obContext: NapCatOneBot11Adapter, { data: { content } }) => SendMsgElementConstructor.markdown(coreContext, content),

    [OB11MessageDataType.music]: async (coreContext, obContext: NapCatOneBot11Adapter, { data }) => {
        // 保留, 直到...找到更好的解决方案
        if (data.type === 'custom') {
            if (!data.url) {
                coreContext.context.logger.logError('自定义音卡缺少参数url');
                return undefined;
            }
            if (!data.audio) {
                coreContext.context.logger.logError('自定义音卡缺少参数audio');
                return undefined;
            }
            if (!data.title) {
                coreContext.context.logger.logError('自定义音卡缺少参数title');
                return undefined;
            }
        } else {
            if (!['qq', '163'].includes(data.type)) {
                coreContext.context.logger.logError('音乐卡片type错误, 只支持qq、163、custom，当前type:', data.type);
                return undefined;
            }
            if (!data.id) {
                coreContext.context.logger.logError('音乐卡片缺少参数id');
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
        // Mlikiowa V2.0.26 Refactor Todo
        const signUrl = obContext.configLoader.configData.musicSignUrl;
        if (!signUrl) {
            if (data.type === 'qq') {
                //const musicJson = (await SignMusicWrapper(data.id.toString())).data.arkResult.slice(0, -1);
                //return SendMsgElementConstructor.ark(musicJson);
            }
            throw Error('音乐消息签名地址未配置');
        }
        try {
            const musicJson = await RequestUtil.HttpGetJson<any>(signUrl, 'POST', postData);
            return SendMsgElementConstructor.ark(coreContext, musicJson);
        } catch (e) {
            coreContext.context.logger.logError('生成音乐消息失败', e);
        }
    },

    [OB11MessageDataType.node]: async (coreContext, obContext: NapCatOneBot11Adapter) => undefined,

    [OB11MessageDataType.forward]: async (coreContext, obContext: NapCatOneBot11Adapter) => undefined,

    [OB11MessageDataType.xml]: async (coreContext, obContext: NapCatOneBot11Adapter) => undefined,

    [OB11MessageDataType.poke]: async (coreContext, obContext: NapCatOneBot11Adapter) => undefined,

    [OB11MessageDataType.Location]: async (coreContext, obContext: NapCatOneBot11Adapter) => {
        return SendMsgElementConstructor.location(coreContext);
    },
    [OB11MessageDataType.miniapp]: function (CoreContext: NapCatCore, obContext: NapCatOneBot11Adapter, sendMsg: never, context: MessageContext): Promise<SendMessageElement | undefined> {
        throw new Error('Function not implemented.');
    },
};

const handlers = <{
    [Key in OB11MessageDataType]: (
        coreContext: NapCatCore,
        obContext: NapCatOneBot11Adapter,
        sendMsg: OB11MessageData,
        context: MessageContext,
    ) => Promise<SendMessageElement | undefined>
}>_handlers;

export default async function createSendElements(
    CoreContext: NapCatCore,
    obContext: NapCatOneBot11Adapter,
    messageData: OB11MessageData[],
    peer: Peer,
    ignoreTypes: OB11MessageDataType[] = [],
) {
    const deleteAfterSentFiles: string[] = [];
    const callResultList: Array<Promise<SendMessageElement | undefined>> = [];
    for (const sendMsg of messageData) {
        if (ignoreTypes.includes(sendMsg.type)) {
            continue;
        }
        const callResult = handlers[sendMsg.type](
            CoreContext,
            obContext,
            sendMsg,
            { peer, deleteAfterSentFiles },
        )?.catch(undefined);
        callResultList.push(callResult);
    }
    const ret = await Promise.all(callResultList);
    const sendElements: SendMessageElement[] = ret.filter(ele => ele) as SendMessageElement[];
    return { sendElements, deleteAfterSentFiles };
}

export async function createSendElementsParallel(
    CoreContext: NapCatCore,
    obContext: NapCatOneBot11Adapter,
    messageData: OB11MessageData[],
    peer: Peer,
    ignoreTypes: OB11MessageDataType[] = [],
) {
    const deleteAfterSentFiles: string[] = [];
    const sendElements = <SendMessageElement[]>(
        await Promise.all(
            messageData.map(async sendMsg => ignoreTypes.includes(sendMsg.type) ?
                undefined :
                handlers[sendMsg.type](CoreContext, obContext, sendMsg, { peer, deleteAfterSentFiles })),
        ).then(
            results => results.filter(
                element => element !== undefined,
            ),
        )
    );
    return { sendElements, deleteAfterSentFiles };
}
