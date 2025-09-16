import { ActionName } from '@/onebot/action/router';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import fs from 'fs';
import { join as joinPath } from 'node:path';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';

// 简化配置
const CONFIG = {
    TIMEOUT: 10 * 60 * 1000,           // 10分钟超时
    MEMORY_THRESHOLD: 10 * 1024 * 1024, // 10MB，超过使用磁盘
    MEMORY_LIMIT: 100 * 1024 * 1024     // 100MB内存总限制
} as const;

const SchemaData = Type.Object({
    stream_id: Type.String(),
    chunk_data: Type.Optional(Type.String()),
    chunk_index: Type.Optional(Type.Number()),
    total_chunks: Type.Optional(Type.Number()),
    file_size: Type.Optional(Type.Number()),
    expected_sha256: Type.Optional(Type.String()),
    is_complete: Type.Optional(Type.Boolean()),
    filename: Type.Optional(Type.String()),
    reset: Type.Optional(Type.Boolean()),
    verify_only: Type.Optional(Type.Boolean())
});

type Payload = Static<typeof SchemaData>;

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

    // 管理
    createdAt: number;
    timeoutId: NodeJS.Timeout;
}

interface StreamResult {
    stream_id: string;
    status: 'receiving' | 'completed' | 'error' | 'ready';
    received_chunks: number;
    total_chunks?: number;
    missing_chunks?: number[];
    file_path?: string;
    file_size?: number;
    sha256?: string;
    message?: string;
}

export class UploadFileStream extends OneBotAction<Payload, StreamResult> {
    override actionName = ActionName.UploadFileStream;
    override payloadSchema = SchemaData;

    private static streams = new Map<string, StreamState>();
    private static memoryUsage = 0;

    async _handle(payload: Payload): Promise<StreamResult> {
        const { stream_id, reset, verify_only } = payload;

        try {
            if (reset) return this.resetStream(stream_id);
            if (verify_only) return this.verifyStream(stream_id);

            const stream = this.getOrCreateStream(payload);

            if (payload.chunk_data && payload.chunk_index !== undefined) {
                const result = await this.processChunk(stream, payload.chunk_data, payload.chunk_index);
                if (result.status === 'error') return result;
            }

            if (payload.is_complete || stream.receivedChunks === stream.totalChunks) {
                return await this.completeStream(stream);
            }

            return this.getStreamStatus(stream);

        } catch (error) {
            // 确保在任何错误情况下都清理资源
            this.cleanupStream(stream_id, true);
            return this.errorResult(stream_id, error);
        }
    }

    private resetStream(streamId: string): StreamResult {
        this.cleanupStream(streamId);
        return {
            stream_id: streamId,
            status: 'ready',
            received_chunks: 0,
            message: 'Stream reset'
        };
    }

    private verifyStream(streamId: string): StreamResult {
        const stream = UploadFileStream.streams.get(streamId);
        if (!stream) {
            return this.errorResult(streamId, new Error('Stream not found'));
        }
        return this.getStreamStatus(stream);
    }

    private getOrCreateStream(payload: Payload): StreamState {
        let stream = UploadFileStream.streams.get(payload.stream_id);

        if (!stream) {
            if (!payload.total_chunks) {
                throw new Error('total_chunks required for new stream');
            }
            stream = this.createStream(payload);
        }

        return stream;
    }

