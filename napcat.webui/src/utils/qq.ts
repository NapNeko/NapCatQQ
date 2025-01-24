import type { QQItem } from '@/components/quick_login'

/**
 * 判断 QQ 快速登录列表项是否为 QQ 信息
 * @param data QQ 快速登录列表项
 * @returns 是否为 QQ 信息
 * @description 用于判定 QQ 快速登录列表项是否为 QQ 信息
 */
export const isQQQuickNewItem = (
  data?: QQItem | LoginListItem | null
): data is LoginListItem => {
  return !!data && 'nickName' in data && 'faceUrl' in data
}
