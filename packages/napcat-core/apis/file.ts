import {
  ChatType,
  ElementType,
  IMAGE_HTTP_HOST,
  IMAGE_HTTP_HOST_NT,
  Peer,
  PicElement,
  RawMessage,
} from '@/napcat-core/types';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { InstanceContext, NapCatCore, SearchResultItem } from '@/napcat-core/index';
import { fileTypeFromFile } from 'file-type';
import { RkeyManager } from '@/napcat-core/helper/rkey';
import { calculateFileMD5 } from 'napcat-common/src/file';
import { rkeyDataType } from '../types/file';
import { NapProtoMsg } from 'napcat-protobuf';
import { FileId } from '../packet/transformer/proto/misc/fileid';

export class NTQQFileApi {
  context: InstanceContext;
  core: NapCatCore;
  rkeyManager: RkeyManager;
  packetRkey: Array<{ rkey: string; time: number; type: number; ttl: bigint; }> | undefined;
  private fetchRkeyFailures: number = 0;
  private readonly MAX_RKEY_FAILURES: number = 8;

  constructor (context: InstanceContext, core: NapCatCore) {
    this.context = context;
    this.core = core;
    this.rkeyManager = new RkeyManager([
      'http://ss.xingzhige.com/music_card/rkey',
      'https://secret-service.bietiaop.com/rkeys',
    ],
      this.context.logger
    );
  }

  private async fetchRkeyWithRetry () {
    if (this.fetchRkeyFailures >= this.MAX_RKEY_FAILURES) {
      throw new Error('Native.FetchRkey 已被禁用');
    }
    try {
      const ret = await this.core.apis.PacketApi.pkt.operation.FetchRkey();
      this.fetchRkeyFailures = 0; // Reset failures on success
      return ret;
    } catch (error) {
      this.fetchRkeyFailures++;
      this.context.logger.logError('FetchRkey 失败', (error as Error).message);
      throw error;
    }
  }

  async getFileUrl (chatType: ChatType, peer: string, fileUUID?: string, file10MMd5?: string | undefined, timeout: number = 5000) {
    if (this.core.apis.PacketApi.packetStatus) {
      try {
        if (chatType === ChatType.KCHATTYPEGROUP && fileUUID) {
          return this.core.apis.PacketApi.pkt.operation.GetGroupFileUrl(+peer, fileUUID, timeout);
        } else if (file10MMd5 && fileUUID) {
          return this.core.apis.PacketApi.pkt.operation.GetPrivateFileUrl(peer, fileUUID, file10MMd5, timeout);
        }
      } catch (error) {
        this.context.logger.logError('获取文件URL失败', (error as Error).message);
      }
    }
    throw new Error('fileUUID or file10MMd5 is undefined');
  }

  async getPttUrl (peer: string, fileUUID?: string, timeout: number = 5000) {
    if (this.core.apis.PacketApi.packetStatus && fileUUID) {
      const appid = new NapProtoMsg(FileId).decode(Buffer.from(fileUUID.replaceAll('-', '+').replaceAll('_', '/'), 'base64')).appid;
      try {
        if (appid && appid === 1403) {
          return this.core.apis.PacketApi.pkt.operation.GetGroupPttUrl(+peer, {
            fileUuid: fileUUID,
            storeId: 1,
            uploadTime: 0,
            ttl: 0,
            subType: 0,
          }, timeout);
        } else if (fileUUID) {
          return this.core.apis.PacketApi.pkt.operation.GetPttUrl(peer, {
            fileUuid: fileUUID,
            storeId: 1,
            uploadTime: 0,
            ttl: 0,
            subType: 0,
          }, timeout);
        }
      } catch (error) {
        this.context.logger.logError('获取文件URL失败', (error as Error).message);
      }
    }
    throw new Error('packet cant get ptt url');
  }

  async getVideoUrlPacket (peer: string, fileUUID?: string, timeout: number = 5000) {
    if (this.core.apis.PacketApi.packetStatus && fileUUID) {
      const appid = new NapProtoMsg(FileId).decode(Buffer.from(fileUUID.replaceAll('-', '+').replaceAll('_', '/'), 'base64')).appid;
      try {
        if (appid && appid === 1415) {
          return this.core.apis.PacketApi.pkt.operation.GetGroupVideoUrl(+peer, {
            fileUuid: fileUUID,
            storeId: 1,
            uploadTime: 0,
            ttl: 0,
            subType: 0,
          }, timeout);
        } else if (fileUUID) {
          return this.core.apis.PacketApi.pkt.operation.GetVideoUrl(peer, {
            fileUuid: fileUUID,
            storeId: 1,
            uploadTime: 0,
            ttl: 0,
            subType: 0,
          }, timeout);
        }
      } catch (error) {
        this.context.logger.logError('获取文件URL失败', (error as Error).message);
      }
    }
    throw new Error('packet cant get video url');
  }

