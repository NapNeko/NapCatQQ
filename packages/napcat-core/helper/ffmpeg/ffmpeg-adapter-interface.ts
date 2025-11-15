/**
 * FFmpeg Adapter Interface
 * 定义统一的 FFmpeg 操作接口,支持多种实现方式
 */

/**
 * 视频信息结果
 */
export interface VideoInfoResult {
  /** 视频宽度(像素) */
  width: number;
  /** 视频高度(像素) */
  height: number;
  /** 视频时长(秒) */
  duration: number;
  /** 容器格式 */
  format: string;
  /** 缩略图 Buffer */
  thumbnail?: Buffer;
}

/**
 * FFmpeg 适配器接口
 */
export interface IFFmpegAdapter {
  /** 适配器名称 */
  readonly name: string;

  /** 是否可用 */
  isAvailable(): Promise<boolean>;

  /**
     * 获取视频信息(包含缩略图)
     * @param videoPath 视频文件路径
     * @returns 视频信息
     */
  getVideoInfo(videoPath: string): Promise<VideoInfoResult>;

  /**
     * 获取音视频文件时长
     * @param filePath 文件路径
     * @returns 时长(秒)
     */
  getDuration(filePath: string): Promise<number>;

  /**
     * 转换音频为 PCM 格式
     * @param filePath 输入文件路径
     * @param pcmPath 输出 PCM 文件路径
     * @returns PCM 数据 Buffer
     */
  convertToPCM(filePath: string, pcmPath: string): Promise<{ result: boolean, sampleRate: number }>;

  /**
     * 转换音频文件
     * @param inputFile 输入文件路径
     * @param outputFile 输出文件路径
     * @param format 目标格式 ('amr' | 'silk' 等)
     */
  convertFile(inputFile: string, outputFile: string, format: string): Promise<void>;

  /**
     * 提取视频缩略图
     * @param videoPath 视频文件路径
     * @param thumbnailPath 缩略图输出路径
     */
  extractThumbnail(videoPath: string, thumbnailPath: string): Promise<void>;
}
