import fsPromise from 'fs/promises';
import path from 'node:path';
import { randomUUID } from 'crypto';
import { EncodeResult, getDuration, getWavFileInfo, isSilk, isWav } from 'silk-wasm';
import { LogWrapper } from '@/common/log';
import { EncodeArgs } from '@/common/audio-worker';
import { FFmpegService } from '@/common/ffmpeg';
import { runTask } from './worker';
import { fileURLToPath } from 'node:url';

const ALLOW_SAMPLE_RATE = [8000, 12000, 16000, 24000, 32000, 44100, 48000];

function getWorkerPath() {
    //return new URL(/* @vite-ignore */ './audio-worker.mjs', import.meta.url).href;
    return path.join(path.dirname(fileURLToPath(import.meta.url)), 'audio-worker.mjs');
}


async function guessDuration(pttPath: string, logger: LogWrapper) {
    const pttFileInfo = await fsPromise.stat(pttPath);
    const duration = Math.max(1, Math.floor(pttFileInfo.size / 1024 / 3)); // 3kb/s
    logger.log('通过文件大小估算语音的时长:', duration);
    return duration;
}

async function handleWavFile(
    file: Buffer,
    filePath: string,
    pcmPath: string
): Promise<{ input: Buffer; sampleRate: number }> {
    const { fmt } = getWavFileInfo(file);
    if (!ALLOW_SAMPLE_RATE.includes(fmt.sampleRate)) {
        return { input: await FFmpegService.convert(filePath, pcmPath), sampleRate: 24000 };
    }
    return { input: file, sampleRate: fmt.sampleRate };
}

export async function encodeSilk(filePath: string, TEMP_DIR: string, logger: LogWrapper) {
    try {
        const file = await fsPromise.readFile(filePath);
        const pttPath = path.join(TEMP_DIR, randomUUID());
        if (!isSilk(file)) {
            logger.log(`语音文件${filePath}需要转换成silk`);
            const pcmPath = `${pttPath}.pcm`;
            const { input, sampleRate } = isWav(file)
                ? await handleWavFile(file, filePath, pcmPath)
                : { input: await FFmpegService.convert(filePath, pcmPath), sampleRate: 24000 };
            const silk = await runTask<EncodeArgs, EncodeResult>(getWorkerPath(), { input: input, sampleRate: sampleRate });
            fsPromise.unlink(pcmPath).catch((e) => logger.logError('删除临时文件失败', pcmPath, e));
            await fsPromise.writeFile(pttPath, Buffer.from(silk.data));
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
        logger.logError('convert silk failed', (error as Error).stack);
        return {};
    }
}