  async copyFile (filePath: string, destPath: string) {
    await this.core.util.copyFile(filePath, destPath);
  }

  async getFileSize (filePath: string): Promise<number> {
    return await this.core.util.getFileSize(filePath);
  }

  async getVideoUrl (peer: Peer, msgId: string, elementId: string) {
    return (await this.context.session.getRichMediaService().getVideoPlayUrlV2(peer, msgId, elementId, 0, {
      downSourceType: 1,
      triggerType: 1,
    })).urlResult.domainUrl;
  }

  async uploadFile (filePath: string, elementType: ElementType = ElementType.PIC, elementSubType: number = 0) {
    const fileMd5 = await calculateFileMD5(filePath);
    const extOrEmpty = await fileTypeFromFile(filePath).then(e => e?.ext ?? '').catch(() => '');
    const ext = extOrEmpty ? `.${extOrEmpty}` : '';
    let fileName = `${path.basename(filePath)}`;
    if (fileName.indexOf('.') === -1) {
      fileName += ext;
    }

    const mediaPath = this.context.session.getMsgService().getRichMediaFilePathForGuild({
      md5HexStr: fileMd5,
      fileName,
      elementType,
      elementSubType,
      thumbSize: 0,
      needCreate: true,
      downloadType: 1,
      file_uuid: '',
    });

    await this.copyFile(filePath, mediaPath);
    const fileSize = await this.getFileSize(filePath);
    return {
      md5: fileMd5,
      fileName,
      path: mediaPath,
      fileSize,
      ext,
    };
  }


  async downloadFileForModelId (peer: Peer, modelId: string, unknown: string, timeout = 1000 * 60 * 2) {
    const [, fileTransNotifyInfo] = await this.core.eventWrapper.callNormalEventV2(
      'NodeIKernelRichMediaService/downloadFileForModelId',
      'NodeIKernelMsgListener/onRichMediaDownloadComplete',
      [peer, [modelId], unknown],
      () => true,
      (arg) => arg?.commonFileInfo?.fileModelId === modelId,
      1,
      timeout
    );
    return fileTransNotifyInfo.filePath;
  }

  async downloadRawMsgMedia (msg: RawMessage[]) {
    const res = await Promise.all(
      msg.map(m =>
        Promise.all(
          m.elements
            .filter(element =>
              element.elementType === ElementType.PIC ||
              element.elementType === ElementType.VIDEO ||
              element.elementType === ElementType.PTT ||
              element.elementType === ElementType.FILE
            )
            .map(element =>
              this.downloadMedia(m.msgId, m.chatType, m.peerUid, element.elementId, '', '', 1000 * 60 * 2, true)
            )
        )
      )
    );
    msg.forEach((m, msgIndex) => {
      const elementResults = res[msgIndex];
      let elementIndex = 0;
      m.elements.forEach(element => {
        if (
          element.elementType === ElementType.PIC ||
          element.elementType === ElementType.VIDEO ||
          element.elementType === ElementType.PTT ||
          element.elementType === ElementType.FILE
        ) {
          switch (element.elementType) {
            case ElementType.PIC:
              element.picElement!.sourcePath = elementResults?.[elementIndex] ?? '';
              break;
            case ElementType.VIDEO:
              element.videoElement!.filePath = elementResults?.[elementIndex] ?? '';
              break;
            case ElementType.PTT:
              element.pttElement!.filePath = elementResults?.[elementIndex] ?? '';
              break;
            case ElementType.FILE:
              element.fileElement!.filePath = elementResults?.[elementIndex] ?? '';
              break;
          }
          elementIndex++;
        }
      });
    });
    return res.flat();
  }

  async downloadMedia (msgId: string, chatType: ChatType, peerUid: string, elementId: string, thumbPath: string, sourcePath: string, timeout = 1000 * 60 * 2, force: boolean = false) {
    // 用于下载文件
    if (sourcePath && fs.existsSync(sourcePath)) {
      if (force) {
        try {
          await fsPromises.unlink(sourcePath);
        } catch {
          //
        }
      } else {
        return sourcePath;
      }
    }
    const [, completeRetData] = await this.core.eventWrapper.callNormalEventV2(
      'NodeIKernelMsgService/downloadRichMedia',
      'NodeIKernelMsgListener/onRichMediaDownloadComplete',
      [{
        fileModelId: '0',
        downSourceType: 0,
        downloadSourceType: 0,
        triggerType: 1,
        msgId,
        chatType,
        peerUid,
        elementId,
        thumbSize: 0,
        downloadType: 1,
        filePath: thumbPath,
      }],
      () => true,
      (arg) => arg.msgElementId === elementId && arg.msgId === msgId,
      1,
      timeout
    );
    return completeRetData.filePath;
  }

