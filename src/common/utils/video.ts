import ffmpeg, { FfprobeStream } from 'fluent-ffmpeg';
import fs from 'fs';
import type { LogWrapper } from './log';

export async function getVideoInfo(filePath: string, logger: LogWrapper) {
    const size = fs.statSync(filePath).size;
    return new Promise<{
        width: number,
        height: number,
        time: number,
        format: string,
        size: number,
        filePath: string
    }>((resolve, reject) => {
        const ffmpegPath = process.env.FFMPEG_PATH;
        ffmpegPath && ffmpeg.setFfmpegPath(ffmpegPath);
        ffmpeg(filePath).ffprobe((err: any, metadata: ffmpeg.FfprobeData) => {
            if (err) {
                reject(err);
            } else {
                const videoStream = metadata.streams.find((s: FfprobeStream) => s.codec_type === 'video');
                if (videoStream) {
                    logger.log(`视频尺寸: ${videoStream.width}x${videoStream.height}`);
                } else {
                    return reject('未找到视频流信息。');
                }
                resolve({
                    width: videoStream.width!, height: videoStream.height!,
                    time: parseInt(videoStream.duration!),
                    format: metadata.format.format_name!,
                    size,
                    filePath,
                });
            }
        });
    });
}

export function checkFfmpeg(newPath: string | null = null, logger: LogWrapper): Promise<boolean> {
    return new Promise((resolve, reject) => {
        logger.log('开始检查ffmpeg', newPath);
        if (newPath) {
            ffmpeg.setFfmpegPath(newPath);
        }
        try {
            ffmpeg.getAvailableFormats((err: any, formats: any) => {
                if (err) {
                    logger.log('ffmpeg is not installed or not found in PATH:', err);
                    resolve(false);
                } else {
                    logger.log('ffmpeg is installed.');
                    resolve(true);
                }
            });
        } catch (e) {
            resolve(false);
        }
    });
}
