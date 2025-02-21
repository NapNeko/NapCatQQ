import { OB11Segment } from './segment'

/** 性别枚举 */
export const enum OB11Sex {
  Male = 'male',
  Female = 'female',
  Unknown = 'unknown'
}

/** OneBot11消息类型枚举 */
export const enum OB11Event {
  Message = 'message',
  Notice = 'notice',
  Request = 'request',
  MetaEvent = 'meta_event',
  /** go-cqhttp拓展 自身事件上报 */
  MessageSent = 'message_sent'
}

/** 消息事件类型 */
export const enum OB11MessageType {
  Private = 'private',
  Group = 'group'
}

/** 消息子类型 */
export const enum OB11MessageSubType {
  Friend = 'friend',
  Group = 'group',
  Other = 'other',
  Normal = 'normal',
  Anonymous = 'anonymous',
  Notice = 'notice'
}

/** 通知事件枚举 */
export const enum OB11NoticeType {
  /** 群文件上传 */
  GroupUpload = 'group_upload',
  /** 群管理员变动 */
  GroupAdmin = 'group_admin',
  /** 群成员减少 */
  GroupDecrease = 'group_decrease',
  /** 群成员增加 */
  GroupIncrease = 'group_increase',
  /** 群禁言 */
  GroupBan = 'group_ban',
  /** 新增好友 */
  FriendAdd = 'friend_add',
  /** 群消息撤回 */
  GroupRecall = 'group_recall',
  /** 好友消息撤回 */
  FriendRecall = 'friend_recall',
  /** 通知 */
  Notify = 'notify',
  /** 群表情回应 */
  GroupMsgEmojiLike = 'group_msg_emoji_like',
  /** 群表情回应 Lagrange */
  GroupMsgEmojiLikeLagrange = 'reaction',
  /** 精华 */
  GroupEssence = 'essence',
  /** 群名片更新 */
  GroupCard = 'group_card'
}

/** 请求事件类型 */
export const enum OB11RequestType {
  Friend = 'friend',
  Group = 'group'
}

export interface FriendSender {
  /** 发送者 QQ 号 */
  user_id: number
  /** 昵称 不存在则为空字符串 */
  nickname: string
  /** 性别 */
  sex?: `${OB11Sex}`
  /** 年龄 */
  age?: number
  /** 群临时会话会有此字段 */
  group_id?: number
}

export interface GroupSender {
  /** 发送者 QQ 号 */
  user_id: number
  /** 昵称 不存在则为空字符串 */
  nickname: string
  /** 性别 */
  sex?: `${OB11Sex}`
  /** 年龄 */
  age?: number
  /** 群名片/备注 */
  card?: string
  /** 地区 */
  area?: string
  /** 成员等级 */
  level?: number
  /** 角色 不存在则为空字符串 */
  role: 'owner' | 'admin' | 'member'
  /** 专属头衔 */
  title?: string
}

/** 所有事件基类 */
export interface OB11EventBase {
  /** 事件发生的时间戳 */
  time: number
  /** 事件类型 */
  post_type: OB11Event
  /** 收到事件的机器人 QQ 号 */
  self_id: number
}

/** 消息事件基类 */
interface MessageBase extends OB11EventBase {
  /** 事件类型 */
  post_type: OB11Event.Message | OB11Event.MessageSent
  /** 消息类型 */
  message_type: `${OB11MessageType}`
  /** 消息子类型 */
  sub_type: `${OB11MessageSubType}`
  /** 消息 ID */
  message_id: number
  /** 发送者 QQ 号 */
  user_id: number
  /** 消息内容 */
  message: OB11Segment[]
  /** 原始消息内容 */
  raw_message: string
  /** 字体 */
  font: number
}

/** 私聊消息事件 */
export interface OB11PrivateMessage extends MessageBase {
  /** 消息类型 */
  message_type: 'private'
  /** 消息子类型 */
  sub_type: 'friend'
  /** 接收者QQ gocq-http拓展 */
  target_id?: number
  /** 临时会话来源 */
  temp_source?: number
  /** 发送人信息 */
  sender: FriendSender
}

/** 群消息事件 */
export interface OB11GroupMessage extends MessageBase {
  /** 消息类型 */
  message_type: 'group'
  /** 消息子类型 */
  sub_type: 'normal' | 'anonymous' | 'notice'
  /** 群号 */
  group_id: number
  // /** 匿名信息 */
  // anonymous?: {
  //   /** 匿名用户 ID */
  //   id: string
  //   /** 匿名用户名称 */
  //   name: string
  //   /** 匿名用户 flag，在调用禁言 API 时需要传入 */
  //   flag: string
  // }
  /** 发送人信息 */
  sender: GroupSender
}

/** 消息事件 */
export type OB11Message = OB11PrivateMessage | OB11GroupMessage

