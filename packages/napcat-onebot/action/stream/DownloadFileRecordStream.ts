import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotRequestToolkit } from '@/napcat-onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';
import { StreamPacket, StreamStatus } from './StreamBasic';
import fs from 'fs';
import { decode } from 'silk-wasm';
import { FFmpegService } from 'napcat-common/src/ffmpeg';
import { BaseDownloadStream, DownloadResult } from './BaseDownloadStream';

const out_format = ['mp3', 'amr', 'wma', 'm4a', 'spx', 'ogg', 'wav', 'flac'];

const SchemaData = Type.Object({
  file: Type.Optional(Type.String()),
  file_id: Type.Optional(Type.String()),
  chunk_size: Type.Optional(Type.Number({ default: 64 * 1024 })), // 默认64KB分块
  out_format: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;

export class DownloadFileRecordStream extends BaseDownloadStream<Payload, DownloadResult> {
  override actionName = ActionName.DownloadFileRecordStream;
  override payloadSchema = SchemaData;
  override useStream = true;

  async _handle (payload: Payload, _adaptername: string, _config: NetworkAdapterConfig, req: OneBotRequestToolkit): Promise<StreamPacket<DownloadResult>> {
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

        const pcmFile = `${downloadPath}.pcm`;
        const outputFile = `${downloadPath}.${payload.out_format}`;

        try {
          // 如果已存在目标文件则跳过转换
          await fs.promises.access(outputFile);
          streamPath = outputFile;
        } catch {
          // 尝试解码 silk 到 pcm 再用 ffmpeg 转换
          if (FFmpegService.getAdapterName() === 'FFmpegAddon') {
            await FFmpegService.convertFile(downloadPath, outputFile, payload.out_format);
          } else {
            await this.decodeFile(downloadPath, pcmFile);
            await FFmpegService.convertFile(pcmFile, outputFile, payload.out_format);
          }
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

  private async decodeFile (inputFile: string, outputFile: string): Promise<void> {
    try {
      const inputData = await fs.promises.readFile(inputFile);
      const decodedData = await decode(inputData, 24000);
      await fs.promises.writeFile(outputFile, Buffer.from(decodedData.data));
    } catch (error) {
      console.error('Error decoding file:', error);
      throw error;
    }
  }
}
