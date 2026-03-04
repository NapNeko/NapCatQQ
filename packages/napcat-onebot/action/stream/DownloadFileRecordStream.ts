import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotRequestToolkit } from '@/napcat-onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';
import { StreamPacket, StreamStatus } from './StreamBasic';
import fs from 'fs';
import { FFmpegService } from '@/napcat-core/helper/ffmpeg/ffmpeg';
import { BaseDownloadStream, DownloadResult } from './BaseDownloadStream';

const out_format = ['mp3', 'amr', 'wma', 'm4a', 'spx', 'ogg', 'wav', 'flac'];

export const DownloadFileRecordStreamPayloadSchema = Type.Object({
  file: Type.Optional(Type.String({ description: '文件路径或 URL' })),
  file_id: Type.Optional(Type.String({ description: '文件 ID' })),
  chunk_size: Type.Optional(Type.Number({ default: 64 * 1024, description: '分块大小 (字节)' })), // 默认64KB分块
  out_format: Type.Optional(Type.String({ description: '输出格式' })),
});

export type DownloadFileRecordStreamPayload = Static<typeof DownloadFileRecordStreamPayloadSchema>;

export class DownloadFileRecordStream extends BaseDownloadStream<DownloadFileRecordStreamPayload, DownloadResult> {
  override actionName = ActionName.DownloadFileRecordStream;
  override actionSummary = '下载语音文件流';
  override actionTags = ['流式传输扩展'];
  override payloadExample = {
    file: 'record_file_id'
  };
  override returnExample = {
    file: 'temp_record_path'
  };
  override payloadSchema = DownloadFileRecordStreamPayloadSchema;
  override returnSchema = Type.Any({ description: '下载结果 (流式)' });
  override useStream = true;

  async _handle (payload: DownloadFileRecordStreamPayload, _adaptername: string, _config: NetworkAdapterConfig, req: OneBotRequestToolkit): Promise<StreamPacket<DownloadResult>> {
    try {
      payload.file ||= payload.file_id || '';
      const chunkSize = payload.chunk_size || 64 * 1024;

      const { downloadPath, fileName, fileSize } = await this.resolveDownload(payload.file);

      // 处理输出格式转换
      let streamPath = downloadPath;
      if (payload.out_format && typeof payload.out_format === 'string') {
        if (!out_format.includes(payload.out_format)) {
          throw new Error('转换失败 out_format 字段可能格式不正确');
        }

        const outputFile = `${downloadPath}.${payload.out_format}`;

        try {
          // 如果已存在目标文件则跳过转换
          await fs.promises.access(outputFile);
          streamPath = outputFile;
        } catch {
          // 尝试解码 amr 到 out format直接 ffmpeg 转换
          await FFmpegService.convertAudioFmt(downloadPath, outputFile, payload.out_format);
          streamPath = outputFile;
        }
      }

      const stats = await fs.promises.stat(streamPath);
      const totalSize = fileSize || stats.size;

      await req.send({
        type: StreamStatus.Stream,
        data_type: 'file_info',
        file_name: fileName,
        file_size: totalSize,
        chunk_size: chunkSize,
        out_format: payload.out_format,
      });

      const { totalChunks, totalBytes } = await this.streamFileChunks(req, streamPath, chunkSize, 'file_chunk');

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
