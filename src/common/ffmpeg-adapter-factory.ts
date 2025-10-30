/**
 * FFmpeg Adapter Factory
 * 自动检测并选择最佳的 FFmpeg 适配器
 */

import { LogWrapper } from './log';
import { FFmpegAddonAdapter } from './ffmpeg-addon-adapter';
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
    static async getAdapter(
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
    private static async initialize(
        logger: LogWrapper,
        ffmpegPath: string,
        ffprobePath: string,
        binaryPath?: string
    ): Promise<IFFmpegAdapter> {

        // 1. 优先尝试使用 Native Addon
        if (binaryPath) {
            const addonAdapter = new FFmpegAddonAdapter(binaryPath);

            logger.log('[FFmpeg] 检查 Native Addon 可用性...');
            if (await addonAdapter.isAvailable()) {
                logger.log('[FFmpeg] ✓ 使用 Native Addon 适配器');
                return addonAdapter;
            }

            logger.log('[FFmpeg] Native Addon 不可用，尝试使用命令行工具');
        } else {
            logger.log('[FFmpeg] 未提供 binaryPath，跳过 Native Addon 检测');
        }

        // 2. 降级到 execFile 实现
        const execAdapter = new FFmpegExecAdapter(ffmpegPath, ffprobePath, binaryPath, logger);

        logger.log(`[FFmpeg] 检查命令行工具可用性: ${ffmpegPath}`);
        if (await execAdapter.isAvailable()) {
            logger.log('[FFmpeg] 使用命令行工具适配器 ✓');
            return execAdapter;
        }

        // 3. 都不可用，返回 execAdapter 但会在使用时报错
        logger.logError('[FFmpeg] 警告: FFmpeg 不可用，将使用命令行适配器但可能失败');
        return execAdapter;
    }

    /**
     * 重置适配器(用于测试或重新初始化)
     */
    static reset(): void {
        this.instance = null;
        this.initPromise = null;
    }

    /**
     * 更新 FFmpeg 路径并重新初始化
     * @param logger 日志记录器
     * @param ffmpegPath FFmpeg 可执行文件路径
     * @param ffprobePath FFprobe 可执行文件路径
     */
    static async updateFFmpegPath(
        logger: LogWrapper,
        ffmpegPath: string,
        ffprobePath: string
    ): Promise<void> {
        // 如果当前使用的是 Exec 适配器,更新路径
        if (this.instance && this.instance instanceof FFmpegExecAdapter) {
            logger.log(`[FFmpeg] 更新 FFmpeg 路径: ${ffmpegPath}`);
            this.instance.setFFmpegPath(ffmpegPath);
            this.instance.setFFprobePath(ffprobePath);

            // 验证新路径是否可用
            if (await this.instance.isAvailable()) {
                logger.log('[FFmpeg] 新路径验证成功 ✓');
            } else {
                logger.logError('[FFmpeg] 警告: 新 FFmpeg 路径不可用');
            }
        }
    }

    /**
     * 获取当前适配器(不初始化)
     */
    static getCurrentAdapter(): IFFmpegAdapter | null {
        return this.instance;
    }
}
