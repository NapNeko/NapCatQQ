import { describe, it, expect, vi } from 'vitest';

import { runAutoLoginWithFallback } from '../napcat-webui-backend/src/utils/auto_login';
import { buildAutoPasswordLoginConfigPatch } from '../napcat-webui-backend/src/utils/auto_login_config';

describe('自动登录回退逻辑', () => {
  it('快速登录成功时不触发密码回退', async () => {
    const quickLogin = vi.fn().mockResolvedValue({ result: true, message: '' });
    const passwordLogin = vi.fn().mockResolvedValue({ result: true, message: '' });
    const logs: string[] = [];

    const result = await runAutoLoginWithFallback(
      {
        autoLoginAccount: '10001',
        autoPasswordLoginAccount: '10001',
        autoPasswordLoginPasswordMd5: '0123456789abcdef0123456789abcdef',
      },
      {
        quickLogin,
        passwordLogin,
        log: (message) => logs.push(message),
      }
    );

    expect(result).toEqual({
      quickLoginTried: true,
      quickLoginSuccess: true,
      passwordLoginTried: false,
      passwordLoginSuccess: false,
    });
    expect(quickLogin).toHaveBeenCalledTimes(1);
    expect(passwordLogin).not.toHaveBeenCalled();
    expect(logs.some(log => log.includes('自动快速登录成功'))).toBe(true);
  });

  it('快速登录失败后触发密码回退并成功', async () => {
    const quickLogin = vi.fn().mockResolvedValue({ result: false, message: 'token expired' });
    const passwordLogin = vi.fn().mockResolvedValue({ result: true, message: '' });
    const logs: string[] = [];

    const result = await runAutoLoginWithFallback(
      {
        autoLoginAccount: '10002',
        autoPasswordLoginAccount: '10002',
        autoPasswordLoginPasswordMd5: 'abcdef0123456789abcdef0123456789',
      },
      {
        quickLogin,
        passwordLogin,
        log: (message) => logs.push(message),
      }
    );

    expect(result).toEqual({
      quickLoginTried: true,
      quickLoginSuccess: false,
      passwordLoginTried: true,
      passwordLoginSuccess: true,
    });
    expect(quickLogin).toHaveBeenCalledWith('10002');
    expect(passwordLogin).toHaveBeenCalledWith('10002', 'abcdef0123456789abcdef0123456789');
    expect(logs.some(log => log.includes('自动快速登录失败'))).toBe(true);
    expect(logs.some(log => log.includes('自动密码回退登录成功'))).toBe(true);
  });

  it('快速登录失败且未配置密码时保持二维码兜底', async () => {
    const quickLogin = vi.fn().mockResolvedValue({ result: false, message: 'token expired' });
    const passwordLogin = vi.fn().mockResolvedValue({ result: true, message: '' });
    const logs: string[] = [];

    const result = await runAutoLoginWithFallback(
      {
        autoLoginAccount: '10003',
        autoPasswordLoginAccount: '10003',
        autoPasswordLoginPasswordMd5: '',
      },
      {
        quickLogin,
        passwordLogin,
        log: (message) => logs.push(message),
      }
    );

    expect(result).toEqual({
      quickLoginTried: true,
      quickLoginSuccess: false,
      passwordLoginTried: false,
      passwordLoginSuccess: false,
    });
    expect(passwordLogin).not.toHaveBeenCalled();
    expect(logs.some(log => log.includes('保持二维码登录兜底'))).toBe(true);
  });

  it('快速登录和密码回退都失败时返回失败结果', async () => {
    const quickLogin = vi.fn().mockResolvedValue({ result: false, message: 'token expired' });
    const passwordLogin = vi.fn().mockResolvedValue({ result: false, message: 'wrong password' });
    const logs: string[] = [];

    const result = await runAutoLoginWithFallback(
      {
        autoLoginAccount: '10004',
        autoPasswordLoginAccount: '10004',
        autoPasswordLoginPasswordMd5: '11112222333344445555666677778888',
      },
      {
        quickLogin,
        passwordLogin,
        log: (message) => logs.push(message),
      }
    );

    expect(result).toEqual({
      quickLoginTried: true,
      quickLoginSuccess: false,
      passwordLoginTried: true,
      passwordLoginSuccess: false,
    });
    expect(logs.some(log => log.includes('自动密码回退登录失败'))).toBe(true);
  });
});

describe('自动回退密码配置补丁构造', () => {
  it('空密码不覆盖已保存密码', () => {
    expect(buildAutoPasswordLoginConfigPatch('10005')).toEqual({
      autoPasswordLoginAccount: '10005',
    });

    expect(buildAutoPasswordLoginConfigPatch('10005', '')).toEqual({
      autoPasswordLoginAccount: '10005',
    });
  });

  it('有密码时包含 passwordMd5 字段', () => {
    expect(buildAutoPasswordLoginConfigPatch('10006', 'abcdefabcdefabcdefabcdefabcdefab')).toEqual({
      autoPasswordLoginAccount: '10006',
      autoPasswordLoginPasswordMd5: 'abcdefabcdefabcdefabcdefabcdefab',
    });
  });
});
