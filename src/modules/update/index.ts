import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { bus } from '../../events/index.js';
import { configManager } from '../../core/config/index.js';
import { getLogger } from '../../core/logger/index.js';
import { withLock, locks } from '../../locks/index.js';

export interface ReleaseInfo {
  version: string;
  publishedAt: string;
  downloadUrl: string;
  releaseNotes: string;
}

let _currentVersion = '1.0.0';

export function setCurrentVersion(v: string): void {
  _currentVersion = v;
}

export function getCurrentVersion(): string {
  return _currentVersion;
}

export async function checkForUpdate(): Promise<ReleaseInfo | null> {
  const cfg = configManager.get().update;
  const log = getLogger().child({ module: 'update' });

  try {
    const res = await fetch(
      `https://api.github.com/repos/${cfg.githubRepo}/releases/latest`,
      { headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(10_000) }
    );
    if (!res.ok) return null;

    const data = (await res.json()) as {
      tag_name?: string;
      published_at?: string;
      body?: string;
      assets?: Array<{ name: string; browser_download_url: string }>;
    };

    const latest = data.tag_name?.replace(/^v/, '') ?? '';
    if (!latest || !isNewerVersion(latest, _currentVersion)) return null;

    const zipAsset = data.assets?.find((a) => a.name.endsWith('.zip'));
    if (!zipAsset) return null;

    return {
      version: latest,
      publishedAt: data.published_at ?? '',
      downloadUrl: zipAsset.browser_download_url,
      releaseNotes: data.body ?? '',
    };
  } catch (err) {
    log.error(err, 'Failed to check for updates');
    return null;
  }
}

export async function applyUpdate(info: ReleaseInfo): Promise<void> {
  return withLock(locks.update(), async () => {
    const log = getLogger().child({ module: 'update' });
    const cfg = configManager.get().core;
    const backupDir = join(cfg.dataDir, 'backups');
    mkdirSync(backupDir, { recursive: true });

    log.info({ version: info.version }, 'Applying update');

    // Download zip to temp
    const tmpPath = join(backupDir, `update-${info.version}.zip`);
    const res = await fetch(info.downloadUrl, { signal: AbortSignal.timeout(120_000) });
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);

    const writer = createWriteStream(tmpPath);
    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      writer.write(value);
    }
    await new Promise<void>((resolve, reject) => {
      writer.end();
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    log.info({ version: info.version }, 'Update downloaded, restart required to apply');
    // Note: actual file replacement requires the plugin host to handle the restart.
    // We signal via the event bus that an update is ready.

    bus.emit('PluginUpdated', {
      fromVersion: _currentVersion,
      toVersion: info.version,
      timestamp: Date.now(),
    });
    bus.emit('AuditCreated', {
      action: 'plugin.update',
      actorId: null,
      targetType: 'plugin',
      targetId: 'qq-guardian',
      details: { fromVersion: _currentVersion, toVersion: info.version },
      timestamp: Date.now(),
    });

    _currentVersion = info.version;
  });
}

function isNewerVersion(latest: string, current: string): boolean {
  const parse = (v: string) => v.split('.').map((n) => parseInt(n, 10));
  const [lMaj, lMin, lPat] = parse(latest);
  const [cMaj, cMin, cPat] = parse(current);
  if (lMaj !== cMaj) return lMaj > cMaj;
  if (lMin !== cMin) return lMin > cMin;
  return lPat > cPat;
}
