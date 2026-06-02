import { createHash } from 'node:crypto';
import { stat, readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { Type, Static } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

const FetchCustomFaceDetailPayloadSchema = Type.Object({
  count: Type.Union([Type.Number(), Type.String()], { default: 48, description: '获取数量' }),
});

type FetchCustomFaceDetailPayloadType = Static<typeof FetchCustomFaceDetailPayloadSchema>;

const FetchCustomFaceDetailReturnSchema = Type.Any({ description: '自定义表情详情列表' });

type FetchCustomFaceDetailReturnType = Static<typeof FetchCustomFaceDetailReturnSchema>;

export class FetchCustomFaceDetail extends OneBotAction<FetchCustomFaceDetailPayloadType, FetchCustomFaceDetailReturnType> {
  override actionName = ActionName.FetchCustomFaceDetail;
  override payloadSchema = FetchCustomFaceDetailPayloadSchema;
  override returnSchema = FetchCustomFaceDetailReturnSchema;
  override actionSummary = '获取自定义表情详情';
  override actionTags = ['系统扩展'];
  override payloadExample = {
    count: 10,
  };

  override returnExample = null;

  async _handle (payload: FetchCustomFaceDetailPayloadType) {
    const ret = await this.core.apis.MsgApi.fetchFavEmojiList(+payload.count);
    return ret.emojiInfoList;
  }
}

const AddCustomFacePayloadSchema = Type.Object({
  file: Type.String({ description: '本地表情文件路径' }),
  emoji_id: Type.Optional(Type.Union([Type.String(), Type.Number()], { description: '表情ID，未提供时传空字符串' })),
  package_id: Type.Optional(Type.Union([Type.String(), Type.Number()], { description: '表情包ID，未提供时传0' })),
  file_name: Type.Optional(Type.String({ description: '文件名，未提供时从file路径取basename' })),
  file_size: Type.Optional(Type.Union([Type.String(), Type.Number()], { description: '文件大小，未提供时读取本地文件' })),
  md5: Type.Optional(Type.String({ description: '文件MD5，未提供时读取本地文件计算' })),
  is_mark_face: Type.Optional(Type.Boolean({ description: '是否商城表情' })),
  is_origin: Type.Optional(Type.Boolean({ description: '是否原图' })),
});

type AddCustomFacePayloadType = Static<typeof AddCustomFacePayloadSchema>;

const AddCustomFaceReturnSchema = Type.Any({ description: '添加结果' });

type AddCustomFaceReturnType = Static<typeof AddCustomFaceReturnSchema>;

export class AddCustomFace extends OneBotAction<AddCustomFacePayloadType, AddCustomFaceReturnType> {
  override actionName = ActionName.AddCustomFace;
  override payloadSchema = AddCustomFacePayloadSchema;
  override returnSchema = AddCustomFaceReturnSchema;
  override actionSummary = '添加自定义表情';
  override actionTags = ['系统扩展'];
  override payloadExample = {
    file: 'C:\\Users\\Public\\face.png',
    is_origin: true,
  };

  override returnExample = null;

  async _handle (payload: AddCustomFacePayloadType) {
    const fileStat = await stat(payload.file);
    const md5 = payload.md5 ?? createHash('md5').update(await readFile(payload.file)).digest('hex');
    return await this.core.apis.MsgApi.addFavEmoji({
      emojiId: payload.emoji_id?.toString() ?? '',
      packageId: payload.package_id === undefined ? 0 : Number(payload.package_id),
      emojiPath: payload.file,
      fileSize: payload.file_size?.toString() ?? fileStat.size.toString(),
      fileName: payload.file_name ?? basename(payload.file),
      md5,
      isMarkFace: payload.is_mark_face ?? false,
      isOrigin: payload.is_origin ?? true,
    });
  }
}

const DeleteCustomFacePayloadSchema = Type.Object({
  res_id: Type.Optional(Type.Union([
    Type.String({ description: 'fetch_custom_face_detail返回的resId' }),
    Type.Array(Type.String({ description: 'fetch_custom_face_detail返回的resId' })),
  ])),
  id: Type.Optional(Type.Union([
    Type.String({ description: 'native deleteFavEmoji字符串ID，通常为resId' }),
    Type.Array(Type.String({ description: 'native deleteFavEmoji字符串ID，通常为resId' })),
  ])),
  ids: Type.Optional(Type.Array(Type.String({ description: 'native deleteFavEmoji字符串ID列表，通常为resId列表' }))),
  md5: Type.Optional(Type.Union([
    Type.String({ description: '表情MD5，不能直接删除，请先通过fetch_custom_face_detail获取resId' }),
    Type.Array(Type.String({ description: '表情MD5，不能直接删除，请先通过fetch_custom_face_detail获取resId' })),
  ])),
});

type DeleteCustomFacePayloadType = Static<typeof DeleteCustomFacePayloadSchema>;

const DeleteCustomFaceReturnSchema = Type.Any({ description: '删除结果' });

type DeleteCustomFaceReturnType = Static<typeof DeleteCustomFaceReturnSchema>;

export class DeleteCustomFace extends OneBotAction<DeleteCustomFacePayloadType, DeleteCustomFaceReturnType> {
  override actionName = ActionName.DeleteCustomFace;
  override payloadSchema = DeleteCustomFacePayloadSchema;
  override returnSchema = DeleteCustomFaceReturnSchema;
  override actionSummary = '删除自定义表情';
  override actionTags = ['系统扩展'];
  override payloadExample = {
    res_id: '2707600964_0_0_0_D8EAA70984B402EE10B0F33DB88F4173_0_0',
  };

  override returnExample = null;

  async _handle (payload: DeleteCustomFacePayloadType) {
    const ids = payload.ids ??
      (Array.isArray(payload.res_id) ? payload.res_id : payload.res_id ? [payload.res_id] : undefined) ??
      (Array.isArray(payload.id) ? payload.id : payload.id ? [payload.id] : undefined) ??
      [];
    if (ids.length === 0) throw new Error('res_id or ids is required');
    return await this.core.apis.MsgApi.deleteFavEmoji(ids);
  }
}

const SetCustomFaceDescPayloadSchema = Type.Object({
  emoji_id: Type.Union([Type.Number(), Type.String()], { description: '表情ID' }),
  res_id: Type.String({ description: '资源ID' }),
  md5: Type.String({ description: '表情MD5' }),
  desc: Type.String({ description: '新的表情描述' }),
});

type SetCustomFaceDescPayloadType = Static<typeof SetCustomFaceDescPayloadSchema>;

const SetCustomFaceDescReturnSchema = Type.Any({ description: '修改结果' });

type SetCustomFaceDescReturnType = Static<typeof SetCustomFaceDescReturnSchema>;

export class SetCustomFaceDesc extends OneBotAction<SetCustomFaceDescPayloadType, SetCustomFaceDescReturnType> {
  override actionName = ActionName.SetCustomFaceDesc;
  override payloadSchema = SetCustomFaceDescPayloadSchema;
  override returnSchema = SetCustomFaceDescReturnSchema;
  override actionSummary = '修改自定义表情描述';
  override actionTags = ['系统扩展'];
  override payloadExample = {
    emoji_id: 1,
    res_id: 'resource-id',
    md5: 'd41d8cd98f00b204e9800998ecf8427e',
    desc: '新的描述',
  };

  override returnExample = null;

  async _handle (payload: SetCustomFaceDescPayloadType) {
    return await this.core.apis.MsgApi.modifyFavEmojiDesc([{
      emojiId: Number(payload.emoji_id),
      resId: payload.res_id,
      md5: payload.md5,
      desc: payload.desc,
    }]);
  }
}
