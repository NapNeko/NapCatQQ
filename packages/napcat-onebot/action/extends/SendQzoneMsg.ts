import { uriToLocalFile } from 'napcat-common/src/file';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { existsSync, readFileSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { parseQzonePublishTime } from '@/napcat-core/data/qzone';
import { ExtendsActionsExamples } from '../example/ExtendsActionsExamples';
import { checkQzoneFields, qzoneIdentity, qzoneImages, qzoneInteger, qzonePayload, qzoneText, qzoneUin, SlQzoneTextSchema } from './qzone/common-snowluma';

const ValidUgcRights = [1, 4, 16, 64, 128] as const;

const PayloadSchema = Type.Object({
  content: SlQzoneTextSchema,
  images: Type.Optional(Type.Array(Type.String(), { description: '图片数组, 支持 file:// http(s):// base64:// , 自动上传' })),
  ugc_right: Type.Optional(Type.Union([Type.Number(), Type.String()], { default: 1, description: '查看权限: 1所有人可见 4好友可见 16部分好友可见 64仅自己可见 128部分好友不可见' })),
  target_uins: Type.Optional(Type.Array(Type.Union([Type.Number(), Type.String()]), { description: 'ugc_right为16/128时, 权限作用的QQ号数组' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  tid: Type.String({ description: '说说Tid' }),
  time: Type.Integer({ minimum: 0, description: '发表时间（Unix秒）；上游未提供时为0，表示未知' }),
}, { description: '发说说结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class SendQzoneMsg extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SendQzoneMsg;
  override actionSummary = '发表QQ空间说说';
  override actionDescription = '在QQ空间(Qzone)发表说说, 支持纯文字或带(多)图, 可设置查看权限。纯文字使用QQ内置空间接口, 图片保留原有上传和发表方式';
  override actionTags = ['扩展接口'];
  override payloadExample = ExtendsActionsExamples.SendQzoneMsg.payload;
  override returnExample = { ...ExtendsActionsExamples.SendQzoneMsg.response, time: 0 };

  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  private normalize (payload: PayloadType) {
    checkQzoneFields(qzonePayload(payload), ['content', 'images', 'ugc_right', 'target_uins'], false);
    const images = qzoneImages(payload.images);
    // 原有带图发表允许空配文，兼容既有调用。
    const content = payload.content === '' && images?.length ? '' : qzoneText(payload.content, 'content');
    const ugcRight = qzoneInteger(payload.ugc_right, 'ugc_right', 1, 1);
    if (!ValidUgcRights.includes(ugcRight as typeof ValidUgcRights[number])) {
      throw new Error(`ugc_right 参数不合法, 允许的值为: ${ValidUgcRights.join(', ')}`);
    }
    if (payload.target_uins !== undefined && !Array.isArray(payload.target_uins)) throw new Error('target_uins 必须为有效QQ号数组');
    const targetUins = payload.target_uins?.map((uin) => {
      const target = qzoneUin(uin, 'target_uins');
      if (target === undefined) throw new Error('target_uins 必须为有效QQ号数组');
      return target;
    });
    if ((ugcRight === 16 || ugcRight === 128) && (!targetUins || targetUins.length === 0)) {
      throw new Error('ugc_right 为 16 或 128 时, target_uins 不能为空');
    }

    return { content, images, ugcRight, targetUins };
  }

  protected override async check (payload: PayloadType): Promise<BaseCheckResult> {
    try { this.normalize(payload); } catch (error) { return { valid: false, message: (error as Error).message }; }
    return await super.check(payload);
  }

  private published (result: { tid: string; time?: number; }): ReturnType {
    return { tid: qzoneIdentity(result.tid, '返回的tid'), time: parseQzonePublishTime(result.time) };
  }

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const { content, images, ugcRight, targetUins } = this.normalize(payload);
    if (!images?.length) return this.published(await this.core.apis.QzoneApi.publishMsg(content, ugcRight, targetUins));

    const originalAccount = { uin: this.core.selfInfo?.uin, uid: this.core.selfInfo?.uid };
    if (!originalAccount.uin || !originalAccount.uid) throw new Error('QQ空间图片说说需要已登录的当前账号');
    const assertAccount = () => {
      if (this.core.selfInfo?.uin !== originalAccount.uin || this.core.selfInfo?.uid !== originalAccount.uid) {
        throw new Error('QQ账号已切换，图片说说发表已停止，请重新确认后操作');
      }
    };
    const richvals: string[] = [];
    const cleanupPaths: string[] = [];
    try {
      for (const image of images) {
        assertAccount();
        const downloadResult = await uriToLocalFile(this.core.NapCatTempPath, image);
        if (!downloadResult.success) {
          throw new Error(`图片${image}处理失败, ${downloadResult.errMsg}`);
        }
        if (!downloadResult.isLocal) {
          cleanupPaths.push(downloadResult.path);
        }
        assertAccount();
        const base64 = readFileSync(downloadResult.path).toString('base64');
        const richval = await this.core.apis.WebApi.uploadImageToQzone(base64);
        assertAccount();
        richvals.push(richval);
      }

      assertAccount();
      const result = await this.core.apis.WebApi.publishQzoneMsg(content, richvals, ugcRight, targetUins);
      return this.published(result);
    } finally {
      for (const p of cleanupPaths) {
        if (existsSync(p)) {
          await unlink(p).catch(() => { });
        }
      }
    }
  }
}
