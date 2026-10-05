import { WebApiGroupNoticeFeed } from 'napcat-core';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { GroupActionsExamples } from '../example/GroupActionsExamples';

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
  send_to_new_member: Type.Optional(Type.Boolean({ description: '是否为「发给新成员」公告' })),
  pinned: Type.Optional(Type.Boolean({ description: '是否置顶（仅「发给新成员」公告可读到）' })),
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
    const seen = new Set<string>();
    // 「发给新成员」类公告只出现在 inst 里，追加在 feeds 之后，保持原有条目的顺序不变
    for (const [list, sendToNewMember] of [[ret.feeds, false], [ret.inst, true]] as const) {
      for (const retApiNotice of Array.isArray(list) ? list : []) {
        if (!retApiNotice || seen.has(retApiNotice.fid)) {
          continue;
        }
        seen.add(retApiNotice.fid);
        retNotices.push(this.toNotice(retApiNotice, sendToNewMember));
      }
    }

    return retNotices;
  }

  private toNotice (retApiNotice: WebApiGroupNoticeFeed, sendToNewMember: boolean): ReturnType[number] {
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
      read_num: retApiNotice.read_num,
      send_to_new_member: sendToNewMember,
    };
    // 置顶状态只在 inst 条目的 settings.inst_no_pinned 里：0 = 置顶中，1 = 未置顶
    const instNoPinned = retApiNotice.settings?.inst_no_pinned;
    if (typeof instNoPinned === 'number') {
      retNotice.pinned = instNoPinned === 0;
    }
    return retNotice;
  }
}
