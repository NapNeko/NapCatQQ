import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';
import { StreamPacket, StreamStatus } from './StreamBasic';
import fs from 'fs';
import { join as joinPath } from 'node:path';
import { randomUUID, createHash } from 'crypto';

import { unlink } from 'node:fs';

// 简化配置
const CONFIG = {
  TIMEOUT: 10 * 60 * 1000,           // 10分钟超时
  MEMORY_THRESHOLD: 10 * 1024 * 1024, // 10MB，超过使用磁盘
  MEMORY_LIMIT: 100 * 1024 * 1024,     // 100MB内存总限制
} as const;

export const UploadFileStreamPayloadSchema = Type.Object({
  stream_id: Type.String({ description: '流 ID' }),
  chunk_data: Type.Optional(Type.String({ description: '分块数据 (Base64)' })),
  chunk_index: Type.Optional(Type.Number({ description: '分块索引' })),
  total_chunks: Type.Optional(Type.Number({ description: '总分块数' })),
  file_size: Type.Optional(Type.Number({ description: '文件总大小' })),
  expected_sha256: Type.Optional(Type.String({ description: '期望的 SHA256' })),
  is_complete: Type.Optional(Type.Boolean({ description: '是否完成' })),
  filename: Type.Optional(Type.String({ description: '文件名' })),
  reset: Type.Optional(Type.Boolean({ description: '是否重置' })),
  verify_only: Type.Optional(Type.Boolean({ description: '是否仅验证' })),
  file_retention: Type.Number({ default: 5 * 60 * 1000, description: '文件保留时间 (毫秒)' }), // 默认5分钟 回收 不设置或0为不回收
});

export type UploadFileStreamPayload = Static<typeof UploadFileStreamPayloadSchema>;

// 简化流状态接口
interface StreamState {
  id: string;
  filename: string;
  totalChunks: number;
  receivedChunks: number;
  missingChunks: Set<number>;

  // 可选属性
  fileSize?: number;
  expectedSha256?: string;

  // 存储策略
  useMemory: boolean;
  memoryChunks?: Map<number, Buffer>;
  tempDir?: string;
  finalPath?: string;
  fileRetention?: number;

  // 管理
  createdAt: number;
  timeoutId: NodeJS.Timeout;
}

interface StreamResult {
  stream_id: string;
  status: 'file_created' | 'chunk_received' | 'file_complete';
  received_chunks: number;
  total_chunks: number;
  file_path?: string;
  file_size?: number;
  sha256?: string;
}

export class UploadFileStream extends OneBotAction<UploadFileStreamPayload, StreamPacket<StreamResult>> {
  override actionName = ActionName.UploadFileStream;
  override payloadSchema = UploadFileStreamPayloadSchema;
  override returnSchema = Type.Any({ description: '上传结果 (流式)' });
  override useStream = true;

  private static streams = new Map<string, StreamState>();
  private static memoryUsage = 0;

  async _handle (payload: UploadFileStreamPayload, _adaptername: string, _config: NetworkAdapterConfig): Promise<StreamPacket<StreamResult>> {
    const { stream_id, reset, verify_only } = payload;

    if (reset) {
      this.cleanupStream(stream_id);
      throw new Error('Stream reset completed');
    }

    if (verify_only) {
      const stream = UploadFileStream.streams.get(stream_id);
      if (!stream) throw new Error('Stream not found');
      return this.getStreamStatus(stream);
    }

    const stream = this.getOrCreateStream(payload);

    if (payload.chunk_data && payload.chunk_index !== undefined) {
      return await this.processChunk(stream, payload.chunk_data, payload.chunk_index);
    }

    if (payload.is_complete || stream.receivedChunks === stream.totalChunks) {
      return await this.completeStream(stream);
    }

    return this.getStreamStatus(stream);
  }

