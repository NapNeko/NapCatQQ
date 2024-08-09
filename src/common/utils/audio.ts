import fs from 'fs';
import { encode, getDuration, getWavFileInfo, isWav, isSilk } from 'silk-wasm';
import fsPromise from 'fs/promises';
import path from 'node:path';
import { randomUUID } from 'crypto';
import { spawn } from 'node:child_process';
import { LogWrapper } from './log';
export async function encodeSilk(filePath: string, TEMP_DIR: string, logger: LogWrapper) {
  async function guessDuration(pttPath: string) {
    const pttFileInfo = await fsPromise.stat(pttPath);
    let duration = pttFileInfo.size / 1024 / 3;  // 3kb/s
    duration = Math.floor(duration);
    duration = Math.max(1, duration);
    logger.log('通过文件大小估算语音的时长:', duration);
    return duration;
  }
  try {
    const file = await fsPromise.readFile(filePath);
    const pttPath = path.join(TEMP_DIR, randomUUID());
    if (!isSilk(file)) {
      logger.log(`语音文件${filePath}需要转换成silk`);
      const _isWav = isWav(file);
      const pcmPath = pttPath + '.pcm';
      let sampleRate = 0;
      const convert = () => {
        return new Promise<Buffer>((resolve, reject) => {
          // todo: 通过配置文件获取ffmpeg路径
          const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
          const cp = spawn(ffmpegPath, ['-y', '-i', filePath, '-ar', '24000', '-ac', '1', '-f', 's16le', pcmPath]);
          cp.on('error', err => {
            logger.log('FFmpeg处理转换出错: ', err.message);
            return reject(err);
          });
          cp.on('exit', (code, signal) => {
            const EXIT_CODES = [0, 255];
            if (code == null || EXIT_CODES.includes(code)) {
              sampleRate = 24000;
              const data = fs.readFileSync(pcmPath);
              fs.unlink(pcmPath, (err) => {
              });
              return resolve(data);
            }
            logger.log(`FFmpeg exit: code=${code ?? 'unknown'} sig=${signal ?? 'unknown'}`);
            reject(Error('FFmpeg处理转换失败'));
          });
        });
      };
      let input: Buffer;
      if (!_isWav) {
        input = await convert();
      } else {
        input = file;
        const allowSampleRate = [8000, 12000, 16000, 24000, 32000, 44100, 48000];
        const { fmt } = getWavFileInfo(input);
        // log(`wav文件信息`, fmt)
        if (!allowSampleRate.includes(fmt.sampleRate)) {
          input = await convert();
        }
      }
      const silk = await encode(input, sampleRate);
      fs.writeFileSync(pttPath, silk.data);
      logger.log(`语音文件${filePath}转换成功!`, pttPath, '时长:', silk.duration);
      return {
        converted: true,
        path: pttPath,
        duration: silk.duration / 1000
      };
    } else {
      const silk = file;
      let duration = 0;
      try {
        duration = getDuration(silk) / 1000;
      } catch (e: any) {
        logger.log('获取语音文件时长失败, 使用文件大小推测时长', filePath, e.stack);
        duration = await guessDuration(filePath);
      }

      return {
        converted: false,
        path: filePath,
        duration,
      };
    }
  } catch (error: any) {
    logger.logError('convert silk failed', error.stack);
    return {};
  }
}
