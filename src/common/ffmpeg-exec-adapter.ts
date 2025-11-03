/**
 * FFmpeg Exec Adapter
 * 使用 execFile 调用 FFmpeg 命令行工具的适配器实现
 */

import { readFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileTypeFromFile } from 'file-type';
import { imageSizeFallBack } from '@/image-size';
import { downloadFFmpegIfNotExists } from './download-ffmpeg';
import { LogWrapper } from './log';
import type { IFFmpegAdapter, VideoInfoResult } from './ffmpeg-adapter-interface';

const execFileAsync = promisify(execFile);

/**
 * 确保目录存在
 */
function ensureDirExists (filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * FFmpeg 命令行适配器实现
 */
export class FFmpegExecAdapter implements IFFmpegAdapter {
  public readonly name = 'FFmpegExec';
  private downloadAttempted = false;

  constructor (
    private ffmpegPath: string = 'ffmpeg',
    private ffprobePath: string = 'ffprobe',
    private binaryPath?: string,
    private logger?: LogWrapper
  ) { }

  /**
     * 检查 FFmpeg 是否可用，如果不可用则尝试下载
     */
  async isAvailable (): Promise<boolean> {
    // 首先检查当前路径
    try {
      await execFileAsync(this.ffmpegPath, ['-version']);
      return true;
    } catch {
      // 如果失败且未尝试下载，尝试下载
      if (!this.downloadAttempted && this.binaryPath && this.logger) {
        this.downloadAttempted = true;

        if (process.env['NAPCAT_DISABLE_FFMPEG_DOWNLOAD']) {
          return false;
        }

        this.logger.log('[FFmpeg] 未找到可用的 FFmpeg，尝试自动下载...');
        const result = await downloadFFmpegIfNotExists(this.logger);

        if (result.path && result.reset) {
          // 更新路径
          if (process.platform === 'win32') {
            this.ffmpegPath = join(result.path, 'ffmpeg.exe');
            this.ffprobePath = join(result.path, 'ffprobe.exe');
            this.logger.log('[FFmpeg] 已更新路径:', this.ffmpegPath);

            // 再次检查
            try {
              await execFileAsync(this.ffmpegPath, ['-version']);
              return true;
            } catch {
              return false;
            }
          }
        }
      }
      return false;
    }
  }

  /**
     * 设置 FFmpeg 路径
     */
  setFFmpegPath (ffmpegPath: string): void {
    this.ffmpegPath = ffmpegPath;
  }

  /**
     * 设置 FFprobe 路径
     */
  setFFprobePath (ffprobePath: string): void {
    this.ffprobePath = ffprobePath;
  }

  /**
     * 获取视频信息
     */
  async getVideoInfo (videoPath: string): Promise<VideoInfoResult> {
    // 获取文件大小和类型
    const [fileType, duration] = await Promise.all([
      fileTypeFromFile(videoPath).catch(() => null),
      this.getDuration(videoPath),
    ]);

    // 创建临时缩略图路径
    const thumbnailPath = `${videoPath}.thumbnail.bmp`;
    let width = 100;
    let height = 100;
    let thumbnail: Buffer | undefined;

    try {
      await this.extractThumbnail(videoPath, thumbnailPath);

      // 获取图片尺寸
      const dimensions = await imageSizeFallBack(thumbnailPath);
      width = dimensions.width ?? 100;
      height = dimensions.height ?? 100;

      // 读取缩略图
      if (existsSync(thumbnailPath)) {
        thumbnail = readFileSync(thumbnailPath);
      }
    } catch (_error) {
      // 使用默认值
    }

    return {
      width,
      height,
      duration,
      format: fileType?.ext ?? 'mp4',
      thumbnail,
    };
  }

  /**
     * 获取时长
     */
  async getDuration (filePath: string): Promise<number> {
    try {
      const { stdout } = await execFileAsync(this.ffprobePath, [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        filePath,
      ]);

      const duration = parseFloat(stdout.trim());
      return isNaN(duration) ? 60 : duration;
    } catch {
      return 60; // 默认时长
    }
  }

  /**
     * 转换为 PCM
     */
  async convertToPCM (filePath: string, pcmPath: string): Promise<{ result: boolean, sampleRate: number; }> {
    try {
      ensureDirExists(pcmPath);

      await execFileAsync(this.ffmpegPath, [
        '-y',
        '-i', filePath,
        '-ar', '24000',
        '-ac', '1',
        '-f', 's16le',
        pcmPath,
      ]);

      if (!existsSync(pcmPath)) {
        throw new Error('转换PCM失败，输出文件不存在');
      }

      return { result: true, sampleRate: 24000 };
    } catch (error: any) {
      throw new Error(`FFmpeg处理转换出错: ${error.message}`);
    }
  }

  /**
     * 转换文件
     */
  async convertFile (inputFile: string, outputFile: string, format: string): Promise<void> {
    try {
      ensureDirExists(outputFile);

      const params = format === 'amr'
        ? [
          '-f', 's16le',
          '-ar', '24000',
          '-ac', '1',
          '-i', inputFile,
          '-ar', '8000',
          '-b:a', '12.2k',
          '-y',
          outputFile,
        ]
        : [
          '-f', 's16le',
          '-ar', '24000',
          '-ac', '1',
          '-i', inputFile,
          '-y',
          outputFile,
        ];

      await execFileAsync(this.ffmpegPath, params);

      if (!existsSync(outputFile)) {
        throw new Error('转换失败,输出文件不存在');
      }
    } catch (error) {
      console.error('Error converting file:', error);
      throw new Error(`文件转换失败: ${(error as Error).message}`);
    }
  }

  /**
     * 提取缩略图
     */
  async extractThumbnail (videoPath: string, thumbnailPath: string): Promise<void> {
    try {
      ensureDirExists(thumbnailPath);

      const { stderr } = await execFileAsync(this.ffmpegPath, [
        '-i', videoPath,
        '-ss', '00:00:01.000',
        '-vframes', '1',
        '-y', // 覆盖输出文件
        thumbnailPath,
      ]);

      if (!existsSync(thumbnailPath)) {
        throw new Error(`提取缩略图失败，输出文件不存在: ${stderr}`);
      }
    } catch (error) {
      console.error('Error extracting thumbnail:', error);
      throw new Error(`提取缩略图失败: ${(error as Error).message}`);
    }
  }
}
