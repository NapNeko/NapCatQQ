import { getDatabase } from '../../database/index.js';
import { configManager } from '../../core/config/index.js';
import { getLogger } from '../../core/logger/index.js';
import { freemem, totalmem } from 'os';
import { statfsSync } from 'fs';

export interface HealthStatus {
  healthy: boolean;
  timestamp: number;
  components: Record<string, ComponentHealth>;
}

export interface ComponentHealth {
  status: 'ok' | 'warn' | 'error';
  message?: string;
  detail?: Record<string, unknown>;
}

let _timer: NodeJS.Timeout | null = null;
let _lastStatus: HealthStatus = buildEmpty();

function buildEmpty(): HealthStatus {
  return { healthy: true, timestamp: 0, components: {} };
}

export function initMonitorModule(): void {
  const cfg = configManager.get().monitor;
  runChecks();
  _timer = setInterval(runChecks, cfg.intervalMs);
}

export function stopMonitorModule(): void {
  if (_timer) { clearInterval(_timer); _timer = null; }
}

export function getLastHealthStatus(): HealthStatus {
  return _lastStatus;
}

function runChecks(): void {
  const cfg = configManager.get().monitor;
  const components: Record<string, ComponentHealth> = {};

  // Database
  try {
    getDatabase().prepare('SELECT 1').get();
    components['database'] = { status: 'ok' };
  } catch (err) {
    components['database'] = { status: 'error', message: String(err) };
  }

  // Memory
  try {
    const free = freemem();
    const total = totalmem();
    const usedPercent = Math.round(((total - free) / total) * 100);
    components['memory'] = {
      status: usedPercent > cfg.memoryAlertPercent ? 'warn' : 'ok',
      detail: { usedPercent, freeMb: Math.round(free / 1024 / 1024) },
    };
  } catch {
    components['memory'] = { status: 'error', message: 'Could not read memory stats' };
  }

  // Disk
  try {
    const dataDir = configManager.get().core.dataDir;
    const stats = statfsSync(dataDir);
    const freeMb = Math.round((stats.bfree * stats.bsize) / 1024 / 1024);
    components['disk'] = {
      status: freeMb < cfg.diskAlertMb ? 'warn' : 'ok',
      detail: { freeMb },
    };
  } catch {
    components['disk'] = { status: 'error', message: 'Could not read disk stats' };
  }

  const allOk = Object.values(components).every((c) => c.status === 'ok');
  const anyError = Object.values(components).some((c) => c.status === 'error');

  _lastStatus = {
    healthy: !anyError,
    timestamp: Date.now(),
    components,
  };

  if (!allOk) {
    getLogger()
      .child({ module: 'monitor' })
      .warn({ components }, 'Health check warning');
  }
}
