import fsPromise from 'fs/promises';
import path from 'node:path';
import { randomUUID } from 'crypto';
import { spawn } from 'node:child_process';
import { encode, getDuration, getWavFileInfo, isSilk, isWav } from 'silk-wasm';
import { LogWrapper } from './log';

const ALLOW_SAMPLE_RATE = [8000, 12000, 16000, 24000, 32000, 44100, 48000];
const EXIT_CODES = [0, 255];
const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';

async function guessDuration(pttPath: string, logger: LogWrapper) {
    const pttFileInfo = await fsPromise.stat(pttPath);
    const duration = Math.max(1, Math.floor(pttFileInfo.size / 1024 / 3));  // 3kb/s
    logger.log('通过文件大小估算语音的时长:', duration);
    return duration;
}

async function convert(filePath: string, pcmPath: string, logger: LogWrapper): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const cp = spawn(FFMPEG_PATH, ['-y', '-i', filePath, '-ar', '24000', '-ac', '1', '-f', 's16le', pcmPath]);
        cp.on('error', (err: Error) => {
            logger.log('FFmpeg处理转换出错: ', err.message);
            reject(err);
        });
        cp.on('exit', async (code, signal) => {
            if (code == null || EXIT_CODES.includes(code)) {
                try {
                    const data = await fsPromise.readFile(pcmPath);
                    await fsPromise.unlink(pcmPath);
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            } else {
                logger.log(`FFmpeg exit: code=${code ?? 'unknown'} sig=${signal ?? 'unknown'}`);
                reject(new Error('FFmpeg处理转换失败'));
            }
        });
    });
}

async function handleWavFile(file: Buffer, filePath: string, pcmPath: string, logger: LogWrapper): Promise<Buffer> {
    const { fmt } = getWavFileInfo(file);
    if (!ALLOW_SAMPLE_RATE.includes(fmt.sampleRate)) {
        return await convert(filePath, pcmPath, logger);
    }
    return file;
}

export async function encodeSilk(filePath: string, TEMP_DIR: string, logger: LogWrapper) {
    try {
        const file = await fsPromise.readFile(filePath);
        const pttPath = path.join(TEMP_DIR, randomUUID());
        if (!isSilk(file)) {
            logger.log(`语音文件${filePath}需要转换成silk`);
            const pcmPath = `${pttPath}.pcm`;
            const input = isWav(file) ? await handleWavFile(file, filePath, pcmPath, logger) : await convert(filePath, pcmPath, logger);
            const silk = await encode(input, 24000);
            await fsPromise.writeFile(pttPath, silk.data);
            logger.log(`语音文件${filePath}转换成功!`, pttPath, '时长:', silk.duration);
            return {
                converted: true,
                path: pttPath,
                duration: silk.duration / 1000,
            };
        } else {
            let duration = 0;
            try {
                duration = getDuration(file) / 1000;
            } catch (e: any) {
                logger.log('获取语音文件时长失败, 使用文件大小推测时长', filePath, e.stack);
                duration = await guessDuration(filePath, logger);
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