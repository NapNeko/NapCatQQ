import { checkFileReceived, uri2local } from '@/common/file';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { unlink } from 'node:fs';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        content: { type: 'string' },
        image: { type: 'string' },
        pinned: { type: ['number', 'string'] },
        confirm_required: { type: ['number', 'string'] },
    },
    required: ['group_id', 'content'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SendGroupNotice extends BaseAction<Payload, null> {
    actionName = ActionName.GoCQHTTP_SendGroupNotice;

    async _handle(payload: Payload) {
        const NTQQGroupApi = this.core.apis.GroupApi;
        let UploadImage: { id: string, width: number, height: number } | undefined = undefined;
        if (payload.image) {
            //公告图逻辑
            const {
                path,
                isLocal,
                success,
            } = (await uri2local(this.core.NapCatTempPath, payload.image));
            if (!success) {
                throw `群公告${payload.image}设置失败,image字段可能格式不正确`;
            }
            if (!path) {
                throw `群公告${payload.image}设置失败,获取资源失败`;
            }
            await checkFileReceived(path, 5000); // 文件不存在QQ会崩溃，需要提前判断
            const ImageUploadResult = await NTQQGroupApi.uploadGroupBulletinPic(payload.group_id.toString(), path);
            if (ImageUploadResult.errCode != 0) {
                throw `群公告${payload.image}设置失败,图片上传失败`;
            }
            if (!isLocal) {
                unlink(path, () => {
                });
            }
            UploadImage = ImageUploadResult.picInfo;
        }
        const noticePinned = +(payload.pinned ?? 0);
        const noticeConfirmRequired = +(payload.confirm_required ?? 0);
        const publishGroupBulletinResult = await NTQQGroupApi.publishGroupBulletin(payload.group_id.toString(), payload.content, UploadImage, noticePinned, noticeConfirmRequired);

        if (publishGroupBulletinResult.result != 0) {
            throw `设置群公告失败,错误信息:${publishGroupBulletinResult.errMsg}`;
        }
        return null;
    }
}
