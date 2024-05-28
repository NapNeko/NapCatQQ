import BaseAction from '../BaseAction';
import fs from 'fs/promises';
import { dbUtil } from '@/common/utils/db';
import { ob11Config } from '@/onebot11/config';
import { log, logDebug } from '@/common/utils/log';
import { sleep } from '@/common/utils/helper';
import { uri2local } from '@/common/utils/file';
import { ActionName, BaseCheckResult } from '../types';
import { FileElement, RawMessage, VideoElement } from '@/core/entities';
import { NTQQFileApi } from '@/core/apis';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import Ajv from 'ajv';

export interface GetFilePayload {
  file: string; // 文件名或者fileUuid
}

export interface GetFileResponse {
  file?: string;  // path
  url?: string;
  file_size?: string;
  file_name?: string;
  base64?: string;
}
const GetFileBase_PayloadSchema = {
  type: 'object',
  properties: {
    file: { type: 'string' }
  },
  required: ['file']
} as const satisfies JSONSchema;

export class GetFileBase extends BaseAction<GetFilePayload, GetFileResponse> {
  PayloadSchema: any = GetFileBase_PayloadSchema;
  private getElement(msg: RawMessage): { id: string, element: VideoElement | FileElement } {
    let element = msg.elements.find(e => e.fileElement);
    if (!element) {
      element = msg.elements.find(e => e.videoElement);
      if (element) {
        return { id: element.elementId, element: element.videoElement };
      } else {
        throw new Error('找不到文件');
      }
    }
    return { id: element.elementId, element: element.fileElement };
  }
  protected async _handle(payload: GetFilePayload): Promise<GetFileResponse> {
    let cache = await dbUtil.getFileCacheByName(payload.file);
    if (!cache) {
      cache = await dbUtil.getFileCacheByUuid(payload.file);
    }
    if (!cache) {
      throw new Error('file not found');
    }
    const { enableLocalFile2Url } = ob11Config;
    try {
      await fs.access(cache.path, fs.constants.F_OK);
    } catch (e) {
      logDebug('local file not found, start download...');
      // if (cache.url) {
      //   const downloadResult = await uri2local(cache.url);
      //   if (downloadResult.success) {
      //     cache.path = downloadResult.path;
      //     dbUtil.updateFileCache(cache).then();
      //   } else {
      //     throw new Error('file download failed. ' + downloadResult.errMsg);
      //   }
      // } else {
      //   // 没有url的可能是私聊文件或者群文件，需要自己下载
      //   log('需要调用 NTQQ 下载文件api');
      let msg = await dbUtil.getMsgByLongId(cache.msgId);
      // log('文件 msg', msg);
      if (msg) {
        // 构建下载函数
        const downloadPath = await NTQQFileApi.downloadMedia(msg.msgId, msg.chatType, msg.peerUid,
          cache.elementId, '', '');
        // await sleep(1000);

        // log('download result', downloadPath);
        msg = await dbUtil.getMsgByLongId(cache.msgId);
        // log('下载完成后的msg', msg);
        cache.path = downloadPath!;
        dbUtil.updateFileCache(cache).then();
        // log('下载完成后的msg', msg);
        // }
      }

    }
    // log('file found', cache);
    const res: GetFileResponse = {
      file: cache.path,
      url: cache.url,
      file_size: cache.size.toString(),
      file_name: cache.name
    };
    if (enableLocalFile2Url) {
      if (!cache.url) {
        try {
          res.base64 = await fs.readFile(cache.path, 'base64');
        } catch (e) {
          throw new Error('文件下载失败. ' + e);
        }
      }
    }
    // if (autoDeleteFile) {
    //     setTimeout(() => {
    //         fs.unlink(cache.filePath)
    //     }, autoDeleteFileSecond * 1000)
    // }
    return res;
  }
}

const GetFile_PayloadSchema = {
  type: 'object',
  properties: {
    file_id: { type: 'string' },
    file: { type: 'string' }
  },
  required: ['file_id']
} as const satisfies JSONSchema;

type GetFile_Payload_Internal = FromSchema<typeof GetFile_PayloadSchema>;

interface GetFile_Payload extends GetFile_Payload_Internal {
  file: string
}

export default class GetFile extends GetFileBase {
  actionName = ActionName.GetFile;
  PayloadSchema = GetFile_PayloadSchema;
  protected async _handle(payload: GetFile_Payload): Promise<GetFileResponse> {
    payload.file = payload.file_id;
    return super._handle(payload);
  }
}
