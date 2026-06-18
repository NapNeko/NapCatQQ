/**
 * FFmpeg Node.js Native Addon Type Definitions
 *
 * This addon provides FFmpeg functionality for Node.js including:
 * - Video information extraction with thumbnail generation
 * - Audio/Video duration detection
 * - Audio format conversion to NTSILK
 * - Audio decoding to PCM
 */

/**
 * Video information result object
 */
export interface VideoInfo {
  /** Video width in pixels */
  width: number;

  /** Video height in pixels */
  height: number;

  /** Video duration in seconds */
  duration: number;

  /** Container format name (e.g., "mp4", "mkv", "avi") */
  format: string;

  /** Video codec name (e.g., "h264", "hevc", "vp9") */
  videoCodec: string;

  /** First frame thumbnail as BMP image buffer */
  image: Buffer;
}

/**
 * Audio PCM decoding result object
 */
export interface AudioPCMResult {
  /** PCM audio data as 16-bit signed integer samples */
  pcm: Buffer;

  /** Sample rate in Hz (e.g., 44100, 48000, 24000) */
  sampleRate: number;

  /** Number of audio channels (1 for mono, 2 for stereo) */
  channels: number;
}

/**
 * FFmpeg interface providing all audio/video processing methods
 */
export interface FFmpeg {
  convertFile (inputFile: string, outputFile: string, format: string): Promise<{ success: boolean; }>;
  /**
     * Get video information including resolution, duration, format, codec and first frame thumbnail
     */
  getVideoInfo (filePath: string, format?: 'bmp' | 'bmp24'): Promise<VideoInfo>;

  /**
     * Get duration of audio or video file in seconds
     */
  getDuration (filePath: string): Promise<number>;

  /**
     * Convert audio file to NTSILK format (WeChat voice message format)
     */
  convertToNTSilkTct (inputPath: string, outputPath: string): Promise<void>;

  /**
     * Decode audio file to raw PCM data
     */
  decodeAudioToPCM (filePath: string, pcmPath: string, sampleRate?: number): Promise<{ result: boolean, sampleRate: number; }>;
  decodeAudioToFmt (filePath: string, pcmPath: string, format: string): Promise<{ channels: number; sampleRate: number; format: string; }>;

  convertToNTSilkTct (inputFile: string, outputFile: string): Promise<void>;
}
