import { afterEach, describe, expect, test, vi } from 'vitest';
import { NapCatCore } from '../napcat-core/index';
import type { SelfStatusInfo, SelfInfo } from '../napcat-core/types';

interface FakeProfileListener {
  onSelfStatusChanged: (info: SelfStatusInfo) => void;
}

interface FakeMessageListener {
  onKickedOffLine: (info: { tipsTitle: string; tipsDesc: string; }) => void;
}

function status (value: number): SelfStatusInfo {
  return {
    uid: 'self-uid',
    status: value,
    extStatus: 0,
    termType: 0,
    netType: 0,
    iconType: 0,
    customStatus: undefined,
    setTime: '0',
  };
}

function createCore (online: boolean | undefined) {
  let profileListener: FakeProfileListener | undefined;
  let messageListener: FakeMessageListener | undefined;
  const session = {
    getMsgService: () => ({
      addKernelMsgListener: vi.fn((listener: FakeMessageListener) => {
        messageListener = listener;
      }),
    }),
    getProfileService: () => ({
      addKernelProfileListener: vi.fn((listener: FakeProfileListener) => {
        profileListener = listener;
      }),
    }),
  };
  const logger = {
    log: vi.fn(),
    logError: vi.fn(),
    logWarn: vi.fn(),
    logDebug: vi.fn(),
  };
  const emit = vi.fn();
  // NapCatCore's constructor loads the native wrapper, which is unavailable in tests.
  // Only the listener wiring is under test, so the instance is built field-by-field.
  const core = Object.create(NapCatCore.prototype) as NapCatCore;
  Object.assign(core, {
    context: { logger, session },
    selfInfo: { uid: 'self-uid', uin: '1', online } as SelfInfo,
    event: { emit },
  });
  return {
    core,
    emit,
    profileListener: () => profileListener,
    messageListener: () => messageListener,
  };
}

describe('silent offline (SelfOffline) event', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('emits SelfOffline when the account transitions online -> offline', async () => {
    const { core, emit, profileListener } = createCore(true);
    await core.initNapCatCoreListeners();

    profileListener()!.onSelfStatusChanged(status(20));

    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith('SelfOffline', expect.stringContaining('账号状态变更为离线'));
    expect(core.selfInfo.online).toBe(false);
  });

  test('does not emit again while the account stays offline', async () => {
    const { core, emit, profileListener } = createCore(true);
    await core.initNapCatCoreListeners();

    profileListener()!.onSelfStatusChanged(status(20));
    profileListener()!.onSelfStatusChanged(status(20));
    profileListener()!.onSelfStatusChanged(status(20));

    expect(emit).toHaveBeenCalledTimes(1);
  });

  test('emits again after the account recovered and went offline once more', async () => {
    const { core, emit, profileListener } = createCore(true);
    await core.initNapCatCoreListeners();

    profileListener()!.onSelfStatusChanged(status(20));
    profileListener()!.onSelfStatusChanged(status(10));
    profileListener()!.onSelfStatusChanged(status(20));

    expect(emit).toHaveBeenCalledTimes(2);
    expect(core.selfInfo.online).toBe(false);
  });

  test('does not emit during startup when the account was never online', async () => {
    const { core, emit, profileListener } = createCore(undefined);
    await core.initNapCatCoreListeners();

    profileListener()!.onSelfStatusChanged(status(20));

    expect(emit).not.toHaveBeenCalled();
    expect(core.selfInfo.online).toBe(false);
  });

  test('keeps emitting KickedOffLine as before', async () => {
    const { core, emit, messageListener } = createCore(true);
    await core.initNapCatCoreListeners();

    messageListener()!.onKickedOffLine({ tipsTitle: '下线通知', tipsDesc: '当前账号已在其它设备登录' });

    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith('KickedOffLine', expect.stringContaining('当前账号已在其它设备登录'));
    expect(core.selfInfo.online).toBe(false);
  });
});
