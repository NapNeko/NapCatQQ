import { OneBotAction, OneBotRequestToolkit } from '@/napcat-onebot/action/OneBotAction';
import { StreamPacket, StreamStatus } from './StreamBasic';
import fs from 'fs';
import { FileNapCatOneBotUUID } from 'napcat-common/src/file-uuid';

export interface ResolvedFileInfo {
  downloadPath: string;
  fileName: string;
  fileSize: number;
}

export interface DownloadResult {
  // 文件信息
  file_name?: string;
  file_size?: number;
  chunk_size?: number;

  // 分片数据
  index?: number;
  data?: string;
  size?: number;
  progress?: number;
  base64_size?: number;

  // 完成信息
  total_chunks?: number;
  total_bytes?: number;
  message?: string;
  data_type?: 'file_info' | 'file_chunk' | 'file_complete';

  // 可选扩展字段
  width?: number;
  height?: number;
  out_format?: string;
}

export abstract class BaseDownloadStream<PayloadType, ResultType> extends OneBotAction<PayloadType, StreamPacket<ResultType>> {
  protected async resolveDownload (file?: string): Promise<ResolvedFileInfo> {
    const target = file || '';
    let downloadPath = '';
    let fileName = '';
    let fileSize = 0;

    const contextMsgFile = FileNapCatOneBotUUID.decode(target);
    if (contextMsgFile && contextMsgFile.msgId && contextMsgFile.elementId) {
      const { peer, msgId, elementId } = contextMsgFile;
      downloadPath = await this.core.apis.FileApi.downloadMedia(msgId, peer.chatType, peer.peerUid, elementId, '', '');
      const rawMessage = (await this.core.apis.MsgApi.getMsgsByMsgId(peer, [msgId]))?.msgList
        .find(msg => msg.msgId === msgId);
      const mixElement = rawMessage?.elements.find(e => e.elementId === elementId);
      const mixElementInner = mixElement?.videoElement ?? mixElement?.fileElement ?? mixElement?.pttElement ?? mixElement?.picElement;
      if (!mixElementInner) throw new Error('element not found');
      fileSize = parseInt(mixElementInner.fileSize?.toString() ?? '0');
      fileName = mixElementInner.fileName ?? '';
      return { downloadPath, fileName, fileSize };
    }

    const contextModelIdFile = FileNapCatOneBotUUID.decodeModelId(target);
    if (contextModelIdFile && contextModelIdFile.modelId) {
      const { peer, modelId } = contextModelIdFile;
      downloadPath = await this.core.apis.FileApi.downloadFileForModelId(peer, modelId, '');
      return { downloadPath, fileName, fileSize };
    }

    const searchResult = (await this.core.apis.FileApi.searchForFile([target]));
    if (searchResult) {
      downloadPath = await this.core.apis.FileApi.downloadFileById(searchResult.id, parseInt(searchResult.fileSize));
      fileSize = parseInt(searchResult.fileSize);
      fileName = searchResult.fileName;
      return { downloadPath, fileName, fileSize };
    }

    throw new Error('file not found');
  }

  protected async streamFileChunks (req: OneBotRequestToolkit, streamPath: string, chunkSize: number, chunkDataType: string): Promise<{ totalChunks: number; totalBytes: number }> {
    const stats = await fs.promises.stat(streamPath);
    const totalSize = stats.size;
    const readStream = fs.createReadStream(streamPath, { highWaterMark: chunkSize });
    let chunkIndex = 0;
    let bytesRead = 0;
    for await (const chunk of readStream) {
      const base64Chunk = (chunk as Buffer).toString('base64');
      bytesRead += (chunk as Buffer).length;
      await req.send({
        type: StreamStatus.Stream,
        data_type: chunkDataType,
        index: chunkIndex,
        data: base64Chunk,
        size: (chunk as Buffer).length,
        progress: Math.round((bytesRead / totalSize) * 100),
        base64_size: base64Chunk.length,
      } as unknown as StreamPacket<any>);
      chunkIndex++;
    }
    return { totalChunks: chunkIndex, totalBytes: bytesRead };
  }
}
