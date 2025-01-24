import { z } from 'zod'

const messageNode = z.union([
  z
    .object({
      type: z.literal('text'),
      data: z.object({
        text: z.string()
      })
    })
    .describe('文本消息'),
  z
    .object({
      type: z.literal('at'),
      data: z.object({
        qq: z.string()
      })
    })
    .describe('@某人'),
  z
    .object({
      type: z.literal('image'),
      data: z.object({
        file: z.string()
      })
    })
    .describe('图片消息'),
  z
    .object({
      type: z.literal('face'),
      data: z.object({
        id: z.number()
      })
    })
    .describe('表情消息'),
  z
    .object({
      type: z.literal('json'),
      data: z.object({
        data: z.string()
      })
    })
    .describe('json 卡片消息'),
  z
    .object({
      type: z.literal('record'),
      data: z.object({
        file: z.string()
      })
    })
    .describe('语音消息'),
  z
    .object({
      type: z.literal('video'),
      data: z.object({
        file: z.string()
      })
    })
    .describe('视频消息'),
  z
    .object({
      type: z.literal('reply'),
      data: z.object({
        id: z.number()
      })
    })
    .describe('回复消息'),
  z
    .object({
      type: z.literal('music'),
      data: z.union([
        z.object({
          type: z.enum(['qq', '163']),
          id: z.string()
        }),
        z.object({
          type: z.literal('custom'),
          url: z.string(),
          audio: z.string(),
          title: z.string(),
          image: z.string()
        })
      ])
    })
    .describe('音乐消息'),
  z
    .object({
      type: z.literal('dice')
    })
    .describe('掷骰子'),
  z
    .object({
      type: z.literal('rps')
    })
    .describe('猜拳'),
  z
    .object({
      type: z.literal('file'),
      data: z.object({
        file: z.string().describe('文件路径，服务器本地或者网络文件均可')
      })
    })
    .describe('发送消息')
])

export const nodeMessage = z
  .object({
    type: z.literal('node'),
    data: z.object({
      user_id: z.string(),
      nickname: z.string(),
      content: z.array(messageNode)
    })
  })
  .describe('消息节点')

const messageNodeSchema = z.union([messageNode, nodeMessage])

export default messageNodeSchema
