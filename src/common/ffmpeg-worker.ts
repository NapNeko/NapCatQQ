import { FFmpeg } from '@ffmpeg.wasm/main';
import { randomUUID } from 'crypto';
import { readFileSync, statSync, writeFileSync } from 'fs';
import type { VideoInfo } from './video';
import { fileTypeFromFile } from 'file-type';
import imageSize from 'image-size';
class FFmpegService {
    public static async extractThumbnail(videoPath: string, thumbnailPath: string): Promise<void> {
        const ffmpegInstance = await FFmpeg.create({ core: '@ffmpeg.wasm/core-mt' });
        const videoFileName = `${randomUUID()}.mp4`;
        const outputFileName = `${randomUUID()}.jpg`;
        try {
            ffmpegInstance.fs.writeFile(videoFileName, readFileSync(videoPath));
            const code = await ffmpegInstance.run('-i', videoFileName, '-ss', '00:00:01.000', '-vframes', '1', outputFileName);
            if (code !== 0) {
                throw new Error('Error extracting thumbnail: FFmpeg process exited with code ' + code);
            }
            const thumbnail = ffmpegInstance.fs.readFile(outputFileName);
            writeFileSync(thumbnailPath, thumbnail);
        } catch (error) {
            console.error('Error extracting thumbnail:', error);
            throw error;
        } finally {
            try {
                ffmpegInstance.fs.unlink(outputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking output file:', unlinkError);
            }
            try {
                ffmpegInstance.fs.unlink(videoFileName);
            } catch (unlinkError) {
                console.error('Error unlinking video file:', unlinkError);
            }
        }
    }

    public static async convertFile(inputFile: string, outputFile: string, format: string): Promise<void> {
        const ffmpegInstance = await FFmpeg.create({ core: '@ffmpeg.wasm/core-mt' });
        const inputFileName = `${randomUUID()}.pcm`;
        const outputFileName = `${randomUUID()}.${format}`;
        try {
            ffmpegInstance.fs.writeFile(inputFileName, readFileSync(inputFile));
            const params = format === 'amr'
                ? ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', inputFileName, '-ar', '8000', '-b:a', '12.2k', outputFileName]
                : ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', inputFileName, outputFileName];
            const code = await ffmpegInstance.run(...params);
            if (code !== 0) {
                throw new Error('Error extracting thumbnail: FFmpeg process exited with code ' + code);
            }
            const outputData = ffmpegInstance.fs.readFile(outputFileName);
            writeFileSync(outputFile, outputData);
        } catch (error) {
            console.error('Error converting file:', error);
            throw error;
        } finally {
            try {
                ffmpegInstance.fs.unlink(outputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking output file:', unlinkError);
            }
            try {
                ffmpegInstance.fs.unlink(inputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking input file:', unlinkError);
            }
        }
    }

    public static async convert(filePath: string, pcmPath: string): Promise<Buffer> {
        const ffmpegInstance = await FFmpeg.create({ core: '@ffmpeg.wasm/core-mt' });
        const inputFileName = `${randomUUID()}.input`;
        const outputFileName = `${randomUUID()}.pcm`;
        try {
            ffmpegInstance.fs.writeFile(inputFileName, readFileSync(filePath));
            const params = ['-y', '-i', inputFileName, '-ar', '24000', '-ac', '1', '-f', 's16le', outputFileName];
            const code = await ffmpegInstance.run(...params);
            if (code !== 0) {
                throw new Error('FFmpeg process exited with code ' + code);
            }
            const outputData = ffmpegInstance.fs.readFile(outputFileName);
            writeFileSync(pcmPath, outputData);
            return Buffer.from(outputData);
        } catch (error: any) {
            throw new Error('FFmpeg处理转换出错: ' + error.message);
        } finally {
            try {
                ffmpegInstance.fs.unlink(outputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking output file:', unlinkError);
            }
            try {
                ffmpegInstance.fs.unlink(inputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking output file:', unlinkError);
            }
        }
    }

    public static async getVideoInfo(videoPath: string, thumbnailPath: string): Promise<VideoInfo> {
        await FFmpegService.extractThumbnail(videoPath, thumbnailPath);
        const fileType = (await fileTypeFromFile(videoPath))?.ext ?? 'mp4';
        const inputFileName = `${randomUUID()}.${fileType}`;
        const ffmpegInstance = await FFmpeg.create({ core: '@ffmpeg.wasm/core-mt' });
        ffmpegInstance.fs.writeFile(inputFileName, readFileSync(videoPath));
        ffmpegInstance.setLogging(true);
        let duration = 60;
        ffmpegInstance.setLogger((_level, ...msg) => {
            const message = msg.join(' ');
            const durationMatch = message.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
            if (durationMatch) {
                const hours = parseInt(durationMatch[1] ?? '0', 10);
                const minutes = parseInt(durationMatch[2] ?? '0', 10);
                const seconds = parseFloat(durationMatch[3] ?? '0');
                duration = hours * 3600 + minutes * 60 + seconds;
            }
        });
        await ffmpegInstance.run('-i', inputFileName);
        const image = imageSize(thumbnailPath);
        ffmpegInstance.fs.unlink(inputFileName);
        const fileSize = statSync(videoPath).size;
        return {
            width: image.width ?? 100,
            height: image.height ?? 100,
            time: duration,
            format: fileType,
            size: fileSize,
            filePath: videoPath
        };
    }
}
type FFmpegMethod = 'extractThumbnail' | 'convertFile' | 'convert' | 'getVideoInfo';

interface FFmpegTask {
    method: FFmpegMethod;
    args: any[];
}
export default async function handleFFmpegTask({ method, args }: FFmpegTask): Promise<any> {
    switch (method) {
    case 'extractThumbnail':
        return await FFmpegService.extractThumbnail(...args as [string, string]);
    case 'convertFile':
        return await FFmpegService.convertFile(...args as [string, string, string]);
    case 'convert':
        return await FFmpegService.convert(...args as [string, string]);
    case 'getVideoInfo':
        return await FFmpegService.getVideoInfo(...args as [string, string]);
    default:
        throw new Error(`Unknown method: ${method}`);
    }
}