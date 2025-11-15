/**
 * FFmpeg Native Addon Adapter
 * 使用原生 Node.js Addon 实现的 FFmpeg 适配器
 */

import { platform, arch } from 'node:os';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import type { FFmpeg } from './ffmpeg-addon';
import type { IFFmpegAdapter, VideoInfoResult } from './ffmpeg-adapter-interface';
import { dlopen } from 'node:process';

/**
 * 获取 Native Addon 路径
 * @param binaryPath 二进制文件路径(来自 pathWrapper.binaryPath)
 */
function getAddonPath (binaryPath: string): string {
  const platformName = platform();
  const archName = arch();

  const addonFileName: string = process.platform + '.' + process.arch;
  const addonPath = path.join(binaryPath, './native/ffmpeg/', `ffmpegAddon.${addonFileName}.node`);
  if (!existsSync(addonPath)) {
    throw new Error(`Unsupported platform: ${platformName} ${archName} - Addon not found at ${addonPath}`);
  }
  return addonPath;
}

/**
 * FFmpeg Native Addon 适配器实现
 */
export class FFmpegAddonAdapter implements IFFmpegAdapter {
  public readonly name = 'FFmpegAddon';
  private addon: FFmpeg | null = null;
  private binaryPath: string;

  constructor (binaryPath: string) {
    this.binaryPath = binaryPath;
  }

  /**
     * 检查 Addon 是否可用
     */
  async isAvailable (): Promise<boolean> {
    try {
      const temp_addon = { exports: {} };
      dlopen(temp_addon, getAddonPath(this.binaryPath));
      this.addon = temp_addon.exports as FFmpeg;
      return this.addon !== null;
    } catch (error) {
      console.log('[FFmpegAddonAdapter] Failed to load addon:', error);
      return false;
    }
  }

  private ensureAddon (): FFmpeg {
    if (!this.addon) {
      throw new Error('FFmpeg Addon is not available');
    }
    return this.addon;
  }

  /**
     * 获取视频信息
     */
  async getVideoInfo (videoPath: string): Promise<VideoInfoResult> {
    const addon = this.ensureAddon();
    const info = await addon.getVideoInfo(videoPath);

    const format = info.format.includes(',') ? info.format.split(',')[0] ?? info.format : info.format;
    console.log('[FFmpegAddonAdapter] Detected format:', format);
    return {
      width: info.width,
      height: info.height,
      duration: info.duration,
      format,
      thumbnail: info.image,
    };
  }

  /**
     * 获取时长
     */
  async getDuration (filePath: string): Promise<number> {
    const addon = this.ensureAddon();
    return addon.getDuration(filePath);
  }

  /**
     * 转换为 PCM
     */
  async convertToPCM (filePath: string, pcmPath: string): Promise<{ result: boolean, sampleRate: number; }> {
    const addon = this.ensureAddon();
    const result = await addon.decodeAudioToPCM(filePath, pcmPath, 24000);

    return result;
  }

  /**
     * 转换文件
     */
  async convertFile (inputFile: string, outputFile: string, format: string): Promise<void> {
    const addon = this.ensureAddon();
    console.log('[FFmpegAddonAdapter] Converting file:', inputFile, 'to', outputFile, 'as', format);
    await addon.decodeAudioToFmt(inputFile, outputFile, format);
  }

  /**
     * 提取缩略图
     */
  async extractThumbnail (videoPath: string, thumbnailPath: string): Promise<void> {
    const addon = this.ensureAddon();
    const info = await addon.getVideoInfo(videoPath);

    // 将缩略图写入文件
    await writeFile(thumbnailPath, info.image);
  }
}
