import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.Union([Type.Number(), Type.String()], { description: '群号' }),
  need_short_url: Type.Optional(Type.Union([Type.Boolean(), Type.String()], { default: true, description: '是否返回短链 (qm.qq.com/q/xxx)，false 返回完整 universal-share 链接' })),
  src_id: Type.Optional(Type.Union([Type.Number(), Type.String()], { default: 73, description: '分享来源 ID' })),
  additional_param: Type.Optional(Type.String({ default: '', description: '附加参数' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  url: Type.String({ description: '群分享链接' }),
}, { description: '群分享链接' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupShareLink extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupShareLink;
  override actionSummary = '获取群分享链接';
  override actionDescription = '通过 NTQQ 原生 getJoinGroupLink 获取群的 H5 分享/加群链接 (qm.qq.com/q/xxx 或 qun.qq.com/universal-share/share?...)';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: '123456',
    need_short_url: true,
  };

  override returnExample = {
    url: 'https://qm.qq.com/q/xxxxxxxxxx',
  };

  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    const needShortUrl = payload.need_short_url === undefined ? true : payload.need_short_url.toString() === 'true';
    const srcId = payload.src_id === undefined ? 73 : Number(payload.src_id);
    const ret = await this.core.apis.GroupApi.getJoinGroupLink(
      payload.group_id.toString(),
      needShortUrl,
      srcId,
      payload.additional_param ?? ''
    );
    if (!ret?.url) {
      throw new Error(`获取群分享链接失败: ${ret?.errMsg || JSON.stringify(ret)}`);
    }
    return { url: ret.url };
  }
}
