import { bus } from '../../events/index.js';
import { auditRepo } from '../../database/repositories/audit.js';

export function initAuditModule(): void {
  bus.on('AuditCreated', (payload) => {
    auditRepo.log({
      action: payload.action,
      actorId: payload.actorId ?? undefined,
      targetType: payload.targetType ?? undefined,
      targetId: payload.targetId ?? undefined,
      details: payload.details,
    });
  });
}
