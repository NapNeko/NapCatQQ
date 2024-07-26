import {
  CacheFileListItem,
  CacheFileType,
  ChatCacheListItemBasic,
  ChatType,
  ElementType, IMAGE_HTTP_HOST, IMAGE_HTTP_HOST_NT, RawMessage
} from '@/core/entities';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { log, logDebug, logError } from '@/common/utils/log';
import { GeneralCallResult, napCatCore, OnRichMediaDownloadCompleteParams } from '@/core';
import { calculateFileMD5 } from '@/common/utils/file';
import * as fileType from 'file-type';
import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { sessionConfig } from '@/core/sessionConfig';
import { rkeyManager } from '../utils/rkey';
import { NTEventDispatch } from '@/common/utils/EventTask';
import { NodeIKernelSearchService } from '../services/NodeIKernelSearchService';

export class NTQQFileApi {
  static async getFileType(filePath: string) {
    return fileType.fileTypeFromFile(filePath);
  }

  static async copyFile(filePath: string, destPath: string) {
    await napCatCore.util.copyFile(filePath, destPath);
  }

  static async getFileSize(filePath: string): Promise<number> {
    return await napCatCore.util.getFileSize(filePath);
  }
  static async getVideoUrl(msg: RawMessage, element: any) {
    return (await napCatCore.session.getRichMediaService().getVideoPlayUrlV2({
      chatType: msg.chatType,
      peerUid: msg.peerUid,
      guildId: '0'
    }, msg.msgId, element.elementId, 0, { downSourceType: 1, triggerType: 1 })).urlResult.domainUrl[0].url;
  }
  // 上传文件到QQ的文件夹
  static async uploadFile(filePath: string, elementType: ElementType = ElementType.PIC, elementSubType: number = 0) {
    // napCatCore.wrapper.util.
    const fileMd5 = await calculateFileMD5(filePath);
    let ext: string = (await NTQQFileApi.getFileType(filePath))?.ext as string || '';
    if (ext) {
      ext = '.' + ext;
    }
    let fileName = `${path.basename(filePath)}`;
    if (fileName.indexOf('.') === -1) {
      fileName += ext;
    }
    const mediaPath = napCatCore.session.getMsgService().getRichMediaFilePathForGuild({
      md5HexStr: fileMd5,
      fileName: fileName,
      elementType: elementType,
      elementSubType,
      thumbSize: 0,
      needCreate: true,
      downloadType: 1,
      file_uuid: ''
    });
    await NTQQFileApi.copyFile(filePath, mediaPath!);
    const fileSize = await NTQQFileApi.getFileSize(filePath);
    return {
      md5: fileMd5,
      fileName,
      path: mediaPath,
      fileSize,
      ext
    };
  }

  static async downloadMedia(msgId: string, chatType: ChatType, peerUid: string, elementId: string, thumbPath: string, sourcePath: string, timeout = 1000 * 60 * 2, force: boolean = false) {
    //logDebug('receive downloadMedia task', msgId, chatType, peerUid, elementId, thumbPath, sourcePath, timeout, force);
    // 用于下载收到的消息中的图片等
    if (sourcePath && fs.existsSync(sourcePath)) {
      if (force) {
        try {
          await fsPromises.unlink(sourcePath);
        } catch (e) {
          //
        }
      } else {
        return sourcePath;
      }
    }
    let data = await NTEventDispatch.CallNormalEvent<
      (
        params: {
          fileModelId: string,
          downloadSourceType: number,
          triggerType: number,
          msgId: string,
          chatType: ChatType,
          peerUid: string,
          elementId: string,
          thumbSize: number,
          downloadType: number,
          filePath: string
        }) => Promise<unknown>,
      (fileTransNotifyInfo: OnRichMediaDownloadCompleteParams) => void
    >(
      'NodeIKernelMsgService/downloadRichMedia',
      'NodeIKernelMsgListener/onRichMediaDownloadComplete',
      1,
      timeout,
      (arg: OnRichMediaDownloadCompleteParams) => {
        if (arg.msgId === msgId) {
          return true;
        }
        return false;
      },
      {
        fileModelId: '0',
        downloadSourceType: 0,
        triggerType: 1,
        msgId: msgId,
        chatType: chatType,
        peerUid: peerUid,
        elementId: elementId,
        thumbSize: 0,
        downloadType: 1,
        filePath: thumbPath
      }
    );
    let filePath = data[1].filePath;
    if (filePath.startsWith('\\')) {
      // log('filePath start with \\');
      const downloadPath = sessionConfig.defaultFileDownloadPath;
      //logDebug('downloadPath', downloadPath);
      filePath = path.join(downloadPath, filePath);
      // 下载路径是下载文件夹的相对路径
    }
    return filePath;
  }

