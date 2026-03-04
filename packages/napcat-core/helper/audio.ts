import fsPromise from 'fs/promises';
import path from 'node:path';
import { randomUUID } from 'crypto';
import { LogWrapper } from '@/napcat-core/helper/log';
import { FFmpegService } from '@/napcat-core/helper/ffmpeg/ffmpeg';

async function guessDuration (pttPath: string, logger: LogWrapper) {
  const pttFileInfo = await fsPromise.stat(pttPath);
  const duration = Math.max(1, Math.floor(pttFileInfo.size / 1024 / 3)); // 3kb/s
  logger.log('通过文件大小估算语音的时长:', duration);
  return duration;
}

export async function encodeSilk (filePath: string, TEMP_DIR: string, logger: LogWrapper) {
  try {
    const pttPath = path.join(TEMP_DIR, randomUUID());
    if (!(await FFmpegService.isSilk(filePath))) {
      logger.log(`语音文件${filePath}需要转换成silk`);
      await FFmpegService.convertToNTSilkTct(filePath, pttPath);
      const duration = await FFmpegService.getDuration(filePath);
      logger.log(`语音文件${filePath}转换成功!`, pttPath, '时长:', duration);
      return {
        converted: true,
        path: pttPath,
        duration: duration,
      };
    } else {
      let duration = 0;
      try {
        duration = await FFmpegService.getDuration(filePath);
      } catch (e: unknown) {
        logger.log('获取语音文件时长失败, 使用文件大小推测时长', filePath, (e as Error).stack);
        duration = await guessDuration(filePath, logger);
      }
      return {
        converted: false,
        path: filePath,
        duration,
      };
    }
  } catch (error: unknown) {
    logger.logError('convert silk failed', error);
    return {};
  }
}
