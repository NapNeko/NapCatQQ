import { ActionName } from '@/onebot/action/router';
import { OneBotAction, OneBotRequestToolkit } from '@/onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/onebot/config/config';
import { StreamPacket, StreamStatus } from './StreamBasic';
import fs from 'fs';
import { FileNapCatOneBotUUID } from '@/common/file-uuid';
const SchemaData = Type.Object({
    file: Type.Optional(Type.String()),
    file_id: Type.Optional(Type.String()),
    chunk_size: Type.Optional(Type.Number({ default: 64 * 1024 })) // 默认64KB分块
});

type Payload = Static<typeof SchemaData>;

// 下载结果类型
interface DownloadResult {
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
}

export class DownloadFileStream extends OneBotAction<Payload, StreamPacket<DownloadResult>> {
    override actionName = ActionName.DownloadFileStream;
    override payloadSchema = SchemaData;
    override useStream = true;

    async _handle(payload: Payload, _adaptername: string, _config: NetworkAdapterConfig, req: OneBotRequestToolkit): Promise<StreamPacket<DownloadResult>> {
        try {
            payload.file ||= payload.file_id || '';
            const chunkSize = payload.chunk_size || 64 * 1024;
            let downloadPath = '';
            let fileName = '';
            let fileSize = 0;

            //接收消息标记模式
            const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file);
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
            }
            //群文件模式
            else if (FileNapCatOneBotUUID.decodeModelId(payload.file)) {
                const contextModelIdFile = FileNapCatOneBotUUID.decodeModelId(payload.file);
                if (contextModelIdFile && contextModelIdFile.modelId) {
                    const { peer, modelId } = contextModelIdFile;
                    downloadPath = await this.core.apis.FileApi.downloadFileForModelId(peer, modelId, '');
                }
            }
            //搜索名字模式
            else {
                const searchResult = (await this.core.apis.FileApi.searchForFile([payload.file]));
                if (searchResult) {
                    downloadPath = await this.core.apis.FileApi.downloadFileById(searchResult.id, parseInt(searchResult.fileSize));
                    fileSize = parseInt(searchResult.fileSize);
                    fileName = searchResult.fileName;
                }
            }

            if (!downloadPath) {
                throw new Error('file not found');
            }

            // 获取文件大小
            const stats = await fs.promises.stat(downloadPath);
            const totalSize = fileSize || stats.size;

            // 发送文件信息
            req.send({
                type: StreamStatus.Stream,
                data_type: 'file_info',
                file_name: fileName,
                file_size: totalSize,
                chunk_size: chunkSize
            });

            // 创建读取流并分块发送
            const readStream = fs.createReadStream(downloadPath, { highWaterMark: chunkSize });
            let chunkIndex = 0;
            let bytesRead = 0;

            for await (const chunk of readStream) {
                const base64Chunk = chunk.toString('base64');
                bytesRead += chunk.length;

                req.send({
                    type: StreamStatus.Stream,
                    data_type: 'file_chunk',
                    index: chunkIndex,
                    data: base64Chunk,
                    size: chunk.length,
                    progress: Math.round((bytesRead / totalSize) * 100),
                    base64_size: base64Chunk.length
                });

                chunkIndex++;
            }

            // 返回完成状态
            return {
                type: StreamStatus.Response,
                data_type: 'file_complete',
                total_chunks: chunkIndex,
                total_bytes: bytesRead,
                message: 'Download completed'
            };

        } catch (error) {
            throw new Error(`Download failed: ${(error as Error).message}`);
        }
    }
}
