import { SatoriAction } from '../SatoriAction';

interface UploadCreatePayload {
  [key: string]: unknown;
}

interface UploadResult {
  [key: string]: string;
}

export class UploadCreateAction extends SatoriAction<UploadCreatePayload, UploadResult> {
  actionName = 'upload.create';

  async handle (payload: UploadCreatePayload): Promise<UploadResult> {
    const result: UploadResult = {};

    // 处理上传的文件
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === 'string' && value.startsWith('data:')) {
        // Base64 数据
        const matches = value.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches[1] && matches[2]) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          // 保存文件并返回 URL
          const url = await this.saveFile(base64Data, mimeType);
          result[key] = url;
        }
      } else if (typeof value === 'string') {
        // 可能是 URL，直接返回
        result[key] = value;
      }
    }

    return result;
  }

  private async saveFile (base64Data: string, _mimeType: string): Promise<string> {
    // 将 base64 数据保存为临时文件并返回 URL
    // 这里简化处理，实际应该保存到文件系统
    return `base64://${base64Data}`;
  }
}
