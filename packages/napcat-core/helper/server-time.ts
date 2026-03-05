/**
 * 服务器时间矫正 - 全局 Hook
 *
 * 保留 Date.now 原始引用，启动后通过 getServerTime 计算偏移量，
 * 直接覆盖 Date.now()，使全局所有调用自动获得矫正后的时间戳。
 */

/** 原始 Date.now 引用，不受 hook 影响 */
export const OriginalDateNow: () => number = Date.now.bind(Date);

/**
 * 初始化全局时间矫正，覆盖 Date.now()
 * @param getServerTimeFn 获取服务器时间的函数，返回毫秒级时间戳字符串
 * @returns 偏移量（毫秒）
 */
export function hookGlobalDateNow (getServerTimeFn: () => string): number {
  const localNow = OriginalDateNow();
  const serverTimeStr = getServerTimeFn();
  const serverTimeMs = parseInt(serverTimeStr, 10);

  if (isNaN(serverTimeMs) || serverTimeMs <= 0) {
    return 0;
  }

  const offsetMs = serverTimeMs - localNow;

  if (Math.abs(offsetMs) > 5000) {
    Date.now = () => OriginalDateNow() + offsetMs;
  }

  return offsetMs;
}
