import { uriToLocalFile } from 'napcat-common/src/file';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { existsSync, readFileSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { ExtendsActionsExamples } from '../example/ExtendsActionsExamples';

const ValidUgcRights = [1, 4, 16, 64, 128] as const;

const PayloadSchema = Type.Object({
  content: Type.String({ description: '说说正文' }),
  images: Type.Optional(Type.Array(Type.String(), { description: '图片数组, 支持 file:// http(s):// base64:// , 自动上传' })),
  ugc_right: Type.Optional(Type.Union([Type.Number(), Type.String()], { default: 1, description: '查看权限: 1所有人可见 4好友可见 16部分好友可见 64仅自己可见 128部分好友不可见' })),
  target_uins: Type.Optional(Type.Array(Type.Union([Type.Number(), Type.String()]), { description: 'ugc_right为16/128时, 权限作用的QQ号数组' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  tid: Type.String({ description: '说说Tid' }),
}, { description: '发说说结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class SendQzoneMsg extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SendQzoneMsg;
  override actionSummary = '发表QQ空间说说';
  override actionDescription = '在QQ空间(Qzone)发表说说, 支持纯文字或带(多)图, 可设置查看权限';
  override actionTags = ['扩展接口'];
  override payloadExample = ExtendsActionsExamples.SendQzoneMsg.payload;
  override returnExample = ExtendsActionsExamples.SendQzoneMsg.response;

  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const ugcRight = payload.ugc_right !== undefined ? +payload.ugc_right : 1;
    if (!ValidUgcRights.includes(ugcRight as typeof ValidUgcRights[number])) {
      throw new Error(`ugc_right 参数不合法, 允许的值为: ${ValidUgcRights.join(', ')}`);
    }
    const targetUins = payload.target_uins?.map((uin) => +uin).filter((uin) => !Number.isNaN(uin));
    if ((ugcRight === 16 || ugcRight === 128) && (!targetUins || targetUins.length === 0)) {
      throw new Error('ugc_right 为 16 或 128 时, target_uins 不能为空');
    }

    const richvals: string[] = [];
    const cleanupPaths: string[] = [];
    try {
      for (const image of payload.images ?? []) {
        const downloadResult = await uriToLocalFile(this.core.NapCatTempPath, image);
        if (!downloadResult.success) {
          throw new Error(`图片${image}处理失败, ${downloadResult.errMsg}`);
        }
        if (!downloadResult.isLocal) {
          cleanupPaths.push(downloadResult.path);
        }
        const base64 = readFileSync(downloadResult.path).toString('base64');
        const richval = await this.core.apis.WebApi.uploadImageToQzone(base64);
        richvals.push(richval);
      }

      const result = await this.core.apis.WebApi.publishQzoneMsg(payload.content, richvals, ugcRight, targetUins);
      return result;
    } finally {
      for (const p of cleanupPaths) {
        if (existsSync(p)) {
          await unlink(p).catch(() => { });
        }
      }
    }
  }
}
