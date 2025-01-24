import { z } from 'zod'
import type { ZodSchema } from 'zod'

import { baseResponseSchema, commonResponseDataSchema } from '../response'
import messageNodeSchema, { nodeMessage } from './node'

const oneBotHttpApiMessageGroup: Record<
  string,
  {
    description?: string
    request: ZodSchema
    response: ZodSchema
  }
> = {
  '/send_group_msg': {
    description: '发送群消息',
    request: z
      .object({
        group_id: z
          .union([z.string(), z.number()])
          .describe('群号')
          .describe('群号'),
        message: z.array(messageNodeSchema).describe('消息内容')
      })
      .refine(
        (data) => {
          const hasReply = data.message.some((item) => item.type === 'reply')

          if (hasReply) {
            return data.message[0].type === 'reply'
          }

          return true
        },
        {
          message:
            '如果 message 包含 reply 类型的消息，那么只能包含一个，而且排在最前面'
        }
      ),
    response: baseResponseSchema.extend({
      data: commonResponseDataSchema
    })
  },
  '/send_group_forward_msg': {
    description: '发送群合并转发消息',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      messages: z.array(nodeMessage).describe('消息内容'),
      news: z
        .array(
          z.object({
            text: z.string()
          })
        )
        .describe('?'),
      prompt: z.string().describe('外显'),
      summary: z.string().describe('底下文本'),
      source: z.string().describe('内容')
    }),
    response: baseResponseSchema.extend({
      data: commonResponseDataSchema
    })
  },
  '/forward_group_single_msg': {
    description: '消息转发到群',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      message_id: z.union([z.string(), z.number()]).describe('消息 ID')
    }),
    response: baseResponseSchema.extend({
      data: commonResponseDataSchema
    })
  },
  '/group_poke': {
    description: '发送戳一戳',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群号'),
      user_id: z.union([z.string(), z.number()]).describe('对方QQ号')
    }),
    response: baseResponseSchema
  }
}

export default oneBotHttpApiMessageGroup
