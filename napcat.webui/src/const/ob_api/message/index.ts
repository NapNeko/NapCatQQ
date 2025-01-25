import { z } from 'zod'

import { baseResponseSchema, commonResponseDataSchema } from '../response'
import oneBotHttpApiMessageGroup from './group'
import messageNodeSchema from './node'
import oneBotHttpApiMessagePrivate from './private'

const fileSchema = z
  .object({
    file: z.string().describe('路径或链接'),
    url: z.string().describe('路径或链接'),
    file_size: z.string().describe('文件大小'),
    file_name: z.string().describe('文件名'),
    base64: z.string().describe('文件base64编码')
  })
  .describe('文件')
const messageSchema = z
  .object({
    self_id: z.number().describe('自己QQ号'),
    user_id: z.number().describe('发送人QQ号'),
    time: z.number().describe('发送时间'),
    message_id: z.number().describe('消息ID'),
    message_seq: z.number().describe('消息序号'),
    real_id: z.number().describe('?ID'),
    message_type: z.string().describe('消息类型'),
    sender: z
      .object({
        user_id: z.number().describe('发送人QQ号'),
        nickname: z.string().describe('昵称'),
        sex: z.enum(['male', 'female', 'unknown']).describe('性别'),
        age: z.number().describe('年龄'),
        card: z.string().describe('名片'),
        role: z.enum(['owner', 'admin', 'member']).describe('角色')
      })
      .describe('发送人信息'),
    raw_message: z.string().describe('原始消息'),
    font: z.number().describe('字体'),
    sub_type: z.string().describe('子类型'),
    message: z.array(messageNodeSchema).describe('消息内容'),
    message_format: z.string().describe('消息格式'),
    post_type: z.string().describe('?'),
    message_sent_type: z.string().describe('消息发送类型'),
    group_id: z.number().describe('群号')
  })
  .describe('消息')

