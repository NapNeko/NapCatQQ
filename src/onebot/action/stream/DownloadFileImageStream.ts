import { ActionName } from '@/onebot/action/router';
import { OneBotRequestToolkit } from '@/onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/onebot/config/config';
import { StreamPacket, StreamStatus } from './StreamBasic';
import fs from 'fs';
import { imageSizeFallBack } from '@/image-size';
import { BaseDownloadStream, DownloadResult } from './BaseDownloadStream';

const SchemaData = Type.Object({
    file: Type.Optional(Type.String()),
    file_id: Type.Optional(Type.String()),
    chunk_size: Type.Optional(Type.Number({ default: 64 * 1024 })) // 默认64KB分块
});

type Payload = Static<typeof SchemaData>;

export class DownloadFileImageStream extends BaseDownloadStream<Payload, DownloadResult> {
    override actionName = ActionName.DownloadFileImageStream;
    override payloadSchema = SchemaData;
    override useStream = true;

    async _handle(payload: Payload, _adaptername: string, _config: NetworkAdapterConfig, req: OneBotRequestToolkit): Promise<StreamPacket<DownloadResult>> {
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
                height
            });

            const { totalChunks, totalBytes } = await this.streamFileChunks(req, downloadPath, chunkSize, 'file_chunk');

            // 返回完成状态（与 DownloadFileStream 对齐）
            return {
                type: StreamStatus.Response,
                data_type: 'file_complete',
                total_chunks: totalChunks,
                total_bytes: totalBytes,
                message: 'Download completed'
            };

        } catch (error) {
            throw new Error(`Download failed: ${(error as Error).message}`);
        }
    }
}
