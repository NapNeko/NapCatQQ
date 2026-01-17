import QQManager from '@/controllers/qq_manager';

/**
 * 轮询等待后端进程恢复
 * @param maxWaitTime 最大等待时间，单位毫秒
 * @param onSuccess 成功回调
 * @param onTimeout 超时回调
 */
export async function waitForBackendReady (
  maxWaitTime: number = 15000,
  onSuccess?: () => void,
  onTimeout?: () => void
): Promise<boolean> {
  const startTime = Date.now();

  return new Promise<boolean>((resolve) => {
    const timer = setInterval(async () => {
      try {
        // 尝试请求后端，设置一个较短的请求超时避免挂起
        await QQManager.getQQLoginInfo({ timeout: 500 });
        // 如果能走到这一步说明请求成功了
        clearInterval(timer);
        onSuccess?.();
        resolve(true);
      } catch (_e) {
        // 如果请求失败（后端没起来），检查是否超时
        if (Date.now() - startTime > maxWaitTime) {
          clearInterval(timer);
          onTimeout?.();
          resolve(false);
        }
      }
    }, 500); // 每 500ms 探测一次
  });
}
