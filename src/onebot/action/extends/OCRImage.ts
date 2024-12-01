import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { checkFileExist, uri2local } from '@/common/file';
import fs from 'fs';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    image: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class OCRImage extends OneBotAction<Payload, any> {
    actionName = ActionName.OCRImage;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const { path, success } = (await uri2local(this.core.NapCatTempPath, payload.image));
        if (!success) {
            throw new Error(`OCR ${payload.image}失败,image字段可能格式不正确`);
        }
        if (path) {
            await checkFileExist(path, 5000); // 避免崩溃
            const ret = await this.core.apis.SystemApi.ocrImage(path);
            fs.unlink(path, () => { });

            if (!ret) {
                throw new Error(`OCR ${payload.image}失败`);
            }
            return ret.result;
        }
        fs.unlink(path, () => { });
        throw new Error(`OCR ${payload.image}失败,文件可能不存在`);
    }
}

export class IOCRImage extends OCRImage {
    actionName = ActionName.IOCRImage;
}
