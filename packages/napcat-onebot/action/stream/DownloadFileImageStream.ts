import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotRequestToolkit } from '@/napcat-onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';
import { StreamPacket, StreamStatus } from './StreamBasic';
import fs from 'fs';
import { imageSizeFallBack } from 'napcat-image-size';
import { BaseDownloadStream, DownloadResult } from './BaseDownloadStream';

export const DownloadFileImageStreamPayloadSchema = Type.Object({
  file: Type.Optional(Type.String({ description: '文件路径或 URL' })),
  file_id: Type.Optional(Type.String({ description: '文件 ID' })),
  chunk_size: Type.Optional(Type.Number({ default: 64 * 1024, description: '分块大小 (字节)' })), // 默认64KB分块
});

export type DownloadFileImageStreamPayload = Static<typeof DownloadFileImageStreamPayloadSchema>;

export class DownloadFileImageStream extends BaseDownloadStream<DownloadFileImageStreamPayload, DownloadResult> {
  override actionName = ActionName.DownloadFileImageStream;
  override actionSummary = '下载图片文件流';
  override actionTags = ['流式传输扩展'];
  override payloadExample = {
    file: 'image_file_id'
  };
  override returnExample = {
    file: 'temp_image_path'
  };
  override payloadSchema = DownloadFileImageStreamPayloadSchema;
  override returnSchema = Type.Any({ description: '下载结果 (流式)' });
  override useStream = true;

  async _handle (payload: DownloadFileImageStreamPayload, _adaptername: string, _config: NetworkAdapterConfig, req: OneBotRequestToolkit): Promise<StreamPacket<DownloadResult>> {
    try {
      payload.file ||= payload.file_id || '';
      const chunkSize = payload.chunk_size || 64 * 1024;

      const { downloadPath, fileName, fileSize } = await this.resolveDownload(payload.file);

      const stats = await fs.promises.stat(downloadPath);
      const totalSize = fileSize || stats.size;
      const { width, height } = await imageSizeFallBack(downloadPath);

      // 发送文件信息（与 DownloadFileStream 对齐，但包含宽高）
      await req.send({
        type: StreamStatus.Stream,
        data_type: 'file_info',
        file_name: fileName,
        file_size: totalSize,
        chunk_size: chunkSize,
        width,
        height,
      });

      const { totalChunks, totalBytes } = await this.streamFileChunks(req, downloadPath, chunkSize, 'file_chunk');

      // 返回完成状态（与 DownloadFileStream 对齐）
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