const oneBotHttpApiMessage = {
  ...oneBotHttpApiMessagePrivate,
  ...oneBotHttpApiMessageGroup,
  '/mark_msg_as_read': {
    description: '标记消息已读',
    request: z
      .object({
        group_id: z
          .union([z.string(), z.number()])
          .optional()
          .describe('群号，与 user_id 二选一'),
        user_id: z
          .union([z.string(), z.number()])
          .optional()
          .describe('用户QQ号，与 group_id 二选一')
      })
      .refine(
        (data) =>
          (data.group_id && !data.user_id) || (!data.group_id && data.user_id),
        {
          message: 'group_id 和 user_id 必须二选一，且不能同时存在或同时为空',
          path: ['group_id', 'user_id']
        }
      ),
    response: baseResponseSchema
  },
  '/mark_group_msg_as_read': {
    description: '标记群消息已读',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号')
    }),
    response: baseResponseSchema
  },
  '/mark_private_msg_as_read': {
    description: '标记私聊消息已读',
    request: z.object({
      user_id: z.union([z.string(), z.number()]).describe('用户QQ号')
    }),
    response: baseResponseSchema
  },
  '/_mark_all_as_read': {
    description: '标记所有消息已读',
    request: z.object({}),
    response: baseResponseSchema
  },
  '/delete_msg': {
    description: '撤回消息',
    request: z.object({
      message_id: z.union([z.string(), z.number()]).describe('消息ID')
    }),
    response: baseResponseSchema
  },
  '/get_msg': {
    description: '获取消息',
    request: z.object({
      message_id: z.union([z.string(), z.number()]).describe('消息ID')
    }),
    response: baseResponseSchema.extend({
      data: z.object({})
    })
  },
  '/get_image': {
    description: '获取图片',
    request: z.object({
      file_id: z.string().describe('文件ID')
    }),
    response: baseResponseSchema.extend({
      data: fileSchema
    })
  },
  '/get_record': {
    description: '获取语音',
    request: z.object({
      file_id: z.string().describe('文件ID'),
      out_format: z
        .enum(['mp3', 'amr', 'wma', 'm4a', 'spx', 'ogg', 'wav', 'flac'])
        .describe('输出格式')
    }),
    response: baseResponseSchema.extend({
      data: fileSchema
    })
  },
  '/get_file': {
    description: '获取文件',
    request: z.object({
      file_id: z.string().describe('文件ID')
    }),
    response: baseResponseSchema.extend({
      data: fileSchema
    })
  },
  '/get_group_msg_history': {
    description: '获取群消息历史',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      message_seq: z.union([z.string(), z.number()]).describe('消息序号'),
      count: z.number().int().positive().describe('获取数量'),
      reverseOrder: z.boolean().describe('是否倒序')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        messages: z.array(messageSchema).describe('消息列表')
      })
    })
  },
  '/set_msg_emoji_like': {
    description: '贴表情',
    request: z.object({
      message_id: z.union([z.string(), z.number()]).describe('消息ID'),
      emoji_id: z.number().describe('表情ID'),
      set: z.boolean().describe('?')
    }),
    response: baseResponseSchema.extend({
      data: commonResponseDataSchema
    })
  },
  '/get_friend_msg_history': {
    description: '获取好友消息历史',
    request: z.object({
      user_id: z.union([z.string(), z.number()]).describe('用户QQ号'),
      message_seq: z.union([z.string(), z.number()]).describe('消息序号'),
      count: z.number().int().positive().describe('获取数量'),
      reverseOrder: z.boolean().describe('是否倒序')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        messages: z.array(messageSchema)
      })
    })
  },
  '/get_recent_contact': {
    description: '最近消息列表',
    request: z.object({
      count: z.number().int().positive().describe('获取数量')
    }),
    response: baseResponseSchema.extend({
      data: z.array(
        z.object({
          lastestMsg: messageSchema,
          peerUin: z.string().describe('对方QQ号'),
          remark: z.string().describe('备注'),
          msgTime: z.string().describe('消息时间'),
          chatType: z.number().describe('聊天类型'),
          msgId: z.string().describe('消息ID'),
          sendNickName: z.string().describe('发送人昵称'),
          sendMemberName: z.string().describe('发送人?昵称'),
          peerName: z.string().describe('对方昵称')
        })
      )
    })
  },
  '/fetch_emoji_like': {
    description: '获取贴表情详情',
    request: z.object({
      message_id: z.union([z.string(), z.number()]).describe('消息ID'),
      emojiId: z.string().describe('表情ID'),
      emojiType: z.string().describe('表情类型'),
      group_id: z.union([z.string(), z.number()]).optional().describe('群号'),
      user_id: z
        .union([z.string(), z.number()])
        .optional()
        .describe('用户QQ号'),
      count: z.number().int().positive().optional().describe('获取数量')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        result: z.number().describe('结果'),
        errMsg: z.string().describe('错误信息'),
        emojiLikesList: z
          .array(
            z
              .object({
                tinyId: z.string().describe('表情ID'),
                nickName: z.string().describe('昵称?'),
                headUrl: z.string().describe('头像?')
              })
              .describe('表情点赞列表')
          )
          .describe('表情点赞列表'),
        cookie: z.string().describe('cookie'),
        isLastPage: z.boolean().describe('是否最后一页'),
        isFirstPage: z.boolean().describe('是否第一页')
      })
    })
  },
  '/get_forward_msg': {
    description: '获取合并转发消息',
    request: z.object({
      message_id: z.union([z.string(), z.number()]).describe('消息ID')
    }),
    response: baseResponseSchema.extend({
      data: z.object({})
    })
  },
  '/send_forward_msg': {
    description: '发送合并转发消息',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).optional().describe('群号'),
      user_id: z
        .union([z.string(), z.number()])
        .optional()
        .describe('用户QQ号'),
      messages: z.array(messageNodeSchema).describe('消息内容'),
      news: z
        .array(
          z.object({
            text: z.string()
          })
        )
        .describe('?'),
      prompt: z.string().describe('外显'),
      summary: z.string().describe('底下文字'),
      source: z.string().describe('内容')
    }),
    response: baseResponseSchema.extend({
      data: commonResponseDataSchema.extend({
        data: z.object({})
      })
    })
  }
} as const

export default oneBotHttpApiMessage
