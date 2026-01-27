import { InstanceContext, NapCatCore } from '@/napcat-core';
import { Peer } from '@/napcat-core/types';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { GeneralCallResultStatus } from '@/napcat-core/services/common';
import { sleep } from '@/napcat-common/src/helper';

const normalizePath = (p: string) => path.normalize(p).toLowerCase();

export class NTQQOnlineApi {
  context: InstanceContext;
  core: NapCatCore;

  constructor (context: InstanceContext, core: NapCatCore) {
    this.context = context;
    this.core = core;
  }

  /**
   * 这里不等待node返回，因为the fuck wrapper.node 根本不返回（会卡死不知道为什么）！！！  只能手动查询判断死活
   * @param peer
   * @param filePath
   * @param fileName
   */
  async sendOnlineFile (peer: Peer, filePath: string, fileName: string): Promise<any> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`[NapCat] 文件不存在: ${filePath}`);
    }
    const actualFileName = fileName || path.basename(filePath);
    const fileSize = fs.statSync(filePath).size.toString();

    const fileElementToSend = [{
      elementType: 23,
      elementId: '',
      fileElement: {
        fileName: actualFileName,
        filePath,
        fileSize,
      },
    }];

    const msgService = this.context.session.getMsgService();
    const startTime = Math.floor(Date.now() / 1000) - 2; // 容错时间窗口

    msgService.sendMsg('0', peer, fileElementToSend, new Map()).catch((_e: any) => {
    });

    const maxRetries = 10;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      await sleep(1000);
      retryCount++;

      try {
        const msgListResult = await msgService.getOnlineFileMsgs(peer);

        const msgs = msgListResult?.msgList || [];

        const foundMsg = msgs.find((msg: any) => {
          if (parseInt(msg.msgTime) < startTime) return false;

          const validElement = msg.elements.find((el: any) => {
            if (el.elementType !== 23 || !el.fileElement) return false;

            const isNameMatch = el.fileElement.fileName === actualFileName;
            const isPathMatch = normalizePath(el.fileElement.filePath) === normalizePath(filePath);

            return isNameMatch && isPathMatch;
          });

          return !!validElement;
        });

        if (foundMsg) {
          const targetElement = foundMsg.elements.find((el: any) => el.elementType === 23);
          this.context.logger.log('[OnlineFile] 在线文件发送成功！');
          return {
            result: GeneralCallResultStatus.OK,
            errMsg: '',
            msgId: foundMsg.msgId,
            elementId: targetElement?.elementId || '',
          };
        }
      } catch (_e) {
      }
    }
    this.context.logger.logError('[OnlineFile] 在线文件发送失败！！！');
    return {
      result: GeneralCallResultStatus.ERROR,
      errMsg: '[NapCat] Send Online File Timeout: Message not found in history.',
    };
  }

  /**
   * 发送在线文件夹
   * @param peer
   * @param folderPath
   * @param folderName
   */
  async sendOnlineFolder (peer: Peer, folderPath: string, folderName?: string): Promise<any> {
    const actualFolderName = folderName || path.basename(folderPath);

    if (!fs.existsSync(folderPath)) {
      return { result: GeneralCallResultStatus.ERROR, errMsg: `Folder not found: ${folderPath}` };
    }

    if (!fs.statSync(folderPath).isDirectory()) {
      return { result: GeneralCallResultStatus.ERROR, errMsg: `Path is not a directory: ${folderPath}` };
    }
    const folderElementItem = {
      elementType: 30,
      elementId: '',
      fileElement: {
        fileName: actualFolderName,
        filePath: folderPath,
        fileSize: "",
      },
    };

    const msgService = this.context.session.getMsgService();
    const startTime = Math.floor(Date.now() / 1000) - 2;
    msgService.sendMsg('0', peer, [folderElementItem], new Map()).catch((_e: any) => {

    });

    const maxRetries = 10;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      await sleep(1000);
      retryCount++;

      try {
        const msgListResult = await msgService.getOnlineFileMsgs(peer);
        const msgs = msgListResult?.msgList || [];

        const foundMsg = msgs.find((msg: any) => {
          if (parseInt(msg.msgTime) < startTime) return false;

          const validElement = msg.elements.find((el: any) => {
            if (el.elementType !== 30 || !el.fileElement) return false;

            const isNameMatch = el.fileElement.fileName === actualFolderName;
            const isPathMatch = normalizePath(el.fileElement.filePath) === normalizePath(folderPath);

            return isNameMatch && isPathMatch;
          });
          return !!validElement;
        });

        if (foundMsg) {
          const targetElement = foundMsg.elements.find((el: any) => el.elementType === 30);
          this.context.logger.log('[OnlineFile] 在线文件夹发送成功！');
          return {
            result: GeneralCallResultStatus.OK,
            errMsg: '',
            msgId: foundMsg.msgId,
            elementId: targetElement?.elementId || '',
          };
        }
      } catch (_e) {

      }
    }
    this.context.logger.logError('[OnlineFile] 在线文件发送失败!!!');
    return {
      result: GeneralCallResultStatus.ERROR,
      errMsg: '[NapCat] Send Online Folder Timeout: Message not found in history.',
    };
  }

  /**
   * 获取好友的在线文件消息
   * @param peer
   */
  async getOnlineFileMsg (peer: Peer): Promise<any> {
    const msgService = this.context.session.getMsgService();
    return await msgService.getOnlineFileMsgs(peer);
  }

  /**
   * 取消在线文件的发送
   * @param peer
   * @param msgId
   */
  async cancelMyOnlineFileMsg (peer: Peer, msgId: string): Promise<void> {
    const msgService = this.context.session.getMsgService();
    await msgService.cancelSendMsg(peer, msgId);
  }

  /**
   * 拒绝接收在线文件
   * @param peer
   * @param msgId
   * @param elementId
   */
  async refuseOnlineFileMsg (peer: Peer, msgId: string, elementId: string): Promise<void> {
    const msgService = this.context.session.getMsgService();
    const arrToSend = {
      msgId,
      peerUid: peer.peerUid,
      chatType: 1,
      elementId,
      downloadType: 1,
      downSourceType: 1,
    };

    await msgService.refuseGetRichMediaElement(arrToSend);
  }

  /**
   * 接收在线文件/文件夹
   * @param peer
   * @param msgId
   * @param elementId
   * @constructor
   */
  async receiveOnlineFileOrFolder (peer: Peer, msgId: string, elementId: string): Promise<any> {
    const msgService = this.context.session.getMsgService();
    const arrToSend = {
      msgId,
      peerUid: peer.peerUid,
      chatType: 1,
      elementId,
      downSourceType: 1,
      downloadType: 1,
    };
    return await msgService.getRichMediaElement(arrToSend);
  }

  /**
   * 在线文件/文件夹转离线
   * @param peer
   * @param msgId
   */
  async switchFileToOffline (peer: Peer, msgId: string): Promise<void> {
    const msgService = this.context.session.getMsgService();
    await msgService.switchToOfflineSendMsg(peer, msgId);
  }
}
