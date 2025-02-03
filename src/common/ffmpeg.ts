/* eslint-disable @typescript-eslint/no-explicit-any */
import Piscina from 'piscina/src';
import { VideoInfo } from './video';

type EncodeArgs = {
    method: 'extractThumbnail' | 'convertFile' | 'convert' | 'getVideoInfo';
    args: any[];
};

type EncodeResult = any;

async function getWorkerPath() {
    return new URL(/* @vite-ignore */ './ffmpeg-worker.mjs', import.meta.url).href;
}

export class FFmpegService {
    public static async extractThumbnail(videoPath: string, thumbnailPath: string): Promise<void> {
        const piscina = new Piscina<EncodeArgs, EncodeResult>({
            filename: await getWorkerPath(),
        });
        await piscina.run({ method: 'extractThumbnail', args: [videoPath, thumbnailPath] });
        await piscina.destroy();
    }

    public static async convertFile(inputFile: string, outputFile: string, format: string): Promise<void> {
        const piscina = new Piscina<EncodeArgs, EncodeResult>({
            filename: await getWorkerPath(),
        });
        await piscina.run({ method: 'convertFile', args: [inputFile, outputFile, format] });
        await piscina.destroy();
    }

    public static async convert(filePath: string, pcmPath: string): Promise<Buffer> {
        const piscina = new Piscina<EncodeArgs, EncodeResult>({
            filename: await getWorkerPath(),
        });
        const result = await piscina.run({ method: 'convert', args: [filePath, pcmPath] });
        await piscina.destroy();
        return result;
    }

    public static async getVideoInfo(videoPath: string, thumbnailPath: string): Promise<VideoInfo> {
        const piscina = new Piscina<EncodeArgs, EncodeResult>({
            filename: await getWorkerPath(),
        });
        const result = await piscina.run({ method: 'getVideoInfo', args: [videoPath, thumbnailPath] });
        await piscina.destroy();
        return result;
    }
}