    private createStream(payload: Payload): StreamState {
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
            timeoutId: this.setupTimeout(stream_id)
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
                    console.error(`Failed to cleanup temp dir during creation error:`, cleanupError);
                }
            }
            throw error;
        }
    }

    private shouldUseMemory(fileSize?: number): boolean {
        return fileSize !== undefined && fileSize <= CONFIG.MEMORY_THRESHOLD;
    }

    private setupDiskStorage(stream: StreamState): void {
        const tempDir = joinPath(this.core.NapCatTempPath, `upload_${stream.id}`);
        const finalPath = joinPath(this.core.NapCatTempPath, stream.filename);

        fs.mkdirSync(tempDir, { recursive: true });

        stream.tempDir = tempDir;
        stream.finalPath = finalPath;
    }

    private setupTimeout(streamId: string): NodeJS.Timeout {
        return setTimeout(() => {
            console.log(`Stream ${streamId} timeout`);
            this.cleanupStream(streamId);
        }, CONFIG.TIMEOUT);
    }

    private async processChunk(stream: StreamState, chunkData: string, chunkIndex: number): Promise<StreamResult> {
        // 验证索引
        if (chunkIndex < 0 || chunkIndex >= stream.totalChunks) {
            throw new Error(`Invalid chunk index: ${chunkIndex}`);
        }

        // 检查重复
        if (!stream.missingChunks.has(chunkIndex)) {
            return this.getStreamStatus(stream, `Chunk ${chunkIndex} already received`);
        }

        try {
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

            return this.getStreamStatus(stream);

        } catch (error) {
            throw new Error(`Chunk processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private refreshTimeout(stream: StreamState): void {
        clearTimeout(stream.timeoutId);
        stream.timeoutId = this.setupTimeout(stream.id);
    }

    private getStreamStatus(stream: StreamState, message?: string): StreamResult {
        const missingChunks = Array.from(stream.missingChunks).sort();

        return {
            stream_id: stream.id,
            status: 'receiving',
            received_chunks: stream.receivedChunks,
            total_chunks: stream.totalChunks,
            missing_chunks: missingChunks.length > 0 ? missingChunks : undefined,
            file_size: stream.fileSize,
            message
        };
    }

    private async completeStream(stream: StreamState): Promise<StreamResult> {
        try {
            // 合并分片
            const finalBuffer = stream.useMemory ?
                await this.mergeMemoryChunks(stream) :
                await this.mergeDiskChunks(stream);

            // 验证SHA256
            const sha256 = this.validateSha256(stream, finalBuffer);

            // 保存文件
            const finalPath = stream.finalPath || joinPath(this.core.NapCatTempPath, stream.filename);
            await fs.promises.writeFile(finalPath, finalBuffer);

            // 清理资源但保留文件
            this.cleanupStream(stream.id, false);

            return {
                stream_id: stream.id,
                status: 'completed',
                received_chunks: stream.receivedChunks,
                total_chunks: stream.totalChunks,
                file_path: finalPath,
                file_size: finalBuffer.length,
                sha256,
                message: 'Upload completed'
            };

        } catch (error) {
            throw new Error(`Stream completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async mergeMemoryChunks(stream: StreamState): Promise<Buffer> {
        const chunks: Buffer[] = [];
        for (let i = 0; i < stream.totalChunks; i++) {
            const chunk = stream.memoryChunks!.get(i);
            if (!chunk) throw new Error(`Missing memory chunk ${i}`);
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }

    private async mergeDiskChunks(stream: StreamState): Promise<Buffer> {
        const chunks: Buffer[] = [];
        for (let i = 0; i < stream.totalChunks; i++) {
            const chunkPath = joinPath(stream.tempDir!, `${i}.chunk`);
            if (!fs.existsSync(chunkPath)) throw new Error(`Missing chunk file ${i}`);
            chunks.push(await fs.promises.readFile(chunkPath));
        }
        return Buffer.concat(chunks);
    }

    private validateSha256(stream: StreamState, buffer: Buffer): string | undefined {
        if (!stream.expectedSha256) return undefined;

        const actualSha256 = createHash('sha256').update(buffer).digest('hex');
        if (actualSha256 !== stream.expectedSha256) {
            throw new Error(`SHA256 mismatch. Expected: ${stream.expectedSha256}, Got: ${actualSha256}`);
        }
        return actualSha256;
    }

    private cleanupStream(streamId: string, deleteFinalFile = true): void {
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

    private errorResult(streamId: string, error: any): StreamResult {
        return {
            stream_id: streamId,
            status: 'error',
            received_chunks: 0,
            message: error instanceof Error ? error.message : 'Unknown error'
        };
    }

    // 全局状态查询
    static getGlobalStatus() {
        return {
            activeStreams: this.streams.size,
            memoryUsageMB: Math.round(this.memoryUsage / 1024 / 1024 * 100) / 100,
            streams: Array.from(this.streams.values()).map(stream => ({
                streamId: stream.id,
                filename: stream.filename,
                progress: `${stream.receivedChunks}/${stream.totalChunks}`,
                useMemory: stream.useMemory,
                createdAt: new Date(stream.createdAt).toISOString()
            }))
        };
    }
}
