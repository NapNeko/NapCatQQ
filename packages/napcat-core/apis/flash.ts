import { GeneralCallResult, InstanceContext, NapCatCore } from '@/napcat-core';
import {
  createFlashTransferResult,
  FileListResponse,
  FlashFileSetInfo,
  SendStatus,
} from '@/napcat-core/data/flash';
import { Peer } from '@/napcat-core/types';

export class NTQQFlashApi {
  context: InstanceContext;
  core: NapCatCore;

  constructor (context: InstanceContext, core: NapCatCore) {
    this.context = context;
    this.core = core;
  }

  /**
   * 发起闪传上传任务
   * @param fileListToUpload 上传文件绝对路径的列表，可以是文件夹！！
   */
  async createFlashTransferUploadTask (fileListToUpload: string[]): Promise < GeneralCallResult & {
    createFlashTransferResult: createFlashTransferResult;
    seq: number;
  } > {
    const flashService = this.context.session.getFlashTransferService();

    const timestamp : number = Date.now();
    const selfInfo = this.core.selfInfo;

    const fileUploadArg = {
      screen: 1, // 1
      uploaders: [{
        uin: selfInfo.uin,
        uid: selfInfo.uid,
        sendEntrance: '',
        nickname: selfInfo.nick,
      }],
      paths: fileListToUpload,
    };

    const uploadResult = await flashService.createFlashTransferUploadTask(timestamp, fileUploadArg);
    if (uploadResult.result === 0) {
      this.context.logger.log('[Flash] 发起闪传任务成功');
      return uploadResult;
    } else {
      this.context.logger.logError('[Flash] 发起闪传上传任务失败！！');
      return uploadResult;
    }
  }

  /**
   * 下载闪传文件集
   * @param fileSetId
   */
  async downloadFileSetBySetId (fileSetId: string): Promise < GeneralCallResult & {
    extraInfo: unknown
  } > {
    const flashService = this.context.session.getFlashTransferService();

    const result = await flashService.startFileSetDownload(fileSetId, 1, { isIncludeCompressInnerFiles: false });  // 为了方便，暂时硬编码
    if (result.result === 0) {
      this.context.logger.log('[Flash] 成功开始下载文件集');
    } else {
      this.context.logger.logError('[Flash] 尝试下载文件集失败！');
    }
    return result;
  }

  /**
   * 获取闪传的外链分享
   * @param fileSetId
   */
  async getShareLinkBySetId (fileSetId: string): Promise < GeneralCallResult & {
    shareLink: string;
    expireTimestamp: string;
  }> {
    const flashService = this.context.session.getFlashTransferService();

    const result = await flashService.getShareLinkReq(fileSetId);
    if (result.result === 0) {
      this.context.logger.log('[Flash] 获取闪传外链分享成功:', result.shareLink);
    } else {
      this.context.logger.logError('[Flash] 获取闪传外链失败！！');
    }
    return result;
  }

  /**
   * 从分享外链获取文件集id
   * @param shareCode
   */
  async fromShareLinkFindSetId (shareCode: string): Promise < GeneralCallResult & {
    fileSetId: string;
  } > {
    const flashService = this.context.session.getFlashTransferService();

    const result = await flashService.getFileSetIdByCode(shareCode);
    if (result.result === 0) {
      this.context.logger.log('[Flash] 获取shareCode的文件集Id成功！');
    } else {
      this.context.logger.logError('[Flash] 获取文件集ID失败！！');
    }
    return result;
  }

