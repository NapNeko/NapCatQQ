import type { Op } from 'quill'

import type { EmojiValue } from '@/components/chat_input/formats/emoji_blot'
import type { ImageValue } from '@/components/chat_input/formats/image_blot'
import type { ReplyBlockValue } from '@/components/chat_input/formats/reply_blot'

import {
  type AllOB11WsResponse,
  type OB11AllEvent,
  type OB11GroupMessage,
  type OB11Message,
  type OB11Notice,
  OB11NoticeType,
  type OB11PrivateMessage,
  type OB11Segment,
  type OneBot11Lifecycle,
  type RequestResponse
} from '../types/onebot'

/**
 * 获取事件名称
 * @param event 事件类型
 * @returns 事件名称
 * @description 用于获取事件的名称
 */
export const getEventName = (event: OB11AllEvent['post_type']): string => {
  switch (event) {
    case 'message':
      return '消息'
    case 'notice':
      return '通知'
    case 'request':
      return '请求'
    case 'meta_event':
      return '元事件'
    case 'message_sent':
      return '消息上报'
    default:
      return '未知'
  }
}

/**
 * 获取生命周期事件名称
 * @param event 生命周期事件类型
 * @returns 生命周期事件名称
 * @description 用于获取生命周期事件的名称
 */
export const getLifecycleName = (
  event: OneBot11Lifecycle['sub_type']
): string => {
  switch (event) {
    case 'enable':
      return '启用'
    case 'disable':
      return '停用'
    case 'connect':
      return '连接'
    default:
      return '未知'
  }
}

/**
 * 获取生命周期事件Chip颜色
 * @param event 生命周期事件类型
 * @returns 生命周期事件颜色
 * @description 用于获取生命周期事件的颜色
 */
export const getLifecycleColor = (
  event: OneBot11Lifecycle['sub_type']
): 'success' | 'danger' | 'default' => {
  switch (event) {
    case 'enable':
      return 'success'
    case 'disable':
      return 'danger'
    case 'connect':
      return 'success'
    default:
      return 'default'
  }
}

/**
 * 判断 OneBot WS 返回值是否为事件
 * @param data OneBot WS 返回值
 * @returns 是否为事件
 * @description 用于判断 OneBot WS 返回值是否为事件
 */
export const isOB11Event = (data: AllOB11WsResponse): data is OB11AllEvent => {
  return 'post_type' in data
}

/**
 * 判断 OneBot WS 返回值是否为请求响应
 * @param data OneBot WS 返回值
 * @returns 是否为请求响应
 * @description 用于判断 OneBot WS 返回值是否为请求响应
 */
export const isOB11RequestResponse = (
  data: AllOB11WsResponse
): data is RequestResponse => {
  return 'status' in data && 'retcode' in data
}

/**
 * 获取请求响应状态文本
 * @param status 请求响应状态
 * @returns 请求响应状态文本
 * @description 用于获取请求响应状态的文本
 */
export const getResponseStatusText = (
  status: RequestResponse['status']
): string => {
  switch (status) {
    case 'ok':
      return '成功'
    case 'failed':
      return '失败'
    case 'async':
      return '异步'
    default:
      return '未知'
  }
}

/**
 * 获取请求响应状态颜色
 * @param status 请求响应状态
 * @returns 请求响应状态颜色
 * @description 用于获取请求响应状态的颜色
 */
export const getResponseStatusColor = (
  status: RequestResponse['status']
): 'success' | 'danger' | 'warning' | 'default' => {
  switch (status) {
    case 'ok':
      return 'success'
    case 'failed':
      return 'danger'
    case 'async':
      return 'warning'
    default:
      return 'default'
  }
}

/**
 * 获取通知类型名称
 * @param type 通知类型
 * @returns 通知类型名称
 * @description 用于获取通知类型的名称
 */
export const getNoticeTypeName = (type: OB11Notice['notice_type']): string => {
  switch (type) {
    case OB11NoticeType.GroupUpload:
      return '群文件上传'
    case OB11NoticeType.GroupAdmin:
      return '群管理员变动'
    case OB11NoticeType.GroupDecrease:
      return '群成员减少'
    case OB11NoticeType.GroupIncrease:
      return '群成员增加'
    case OB11NoticeType.GroupBan:
      return '群禁言'
    case OB11NoticeType.FriendAdd:
      return '好友添加'
    case OB11NoticeType.GroupRecall:
      return '群消息撤回'
    case OB11NoticeType.FriendRecall:
      return '好友消息撤回'
    case OB11NoticeType.Notify:
      return '通知'
    case OB11NoticeType.GroupMsgEmojiLike:
      return '群消息表情回应'
    case OB11NoticeType.GroupEssence:
      return '群消息精华'
    case OB11NoticeType.GroupCard:
      return '群名片更新'
    default:
      return '未知'
  }
}

/**
 * 判断 OneBot 消息是否为私聊消息
 * @param data OneBot 消息
 * @returns 是否为私聊消息
 * @description 用于判断 OneBot 消息是否为私聊消息
 */
export const isOB11PrivateMessage = (
  data: OB11Message
): data is OB11PrivateMessage => {
  return data.message_type === 'private'
}

/**
 * 判断 OneBot 消息是否为群消息
 * @param data OneBot 消息
 * @returns 是否为群消息
 * @description 用于判断 OneBot 消息是否为群消息
 */
export const isOB11GroupMessage = (
  data: OB11Message
): data is OB11GroupMessage => {
  return data.message_type === 'group'
}

/**
 * 将 Quill Delta 转换为 OneBot 消息
 * @param op Quill Delta
 * @returns OneBot 消息
 * @description 用于将 Quill Delta 转换为 OneBot 消息
 */
export const quillToMessage = (op: Op) => {
  let message: OB11Segment = {
    type: 'text',
    data: {
      text: op.insert as string
    }
  }
  if (typeof op.insert !== 'string') {
    if (op.insert?.image) {
      message = {
        type: 'image',
        data: {
          file: (op.insert.image as ImageValue).src
        }
      }
    } else if (op.insert?.emoji) {
      message = {
        type: 'face',
        data: {
          id: (op.insert.emoji as EmojiValue).id
        }
      }
    } else if (op.insert?.reply) {
      message = {
        type: 'reply',
        data: {
          id: (op.insert.reply as ReplyBlockValue).messageId
        }
      }
    }
  }
  return message
}
