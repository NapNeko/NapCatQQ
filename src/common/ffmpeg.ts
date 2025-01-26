import { FFmpeg } from '@ffmpeg.wasm/main';
import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { LogWrapper } from './log';

class FFmpegService {
    private ffmpegRef: FFmpeg;

    constructor(ffmpegRef: FFmpeg) {
        this.ffmpegRef = ffmpegRef;
    }

    public async extractThumbnail(videoPath: string, thumbnailPath: string): Promise<void> {
        const videoFileName = `${randomUUID()}.mp4`;
        const outputFileName = `${randomUUID()}.jpg`;
        try {
            this.ffmpegRef.fs.writeFile(videoFileName, readFileSync(videoPath));
            let code = await this.ffmpegRef.run('-i', videoFileName, '-ss', '00:00:01.000', '-vframes', '1', outputFileName);
            if (code! === 0) {
                throw new Error('Error extracting thumbnail: FFmpeg process exited with code ' + code);
            }
            const thumbnail = this.ffmpegRef.fs.readFile(outputFileName);
            writeFileSync(thumbnailPath, thumbnail);
        } catch (error) {
            console.error('Error extracting thumbnail:', error);
            throw error;
        } finally {
            try {
                this.ffmpegRef.fs.unlink(outputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking output file:', unlinkError);
            }
            try {
                this.ffmpegRef.fs.unlink(videoFileName);
            } catch (unlinkError) {
                console.error('Error unlinking video file:', unlinkError);
            }
        }
    }

    public async convertFile(inputFile: string, outputFile: string, format: string): Promise<void> {
        const inputFileName = `${randomUUID()}.pcm`;
        const outputFileName = `${randomUUID()}.${format}`;
        try {
            this.ffmpegRef.fs.writeFile(inputFileName, readFileSync(inputFile));
            const params = format === 'amr'
                ? ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', inputFileName, '-ar', '8000', '-b:a', '12.2k', outputFileName]
                : ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', inputFileName, outputFileName];
            let code = await this.ffmpegRef.run(...params);
            if (code! === 0) {
                throw new Error('Error extracting thumbnail: FFmpeg process exited with code ' + code);
            }
            const outputData = this.ffmpegRef.fs.readFile(outputFileName);
            writeFileSync(outputFile, outputData);
        } catch (error) {
            console.error('Error converting file:', error);
            throw error;
        } finally {
            try {
                this.ffmpegRef.fs.unlink(outputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking output file:', unlinkError);
            }
            try {
                this.ffmpegRef.fs.unlink(inputFileName);
            } catch (unlinkError) {
                console.error('Error unlinking input file:', unlinkError);
            }
        }
    }

    public async convert(filePath: string, pcmPath: string, logger: LogWrapper): Promise<Buffer> {
        const inputFileName = `${randomUUID()}.input`;
        const outputFileName = `${randomUUID()}.pcm`;
        try {
            this.ffmpegRef.fs.writeFile(inputFileName, readFileSync(filePath));
            const params = ['-y', '-i', inputFileName, '-ar', '24000', '-ac', '1', '-f', 's16le', outputFileName];
            let code = await this.ffmpegRef.run(...params);
            if (code! === 0) {
                throw new Error('FFmpeg process exited with code ' + code);
            }
            const outputData = this.ffmpegRef.fs.readFile(outputFileName);
            writeFileSync(pcmPath, outputData);
            return  Buffer.from(outputData);
        } catch (error: any) {
            logger.log('FFmpeg处理转换出错: ', error.message);
            throw error;
        } finally {
            try {
                this.ffmpegRef.fs.unlink(outputFileName);
            } catch (unlinkError) {
                logger.log('Error unlinking output file:', unlinkError);
            }
            try {
                this.ffmpegRef.fs.unlink(inputFileName);
            } catch (unlinkError) {
                logger.log('Error unlinking input file:', unlinkError);
            }
        }
    }
}

const ffmpegInstance = await FFmpeg.create({ core: '@ffmpeg.wasm/core-mt' });
export const ffmpegService = new FFmpegService(ffmpegInstance);