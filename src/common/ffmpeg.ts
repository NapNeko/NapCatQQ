import { readFileSync, statSync, existsSync, mkdirSync } from 'fs';
import path, { dirname } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { VideoInfo } from './video';
import { fileTypeFromFile } from 'file-type';
import { fileURLToPath } from 'node:url';
import { platform } from 'node:os';
import { LogWrapper } from './log';
import { imageSizeFallBack } from '@/image-size';
const currentPath = dirname(fileURLToPath(import.meta.url));
const execFileAsync = promisify(execFile);
const getFFmpegPath = (tool: string): string => {
    if (process.platform === 'win32') {
        const exeName = `${tool}.exe`;
        const isLocalExeExists = existsSync(path.join(currentPath, 'ffmpeg', exeName));
        return isLocalExeExists ? path.join(currentPath, 'ffmpeg', exeName) : exeName;
    }
    return tool;
};
export let FFMPEG_CMD = getFFmpegPath('ffmpeg');
export let FFPROBE_CMD = getFFmpegPath('ffprobe');
export class FFmpegService {
    // 确保目标目录存在
    public static setFfmpegPath(ffmpegPath: string,logger:LogWrapper): void {
        if (platform() === 'win32') {
            FFMPEG_CMD = path.join(ffmpegPath, 'ffmpeg.exe');
            FFPROBE_CMD = path.join(ffmpegPath, 'ffprobe.exe');
            logger.log('[Check] ffmpeg:', FFMPEG_CMD);
            logger.log('[Check] ffprobe:', FFPROBE_CMD);
        }
    }
    private static ensureDirExists(filePath: string): void {
        const dir = dirname(filePath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }

    public static async extractThumbnail(videoPath: string, thumbnailPath: string): Promise<void> {
        try {
            this.ensureDirExists(thumbnailPath);

            const { stderr } = await execFileAsync(FFMPEG_CMD, [
                '-i', videoPath,
                '-ss', '00:00:01.000',
                '-vframes', '1',
                '-y', // 覆盖输出文件
                thumbnailPath
            ]);

            if (!existsSync(thumbnailPath)) {
                throw new Error(`提取缩略图失败，输出文件不存在: ${stderr}`);
            }
        } catch (error) {
            console.error('Error extracting thumbnail:', error);
            throw new Error(`提取缩略图失败: ${(error as Error).message}`);
        }
    }

    public static async convertFile(inputFile: string, outputFile: string, format: string): Promise<void> {
        try {
            this.ensureDirExists(outputFile);

            const params = format === 'amr'
                ? [
                    '-f', 's16le',
                    '-ar', '24000',
                    '-ac', '1',
                    '-i', inputFile,
                    '-ar', '8000',
                    '-b:a', '12.2k',
                    '-y',
                    outputFile
                ]
                : [
                    '-f', 's16le',
                    '-ar', '24000',
                    '-ac', '1',
                    '-i', inputFile,
                    '-y',
                    outputFile
                ];

            await execFileAsync(FFMPEG_CMD, params);

            if (!existsSync(outputFile)) {
                throw new Error('转换失败，输出文件不存在');
            }
        } catch (error) {
            console.error('Error converting file:', error);
            throw new Error(`文件转换失败: ${(error as Error).message}`);
        }
    }

    public static async convert(filePath: string, pcmPath: string): Promise<Buffer> {
        try {
            this.ensureDirExists(pcmPath);

            await execFileAsync(FFMPEG_CMD, [
                '-y',
                '-i', filePath,
                '-ar', '24000',
                '-ac', '1',
                '-f', 's16le',
                pcmPath
            ]);

            if (!existsSync(pcmPath)) {
                throw new Error('转换PCM失败，输出文件不存在');
            }

            return readFileSync(pcmPath);
        } catch (error: any) {
            throw new Error(`FFmpeg处理转换出错: ${error.message}`);
        }
    }

    public static async getVideoInfo(videoPath: string, thumbnailPath: string): Promise<VideoInfo> {
        try {
            // 并行执行获取文件信息和提取缩略图
            const [fileInfo, duration] = await Promise.all([
                this.getFileInfo(videoPath, thumbnailPath),
                this.getVideoDuration(videoPath)
            ]);

            const result: VideoInfo = {
                width: fileInfo.width,
                height: fileInfo.height,
                time: duration,
                format: fileInfo.format,
                size: fileInfo.size,
                filePath: videoPath
            };
            return result;
        } catch (error) {
            throw error;
        }
    }

    private static async getFileInfo(videoPath: string, thumbnailPath: string): Promise<{
        format: string,
        size: number,
        width: number,
        height: number
    }> {

        // 获取文件大小和类型
        const [fileType, fileSize] = await Promise.all([
            fileTypeFromFile(videoPath).catch(() => {
                return null;
            }),
            Promise.resolve(statSync(videoPath).size)
        ]);


        try {
            await this.extractThumbnail(videoPath, thumbnailPath);
            // 获取图片尺寸
            const dimensions = await imageSizeFallBack(thumbnailPath);

            return {
                format: fileType?.ext ?? 'mp4',
                size: fileSize,
                width: dimensions.width ?? 100,
                height: dimensions.height ?? 100
            };
        } catch (error) {
            return {
                format: fileType?.ext ?? 'mp4',
                size: fileSize,
                width: 100,
                height: 100
            };
        }
    }

    private static async getVideoDuration(videoPath: string): Promise<number> {
        try {
            // 使用FFprobe获取时长
            const { stdout } = await execFileAsync(FFPROBE_CMD, [
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                videoPath
            ]);

            const duration = parseFloat(stdout.trim());

            return isNaN(duration) ? 60 : duration;
        } catch (error) {
            return 60; // 默认时长
        }
    }
}