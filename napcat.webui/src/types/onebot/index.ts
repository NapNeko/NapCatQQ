import { Request } from './api'
import { OB11AllEvent } from './event'

/**
 * @file onebot协议相关类型定义
 * @module types/onebot
 * @description 与onebot协议相关的类型定义
 * 来源 KarinJS
 */
export * from './api'
export * from './segment'
export * from './event'

export type AllOB11RequestKeys = keyof Request

export type AllOBRequestValues = Request[AllOB11RequestKeys]

export interface RequestResponse<
  T extends AllOB11RequestKeys = AllOB11RequestKeys
> {
  status: 'ok' | 'async' | 'failed'
  retcode: number
  data: Request[T]
  message: string
  wording: string
  echo: string
}

export type AllOB11WsResponse = OB11AllEvent | RequestResponse
