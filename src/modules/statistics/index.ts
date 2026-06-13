import { statisticsRepo } from '../../database/repositories/statistics.js';
import { approvalRepo } from '../../database/repositories/approval.js';
import { getLogger } from '../../core/logger/index.js';

let _timer: NodeJS.Timeout | null = null;

export function initStatisticsModule(): void {
  // Run once at startup to ensure today's snapshot exists
  ensureTodaySnapshot();

  // Refresh snapshot hourly
  _timer = setInterval(ensureTodaySnapshot, 3_600_000);
}

export function stopStatisticsModule(): void {
  if (_timer) { clearInterval(_timer); _timer = null; }
}

function ensureTodaySnapshot(): void {
  try {
    const expired = approvalRepo.expireOldPending();
    if (expired > 0) {
      getLogger()
        .child({ module: 'statistics' })
        .debug({ expired }, 'Expired pending approval requests');
    }
  } catch (err) {
    getLogger().child({ module: 'statistics' }).error(err, 'Statistics snapshot error');
  }
}

export function getOverviewStats() {
  return {
    totals: statisticsRepo.totals(),
    approvalCounts: approvalRepo.countByStatus(),
    recent30Days: statisticsRepo.findRecent(30),
  };
}