  /**
   * 获取fileSet的文件结构信息  （未来可能需要深度遍历）
   * == 注意返回结构和其它的不同，没有GeneralCallResult!!! ==
   * @param fileSetId
   */
  async getFileListBySetId (fileSetId: string): Promise < FileListResponse > {
    const flashService = this.context.session.getFlashTransferService();

    const requestArg = {
      seq: 0,
      fileSetId,
      isUseCache: false,
      sceneType: 1,  // 硬编码
      reqInfos: [
        {
          count: 18, // 18 ??
          paginationInfo: {},
          parentId: '',
          reqIndexPath: '',
          reqDepth: 1,
          filterCondition: {
            fileCategory: 0,
            filterType: 0,
          },
          sortConditions: [
            {
              sortField: 0,
              sortOrder: 0,
            },
          ],
          isNeedPhysicalInfoReady: false,
        },
      ],
    };
    const result = await flashService.getFileList(requestArg);
    if (result.rsp.result === 0) {
      this.context.logger.log('[Flash] 获取fileSet文件信息成功！');
      return result.rsp;
    } else {
      this.context.logger.logError(`[Flash] 获取文件信息失败：ErrMsg: ${result.rsp.errMs}`);
      return result.rsp;
    }
  }

  /**
   * 获取闪传文件集合信息
   * @param fileSetId
   */
  async getFileSetIndoBySetId (fileSetId: string): Promise < GeneralCallResult & {
    seq: number;
    isCache: boolean;
    fileSet: FlashFileSetInfo;
  } > {
    const flashService = this.context.session.getFlashTransferService();

    const requestArg = {
      fileSetId,
    };

    const result = await flashService.getFileSet(requestArg);
    if (result.result === 0) {
      this.context.logger.log('[Flash] 获取闪传文件集信息成功！');
    } else {
      this.context.logger.logError('[Flash] 获取闪传文件信息失败！！');
    }
    return result;
  }

  /**
   * 发送闪传消息（私聊/群聊）
   * @param fileSetId
   * @param peer
   */
  async sendFlashMessage (fileSetId: string, peer:Peer): Promise < {
    errCode: number,
    errMsg: string,
    rsp: {
      sendStatus: SendStatus[]
    }
  } > {
    const flashService = this.context.session.getFlashTransferService();

    const target = {
      destUid: peer.peerUid,
      destType: peer.chatType,
      // destUin: peer.peerUin,
    };

    const requestsArg = {
      fileSetId,
      targets: [target],
    };

    const result = await flashService.sendFlashTransferMsg(requestsArg);
    if (result.errCode === 0) {
      this.context.logger.log('[Flash] 消息发送成功');
    } else {
      this.context.logger.logError(`[Flash] 消息发送失败！！原因：${result.errMsg}`);
    }
    return result;
  }

  /**
   * 获取闪传文件集中某个文件的下载URL（外链）
   * @param fileSetId
   * @param options
   */
  async getFileTransUrl (fileSetId: string, options: { fileName?: string; fileIndex?: number }): Promise < GeneralCallResult & {
    transferUrl: string;
  } > {
    const flashService = this.context.session.getFlashTransferService();
    const result = await this.getFileListBySetId(fileSetId);

    const { fileName, fileIndex } = options;

    let targetFile: any;
    let file: any;

    const allFolder = result.fileLists;

    // eslint-disable-next-line no-labels
    searchLoop: for (const folder of allFolder) {
      const fileList = folder.fileList;
      for (let i = 0; i < fileList.length; i++) {
        file = fileList[i];

        if (fileName !== undefined && file.name === fileName) {
          targetFile = file;
          // eslint-disable-next-line no-labels
          break searchLoop;
        }

        if (fileIndex !== undefined && i === fileIndex) {
          targetFile = file;
          // eslint-disable-next-line no-labels
          break searchLoop;
        }
      }
    }
    if (targetFile === undefined) {
      this.context.logger.logError('[Flash] 未找到对应文件！！');
      return {
        result: -1,
        errMsg: '未找到对应文件',
        transferUrl: '',
      };
    } else {
      this.context.logger.log('[Flash] 找到对应文件，准备尝试获取传输链接');
      const res = await flashService.startFileTransferUrl(targetFile);
      return {
        result: 0,
        errMsg: '',
        transferUrl: res.url,
      };
    }
  }
}
