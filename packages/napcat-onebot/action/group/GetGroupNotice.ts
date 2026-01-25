import { WebApiGroupNoticeFeed } from 'napcat-core';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { GroupActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Array(Type.Object({
  sender_id: Type.Number({ description: '发送者QQ' }),
  publish_time: Type.Number({ description: '发布时间' }),
  notice_id: Type.String({ description: '公告ID' }),
  message: Type.Object({
    text: Type.String({ description: '文本内容' }),
    image: Type.Array(Type.Any(), { description: '图片列表' }),
    images: Type.Array(Type.Any(), { description: '图片列表' }),
  }, { description: '公告内容' }),
  settings: Type.Optional(Type.Any({ description: '设置项' })),
  read_num: Type.Optional(Type.Number({ description: '阅读数' })),
}), { description: '群公告列表' });

type ReturnType = Static<typeof ReturnSchema>;

export type ApiGroupNotice = ReturnType[number] & WebApiGroupNoticeFeed;

export class GetGroupNotice extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GoCQHTTP_GetGroupNotice;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取群公告';
  override actionDescription = '获取指定群聊中的公告列表';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.GetGroupNotice.payload;
  override returnExample = GroupActionsExamples.GetGroupNotice.response;

  async _handle (payload: PayloadType) {
    const group = payload.group_id.toString();
    const ret = await this.core.apis.WebApi.getGroupNotice(group);
    if (!ret) {
      throw new Error('获取公告失败');
    }
    const retNotices: ReturnType = [];
    for (const key in ret.feeds) {
      if (!ret.feeds[key]) {
        continue;
      }
      const retApiNotice: WebApiGroupNoticeFeed = ret.feeds[key];
      const image = retApiNotice.msg.pics?.map((pic) => {
        return { id: pic.id, height: pic.h, width: pic.w };
      }) || [];

      const retNotice: ReturnType[number] = {
        notice_id: retApiNotice.fid,
        sender_id: retApiNotice.u,
        publish_time: retApiNotice.pubt,
        message: {
          text: retApiNotice.msg.text,
          image,
          images: image,
        },
        settings: retApiNotice.settings,
        read_num: retApiNotice.read_num
      };
      retNotices.push(retNotice);
    }

    return retNotices;
  }
}
