import { statSync, existsSync, writeFileSync } from 'fs';
import { copyFile, stat } from 'node:fs/promises';
import path from 'path';
import type { VideoInfo } from './video';
import { fileTypeFromFile } from 'file-type';
import { platform } from 'node:os';
import { LogWrapper } from '@/napcat-core/helper/log';
import { FFmpegAdapterFactory } from './ffmpeg-adapter-factory';
import type { IFFmpegAdapter } from './ffmpeg-adapter-interface';
import {
  FFmpegExecAdapter,
  NormalizedVideoThumbnail,
  VIDEO_THUMBNAIL_MAX_BYTES,
  VIDEO_THUMBNAIL_MAX_SIDE,
} from './ffmpeg-exec-adapter';
import { imageSizeFallBack } from 'napcat-image-size/src/index';

const getFFmpegPath = (tool: string, binaryPath?: string): string => {
  if (process.platform === 'win32' && binaryPath) {
    const exeName = `${tool}.exe`;
    const localPath = path.join(binaryPath, 'ffmpeg', exeName);
    const isLocalExeExists = existsSync(localPath);
    return isLocalExeExists ? localPath : exeName;
  }
  return tool;
};

export let FFMPEG_CMD = 'ffmpeg';
export let FFPROBE_CMD = 'ffprobe';
export class FFmpegService {
  private static adapter: IFFmpegAdapter | null = null;
  private static thumbnailAdapter: FFmpegExecAdapter | null = null;
  private static binaryPath: string | undefined;
  private static logger: LogWrapper | null = null;
  private static initialized = false;

  /**
     * 初始化 FFmpeg 服务
     * @param binaryPath 二进制文件路径(来自 pathWrapper.binaryPath)
     * @param logger 日志记录器
     */
  public static async init (binaryPath: string, logger: LogWrapper): Promise<void> {
    this.binaryPath = binaryPath;
    this.logger = logger;
    if (this.initialized) {
      return;
    }

    // 检查本地 ffmpeg 路径
    FFMPEG_CMD = getFFmpegPath('ffmpeg', binaryPath);
    FFPROBE_CMD = getFFmpegPath('ffprobe', binaryPath);

    // 立即初始化适配器(会触发自动下载等逻辑)
    this.adapter = await FFmpegAdapterFactory.getAdapter(
      logger,
      FFMPEG_CMD,
      FFPROBE_CMD,
      binaryPath
    );
    if (this.adapter instanceof FFmpegExecAdapter) {
      this.thumbnailAdapter = this.adapter;
    }

    this.initialized = true;
  }

  public static getAdapterName (): string {
    if (!this.adapter) {
      throw new Error('FFmpeg service not initialized. Please call FFmpegService.init() first.');
    }
    return this.adapter.name;
  }

  /**
     * 获取 FFmpeg 适配器
     */
  private static async getAdapter (): Promise<IFFmpegAdapter> {
    if (!this.adapter) {
      throw new Error('FFmpeg service not initialized. Please call FFmpegService.init() first.');
    }
    return this.adapter;
  }

