import { GetFileBase, GetFilePayload, GetFileResponse } from './GetFile';
import { ActionName } from '../types';
import { spawn } from 'node:child_process';
import { promises as fs } from 'fs';

const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';

interface Payload extends GetFilePayload {
    out_format: 'mp3' | 'amr' | 'wma' | 'm4a' | 'spx' | 'ogg' | 'wav' | 'flac';
}

export default class GetRecord extends GetFileBase {
    actionName = ActionName.GetRecord;

    async _handle(payload: Payload): Promise<GetFileResponse> {
        const res = await super._handle(payload);
        if (payload.out_format && typeof payload.out_format === 'string') {
            const inputFile = res.file;
            const outputFile = `${inputFile}.${payload.out_format}`;
            if (!inputFile) throw new Error('file not found');
            try {
                await fs.access(inputFile);
                await this.convertFile(inputFile, outputFile, payload.out_format);
                const base64Data = await fs.readFile(outputFile, { encoding: 'base64' });
                res.file = outputFile;
                res.url = outputFile;
                res.base64 = base64Data;
            } catch (error) {
                console.error('Error processing file:', error);
            }
        }
        return res;
    }

    private convertFile(inputFile: string, outputFile: string, format: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const ffmpeg = spawn(FFMPEG_PATH, ['-i', inputFile, outputFile]);

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`ffmpeg process exited with code ${code}`));
                }
            });

            ffmpeg.on('error', (error) => {
                reject(error);
            });
        });
    }
}