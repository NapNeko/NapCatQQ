import { z } from 'zod'

// 通用响应格式
export const baseResponseSchema = z.object({
  status: z.enum(['ok', 'error']).describe('请求状态'), // 状态
  retcode: z.number().describe('响应🐎'), // 返回码
  data: z.null(),
  message: z.string().describe('提示信息'), // 提示信息
  wording: z.string().describe('提示信息（人性化）'), // 人性化提示
  echo: z.string().describe('回显') // 请求回显内容
})

export const commonResponseDataSchema = z.object({
  result: z.number(),
  errMsg: z.string()
})
