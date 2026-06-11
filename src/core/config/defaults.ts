import type { PluginConfig } from './types.js';
import { randomBytes } from 'crypto';

export function buildDefaults(dataDir: string): PluginConfig {
  return {
    core: {
      selfId: 0,
      managedGroups: [],
      superAdmins: [],
      dataDir,
      logLevel: 'info',
    },
    webui: {
      enabled: true,
      host: '127.0.0.1',
      port: 3891,
      jwtSecret: randomBytes(32).toString('hex'),
      jwtExpiresIn: '2h',
      refreshExpiresIn: '7d',
    },
    approval: {
      defaultAction: 'manual',
      groups: {},
      pendingTtlSeconds: 86400, // 24h
    },
    captcha: {
      ttlSeconds: 300,
      maxAttempts: 3,
      types: ['math', 'question'],
      questions: [],
    },
    risk: {
      enabled: true,
      threshold: 70,
      action: 'mute',
      muteDurationSeconds: 600,
      detectors: {
        advertising: true,
        fraud: true,
        grayMarket: true,
        pornography: true,
        political: true,
        gambling: true,
        shortLinks: true,
        duplicateMessages: true,
        spam: true,
        ocrViolation: false,
        aiViolation: false,
      },
      weights: {},
    },
    punishment: {
      defaultMuteDurationSeconds: 600,
      escalateToKickAfter: 3,
      escalateToBlacklistAfter: 5,
    },
    blacklist: {
      syncAcrossGroups: false,
      autoKickOnJoin: true,
    },
    auth: {
      maxLoginAttempts: 5,
      lockoutSeconds: 900,
      requireTotpForHighRisk: false,
      rateLimitRequests: 100,
      rateLimitWindowMs: 60000,
    },
    monitor: {
      intervalMs: 30000,
      diskAlertMb: 500,
      memoryAlertPercent: 90,
    },
    update: {
      githubRepo: 'ShiYuPIay/napcat-plugin-qq-guardian',
      autoCheckOnStartup: true,
      autoInstall: false,
    },
    ai: {
      provider: 'disabled',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o-mini',
      timeoutMs: 15000,
      riskPrompt:
        'Analyze the following QQ group message for risk. Respond with JSON: {"score":0-100,"reason":"...","tags":[]}. Score: 0=safe, 100=extremely harmful.',
    },
    ocr: {
      provider: 'disabled',
      timeoutMs: 10000,
    },
  };
}
