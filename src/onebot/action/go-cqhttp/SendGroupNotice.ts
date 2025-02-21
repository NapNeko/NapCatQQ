import { checkFileExist, uriToLocalFile } from '@/common/file';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { unlink } from 'node:fs/promises';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    content: Type.String(),
    image: Type.Optional(Type.String()),
    pinned: Type.Union([Type.Number(), Type.String()], { default: 0 }),
    type: Type.Union([Type.Number(), Type.String()], { default: 1 }),
    confirm_required: Type.Union([Type.Number(), Type.String()], { default: 1 }),
    is_show_edit_card: Type.Union([Type.Number(), Type.String()], { default: 0 }),
    tip_window_type: Type.Union([Type.Number(), Type.String()], { default: 0 })
});

type Payload = Static<typeof SchemaData>;

export class SendGroupNotice extends OneBotAction<Payload, null> {
    override actionName = ActionName.GoCQHTTP_SendGroupNotice;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload) {

        let UploadImage: { id: string, width: number, height: number } | undefined = undefined;
        if (payload.image) {
            //公告图逻辑
            const {
                path,
                success,
            } = (await uriToLocalFile(this.core.NapCatTempPath, payload.image));
            if (!success) {
                throw new Error(`群公告${payload.image}设置失败,image字段可能格式不正确`);
            }
            if (!path) {
                throw new Error(`群公告${payload.image}设置失败,获取资源失败`);
            }
            await checkFileExist(path, 5000);
            const ImageUploadResult = await this.core.apis.GroupApi.uploadGroupBulletinPic(payload.group_id.toString(), path);
            if (ImageUploadResult.errCode != 0) {
                throw new Error(`群公告${payload.image}设置失败,图片上传失败`);
            }

            unlink(path).catch(() => { });

            UploadImage = ImageUploadResult.picInfo;
        }
        const publishGroupBulletinResult = await this.core.apis.WebApi.setGroupNotice(
            payload.group_id.toString(),
            payload.content,
            +payload.pinned,
            +payload.type,
            +payload.is_show_edit_card,
            +payload.tip_window_type,
            +payload.confirm_required,
            UploadImage?.id,
            UploadImage?.width,
            UploadImage?.height
        );
        if (!publishGroupBulletinResult || publishGroupBulletinResult.ec != 0) {
            throw new Error(`设置群公告失败,错误信息:${publishGroupBulletinResult?.em}`);
        }
        return null;
    }
}