/** 通知事件基类 */
export interface NoticeBase extends OB11EventBase {
  /** 事件类型 */
  post_type: OB11Event.Notice
  /** 通知类型 */
  notice_type: OB11NoticeType
}

/** 群文件上传事件 */
export interface OneBot11GroupUpload extends NoticeBase {
  /** 通知类型 */
  notice_type: OB11NoticeType.GroupUpload
  /** 群号 */
  group_id: number
  /** 发送者 QQ 号 */
  user_id: number
  /** 文件信息 */
  file: {
    /** 文件 ID */
    id: string
    /** 文件名 */
    name: string
    /** 文件大小（字节数） */
    size: number
    /** busid 无作用 */
    busid: number
  }
}

/** 群管理员变动事件 */
export interface OneBot11GroupAdmin extends NoticeBase {
  /** 通知类型 */
  notice_type: OB11NoticeType.GroupAdmin
  /** 事件子类型，分别表示设置和取消管理员 */
  sub_type: 'set' | 'unset'
  /** 群号 */
  group_id: number
  /** 管理员 QQ 号 */
  user_id: number
}

/** 群减少事件 */
export interface OneBot11GroupDecrease extends NoticeBase {
  /** 通知类型 */
  notice_type: OB11NoticeType.GroupDecrease
  /** 事件子类型，分别表示主动退群、成员被踢、登录号被踢 */
  sub_type: 'leave' | 'kick' | 'kick_me'
  /** 群号 */
  group_id: number
  /** 操作者 QQ 号（如果是主动退群，则和 user_id 相同） */
  operator_id: number
  /** 离开者 QQ 号 */
  user_id: number
}

/** 群增加事件 */
export interface OneBot11GroupIncrease extends NoticeBase {
  /** 通知类型 */
  notice_type: OB11NoticeType.GroupIncrease
  /** 事件子类型，分别表示管理员已同意入群、管理员邀请入群 */
  sub_type: 'approve' | 'invite'
  /** 群号 */
  group_id: number
  /** 操作者 QQ 号 */
  operator_id: number
  /** 加入者 QQ 号 */
  user_id: number
}

/** 群禁言事件 */
export interface OneBot11GroupBan extends NoticeBase {
  /** 通知类型 */
  notice_type: OB11NoticeType.GroupBan
  /** 事件子类型，分别表示禁言、解除禁言 */
  sub_type: 'ban' | 'lift_ban'
  /** 群号 */
  group_id: number
  /** 操作者 QQ 号 */
  operator_id: number
  /** 被禁言 QQ 号 */
  user_id: number
  /** 禁言时长，单位秒 */
  duration: number
}

/** 新添加好友事件 */
export interface OneBot11FriendAdd extends NoticeBase {
  /** 通知类型 */
  notice_type: OB11NoticeType.FriendAdd
  /** 新添加好友 QQ 号 */
  user_id: number
}

/** 群撤回事件 */
export interface OneBot11GroupRecall extends NoticeBase {
  /** 通知类型 */
  notice_type: OB11NoticeType.GroupRecall
  /** 群号 */
  group_id: number
  /** 消息发送者 QQ 号 */
  user_id: number
  /** 操作者 QQ 号 */
  operator_id: number
  /** 被撤回的消息 ID */
  message_id: number
}

/** 好友消息撤回事件 */
export interface OneBot11FriendRecall extends NoticeBase {
  /** 通知类型 */
  notice_type: OB11NoticeType.FriendRecall
  /** 好友 QQ 号 */
  user_id: number
  /** 被撤回的消息 ID */
  message_id: number
}

/** 戳一戳事件 */
export interface OneBot11Poke extends NoticeBase {
  /** 消息类型 */
  notice_type: OB11NoticeType.Notify
  /** 提示类型 */
  sub_type: 'poke'
  /** 群号 私聊不存在 */
  group_id?: number
  /** 发送者 QQ 号 */
  user_id: number
  /** 被戳者 QQ 号 */
  target_id: number
}

/** 运气王事件 */
export interface OneBot11LuckyKing extends NoticeBase {
  /** 消息类型 */
  notice_type: OB11NoticeType.Notify
  /** 提示类型 */
  sub_type: 'lucky_king'
  /** 群号 */
  group_id: number
  /** 红包发送者 QQ 号 */
  user_id: number
  /** 运气王 QQ 号 */
  target_id: number
}

/** 荣誉变更事件 */
export interface OneBot11Honor extends NoticeBase {
  /** 消息类型 */
  notice_type: OB11NoticeType.Notify
  /** 提示类型 */
  sub_type: 'honor'
  /** 群号 */
  group_id: number
  /** 荣誉类型，分别表示龙王、群聊之火、快乐源泉 */
  honor_type: 'talkative' | 'performer' | 'emotion'
  /** 成员 QQ 号 */
  user_id: number
}

