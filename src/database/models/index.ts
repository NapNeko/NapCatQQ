/**
 * Database model types.
 * Each interface maps 1-to-1 to a SQLite table row (snake_case columns).
 */

export interface DbUser {
  id: number;
  qq_id: number;
  username: string | null;
  password_hash: string | null;
  role: 'super_admin' | 'group_admin' | 'auditor' | 'viewer' | 'member';
  totp_secret: string | null;
  totp_enabled: 0 | 1;
  login_attempts: number;
  locked_until: number | null;
  last_login: number | null;
  created_at: number;
  updated_at: number;
}

export interface DbApprovalRecord {
  id: number;
  group_id: number;
  user_id: number;
  flag: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'captcha';
  reason: string | null;
  operator_id: number | null;
  captcha_id: string | null;
  created_at: number;
  processed_at: number | null;
  expires_at: number;
}

export interface DbCaptchaSession {
  id: string;  // UUID
  group_id: number;
  user_id: number;
  approval_id: number;
  type: 'math' | 'text' | 'question';
  challenge: string;  // Question text
  answer: string;     // Correct answer (lowercase)
  attempts: number;
  max_attempts: number;
  created_at: number;
  expires_at: number;
  solved: 0 | 1;
}

export interface DbBlacklistEntry {
  id: number;
  user_id: number;
  group_id: number | null;  // null = global across all groups
  reason: string;
  created_by: number;
  created_at: number;
  expires_at: number | null;
}

export interface DbPunishmentRecord {
  id: number;
  group_id: number;
  user_id: number;
  type: 'mute' | 'kick' | 'ban';
  duration_seconds: number | null;  // null = permanent
  reason: string;
  operator_id: number;
  created_at: number;
  expires_at: number | null;
  revoked_at: number | null;
  revoked_by: number | null;
}

export interface DbAuditLog {
  id: number;
  action: string;
  actor_id: number | null;
  target_type: string | null;
  target_id: string | null;
  details: string;  // JSON string
  ip: string | null;
  created_at: number;
}

export interface DbLoginLog {
  id: number;
  user_id: number;
  ip: string;
  user_agent: string | null;
  success: 0 | 1;
  created_at: number;
}

export interface DbStatSnapshot {
  id: number;
  group_id: number | null;
  period: string;  // e.g. "2024-01-15"
  approvals_total: number;
  approvals_passed: number;
  approvals_rejected: number;
  captchas_total: number;
  captchas_passed: number;
  punishments_total: number;
  risk_detections: number;
  created_at: number;
}

export interface DbRiskRule {
  id: number;
  name: string;
  type: string;
  pattern: string;
  weight: number;
  enabled: 0 | 1;
  created_at: number;
  updated_at: number;
}