  static async getImageSize(filePath: string): Promise<ISizeCalculationResult | undefined> {
    return new Promise((resolve, reject) => {
      imageSize(filePath, (err, dimensions) => {
        if (err) {
          reject(err);
        } else {
          resolve(dimensions);
        }
      });
    });
  }
  static async searchfile(keys: string[]) {

    type EventType = NodeIKernelSearchService['searchFileWithKeywords'];
    interface OnListener {
      searchId: string,
      hasMore: boolean,
      resultItems: {
        chatType: ChatType,
        buddyChatInfo: any[],
        discussChatInfo: any[],
        groupChatInfo:
        {
          groupCode: string,
          isConf: boolean,
          hasModifyConfGroupFace: boolean,
          hasModifyConfGroupName: boolean,
          groupName: string,
          remark: string
        }[]
        ,
        dataLineChatInfo: any[],
        tmpChatInfo: any[],
        msgId: string,
        msgSeq: string,
        msgTime: string,
        senderUid: string,
        senderNick: string,
        senderRemark: string,
        senderCard: string,
        elemId: string,
        elemType: number,
        fileSize: string,
        filePath: string,
        fileName: string,
        hits:
        {
          start: number,
          end: number
        }[]
      }[]
    };
    const [id, data] = await NTEventDispatch.CallNormalEvent<EventType, (params: OnListener) => void>(
      'NodeIKernelSearchService/searchFileWithKeywords',
      'NodeIKernelSearchListener/onSearchFileKeywordsResult',
      1,
      10000,
      (arg): boolean => { return id == data.searchId },
      keys,
      12
    );
    return data.resultItems[0];
  }
  static async getImageUrl(element: { originImageUrl: any; md5HexStr?: any; fileUuid: any; }) {
    if (!element) {
      return '';
    }
    const url: string = element.originImageUrl;  // 没有域名
    const md5HexStr = element.md5HexStr;
    const fileMd5 = element.md5HexStr;
    const fileUuid = element.fileUuid;

    if (url) {
      let UrlParse = new URL(IMAGE_HTTP_HOST + url);//临时解析拼接
      let imageAppid = UrlParse.searchParams.get('appid');
      let isNewPic = imageAppid && ['1406', '1407'].includes(imageAppid);
      if (isNewPic) {
        let UrlRkey = UrlParse.searchParams.get('rkey');
        if (UrlRkey) {
          return IMAGE_HTTP_HOST_NT + url;
        }
        const rkeyData = await rkeyManager.getRkey();
        UrlRkey = imageAppid === '1406' ? rkeyData.private_rkey : rkeyData.group_rkey;
        return IMAGE_HTTP_HOST_NT + url + `${UrlRkey}`;
      } else {
        // 老的图片url，不需要rkey
        return IMAGE_HTTP_HOST + url;
      }
    } else if (fileMd5 || md5HexStr) {
      // 没有url，需要自己拼接
      return `${IMAGE_HTTP_HOST}/gchatpic_new/0/0-0-${(fileMd5 || md5HexStr)!.toUpperCase()}/0`;
    }
    logDebug('图片url获取失败', element);
    return '';
  }
}

export class NTQQFileCacheApi {
  static async setCacheSilentScan(isSilent: boolean = true) {
    return '';
  }

  static getCacheSessionPathList() {
    return '';
  }

  static clearCache(cacheKeys: Array<string> = ['tmp', 'hotUpdate']) {
    // 参数未验证
    return napCatCore.session.getStorageCleanService().clearCacheDataByKeys(cacheKeys);
  }

  static addCacheScannedPaths(pathMap: object = {}) {
    return napCatCore.session.getStorageCleanService().addCacheScanedPaths(pathMap);
  }

  static scanCache(): Promise<GeneralCallResult & {
    size: string[]
  }> {
    // 需要注册Listener onFinishScan
    return napCatCore.session.getStorageCleanService().scanCache();
  }

  static getHotUpdateCachePath() {
    // 未实现
    return '';
  }

  static getDesktopTmpPath() {
    // 未实现
    return '';
  }

  static getChatCacheList(type: ChatType, pageSize: number = 1000, pageIndex: number = 0) {
    return napCatCore.session.getStorageCleanService().getChatCacheInfo(type, pageSize, 1, pageIndex);
  }

  static getFileCacheInfo(fileType: CacheFileType, pageSize: number = 1000, lastRecord?: CacheFileListItem) {
    const _lastRecord = lastRecord ? lastRecord : { fileType: fileType };
    //需要五个参数
    //return napCatCore.session.getStorageCleanService().getFileCacheInfo();
  }

  static async clearChatCache(chats: ChatCacheListItemBasic[] = [], fileKeys: string[] = []) {
    return napCatCore.session.getStorageCleanService().clearChatCacheInfo(chats, fileKeys);
  }
}
