import { GetFileBase, GetFilePayload, GetFileResponse } from './GetFile';
import { ActionName } from '@/napcat-onebot/action/router';
import { promises as fs } from 'fs';
import { FFmpegService } from '@/napcat-core/helper/ffmpeg/ffmpeg';

const out_format = ['mp3', 'amr', 'wma', 'm4a', 'spx', 'ogg', 'wav', 'flac'];

type Payload = {
  out_format: string;
} & GetFilePayload;

export default class GetRecord extends GetFileBase {
  override actionName = ActionName.GetRecord;

  override async _handle (payload: Payload): Promise<GetFileResponse> {
    const res = await super._handle(payload);
    if (payload.out_format && typeof payload.out_format === 'string') {
      const inputFile = res.file;
      if (!inputFile) throw new Error('file not found');
      if (!out_format.includes(payload.out_format)) {
        throw new Error('转换失败 out_format 字段可能格式不正确');
      }
      const outputFile = `${inputFile}.${payload.out_format}`;
      try {
        await fs.access(inputFile);
        try {
          await fs.access(outputFile);
        } catch {
          await FFmpegService.convertAudioFmt(inputFile, outputFile, payload.out_format);
        }
        const base64Data = await fs.readFile(outputFile, { encoding: 'base64' });
        res.file = outputFile;
        res.url = outputFile;
        res.base64 = base64Data;
      } catch (error) {
        console.error('Error processing file:', error);
        throw error; // 重新抛出错误以便调用者可以处理
      }
    }
    return res;
  }
}
