import { join } from 'path';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { setContext, clearContext, getCtx } from '../context/index.js';
import { configManager } from '../config/index.js';
import { initLogger, getLogger } from '../logger/index.js';
import { openDatabase, closeDatabase } from '../../database/index.js';
import { initAuditModule } from '../../modules/audit/index.js';
import { initBlacklistModule } from '../../modules/blacklist/index.js';
import { initStatisticsModule, stopStatisticsModule } from '../../modules/statistics/index.js';
import { initMonitorModule, stopMonitorModule } from '../../modules/monitor/index.js';
import { approvalService } from '../../modules/approval/service.js';
import { captchaService } from '../../modules/captcha/service.js';
import { punishmentService } from '../../modules/punishment/service.js';
import { riskService } from '../../modules/risk/service.js';
import { ensureDefaultAdmin } from '../../modules/auth/index.js';
import { registerRoutes } from '../../shared/api/rest/index.js';
import { checkForUpdate, setCurrentVersion } from '../../modules/update/index.js';
import type { NapCatPluginContext } from '../../types/napcat.js';

let _state: 'idle' | 'running' = 'idle';

function readPackageVersion(pluginPath: string): string {
  try {
    const p = join(pluginPath, 'package.json');
    if (existsSync(p)) {
      return (JSON.parse(readFileSync(p, 'utf8')) as { version?: string }).version ?? '1.0.0';
    }
  } catch { /* ignore */ }
  return '1.0.0';
}

export async function boot(ctx: NapCatPluginContext): Promise<void> {
  if (_state === 'running') return;
  setContext(ctx);

  const { dataPath, configPath, pluginPath } = ctx;
  for (const d of [dataPath, join(dataPath, 'logs'), join(dataPath, 'backups'), configPath]) {
    mkdirSync(d, { recursive: true });
  }

  // 1. Config — uses ctx.configPath for storage
  configManager.init(configPath);
  const cfg = configManager.get();

  // 2. Logger — delegates to ctx.logger (no pino, no workers)
  initLogger(dataPath, cfg.core.logLevel);
  const log = getLogger().child({ module: 'lifecycle' });
  log.info('Plugin booting…');

  // 3. Database
  openDatabase(dataPath);
  log.info('Database ready');

  // 4. Core modules
  initAuditModule();
  initBlacklistModule();
  initStatisticsModule();
  initMonitorModule();

  // 5. Feature services
  approvalService.init();
  captchaService.init();
  punishmentService.init();
  riskService.init();
  riskService.reloadRules();

  // 6. Auth
  await ensureDefaultAdmin();

  // 7. WebUI — use ctx.router (NOT our own Express server)
  const wuiDir = join(pluginPath, 'dist', 'webui');
  if (existsSync(wuiDir)) {
    ctx.router.static('/static', join(pluginPath, 'dist', 'webui'));
    ctx.router.page({
      path: 'guardian',
      title: 'QQ Guardian',
      icon: '🛡️',
      htmlFile: join(pluginPath, 'dist', 'webui', 'index.html'),
      description: 'QQ Group Guardian management panel',
    });
    log.info('WebUI registered via ctx.router');
  }

  // 8. REST API routes via ctx.router
  registerRoutes();
  log.info('API routes registered');

  // 9. Version + update check
  const version = readPackageVersion(pluginPath);
  setCurrentVersion(version);
  if (cfg.update.autoCheckOnStartup) {
    checkForUpdate().then(info => {
      if (info) log.info({ version: info.version }, 'Update available');
    }).catch(() => { /* offline — ignore */ });
  }

  _state = 'running';
  log.info({ version }, 'Plugin boot complete ✓');
}

export async function teardown(): Promise<void> {
  if (_state !== 'running') return;
  const log = getLogger().child({ module: 'lifecycle' });
  log.info('Plugin tearing down…');
  stopMonitorModule();
  stopStatisticsModule();
  closeDatabase();
  clearContext();
  _state = 'idle';
  log.info('Plugin teardown complete');
}

export function getState() { return _state; }
