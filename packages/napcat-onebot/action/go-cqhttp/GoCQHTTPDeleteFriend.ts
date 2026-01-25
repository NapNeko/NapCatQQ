import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from './examples';

export const GoCQHTTPDeleteFriendPayloadSchema = Type.Object({
  friend_id: Type.Optional(Type.Union([Type.String(), Type.Number()], { description: '好友 QQ 号' })),
  user_id: Type.Optional(Type.Union([Type.String(), Type.Number()], { description: '用户 QQ 号' })),
  temp_block: Type.Optional(Type.Boolean({ description: '是否加入黑名单' })),
  temp_both_del: Type.Optional(Type.Boolean({ description: '是否双向删除' })),
});

export type GoCQHTTPDeleteFriendPayload = Static<typeof GoCQHTTPDeleteFriendPayloadSchema>;

export class GoCQHTTPDeleteFriend extends OneBotAction<GoCQHTTPDeleteFriendPayload, any> {
  override actionName = ActionName.GoCQHTTP_DeleteFriend;
  override payloadSchema = GoCQHTTPDeleteFriendPayloadSchema;
  override returnSchema = Type.Any();
  override actionDescription = '删除好友';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.GoCQHTTPDeleteFriend.payload;

  async _handle (payload: GoCQHTTPDeleteFriendPayload) {
    const uin = payload.friend_id ?? payload.user_id ?? '';
    const uid = await this.core.apis.UserApi.getUidByUinV2(uin.toString());

    if (!uid) {
      return {
        valid: false,
        message: '好友不存在',
      };
    }
    const isBuddy = await this.core.apis.FriendApi.isBuddy(uid);
    if (!isBuddy) {
      return {
        valid: false,
        message: '不是好友',
      };
    }
    return await this.core.apis.FriendApi.delBuudy(uid, payload.temp_block, payload.temp_both_del);
  }
}
