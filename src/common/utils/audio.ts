import fs from 'fs';
import { encode, getDuration, getWavFileInfo, isWav } from 'silk-wasm';
import fsPromise from 'fs/promises';
import { log } from './log';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'node:child_process';
import { getTempDir } from '@/common/utils/file';

let TEMP_DIR = './';
setTimeout(() => {
  TEMP_DIR = getTempDir();
}, 100);
export async function encodeSilk(filePath: string) {
  function getFileHeader(filePath: string) {
    // 定义要读取的字节数
    const bytesToRead = 7;
    try {
      const buffer = fs.readFileSync(filePath, {
        encoding: null,
        flag: 'r',
      });

      const fileHeader = buffer.toString('hex', 0, bytesToRead);
      return fileHeader;
    } catch (err) {
      console.error('读取文件错误:', err);
      return;
    }
  }

  async function isWavFile(filePath: string) {
    return isWav(fs.readFileSync(filePath));
  }

  async function guessDuration(pttPath: string) {
    const pttFileInfo = await fsPromise.stat(pttPath);
    let duration = pttFileInfo.size / 1024 / 3;  // 3kb/s
    duration = Math.floor(duration);
    duration = Math.max(1, duration);
    log('通过文件大小估算语音的时长:', duration);
    return duration;
  }

  // function verifyDuration(oriDuration: number, guessDuration: number) {
  //     // 单位都是秒
  //     if (oriDuration - guessDuration > 10) {
  //         return guessDuration
  //     }
  //     oriDuration = Math.max(1, oriDuration)
  //     return oriDuration
  // }
  // async function getAudioSampleRate(filePath: string) {
  //     try {
  //         const mm = await import('music-metadata');
  //         const metadata = await mm.parseFile(filePath);
  //         log(`${filePath}采样率`, metadata.format.sampleRate);
  //         return metadata.format.sampleRate;
  //     } catch (error) {
  //         log(`${filePath}采样率获取失败`, error.stack);
  //         // console.error(error);
  //     }
  // }

  try {
    const pttPath = path.join(TEMP_DIR, uuidv4());
    if (getFileHeader(filePath) !== '02232153494c4b') {
      log(`语音文件${filePath}需要转换成silk`);
      const _isWav = await isWavFile(filePath);
      const pcmPath = pttPath + '.pcm';
      let sampleRate = 0;
      const convert = () => {
        return new Promise<Buffer>((resolve, reject) => {
          // todo: 通过配置文件获取ffmpeg路径
          const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
          const cp = spawn(ffmpegPath, ['-y', '-i', filePath, '-ar', '24000', '-ac', '1', '-f', 's16le', pcmPath]);
          cp.on('error', err => {
            log('FFmpeg处理转换出错: ', err.message);
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
            log(`FFmpeg exit: code=${code ?? 'unknown'} sig=${signal ?? 'unknown'}`);
            reject(Error('FFmpeg处理转换失败'));
          });
        });
      };
      let input: Buffer;
      if (!_isWav) {
        input = await convert();
      } else {
        input = fs.readFileSync(filePath);
        const allowSampleRate = [8000, 12000, 16000, 24000, 32000, 44100, 48000];
        const { fmt } = getWavFileInfo(input);
        // log(`wav文件信息`, fmt)
        if (!allowSampleRate.includes(fmt.sampleRate)) {
          input = await convert();
        }
      }
      const silk = await encode(input, sampleRate);
      fs.writeFileSync(pttPath, silk.data);
      log(`语音文件${filePath}转换成功!`, pttPath, '时长:', silk.duration);
      return {
        converted: true,
        path: pttPath,
        duration: silk.duration / 1000
      };
    } else {
      const silk = fs.readFileSync(filePath);
      let duration = 0;
      try {
        duration = getDuration(silk) / 1000;
      } catch (e: any) {
        log('获取语音文件时长失败, 使用文件大小推测时长', filePath, e.stack);
        duration = await guessDuration(filePath);
      }

      return {
        converted: false,
        path: filePath,
        duration,
      };
    }
  } catch (error: any) {
    log('convert silk failed', error.stack);
    return {};
  }
}
