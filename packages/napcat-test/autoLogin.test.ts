import { Value } from '@sinclair/typebox/value';
import { describe, expect, test } from 'vitest';

import {
  resolveAutoLoginAccount,
  WebUiConfigSchema,
  type WebUiConfigType,
} from '../napcat-webui-backend/src/helper/config-schema';

describe('automatic login account selection', () => {
  test('uses explicit sources before the last successful account', () => {
    expect(resolveAutoLoginAccount('10001', '10002', '10003')).toBe('10001');
    expect(resolveAutoLoginAccount(undefined, '10002', '10003')).toBe('10002');
    expect(resolveAutoLoginAccount(undefined, undefined, '10003')).toBe('10003');
  });

  test('ignores empty account values', () => {
    expect(resolveAutoLoginAccount('  ', '', ' 10003 ')).toBe('10003');
    expect(resolveAutoLoginAccount(undefined, '', '  ')).toBeUndefined();
  });
});

describe('WebUI login configuration migration', () => {
  test('adds an empty last account to an existing configuration', () => {
    const config = Value.Parse(WebUiConfigSchema, {
      host: '127.0.0.1',
      autoLoginAccount: '10002',
    }) as WebUiConfigType;

    expect(config.host).toBe('127.0.0.1');
    expect(config.autoLoginAccount).toBe('10002');
    expect(config.lastLoginAccount).toBe('');
  });

  test('preserves existing settings when the last account is updated', () => {
    const current = Value.Parse(WebUiConfigSchema, {
      host: '127.0.0.1',
      port: 7000,
      autoLoginAccount: '10002',
    }) as WebUiConfigType;
    const updated = Value.Parse(WebUiConfigSchema, {
      ...current,
      lastLoginAccount: '10003',
    }) as WebUiConfigType;

    expect(updated.host).toBe('127.0.0.1');
    expect(updated.port).toBe(7000);
    expect(updated.autoLoginAccount).toBe('10002');
    expect(updated.lastLoginAccount).toBe('10003');
  });
});
