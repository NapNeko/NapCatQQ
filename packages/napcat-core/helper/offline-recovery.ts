export interface OfflineRecoveryOptions {
  // 当前账号是否在线
  isOnline: () => boolean;
  // 刚下线：同步 WebUI 状态
  onOffline: (tips: string) => void;
  // 静默离线期间账号自己恢复了，不需要重启
  onRecovered: () => void;
  // 重启 Worker；返回 false 或抛错表示失败，之后可以再次触发
  restart: (tips: string) => Promise<boolean>;
  // 被踢下线后多久重启。常规状态轮询为 3 秒，留出一个轮询周期，确保浏览器先清除旧二维码
  kickedDelayMs?: number;
  // 静默离线后多久重启。网络短暂断开时 QQ 也可能报离线，先给它自己重连的机会，
  // 不然一次网络抖动就会把整个 Worker 重启掉
  selfOfflineDelayMs?: number;
}

/**
 * 下线恢复：被踢下线（KickedOffLine）和静默离线（SelfOffline）共用。
 * 返回的函数在每次收到下线事件时调用，allowSelfRecovery 为 true 表示静默离线。
 */
export function createOfflineRecovery ({
  isOnline,
  onOffline,
  onRecovered,
  restart,
  kickedDelayMs = 3_500,
  selfOfflineDelayMs = 60_000,
}: OfflineRecoveryOptions) {
  let restartRequested = false;
  let selfRecoveryTimer: ReturnType<typeof setTimeout> | undefined;

  return (tips: string, allowSelfRecovery: boolean) => {
    onOffline(tips);

    if (restartRequested) {
      // 被踢时离线状态可能先到：还在等静默离线自行恢复的话，不用再等了
      if (allowSelfRecovery || !selfRecoveryTimer) return;
      clearTimeout(selfRecoveryTimer);
    }
    restartRequested = true;
    // 不在 RefreshQRcode 请求里直接重启 Worker，否则请求在返回前就被中断，
    // 浏览器只能得到 ERR_EMPTY_RESPONSE；延后调度也让前端先看到「二维码已清空、正在恢复」
    const timer = setTimeout(() => {
      selfRecoveryTimer = undefined;
      if (allowSelfRecovery && isOnline()) {
        restartRequested = false;
        onRecovered();
        return;
      }
      restart(tips).then((ok) => {
        if (!ok) restartRequested = false;
      }, () => {
        restartRequested = false;
      });
    }, allowSelfRecovery ? selfOfflineDelayMs : kickedDelayMs);
    selfRecoveryTimer = allowSelfRecovery ? timer : undefined;
  };
}
