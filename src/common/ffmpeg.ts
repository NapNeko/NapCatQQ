/* eslint-disable @typescript-eslint/no-explicit-any */
import { VideoInfo } from './video';
import path from 'path';
import { fileURLToPath } from 'url';
import { runTask } from './worker';

type EncodeArgs = {
    method: 'extractThumbnail' | 'convertFile' | 'convert' | 'getVideoInfo';
    args: any[];
};

type EncodeResult = any;

function getWorkerPath() {
    return path.join(path.dirname(fileURLToPath(import.meta.url)), './ffmpeg-worker.mjs');
}

export class FFmpegService {
    public static async extractThumbnail(videoPath: string, thumbnailPath: string): Promise<void> {
        await runTask<EncodeArgs, EncodeResult>(getWorkerPath(), { method: 'extractThumbnail', args: [videoPath, thumbnailPath] });
    }

    public static async convertFile(inputFile: string, outputFile: string, format: string): Promise<void> {
        await runTask<EncodeArgs, EncodeResult>(getWorkerPath(), { method: 'convertFile', args: [inputFile, outputFile, format] });
    }

    public static async convert(filePath: string, pcmPath: string): Promise<Buffer> {
        const result = await runTask<EncodeArgs, EncodeResult>(getWorkerPath(), { method: 'convert', args: [filePath, pcmPath] });
        return result;
    }

    public static async getVideoInfo(videoPath: string, thumbnailPath: string): Promise<VideoInfo> {
        const result = await runTask<EncodeArgs, EncodeResult>(getWorkerPath(), { method: 'getVideoInfo', args: [videoPath, thumbnailPath] });
        return result;
    }
}