  private getOrCreateStream (payload: UploadFileStreamPayload): StreamState {
    let stream = UploadFileStream.streams.get(payload.stream_id);

    if (!stream) {
      if (!payload.total_chunks) {
        throw new Error('total_chunks required for new stream');
      }
      stream = this.createStream(payload);
    }

    return stream;
  }

  private createStream (payload: UploadFileStreamPayload): StreamState {
    const { stream_id, total_chunks, file_size, filename, expected_sha256 } = payload;

    const useMemory = this.shouldUseMemory(file_size);
    if (useMemory && file_size && (UploadFileStream.memoryUsage + file_size) > CONFIG.MEMORY_LIMIT) {
      throw new Error('Memory limit exceeded');
    }

    const stream: StreamState = {
      id: stream_id,
      filename: filename || `upload_${randomUUID()}`,
      totalChunks: total_chunks!,
      receivedChunks: 0,
      missingChunks: new Set(Array.from({ length: total_chunks! }, (_, i) => i)),
      fileSize: file_size,
      expectedSha256: expected_sha256,
      useMemory,
      createdAt: Date.now(),
      timeoutId: this.setupTimeout(stream_id),
      fileRetention: payload.file_retention,
    };
    try {
      if (useMemory) {
        stream.memoryChunks = new Map();
        if (file_size) UploadFileStream.memoryUsage += file_size;
      } else {
        this.setupDiskStorage(stream);
      }

      UploadFileStream.streams.set(stream_id, stream);
      return stream;
    } catch (error) {
      // 如果设置存储失败，清理已创建的资源
      clearTimeout(stream.timeoutId);
      if (stream.tempDir && fs.existsSync(stream.tempDir)) {
        try {
          fs.rmSync(stream.tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.error('Failed to cleanup temp dir during creation error:', cleanupError);
        }
      }
      throw error;
    }
  }

  private shouldUseMemory (fileSize?: number): boolean {
    return fileSize !== undefined && fileSize <= CONFIG.MEMORY_THRESHOLD;
  }

  private setupDiskStorage (stream: StreamState): void {
    const tempDir = joinPath(this.core.NapCatTempPath, `upload_${stream.id}`);
    const finalPath = joinPath(this.core.NapCatTempPath, stream.filename);

    fs.mkdirSync(tempDir, { recursive: true });

    stream.tempDir = tempDir;
    stream.finalPath = finalPath;
  }

  private setupTimeout (streamId: string): NodeJS.Timeout {
    return setTimeout(() => {
      console.log(`Stream ${streamId} timeout`);
      this.cleanupStream(streamId);
    }, CONFIG.TIMEOUT);
  }

  private async processChunk (stream: StreamState, chunkData: string, chunkIndex: number): Promise<StreamPacket<StreamResult>> {
    // 验证索引
    if (chunkIndex < 0 || chunkIndex >= stream.totalChunks) {
      throw new Error(`Invalid chunk index: ${chunkIndex}`);
    }

    // 检查重复
    if (!stream.missingChunks.has(chunkIndex)) {
      return this.getStreamStatus(stream);
    }

    const buffer = Buffer.from(chunkData, 'base64');

    // 存储分片
    if (stream.useMemory) {
      stream.memoryChunks!.set(chunkIndex, buffer);
    } else {
      const chunkPath = joinPath(stream.tempDir!, `${chunkIndex}.chunk`);
      await fs.promises.writeFile(chunkPath, buffer);
    }

    // 更新状态
    stream.missingChunks.delete(chunkIndex);
    stream.receivedChunks++;
    this.refreshTimeout(stream);

    return {
      type: StreamStatus.Stream,
      stream_id: stream.id,
      status: 'chunk_received',
      received_chunks: stream.receivedChunks,
      total_chunks: stream.totalChunks,
    };
  }

  private refreshTimeout (stream: StreamState): void {
    clearTimeout(stream.timeoutId);
    stream.timeoutId = this.setupTimeout(stream.id);
  }

  private getStreamStatus (stream: StreamState): StreamPacket<StreamResult> {
    return {
      type: StreamStatus.Stream,
      stream_id: stream.id,
      status: 'file_created',
      received_chunks: stream.receivedChunks,
      total_chunks: stream.totalChunks,
    };
  }

  private async completeStream (stream: StreamState): Promise<StreamPacket<StreamResult>> {
    // 合并分片
    const finalBuffer = stream.useMemory
      ? await this.mergeMemoryChunks(stream)
      : await this.mergeDiskChunks(stream);

    // 验证SHA256
    const sha256 = this.validateSha256(stream, finalBuffer);

    // 保存文件
    const finalPath = stream.finalPath || joinPath(this.core.NapCatTempPath, stream.filename);
    await fs.promises.writeFile(finalPath, finalBuffer);

    // 清理资源但保留文件
    this.cleanupStream(stream.id, false);
    if (stream.fileRetention && stream.fileRetention > 0) {
      setTimeout(() => {
        unlink(finalPath, err => {
          if (err) this.core.context.logger.logError(`Failed to delete retained file ${finalPath}:`, err);
        });
      }, stream.fileRetention);
    }
    return {
      type: StreamStatus.Response,
      stream_id: stream.id,
      status: 'file_complete',
      received_chunks: stream.receivedChunks,
      total_chunks: stream.totalChunks,
      file_path: finalPath,
      file_size: finalBuffer.length,
      sha256,
    };
  }

  private async mergeMemoryChunks (stream: StreamState): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for (let i = 0; i < stream.totalChunks; i++) {
      const chunk = stream.memoryChunks!.get(i);
      if (!chunk) throw new Error(`Missing memory chunk ${i}`);
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  private async mergeDiskChunks (stream: StreamState): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for (let i = 0; i < stream.totalChunks; i++) {
      const chunkPath = joinPath(stream.tempDir!, `${i}.chunk`);
      if (!fs.existsSync(chunkPath)) throw new Error(`Missing chunk file ${i}`);
      chunks.push(await fs.promises.readFile(chunkPath));
    }
    return Buffer.concat(chunks);
  }

  private validateSha256 (stream: StreamState, buffer: Buffer): string | undefined {
    if (!stream.expectedSha256) return undefined;

    const actualSha256 = createHash('sha256').update(buffer).digest('hex');
    if (actualSha256 !== stream.expectedSha256) {
      throw new Error(`SHA256 mismatch. Expected: ${stream.expectedSha256}, Got: ${actualSha256}`);
    }
    return actualSha256;
  }

  private cleanupStream (streamId: string, deleteFinalFile = true): void {
    const stream = UploadFileStream.streams.get(streamId);
    if (!stream) return;

    try {
      // 清理超时
      clearTimeout(stream.timeoutId);

      // 清理内存
      if (stream.useMemory) {
        if (stream.fileSize) {
          UploadFileStream.memoryUsage = Math.max(0, UploadFileStream.memoryUsage - stream.fileSize);
        }
        stream.memoryChunks?.clear();
      }

      // 清理临时文件夹及其所有内容
      if (stream.tempDir) {
        try {
          if (fs.existsSync(stream.tempDir)) {
            fs.rmSync(stream.tempDir, { recursive: true, force: true });
            console.log(`Cleaned up temp directory: ${stream.tempDir}`);
          }
        } catch (error) {
          console.error(`Failed to cleanup temp directory ${stream.tempDir}:`, error);
        }
      }

      // 删除最终文件（如果需要）
      if (deleteFinalFile && stream.finalPath) {
        try {
          if (fs.existsSync(stream.finalPath)) {
            fs.unlinkSync(stream.finalPath);
            console.log(`Deleted final file: ${stream.finalPath}`);
          }
        } catch (error) {
          console.error(`Failed to delete final file ${stream.finalPath}:`, error);
        }
      }
    } catch (error) {
      console.error(`Cleanup error for stream ${streamId}:`, error);
    } finally {
      UploadFileStream.streams.delete(streamId);
      console.log(`Stream ${streamId} cleaned up`);
    }
  }
}
