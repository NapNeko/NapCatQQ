import { checkFileExist, uri2local } from '@/common/file';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { unlink } from 'node:fs';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    content: Type.String(),
    image: Type.Optional(Type.String()),
    pinned: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    type: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    confirm_required: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    is_show_edit_card: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    tip_window_type: Type.Optional(Type.Union([Type.Number(), Type.String()]))
});

type Payload = Static<typeof SchemaData>;

export class SendGroupNotice extends OneBotAction<Payload, null> {
    actionName = ActionName.GoCQHTTP_SendGroupNotice;

    async _handle(payload: Payload) {

        let UploadImage: { id: string, width: number, height: number } | undefined = undefined;
        if (payload.image) {
            //公告图逻辑
            const {
                path,
                success,
            } = (await uri2local(this.core.NapCatTempPath, payload.image));
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

            unlink(path, () => {
            });

            UploadImage = ImageUploadResult.picInfo;
        }

        const noticeType = +(payload.type ?? 1);
        const noticePinned = +(payload.pinned ?? 0);

        const noticeShowEditCard = +(payload.is_show_edit_card ?? 0);
        const noticeTipWindowType = +(payload.tip_window_type ?? 0);
        const noticeConfirmRequired = +(payload.confirm_required ?? 1);
        const publishGroupBulletinResult = await this.core.apis.WebApi.setGroupNotice(
            payload.group_id.toString(),
            payload.content,
            noticePinned,
            noticeType,
            noticeShowEditCard,
            noticeTipWindowType,
            noticeConfirmRequired,
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
