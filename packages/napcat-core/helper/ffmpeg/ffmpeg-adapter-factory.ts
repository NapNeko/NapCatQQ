/**
 * FFmpeg Adapter Factory
 * 自动检测并选择最佳的 FFmpeg 适配器
 */

import { LogWrapper } from '@/napcat-core/helper/log';
import { FFmpegAddonAdapter, getAddonPath } from './ffmpeg-addon-adapter';
import { existsSync } from 'node:fs';
import { FFmpegExecAdapter } from './ffmpeg-exec-adapter';
import type { IFFmpegAdapter } from './ffmpeg-adapter-interface';

/**
 * FFmpeg 适配器工厂
 */
export class FFmpegAdapterFactory {
  private static instance: IFFmpegAdapter | null = null;
  private static initPromise: Promise<IFFmpegAdapter> | null = null;

  /**
     * 初始化并获取最佳的 FFmpeg 适配器
     * @param logger 日志记录器
     * @param ffmpegPath FFmpeg 可执行文件路径(用于 Exec 适配器)
     * @param ffprobePath FFprobe 可执行文件路径(用于 Exec 适配器)
     * @param binaryPath 二进制文件路径(来自 pathWrapper.binaryPath,用于 Addon 适配器)
     */
  static async getAdapter (
    logger: LogWrapper,
    ffmpegPath: string = 'ffmpeg',
    ffprobePath: string = 'ffprobe',
    binaryPath?: string
  ): Promise<IFFmpegAdapter> {
    // 如果已经初始化,直接返回
    if (this.instance) {
      return this.instance;
    }

    // 如果正在初始化,等待初始化完成
    if (this.initPromise) {
      return this.initPromise;
    }

    // 开始初始化
    this.initPromise = this.initialize(logger, ffmpegPath, ffprobePath, binaryPath);

    try {
      this.instance = await this.initPromise;
      return this.instance;
    } finally {
      this.initPromise = null;
    }
  }

  /**
     * 初始化适配器
     */
  private static async initialize (
    logger: LogWrapper,
    ffmpegPath: string,
    ffprobePath: string,
    binaryPath?: string
  ): Promise<IFFmpegAdapter> {
    const useCommandLine = Boolean(process.env['FFMPEG_PATH'] || process.env['FFPROBE_PATH']);
    if (binaryPath && !useCommandLine) {
      const addonPath = getAddonPath(binaryPath);
      if (!existsSync(addonPath)) {
        logger.log(
          '[FFmpeg] Native Addon 未找到, 将改用命令行 ffmpeg。' +
          `detail: 找不到文件 ${addonPath} ; ` +
          'cause: 当前发行包未内置原生组件, 或安装目录布局与预期不符(常见于内置更新器原地升级后) ; ' +
          'next: 将检查命令行 ffmpeg, 若其不支持 ntsilk_s16le 语音消息将无法发送'
        );
      } else {
        const addonAdapter = new FFmpegAddonAdapter(binaryPath);

        logger.log('[FFmpeg] 检查 Native Addon 可用性...');
        if (await addonAdapter.isAvailable()) {
          logger.log('[FFmpeg] ✓ 使用 Native Addon 适配器');
          return addonAdapter;
        }

        throw new Error('FFmpeg Native Addon 加载失败: ' + addonPath);
      }
    }

    const execAdapter = new FFmpegExecAdapter(ffmpegPath, ffprobePath);

    logger.log(`[FFmpeg] 检查命令行工具可用性: ${ffmpegPath}`);
    if (await execAdapter.isAvailable()) {
      logger.log('[FFmpeg] 使用命令行工具适配器 ✓');
      if (!await execAdapter.supportsOutputFormat('ntsilk_s16le')) {
        logger.logError(
          '[FFmpeg] 警告: 当前 ffmpeg 不支持语音转码所需格式, 发送语音(record)消息将会失败。' +
          `detail: ${ffmpegPath} 的输出格式列表中不含 ntsilk_s16le (官方发行版之外的 ffmpeg 构建通常如此) ; ` +
          'impact: 文本/图片/视频等消息不受影响, 仅语音转码失败 ; ' +
          'action: 1.使用 NapCat 官方发行包自带的 Native Addon, 或 2.换用支持 ntsilk_s16le 的 ffmpeg 并通过 FFMPEG_PATH/FFPROBE_PATH 环境变量指定'
        );
      }
      return execAdapter;
    }

    throw new Error(
      'FFmpeg 命令行工具不可用: ffmpeg=' + ffmpegPath + ', ffprobe=' + ffprobePath + ' ; ' +
      'detail: 路径不存在或无法执行, 请检查安装与路径配置 ; ' +
      'action: 安装 ffmpeg/ffprobe, 或通过 FFMPEG_PATH/FFPROBE_PATH 环境变量指定正确路径'
    );
  }

  /**
     * 重置适配器(用于测试或重新初始化)
     */
  static reset (): void {
    this.instance = null;
    this.initPromise = null;
  }

  /**
     * 更新 FFmpeg 路径并重新初始化
     * @param logger 日志记录器
     * @param ffmpegPath FFmpeg 可执行文件路径
     * @param ffprobePath FFprobe 可执行文件路径
     */
  static async updateFFmpegPath (
    logger: LogWrapper,
    ffmpegPath: string,
    ffprobePath: string
  ): Promise<IFFmpegAdapter> {
    const adapter = new FFmpegExecAdapter(ffmpegPath, ffprobePath);
    if (!await adapter.isAvailable()) {
      throw new Error('FFmpeg 路径不可用: ' + ffmpegPath + ', ' + ffprobePath);
    }
    if (!await adapter.supportsOutputFormat('ntsilk_s16le')) {
      logger.logError(
        '[FFmpeg] 警告: 新指定的 ffmpeg 不支持语音转码所需格式, 发送语音(record)消息将会失败。' +
        `detail: ${ffmpegPath} 的输出格式列表中不含 ntsilk_s16le ; ` +
        'action: 换用支持 ntsilk_s16le 的 ffmpeg, 或使用 NapCat 官方发行包自带的 Native Addon'
      );
    }
    this.instance = adapter;
    logger.log('[FFmpeg] 已更新命令行工具路径:', ffmpegPath, ffprobePath);
    return adapter;
  }

  /**
     * 获取当前适配器(不初始化)
     */
  static getCurrentAdapter (): IFFmpegAdapter | null {
    return this.instance;
  }
}
