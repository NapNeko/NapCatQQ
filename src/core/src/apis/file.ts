import {
  CacheFileList,
  CacheFileListItem,
  CacheFileType,
  CacheScanResult,
  ChatCacheList,
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
import { MsgListener } from '@/core/listeners';
import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { sessionConfig } from '@/core/sessionConfig';
import { randomUUID } from 'crypto';
import { rkeyManager } from '../utils/rkey';


const downloadMediaTasks: Map<string, (arg: OnRichMediaDownloadCompleteParams) => void> = new Map<string, (arg: OnRichMediaDownloadCompleteParams) => void>();

const downloadMediaListener = new MsgListener();
downloadMediaListener.onRichMediaDownloadComplete = arg => {
  for (const [uuid, cb] of downloadMediaTasks) {
    cb(arg);
    downloadMediaTasks.delete(uuid);
  }
};
setTimeout(() => {
  napCatCore.onLoginSuccess(() => {
    napCatCore.addListener(downloadMediaListener);
  });
}, 100);
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
    //logDebug('start downloadMedia', msgId, chatType, peerUid, elementId, thumbPath, sourcePath, timeout, force);
    return new Promise<string>((resolve, reject) => {
      let completed = false;
      const cb = (arg: OnRichMediaDownloadCompleteParams) => {
        //logDebug('downloadMedia complete', arg, msgId);
        if (arg.msgId === msgId) {
          completed = true;
          let filePath = arg.filePath;
          if (filePath.startsWith('\\')) {
            // log('filePath start with \\');
            const downloadPath = sessionConfig.defaultFileDownloadPath;
            //logDebug('downloadPath', downloadPath);
            filePath = path.join(downloadPath, filePath);
            // 下载路径是下载文件夹的相对路径
          }
          resolve(filePath);
        }
      };
      downloadMediaTasks.set(randomUUID(), cb);
      setTimeout(() => {
        if (!completed) {
          reject('下载超时');
        }
      }, timeout);
      napCatCore.session.getMsgService().downloadRichMedia({
        fileModelId: '0',
        downloadSourceType: 0,
        triggerType: 1,
        msgId: msgId,
        chatType: chatType,
        peerUid: peerUid,
        elementId: elementId,
        thumbSize: 0,
        downloadType: 1,
        filePath: thumbPath,
      });
    });
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

  static async getImageUrl(element: { originImageUrl: any; md5HexStr?: any; fileUuid: any; }, isPrivateImage: boolean) {

    if (!element) {
      return '';
    }
    const url = element.originImageUrl;  // 没有域名
    const md5HexStr = element.md5HexStr;
    const fileMd5 = element.md5HexStr;
    const fileUuid = element.fileUuid;

    if (url) {
      if (url.startsWith('/download')) {
        if (url.includes('&rkey=')) {
          return IMAGE_HTTP_HOST_NT + url;
        }

        const rkeyData = await rkeyManager.getRkey();

        const existsRKey = isPrivateImage ? rkeyData.private_rkey : rkeyData.group_rkey;
        return IMAGE_HTTP_HOST_NT + url + `${existsRKey}`;
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
