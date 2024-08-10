import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { checkFileReceived, uri2local } from '@/common/utils/file';
import fs from 'fs';

const SchemaData = {
    type: 'object',
    properties: {
        image: { type: 'string' },
    },
    required: ['image'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class OCRImage extends BaseAction<Payload, any> {
    actionName = ActionName.OCRImage;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQSystemApi = this.CoreContext.getApiContext().SystemApi;
        const { path, isLocal, errMsg, success } = (await uri2local(this.CoreContext.NapCatTempPath, payload.image));
        if (!success) {
            throw `OCR ${payload.image}失败,image字段可能格式不正确`;
        }
        if (path) {
            await checkFileReceived(path, 5000); // 文件不存在QQ会崩溃，需要提前判断
            const ret = await NTQQSystemApi.ORCImage(path);
            if (!isLocal) {
                fs.unlink(path, () => {
                });
            }
            if (!ret) {
                throw `OCR ${payload.file}失败`;
            }
            return ret.result;
        }
        if (!isLocal) {
            fs.unlink(path, () => {
            });
        }
        throw `OCR ${payload.file}失败,文件可能不存在`;
    }
}

export class IOCRImage extends OCRImage {
    actionName = ActionName.IOCRImage;
}
