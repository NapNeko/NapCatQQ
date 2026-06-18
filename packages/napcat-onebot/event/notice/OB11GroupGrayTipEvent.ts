import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';
import { NapCatCore } from 'napcat-core';

/**
 * 群灰条消息事件
 * 用于上报未知类型的灰条消息，便于下游检测和处理伪造灰条攻击
 */
export class OB11GroupGrayTipEvent extends OB11BaseNoticeEvent {
  notice_type = 'notify';
  sub_type = 'gray_tip';
  group_id: number;
  user_id: number;        // 真实发送者QQ（如果是伪造的灰条，这就是攻击者）
  message_id: number;     // 消息ID，可用于撤回
  busi_id: string;        // 业务ID
  content: string;        // 灰条内容（JSON字符串）
  raw_info: unknown;      // 原始信息

  constructor (
    core: NapCatCore,
    groupId: number,
    userId: number,
    messageId: number,
    busiId: string,
    content: string,
    rawInfo: unknown
  ) {
    super(core);
    this.group_id = groupId;
    this.user_id = userId;
    this.message_id = messageId;
    this.busi_id = busiId;
    this.content = content;
    this.raw_info = rawInfo;
  }
}
