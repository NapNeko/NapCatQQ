/**
 * Internal event bus types.
 * All inter-module communication goes through these events.
 * Modules must NOT call each other directly.
 */

export interface InternalEventMap {
  UserJoined: {
    groupId: number;
    userId: number;
    subType: 'approve' | 'invite';
    timestamp: number;
  };
  ApprovalPassed: {
    groupId: number;
    userId: number;
    flag: string;
    operatorId: number | null;
    timestamp: number;
  };
  ApprovalRejected: {
    groupId: number;
    userId: number;
    flag: string;
    reason: string;
    operatorId: number | null;
    timestamp: number;
  };
  CaptchaRequired: {
    approvalId: number;
    groupId: number;
    userId: number;
    timestamp: number;
  };
  CaptchaSuccess: {
    groupId: number;
    userId: number;
    captchaId: string;
    timestamp: number;
  };
  CaptchaFailed: {
    groupId: number;
    userId: number;
    captchaId: string;
    reason: string;
    timestamp: number;
  };
  RiskDetected: {
    groupId: number;
    userId: number;
    messageId: number;
    riskType: string;
    score: number;
    timestamp: number;
  };
  PunishmentCreated: {
    groupId: number;
    userId: number;
    type: 'mute' | 'kick' | 'ban';
    duration: number | null;
    reason: string;
    operatorId: number;
    timestamp: number;
  };
  UserBanned: {
    groupId: number;
    userId: number;
    duration: number;
    reason: string;
    timestamp: number;
  };
  UserUnbanned: {
    groupId: number;
    userId: number;
    operatorId: number;
    timestamp: number;
  };
  ConfigChanged: {
    section: string;
    timestamp: number;
  };
  PluginUpdated: {
    fromVersion: string;
    toVersion: string;
    timestamp: number;
  };
  AuditCreated: {
    action: string;
    actorId: number | null;
    targetType: string | null;
    targetId: string | null;
    details: Record<string, unknown>;
    timestamp: number;
  };
}

export type InternalEventName = keyof InternalEventMap;
export type InternalEventPayload<T extends InternalEventName> = InternalEventMap[T];
