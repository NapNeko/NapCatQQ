import { checkFileExist, uriToLocalFile } from 'napcat-common/src/file';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { unlink } from 'node:fs/promises';
import { Static, Type } from '@sinclair/typebox';

export const SendGroupNoticePayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  content: Type.String({ description: '公告内容' }),
  image: Type.Optional(Type.String({ description: '公告图片路径或 URL' })),
  pinned: Type.Union([Type.Number(), Type.String()], { default: 0, description: '是否置顶 (0/1)' }),
  type: Type.Union([Type.Number(), Type.String()], { default: 1, description: '类型 (默认为 1)' }),
  confirm_required: Type.Union([Type.Number(), Type.String()], { default: 1, description: '是否需要确认 (0/1)' }),
  is_show_edit_card: Type.Union([Type.Number(), Type.String()], { default: 0, description: '是否显示修改群名片引导 (0/1)' }),
  tip_window_type: Type.Union([Type.Number(), Type.String()], { default: 0, description: '弹窗类型 (默认为 0)' }),
});

export type SendGroupNoticePayload = Static<typeof SendGroupNoticePayloadSchema>;

export class SendGroupNotice extends OneBotAction<SendGroupNoticePayload, void> {
  override actionName = ActionName.GoCQHTTP_SendGroupNotice;
  override payloadSchema = SendGroupNoticePayloadSchema;
  override returnSchema = Type.Null();
  async _handle (payload: SendGroupNoticePayload) {
    let UploadImage: { id: string, width: number, height: number; } | undefined;
    if (payload.image) {
      // 公告图逻辑
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
      if (ImageUploadResult.errCode !== 0) {
        throw new Error(`群公告${payload.image}设置失败,图片上传失败 ， 错误信息:${ImageUploadResult.errMsg}`);
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
    if (!publishGroupBulletinResult || publishGroupBulletinResult.ec !== 0) {
      throw new Error(`设置群公告失败,错误信息:${publishGroupBulletinResult?.em}`);
    }
  }
}