/** 群表情回应事件 napcat、llonebot */
export interface OneBot11GroupMessageReaction extends NoticeBase {
  /** 消息类型 */
  notice_type: OB11NoticeType.GroupMsgEmojiLike
  /** 群号 */
  group_id: number
  /** 发送者 QQ 号 */
  user_id: number
  /** 消息 ID */
  message_id: number
  /** 表情信息 */
  likes: Array<{
    count: number
    /** 表情ID参考: https://bot.q.qq.com/wiki/develop/api-v2/openapi/emoji/model.html#EmojiType */
    emoji_id: number
  }>
}

/** 群表情回应事件 Lagrange */
export interface OneBot11GroupMessageReactionLagrange extends NoticeBase {
  /** 消息类型 */
  notice_type: OB11NoticeType.GroupMsgEmojiLikeLagrange
  /** 提示类型 */
  sub_type: 'remove' | 'add'
  /** 群号 */
  group_id: number
  /** 发送者 QQ 号 */
  operator_id: number
  /** 消息 ID */
  message_id: number
  /** 表情ID */
  code: string
  /** 表情数量 */
  count: number
}

/** 群精华 */
export interface OneBot11GroupEssence extends NoticeBase {
  /** 通知类型 */
  notice_type: OB11NoticeType.GroupEssence
  /** 操作类型 */
  sub_type: 'add' | 'delete'
  /** 群号 */
  group_id: number
  /** 精华消息 ID */
  message_id: number
  /** 消息发送者 */
  sender_id: number
  /** 操作者id */
  operator_id: number
}

/** GroupCard */
export interface OneBot11GroupCard extends NoticeBase {
  /** 通知类型 */
  notice_type: OB11NoticeType.GroupCard
  /** 群号 */
  group_id: number
  /** 用户 QQ 号 */
  user_id: number
  /** 名片 */
  card_new: string
  card_old: string
}

/** 通知事件 */
export type OB11Notice =
  | OneBot11GroupUpload
  | OneBot11GroupAdmin
  | OneBot11GroupDecrease
  | OneBot11GroupIncrease
  | OneBot11GroupBan
  | OneBot11FriendAdd
  | OneBot11GroupRecall
  | OneBot11FriendRecall
  | OneBot11Poke
  | OneBot11LuckyKing
  | OneBot11Honor
  | OneBot11GroupMessageReaction
  | OneBot11GroupMessageReactionLagrange
  | OneBot11GroupEssence
  | OneBot11GroupCard

/** 请求事件基类 */
export interface RequestBase extends OB11EventBase {
  /** 事件发生的时间戳 */
  time: number
  /** 事件类型 */
  post_type: OB11Event.Request
  /** 收到事件的机器人 QQ 号 */
  self_id: number
  /** 请求类型 */
  request_type: OB11RequestType.Friend | OB11RequestType.Group
  /** 请求 flag，在调用处理请求的 API 时需要传入 */
  flag: string
  /** 发送请求的 QQ 号 */
  user_id: number
  /** 验证信息 */
  comment: string
}

/** 好友请求事件 */
export interface OneBot11FriendRequest extends RequestBase {
  /** 请求类型 */
  request_type: OB11RequestType.Friend
}

/** 群请求事件 */
export interface OneBot11GroupRequest extends RequestBase {
  /** 请求类型 */
  request_type: OB11RequestType.Group
  /** 请求子类型，分别表示加群请求、邀请登录号入群 */
  sub_type: 'add' | 'invite'
  /** 群号 */
  group_id: number
}

/** 请求事件 */
export type OB11Request = OneBot11FriendRequest | OneBot11GroupRequest

/** 元事件基类 */
export interface MetaEventBase extends OB11EventBase {
  /** 事件类型 */
  post_type: OB11Event.MetaEvent
  /** 元事件类型 */
  meta_event_type: 'lifecycle' | 'heartbeat'
}

/** 生命周期元事件 */
export interface OneBot11Lifecycle extends MetaEventBase {
  /** 元事件类型 */
  meta_event_type: 'lifecycle'
  /** 事件子类型，分别表示 OneBot 启用、停用、WebSocket 连接成功 */
  sub_type: 'enable' | 'disable' | 'connect'
}

/** 心跳元事件 */
export interface OneBot11Heartbeat extends MetaEventBase {
  /** 元事件类型 */
  meta_event_type: 'heartbeat'
  /** 状态信息 */
  status: {
    /** 到下次心跳的间隔，单位毫秒 */
    interval: number
  }
}

/** 元事件 */
export type OB11Meta = OneBot11Lifecycle | OneBot11Heartbeat
/** 全部事件 */
export type OB11AllEvent = OB11Message | OB11Notice | OB11Request | OB11Meta
