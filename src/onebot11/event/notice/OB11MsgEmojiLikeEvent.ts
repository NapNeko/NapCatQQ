import {OB11GroupNoticeEvent} from "./OB11GroupNoticeEvent";

export interface MsgEmojiLike {
  emoji_id: string,
  count: number
}

export class OB11GroupMsgEmojiLikeEvent extends OB11GroupNoticeEvent {
  notice_type = "group_msg_emoji_like";
  message_id: number;
  sub_type: "ban" | "lift_ban";
  likes: MsgEmojiLike[]

  constructor(groupId: number, userId: number, messageId: number, likes: MsgEmojiLike[]) {
    super();
    this.group_id = groupId;
    this.user_id = userId;  // 可为空，表示是对别人的消息操作，如果是对bot自己的消息则不为空
    this.message_id = messageId;
    this.likes = likes;
  }
}
