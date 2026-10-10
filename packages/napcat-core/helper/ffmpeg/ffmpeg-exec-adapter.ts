/**
 * FFmpeg Exec Adapter
 * 使用 execFile 调用 FFmpeg 命令行工具的适配器实现
 */

import { existsSync, mkdirSync, openSync, readSync, closeSync } from 'fs';
import { dirname } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
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

  constructor (
    private ffmpegPath: string = 'ffmpeg',
    private ffprobePath: string = 'ffprobe'
  ) { }

  /**
     * 检查 FFmpeg 和 FFprobe 是否可用
     */
  async isAvailable (): Promise<boolean> {
    // 首先检查当前路径
    try {
      await Promise.all([
        execFileAsync(this.ffmpegPath, ['-version'], { timeout: 10000, windowsHide: true }),
        execFileAsync(this.ffprobePath, ['-version'], { timeout: 10000, windowsHide: true }),
      ]);
      return true;
    } catch {
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
    const [probe, frame] = await Promise.all([
      execFileAsync(this.ffprobePath, [
        '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height:format=duration,format_name',
        '-of', 'json', videoPath,
      ], { timeout: 30000, windowsHide: true }),
      execFileAsync(this.ffmpegPath, [
        '-v', 'error', '-i', videoPath, '-frames:v', '1',
        '-f', 'image2pipe', '-vcodec', 'mjpeg', 'pipe:1',
      ], { encoding: 'buffer', maxBuffer: 16 * 1024 * 1024, timeout: 30000, windowsHide: true }),
    ]);
    const metadata = JSON.parse(probe.stdout);
    const stream = metadata.streams[0];
    const duration = Number(metadata.format.duration);
    if (!stream || !Number.isFinite(duration) || duration < 0 || frame.stdout.length === 0) {
      throw new Error('FFmpeg 无法读取视频信息或首帧: ' + videoPath);
    }
    return {
      width: stream.width,
      height: stream.height,
      duration,
      format: metadata.format.format_name,
      thumbnail: frame.stdout,
    };
  }

  /**
   * 获取时长
   */
  async getDuration (filePath: string): Promise<number> {
    const { stdout } = await execFileAsync(this.ffprobePath, [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ], { timeout: 30000, windowsHide: true });

    const duration = parseFloat(stdout.trim());
    if (!Number.isFinite(duration) || duration < 0) {
      throw new Error(`ffprobe 返回了无效的时长值: "${stdout.trim()}"`);
    }
    return duration;
  }

  /**
   * 判断是否为 Silk 格式
   */
  async isSilk (filePath: string): Promise<boolean> {
    try {
      const fd = openSync(filePath, 'r');
      const buffer = Buffer.alloc(10);
      readSync(fd, buffer, 0, 10, 0);
      closeSync(fd);
      const header = buffer.toString();
      return header.includes('#!SILK') || header.includes('\x02#!SILK');
    } catch {
      return false;
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
      ], { timeout: 120000, windowsHide: true });

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
          '-i', inputFile,
          '-vn', '-ac', '1',
          '-ar', '8000',
          '-b:a', '12.2k',
          '-y',
          outputFile,
        ]
        : [
          '-i', inputFile,
          '-vn', '-ac', '1',
          ...(format === 'spx' ? ['-ar', '32000'] : []),
          '-y',
          outputFile,
        ];

      await execFileAsync(this.ffmpegPath, params, { timeout: 120000, windowsHide: true });

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
        '-vframes', '1',
        '-y', // 覆盖输出文件
        thumbnailPath,
      ], { timeout: 30000, windowsHide: true });

      if (!existsSync(thumbnailPath)) {
        throw new Error(`提取缩略图失败，输出文件不存在: ${stderr}`);
      }
    } catch (error) {
      console.error('Error extracting thumbnail:', error);
      throw new Error(`提取缩略图失败: ${(error as Error).message}`);
    }
  }

  async convertToNTSilkTct (inputFile: string, outputFile: string): Promise<void> {
    ensureDirExists(outputFile);
    await execFileAsync(this.ffmpegPath, [
      '-v', 'error', '-y', '-i', inputFile, '-vn', '-ac', '1', '-ar', '24000',
      '-c:a', 'ntsilk_s16le', '-f', 'ntsilk_s16le', outputFile,
    ], { timeout: 120000, windowsHide: true });
  }
}
