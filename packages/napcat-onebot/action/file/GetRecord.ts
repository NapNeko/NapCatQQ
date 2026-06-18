import { GetFileBase, GetFilePayload, GetFileResponse } from './GetFile';
import { ActionName } from '@/napcat-onebot/action/router';
import { promises as fs } from 'fs';
import { FFmpegService } from '@/napcat-core/helper/ffmpeg/ffmpeg';
import { Static, Type } from '@sinclair/typebox';

import { FileActionsExamples } from '../example/FileActionsExamples';

const out_format_list = ['mp3', 'amr', 'wma', 'm4a', 'spx', 'ogg', 'wav', 'flac'];

const PayloadSchema = Type.Object({
  file: Type.Optional(Type.String({ description: '文件路径、URL或Base64' })),
  file_id: Type.Optional(Type.String({ description: '文件ID' })),
  out_format: Type.String({ description: '输出格式' }),
});

type PayloadType = Static<typeof PayloadSchema>;

export default class GetRecord extends GetFileBase {
  override actionName = ActionName.GetRecord;
  override payloadSchema = PayloadSchema;
  override actionSummary = '获取语音';
  override actionDescription = '获取指定语音文件的信息，并支持格式转换';
  override actionTags = ['文件接口'];
  override payloadExample = FileActionsExamples.GetRecord.payload;
  override returnExample = FileActionsExamples.GetRecord.response;

  override async _handle (payload: PayloadType): Promise<GetFileResponse> {
    const res = await super._handle(payload as GetFilePayload);
    if (payload.out_format && typeof payload.out_format === 'string') {
      const inputFile = res.file;
      if (!inputFile) throw new Error('file not found');
      if (!out_format_list.includes(payload.out_format)) {
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