  async searchForFile (keys: string[]): Promise<SearchResultItem | undefined> {
    const randomResultId = 100000 + Math.floor(Math.random() * 10000);
    let searchId = 0;
    const [, searchResult] = await this.core.eventWrapper.callNormalEventV2(
      'NodeIKernelFileAssistantService/searchFile',
      'NodeIKernelFileAssistantListener/onFileSearch',
      [
        keys,
        { resultType: 2, pageLimit: 1 },
        randomResultId,
      ],
      (ret) => {
        searchId = ret;
        return true;
      },
      result => result.searchId === searchId && result.resultId === randomResultId
    );
    return searchResult.resultItems[0];
  }

  async downloadFileById (
    fileId: string,
    fileSize: number = 1024576,
    estimatedTime: number = (fileSize * 1000 / 1024576) + 5000
  ) {
    const [, fileData] = await this.core.eventWrapper.callNormalEventV2(
      'NodeIKernelFileAssistantService/downloadFile',
      'NodeIKernelFileAssistantListener/onFileStatusChanged',
      [[fileId]],
      ret => ret.result === 0,
      status => status.fileStatus === 2 && status.fileProgress === '0',
      1,
      estimatedTime // estimate 1MB/s
    );
    return fileData.filePath!;
  }

  async getImageUrl (element: PicElement): Promise<string> {
    if (!element) {
      return '';
    }

    const url: string = element.originImageUrl ?? '';

    const md5HexStr = element.md5HexStr;
    const fileMd5 = element.md5HexStr;
    const parsedUrl = new URL(IMAGE_HTTP_HOST + url);
    const imageAppid = parsedUrl.searchParams.get('appid');
    const isNTV2 = imageAppid && ['1406', '1407'].includes(imageAppid);
    const imageFileId = parsedUrl.searchParams.get('fileid');
    if (url && isNTV2 && imageFileId) {
      const rkeyData = await this.getRkeyData();
      return this.getImageUrlFromParsedUrl(imageFileId, imageAppid, rkeyData);
    }
    return this.getImageUrlFromMd5(fileMd5, md5HexStr);
  }

  private async getRkeyData () {
    const rkeyData: rkeyDataType = {
      private_rkey: 'CAQSKAB6JWENi5LM_xp9vumLbuThJSaYf-yzMrbZsuq7Uz2qEc3Rbib9LP4',
      group_rkey: 'CAQSKAB6JWENi5LM_xp9vumLbuThJSaYf-yzMrbZsuq7Uz2qffcqm614gds',
      online_rkey: false,
    };

    try {
      if (this.core.apis.PacketApi.packetStatus) {
        const rkey_expired_private = !this.packetRkey || (this.packetRkey[0] && this.packetRkey[0].time + Number(this.packetRkey[0].ttl) < Date.now() / 1000);
        const rkey_expired_group = !this.packetRkey || (this.packetRkey[0] && this.packetRkey[0].time + Number(this.packetRkey[0].ttl) < Date.now() / 1000);
        if (rkey_expired_private || rkey_expired_group) {
          this.packetRkey = await this.fetchRkeyWithRetry();
        }
        if (this.packetRkey && this.packetRkey.length > 0) {
          rkeyData.group_rkey = this.packetRkey[1]?.rkey.slice(6) ?? '';
          rkeyData.private_rkey = this.packetRkey[0]?.rkey.slice(6) ?? '';
          rkeyData.online_rkey = true;
        }
      }
    } catch (error: unknown) {
      this.context.logger.logDebug('获取native.rkey失败', (error as Error).message);
    }

    if (!rkeyData.online_rkey) {
      try {
        const tempRkeyData = await this.rkeyManager.getRkey();
        rkeyData.group_rkey = tempRkeyData.group_rkey;
        rkeyData.private_rkey = tempRkeyData.private_rkey;
        rkeyData.online_rkey = tempRkeyData.expired_time > Date.now() / 1000;
      } catch (error: unknown) {
        this.context.logger.logDebug('获取remote.rkey失败', (error as Error).message);
      }
    }
    // 进行 fallback.rkey 模式
    return rkeyData;
  }

  private getImageUrlFromParsedUrl (imageFileId: string, appid: string, rkeyData: rkeyDataType): string {
    const rkey = appid === '1406' ? rkeyData.private_rkey : rkeyData.group_rkey;
    if (rkeyData.online_rkey) {
      return IMAGE_HTTP_HOST_NT + `/download?appid=${appid}&fileid=${imageFileId}&rkey=${rkey}`;
    }
    return IMAGE_HTTP_HOST + `/download?appid=${appid}&fileid=${imageFileId}&rkey=${rkey}&spec=0`;
  }

  private getImageUrlFromMd5 (fileMd5: string | undefined, md5HexStr: string | undefined): string {
    if (fileMd5 || md5HexStr) {
      return `${IMAGE_HTTP_HOST}/gchatpic_new/0/0-0-${(fileMd5 ?? md5HexStr ?? '').toUpperCase()}/0`;
    }

    this.context.logger.logDebug('图片url获取失败', { fileMd5, md5HexStr });
    return '';
  }
}
