import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotRequestToolkit } from '@/napcat-onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';
import { StreamPacket, StreamStatus } from './StreamBasic';
import fs from 'fs';
import { BaseDownloadStream, DownloadResult } from './BaseDownloadStream';
const DownloadFileStreamPayloadSchema = Type.Object({
  file: Type.Optional(Type.String({ description: '文件路径或 URL' })),
  file_id: Type.Optional(Type.String({ description: '文件 ID' })),
  chunk_size: Type.Optional(Type.Number({ default: 64 * 1024, description: '分块大小 (字节)' })), // 默认64KB分块
});

export type DownloadFileStreamPayload = Static<typeof DownloadFileStreamPayloadSchema>;

export class DownloadFileStream extends BaseDownloadStream<DownloadFileStreamPayload, DownloadResult> {
  override actionName = ActionName.DownloadFileStream;
  override payloadSchema = DownloadFileStreamPayloadSchema;
  override returnSchema = Type.Any({ description: '下载结果 (流式)' });
  override actionSummary = '下载文件流';
  override actionDescription = '以流式方式从网络或本地下载文件';
  override actionTags = ['流式接口'];
  override useStream = true;

  async _handle (payload: DownloadFileStreamPayload, _adaptername: string, _config: NetworkAdapterConfig, req: OneBotRequestToolkit): Promise<StreamPacket<DownloadResult>> {
    try {
      payload.file ||= payload.file_id || '';
      const chunkSize = payload.chunk_size || 64 * 1024;

      const { downloadPath, fileName, fileSize } = await this.resolveDownload(payload.file);

      const stats = await fs.promises.stat(downloadPath);
      const totalSize = fileSize || stats.size;

      await req.send({
        type: StreamStatus.Stream,
        data_type: 'file_info',
        file_name: fileName,
        file_size: totalSize,
        chunk_size: chunkSize,
      });

      const { totalChunks, totalBytes } = await this.streamFileChunks(req, downloadPath, chunkSize, 'file_chunk');

      return {
        type: StreamStatus.Response,
        data_type: 'file_complete',
        total_chunks: totalChunks,
        total_bytes: totalBytes,
        message: 'Download completed',
      };
    } catch (error) {
      throw new Error(`Download failed: ${(error as Error).message}`);
    }
  }
}
