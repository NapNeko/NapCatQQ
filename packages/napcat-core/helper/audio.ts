import path from 'node:path';
import { randomUUID } from 'crypto';
import { LogWrapper } from '@/napcat-core/helper/log';
import { FFmpegService } from '@/napcat-core/helper/ffmpeg/ffmpeg';

export async function encodeSilk (filePath: string, temporaryDirectory: string, logger: LogWrapper) {
  const converted = !(await FFmpegService.isSilk(filePath));
  const pttPath = converted ? path.join(temporaryDirectory, randomUUID()) : filePath;
  if (converted) {
    logger.log(`语音文件${filePath}需要转换成silk`);
    await FFmpegService.convertToNTSilkTct(filePath, pttPath);
  }
  const duration = await FFmpegService.getDuration(pttPath);
  logger.log('语音文件已就绪:', pttPath, '时长:', duration);
  return { converted, path: pttPath, duration };
}
