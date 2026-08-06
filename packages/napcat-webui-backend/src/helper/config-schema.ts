import { Static, Type } from '@sinclair/typebox';

import { themeType } from '../types/theme';
import { getRandomToken } from '../utils/url';

export const WebUiConfigSchema = Type.Object({
  host: Type.String({ default: '::' }),
  port: Type.Number({ default: 6099 }),
  token: Type.String({ default: getRandomToken(12) }),
  loginRate: Type.Number({ default: 10 }),
  autoLoginAccount: Type.String({ default: '' }),
  lastLoginAccount: Type.String({ default: '' }),
  theme: themeType,
  disableWebUI: Type.Boolean({ default: false }),
  accessControlMode: Type.Union([
    Type.Literal('none'),
    Type.Literal('whitelist'),
    Type.Literal('blacklist'),
  ], { default: 'none' }),
  ipWhitelist: Type.Array(Type.String(), { default: [] }),
  ipBlacklist: Type.Array(Type.String(), { default: [] }),
  enableXForwardedFor: Type.Boolean({ default: false }),
  enable2FA: Type.Boolean({ default: false }),
  totpSecret: Type.String({ default: '' }),
});

export type WebUiConfigType = Static<typeof WebUiConfigSchema>;

export function resolveAutoLoginAccount (
  environmentAccount: string | undefined,
  configuredAccount: string | undefined,
  lastLoginAccount: string | undefined
): string | undefined {
  return [environmentAccount, configuredAccount, lastLoginAccount]
    .map(account => account?.trim())
    .find((account): account is string => Boolean(account));
}
