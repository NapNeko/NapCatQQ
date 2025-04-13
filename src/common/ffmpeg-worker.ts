/* eslint-disable @typescript-eslint/no-explicit-any */
import { FFmpeg } from '@ffmpeg.wasm/main';
import { randomUUID } from 'crypto';
import { readFileSync, statSync, writeFileSync } from 'fs';
import type { VideoInfo } from './video';
import { fileTypeFromFile } from 'file-type';
import imageSize from 'image-size';
import { parentPort } from 'worker_threads';
export function recvTask<T>(cb: (taskData: T) => Promise<unknown>) {
    parentPort?.on('message', async (taskData: T) => {
        try {
            let ret = await cb(taskData);
            parentPort?.postMessage(ret);
        } catch (error: unknown) {
            parentPort?.postMessage({ error: (error as Error).message });
        }
    });
}
export function sendLog(_log: string) {
    //parentPort?.postMessage({ log });
}
class FFmpegService {
    public static async extractThumbnail(videoPath: string, thumbnailPath: string): Promise<void> {
        const ffmpegInstance = await FFmpeg.create({ core: '@ffmpeg.wasm/core-mt' });
        const videoFileName = `${randomUUID()}.mp4`;
        const outputFileName = `${randomUUID()}.jpg`;
        try {
            ffmpegInstance.fs.writeFile(videoFileName, readFileSync(videoPath));
            const code = await ffmpegInstance.run('-i', videoFileName, '-ss', '00:00:01.000', '-vframes', '1', outputFileName);
            if (code !== 0) {
                throw new Error('Error extracting thumbnail: FFmpeg process exited with code ' + code);
            }
            const thumbnail = ffmpegInstance.fs.readFile(outputFileName);
            writeFileSync(thumbnailPath, thumbnail);
        } catch (error) {
            console.error('Error extracting thumbnail:', error);
            throw error;
        } finally {
            try {
                ffmpegInstance.fs.unlink(outputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking output file:', unlinkError);
            }
            try {
                ffmpegInstance.fs.unlink(videoFileName);
            } catch (unlinkError) {
                console.error('Error unlinking video file:', unlinkError);
            }
        }
    }

    public static async convertFile(inputFile: string, outputFile: string, format: string): Promise<void> {
        const ffmpegInstance = await FFmpeg.create({ core: '@ffmpeg.wasm/core-mt' });
        const inputFileName = `${randomUUID()}.pcm`;
        const outputFileName = `${randomUUID()}.${format}`;
        try {
            ffmpegInstance.fs.writeFile(inputFileName, readFileSync(inputFile));
            const params = format === 'amr'
                ? ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', inputFileName, '-ar', '8000', '-b:a', '12.2k', outputFileName]
                : ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', inputFileName, outputFileName];
            const code = await ffmpegInstance.run(...params);
            if (code !== 0) {
                throw new Error('Error extracting thumbnail: FFmpeg process exited with code ' + code);
            }
            const outputData = ffmpegInstance.fs.readFile(outputFileName);
            writeFileSync(outputFile, outputData);
        } catch (error) {
            console.error('Error converting file:', error);
            throw error;
        } finally {
            try {
                ffmpegInstance.fs.unlink(outputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking output file:', unlinkError);
            }
            try {
                ffmpegInstance.fs.unlink(inputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking input file:', unlinkError);
            }
        }
    }

    public static async convert(filePath: string, pcmPath: string): Promise<Buffer> {
        const ffmpegInstance = await FFmpeg.create({ core: '@ffmpeg.wasm/core-mt' });
        const inputFileName = `${randomUUID()}.input`;
        const outputFileName = `${randomUUID()}.pcm`;
        try {
            ffmpegInstance.fs.writeFile(inputFileName, readFileSync(filePath));
            const params = ['-y', '-i', inputFileName, '-ar', '24000', '-ac', '1', '-f', 's16le', outputFileName];
            const code = await ffmpegInstance.run(...params);
            if (code !== 0) {
                throw new Error('FFmpeg process exited with code ' + code);
            }
            const outputData = ffmpegInstance.fs.readFile(outputFileName);
            writeFileSync(pcmPath, outputData);
            return Buffer.from(outputData);
        } catch (error: any) {
            throw new Error('FFmpeg处理转换出错: ' + error.message);
        } finally {
            try {
                ffmpegInstance.fs.unlink(outputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking output file:', unlinkError);
            }
            try {
                ffmpegInstance.fs.unlink(inputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking output file:', unlinkError);
            }
        }
    }
    public static async getVideoInfo(videoPath: string, thumbnailPath: string): Promise<VideoInfo> {
        const startTime = Date.now();
        sendLog(`开始获取视频信息: ${videoPath}`);

        // 创建一个超时包装函数
        const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, taskName: string): Promise<T> => {
            return Promise.race([
                promise,
                new Promise<T>((_, reject) => {
                    setTimeout(() => reject(new Error(`任务超时: ${taskName} (${timeoutMs}ms)`)), timeoutMs);
                })
            ]);
        };

        // 并行执行多个任务
        const [fileInfo, durationInfo] = await Promise.all([
            // 任务1: 获取文件信息和提取缩略图
            (async () => {
                sendLog('开始任务1: 获取文件信息和提取缩略图');

                // 获取文件信息 (并行)
                const fileInfoStartTime = Date.now();
                const [fileType, fileSize] = await Promise.all([
                    withTimeout(fileTypeFromFile(videoPath), 10000, '获取文件类型')
                        .then(result => {
                            sendLog(`获取文件类型完成，耗时: ${Date.now() - fileInfoStartTime}ms`);
                            return result;
                        }),
                    (async () => {
                        const result = statSync(videoPath).size;
                        sendLog(`获取文件大小完成，耗时: ${Date.now() - fileInfoStartTime}ms`);
                        return result;
                    })()
                ]);

                // 直接实现缩略图提取 (不调用extractThumbnail方法)
                const thumbStartTime = Date.now();
                sendLog('开始提取缩略图');

                const ffmpegInstance = await withTimeout(
                    FFmpeg.create({ core: '@ffmpeg.wasm/core-mt' }),
                    15000,
                    '创建FFmpeg实例(缩略图)'
                );

                const videoFileName = `${randomUUID()}.mp4`;
                const outputFileName = `${randomUUID()}.jpg`;

                try {
                    // 写入视频文件到FFmpeg
                    const writeFileStartTime = Date.now();
                    ffmpegInstance.fs.writeFile(videoFileName, readFileSync(videoPath));
                    sendLog(`写入视频文件到FFmpeg完成，耗时: ${Date.now() - writeFileStartTime}ms`);

                    // 提取缩略图
                    const extractStartTime = Date.now();
                    const code = await withTimeout(
                        ffmpegInstance.run('-i', videoFileName, '-ss', '00:00:01.000', '-vframes', '1', outputFileName),
                        30000,
                        '提取缩略图'
                    );
                    sendLog(`FFmpeg提取缩略图命令执行完成，耗时: ${Date.now() - extractStartTime}ms`);

                    if (code !== 0) {
                        throw new Error('Error extracting thumbnail: FFmpeg process exited with code ' + code);
                    }

                    // 读取并保存缩略图
                    const saveStartTime = Date.now();
                    const thumbnail = ffmpegInstance.fs.readFile(outputFileName);
                    writeFileSync(thumbnailPath, thumbnail);
                    sendLog(`读取并保存缩略图完成，耗时: ${Date.now() - saveStartTime}ms`);

                    // 获取缩略图尺寸
                    const imageSizeStartTime = Date.now();
                    const image = imageSize(thumbnailPath);
                    sendLog(`获取缩略图尺寸完成，耗时: ${Date.now() - imageSizeStartTime}ms`);

                    sendLog(`提取缩略图完成，总耗时: ${Date.now() - thumbStartTime}ms`);

                    return {
                        format: fileType?.ext ?? 'mp4',
                        size: fileSize,
                        width: image.width ?? 100,
                        height: image.height ?? 100
                    };
                } finally {
                    // 清理资源
                    try {
                        ffmpegInstance.fs.unlink(outputFileName);
                    } catch (error) {
                        sendLog(`清理输出文件失败: ${(error as Error).message}`);
                    }

                    try {
                        ffmpegInstance.fs.unlink(videoFileName);
                    } catch (error) {
                        sendLog(`清理视频文件失败: ${(error as Error).message}`);
                    }
                }
            })(),

            // 任务2: 获取视频时长
            (async () => {
                const task2StartTime = Date.now();
                sendLog('开始任务2: 获取视频时长');

                // 创建FFmpeg实例
                const ffmpegCreateStartTime = Date.now();
                const ffmpegInstance = await withTimeout(
                    FFmpeg.create({ core: '@ffmpeg.wasm/core-mt' }),
                    15000,
                    '创建FFmpeg实例(时长)'
                );
                sendLog(`创建FFmpeg实例完成，耗时: ${Date.now() - ffmpegCreateStartTime}ms`);

                const inputFileName = `${randomUUID()}.mp4`;

                try {
                    // 写入文件
                    const writeStartTime = Date.now();
                    ffmpegInstance.fs.writeFile(inputFileName, readFileSync(videoPath));
                    sendLog(`写入文件到FFmpeg完成，耗时: ${Date.now() - writeStartTime}ms`);

                    ffmpegInstance.setLogging(true);
                    let duration = 60; // 默认值

                    ffmpegInstance.setLogger((_level, ...msg) => {
                        const message = msg.join(' ');
                        const durationMatch = message.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
                        if (durationMatch) {
                            const hours = parseInt(durationMatch[1] ?? '0', 10);
                            const minutes = parseInt(durationMatch[2] ?? '0', 10);
                            const seconds = parseFloat(durationMatch[3] ?? '0');
                            duration = hours * 3600 + minutes * 60 + seconds;
                        }
                    });

                    // 执行FFmpeg
                    const runStartTime = Date.now();
                    await withTimeout(
                        ffmpegInstance.run('-i', inputFileName),
                        20000,
                        '获取视频时长'
                    );
                    sendLog(`执行FFmpeg命令完成，耗时: ${Date.now() - runStartTime}ms`);

                    sendLog(`任务2(获取视频时长)完成，总耗时: ${Date.now() - task2StartTime}ms`);
                    return { time: duration };
                } finally {
                    try {
                        ffmpegInstance.fs.unlink(inputFileName);
                    } catch (error) {
                        sendLog(`清理输入文件失败: ${(error as Error).message}`);
                    }
                }
            })()
        ]);

        // 合并结果并返回
        const totalDuration = Date.now() - startTime;
        sendLog(`获取视频信息完成，总耗时: ${totalDuration}ms`);

        return {
            width: fileInfo.width,
            height: fileInfo.height,
            time: durationInfo.time,
            format: fileInfo.format,
            size: fileInfo.size,
            filePath: videoPath
        };
    }
}
type FFmpegMethod = 'extractThumbnail' | 'convertFile' | 'convert' | 'getVideoInfo';

interface FFmpegTask {
    method: FFmpegMethod;
    args: any[];
}
export default async function handleFFmpegTask({ method, args }: FFmpegTask): Promise<any> {
    switch (method) {
    case 'extractThumbnail':
        return await FFmpegService.extractThumbnail(...args as [string, string]);
    case 'convertFile':
        return await FFmpegService.convertFile(...args as [string, string, string]);
    case 'convert':
        return await FFmpegService.convert(...args as [string, string]);
    case 'getVideoInfo':
        return await FFmpegService.getVideoInfo(...args as [string, string]);
    default:
        throw new Error(`Unknown method: ${method}`);
    }
}
recvTask<FFmpegTask>(async ({ method, args }: FFmpegTask) => {
    return await handleFFmpegTask({ method, args });
});