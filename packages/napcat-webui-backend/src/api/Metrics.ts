import { Registry, Gauge, collectDefaultMetrics } from 'prom-client';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { resourceManager } from 'napcat-common/src/health';

export const register = new Registry();

collectDefaultMetrics({ register, prefix: 'napcat_' });

const qqLoginStatus = new Gauge({
  name: 'napcat_qq_login_status',
  help: 'QQ login status (1 = logged in, 0 = not logged in)',
  registers: [register],
});

const qqOnline = new Gauge({
  name: 'napcat_qq_online',
  help: 'QQ online status (1 = online, 0 = offline)',
  registers: [register],
});

const napcatInfo = new Gauge({
  name: 'napcat_info',
  help: 'NapCat build info',
  labelNames: ['version', 'qq_version', 'uin'] as const,
  registers: [register],
});

const uptimeSeconds = new Gauge({
  name: 'napcat_uptime_seconds',
  help: 'Process uptime in seconds',
  registers: [register],
});

const adapterActive = new Gauge({
  name: 'napcat_onebot_adapter_active',
  help: 'Whether an OneBot adapter is currently active (1 = active, 0 = inactive)',
  labelNames: ['name'] as const,
  registers: [register],
});

const adapterEnabled = new Gauge({
  name: 'napcat_onebot_adapter_enabled',
  help: 'Whether an OneBot adapter is enabled (1 = enabled, 0 = disabled)',
  labelNames: ['name'] as const,
  registers: [register],
});

const resourceSuccess = new Gauge({
  name: 'napcat_resource_success_total',
  help: 'Total successful resource calls',
  labelNames: ['type'] as const,
  registers: [register],
});

const resourceFailure = new Gauge({
  name: 'napcat_resource_failure_total',
  help: 'Total failed resource calls',
  labelNames: ['type'] as const,
  registers: [register],
});

export async function getMetrics (): Promise<string> {
  qqLoginStatus.set(WebUiDataRuntime.getQQLoginStatus() ? 1 : 0);
  uptimeSeconds.set(process.uptime());

  const ob11 = WebUiDataRuntime.getOneBotContext();
  if (ob11) {
    qqOnline.set(ob11.core?.selfInfo?.online ? 1 : 0);

    napcatInfo.reset();
    napcatInfo
      .labels(
        WebUiDataRuntime.GetNapCatVersion(),
        WebUiDataRuntime.getQQVersion(),
        WebUiDataRuntime.getQQLoginUin(),
      )
      .set(1);

    adapterActive.reset();
    adapterEnabled.reset();
    if (ob11.networkManager?.adapters) {
      for (const [name, adapter] of ob11.networkManager.adapters) {
        adapterActive.labels(name).set(adapter.isActive ? 1 : 0);
        adapterEnabled.labels(name).set(adapter.isEnable ? 1 : 0);
      }
    }
  }

  resourceSuccess.reset();
  resourceFailure.reset();
  const allStats = resourceManager.getAllResourceStats();
  for (const [type, stats] of allStats) {
    resourceSuccess.labels(type).set(stats.successCount);
    resourceFailure.labels(type).set(stats.failureCount);
  }

  return register.metrics();
}