  public static async convertToNTSilkTct (inputFile: string, outputFile: string): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.convertToNTSilkTct(inputFile, outputFile);
  }

  /**
     * 设置 FFmpeg 路径并更新适配器
     * @deprecated 建议使用 init() 方法初始化
     */
  public static async setFfmpegPath (ffmpegPath: string, logger: LogWrapper): Promise<void> {
    if (platform() === 'win32') {
      FFMPEG_CMD = path.join(ffmpegPath, 'ffmpeg.exe');
      FFPROBE_CMD = path.join(ffmpegPath, 'ffprobe.exe');
      logger.log('[Check] ffmpeg:', FFMPEG_CMD);
      logger.log('[Check] ffprobe:', FFPROBE_CMD);

      // 更新适配器路径
      await FFmpegAdapterFactory.updateFFmpegPath(logger, FFMPEG_CMD, FFPROBE_CMD);
      this.thumbnailAdapter?.setFFmpegPath(FFMPEG_CMD);
      this.thumbnailAdapter?.setFFprobePath(FFPROBE_CMD);
    }
  }

  /**
     * 提取视频缩略图
     */
  public static async extractThumbnail (videoPath: string, thumbnailPath: string): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.extractThumbnail(videoPath, thumbnailPath);
  }

  private static async getThumbnailAdapter (): Promise<FFmpegExecAdapter> {
    if (this.thumbnailAdapter) {
      return this.thumbnailAdapter;
    }
    const adapter = new FFmpegExecAdapter(
      FFMPEG_CMD,
      FFPROBE_CMD,
      this.binaryPath,
      this.logger ?? undefined
    );
    if (!await adapter.isAvailable()) {
      throw new Error('FFmpeg command line tool is unavailable');
    }
    this.thumbnailAdapter = adapter;
    return adapter;
  }

  public static async normalizeVideoThumbnail (
    inputPath: string,
    outputPath: string
  ): Promise<NormalizedVideoThumbnail> {
    const [inputType, inputDimensions, inputStat] = await Promise.all([
      fileTypeFromFile(inputPath),
      imageSizeFallBack(inputPath),
      stat(inputPath),
    ]);
    if (
      ['jpg', 'jpeg'].includes(inputType?.ext ?? '') &&
      Math.max(inputDimensions.width, inputDimensions.height) <= VIDEO_THUMBNAIL_MAX_SIDE &&
      inputStat.size <= VIDEO_THUMBNAIL_MAX_BYTES
    ) {
      await copyFile(inputPath, outputPath);
      return {
        width: inputDimensions.width,
        height: inputDimensions.height,
        size: inputStat.size,
      };
    }
    return (await this.getThumbnailAdapter()).normalizeVideoThumbnail(inputPath, outputPath);
  }

  /**
     * 转换音频文件
     */
  public static async convertAudioFmt (inputFile: string, outputFile: string, format: string): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.convertFile(inputFile, outputFile, format);
  }

  /**
   * 获取音频时长
   */
  public static async getDuration (filePath: string): Promise<number> {
    const adapter = await this.getAdapter();
    return adapter.getDuration(filePath);
  }

  /**
   * 判断是否为 Silk 格式
   */
  public static async isSilk (filePath: string): Promise<boolean> {
    const adapter = await this.getAdapter();
    return adapter.isSilk(filePath);
  }

  /**
     * 转换为 PCM 格式
     */
  public static async convert (filePath: string, pcmPath: string): Promise<{ result: boolean, sampleRate: number; }> {
    const adapter = await this.getAdapter();
    return adapter.convertToPCM(filePath, pcmPath);
  }

  /**
     * 获取视频信息
     */
  public static async getVideoInfo (videoPath: string, thumbnailPath: string): Promise<VideoInfo> {
    const adapter = await this.getAdapter();

    try {
      // 获取文件大小
      const fileSize = statSync(videoPath).size;

      // 使用适配器获取视频信息
      const videoInfo = await adapter.getVideoInfo(videoPath);

      // 如果提供了缩略图路径且适配器返回了缩略图,保存到指定路径
      if (thumbnailPath && videoInfo.thumbnail) {
        writeFileSync(thumbnailPath, videoInfo.thumbnail);
      }

      const result: VideoInfo = {
        width: videoInfo.width,
        height: videoInfo.height,
        time: videoInfo.duration,
        format: videoInfo.format,
        size: fileSize,
        filePath: videoPath,
      };

      return result;
    } catch (_error) {
      // 降级处理:返回默认值
      const fileType = await fileTypeFromFile(videoPath).catch(() => null);
      const fileSize = statSync(videoPath).size;

      return {
        width: 100,
        height: 100,
        time: 60,
        format: fileType?.ext ?? 'mp4',
        size: fileSize,
        filePath: videoPath,
      };
    }
  }
}
