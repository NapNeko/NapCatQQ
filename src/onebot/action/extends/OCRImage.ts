import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { checkFileExist, uriToLocalFile } from '@/common/file';
import fs from 'fs';
import { Static, Type } from '@sinclair/typebox';
import { GeneralCallResultStatus } from '@/core';

const SchemaData = Type.Object({
    image: Type.String(),
});

type Payload = Static<typeof SchemaData>;

class OCRImageBase extends OneBotAction<Payload, GeneralCallResultStatus> {
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const { path, success } = await uriToLocalFile(this.core.NapCatTempPath, payload.image);
        if (!success) {
            throw new Error(`OCR ${payload.image}失败, image字段可能格式不正确`);
        }
        if (path) {
            try {
                await checkFileExist(path, 5000); // 避免崩溃
                const ret = await this.core.apis.SystemApi.ocrImage(path);
                if (!ret) {
                    throw new Error(`OCR ${payload.image}失败`);
                }
                return ret.result;
            } finally {
                fs.unlink(path, () => { });
            }
        }
        throw new Error(`OCR ${payload.image}失败, 文件可能不存在`);
    }
}

export class OCRImage extends OCRImageBase {
    override actionName = ActionName.OCRImage;
}

export class IOCRImage extends OCRImageBase {
    override actionName = ActionName.IOCRImage;
}