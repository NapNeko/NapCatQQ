/**
 * Complete plugin configuration schema.
 * All fields have defaults defined in defaults.ts.
 */

export interface PluginConfig {
  core: CoreConfig;
  webui: WebuiConfig;
  approval: ApprovalConfig;
  captcha: CaptchaConfig;
  risk: RiskConfig;
  punishment: PunishmentConfig;
  blacklist: BlacklistConfig;
  auth: AuthConfig;
  monitor: MonitorConfig;
  update: UpdateConfig;
  ai: AIConfig;
  ocr: OCRConfig;
}

export interface CoreConfig {
  /** Bot's own QQ ID (self_id) */
  selfId: number;
  /** Groups this plugin manages. Empty = all groups. */
  managedGroups: number[];
  /** Super admin QQ IDs */
  superAdmins: number[];
  dataDir: string;
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
}

export interface WebuiConfig {
  enabled: boolean;
  host: string;
  port: number;
  /** HTTPS cert/key paths, optional */
  tls?: { cert: string; key: string };
  /** Session secret for JWT signing */
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshExpiresIn: string;
}

export interface ApprovalConfig {
  /** Default action for groups not explicitly configured */
  defaultAction: 'auto_approve' | 'auto_reject' | 'manual' | 'captcha';
  /** Per-group overrides, keyed by group_id string */
  groups: Record<string, GroupApprovalConfig>;
  /** Request expires after N seconds */
  pendingTtlSeconds: number;
}

export interface GroupApprovalConfig {
  action: 'auto_approve' | 'auto_reject' | 'manual' | 'captcha';
  /** Approve if comment matches any of these keywords */
  approveKeywords: string[];
  /** Reject if comment matches any of these keywords */
  rejectKeywords: string[];
  /** Approve if comment matches any of these regex patterns */
  approvePatterns: string[];
  /** Reject if comment matches any of these regex patterns */
  rejectPatterns: string[];
  rejectReason: string;
}

export interface CaptchaConfig {
  /** Seconds before captcha expires */
  ttlSeconds: number;
  /** Max attempts before rejection */
  maxAttempts: number;
  /** Supported captcha types */
  types: ('math' | 'text' | 'question')[];
  /** Custom Q&A pairs for question-type captcha */
  questions: Array<{ q: string; a: string }>;
}

export interface RiskConfig {
  enabled: boolean;
  /** Score threshold 0-100; action taken above this */
  threshold: number;
  /** Action on risk detection */
  action: 'mute' | 'kick' | 'notify_admin' | 'log_only';
  muteDurationSeconds: number;
  detectors: {
    advertising: boolean;
    fraud: boolean;
    grayMarket: boolean;
    pornography: boolean;
    political: boolean;
    gambling: boolean;
    shortLinks: boolean;
    duplicateMessages: boolean;
    spam: boolean;
    ocrViolation: boolean;
    aiViolation: boolean;
  };
  /** Per-detector weight multiplier 0-2 */
  weights: Partial<Record<string, number>>;
}

export interface PunishmentConfig {
  /** Default mute duration seconds */
  defaultMuteDurationSeconds: number;
  /** Escalation: after N punishments escalate to kick */
  escalateToKickAfter: number;
  /** Escalation: after N kicks escalate to blacklist */
  escalateToBlacklistAfter: number;
}

export interface BlacklistConfig {
  /** Sync blacklist across all managed groups */
  syncAcrossGroups: boolean;
  /** Auto kick on join if blacklisted */
  autoKickOnJoin: boolean;
}

export interface AuthConfig {
  /** Max login attempts before lockout */
  maxLoginAttempts: number;
  /** Lockout duration seconds */
  lockoutSeconds: number;
  /** Require TOTP for high-risk ops */
  requireTotpForHighRisk: boolean;
  /** Rate limit: requests per window */
  rateLimitRequests: number;
  rateLimitWindowMs: number;
}

export interface MonitorConfig {
  /** Health check interval ms */
  intervalMs: number;
  /** Alert if disk free below this MB */
  diskAlertMb: number;
  /** Alert if memory usage above this % */
  memoryAlertPercent: number;
}

export interface UpdateConfig {
  /** GitHub repo for release checks, e.g. "ShiYuPIay/napcat-plugin-qq-guardian" */
  githubRepo: string;
  /** Auto-check for updates on startup */
  autoCheckOnStartup: boolean;
  /** Auto-install non-breaking updates */
  autoInstall: boolean;
}

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'custom' | 'disabled';
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
  /** System prompt for risk assessment */
  riskPrompt: string;
}

export interface OCRConfig {
  provider: 'tesseract' | 'custom' | 'disabled';
  /** Custom OCR endpoint URL */
  customEndpoint?: string;
  customApiKey?: string;
  timeoutMs: number;
}
