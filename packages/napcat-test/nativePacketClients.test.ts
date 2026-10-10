import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import { NativePacketHandler } from '@/napcat-core/packet/handler/client';
import { Napi2NativeLoader } from '@/napcat-core/packet/handler/napi2nativeLoader';
import { NativePacketClient } from '@/napcat-core/packet/client/nativeClient';
import type { LogWrapper } from '@/napcat-core/helper/log';
import type { NapCoreContext } from '@/napcat-core/packet/context/napCoreContext';
import type { PacketLogger } from '@/napcat-core/packet/context/loggerContext';
import type { LogStack } from '@/napcat-core/packet/context/clientContext';
import type { PacketBuf } from '@/napcat-core/packet/transformer/base';

const logger = { log: vi.fn(), logWarn: vi.fn(), logError: vi.fn() } as unknown as LogWrapper;
const platformDescriptor = Object.getOwnPropertyDescriptor(process, 'platform')!;
const archDescriptor = Object.getOwnPropertyDescriptor(process, 'arch')!;

beforeEach(() => {
  Object.defineProperty(process, 'platform', { value: 'darwin' });
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Object.defineProperty(process, 'platform', platformDescriptor);
  Object.defineProperty(process, 'arch', archDescriptor);
});

describe('macOS native loaders', () => {
  it.each(['arm64', 'x64'])('loads both packet modules for %s', async (arch) => {
    Object.defineProperty(process, 'arch', { value: arch });
    const dlopen = vi.spyOn(process, 'dlopen').mockImplementation((module) => {
      Object.assign(module, { exports: { initHook: vi.fn().mockReturnValue('success') } });
    });
    const handler = new NativePacketHandler({ logger });
    expect(await handler.init('7.0.2-53644')).toBe(true);
    expect(dlopen.mock.calls[0]![1]).toContain('MoeHoo.darwin.' + arch + '.node');
    const loader = new Napi2NativeLoader({ logger });
    expect(loader.loaded).toBe(true);
    expect(dlopen.mock.calls[1]![1]).toContain('napi2native.darwin.' + arch + '.node');
  });

  it.each(['error hook', 'error search', undefined])('does not report native failure %s as success', async (result) => {
    Object.defineProperty(process, 'arch', { value: 'arm64' });
    vi.spyOn(process, 'dlopen').mockImplementation(module => {
      Object.assign(module, { exports: { initHook: vi.fn().mockReturnValue(result) } });
    });
    expect(await new NativePacketHandler({ logger }).init('7.0.2-53644')).toBe(false);
  });

  it('does not attempt dlopen when a native binary is absent', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const dlopen = vi.spyOn(process, 'dlopen').mockImplementation(() => {});
    const handler = new NativePacketHandler({ logger });
    expect(await handler.init('7.0.2-53644')).toBe(false);
    expect(new Napi2NativeLoader({ logger }).loaded).toBe(false);
    expect(dlopen).not.toHaveBeenCalled();
  });
});

describe('NativePacketClient', () => {
  function fixture () {
    const send = vi.fn();
    const minimum = vi.fn().mockImplementation(version => Number(version) <= 40768);
    const native = { initHook: vi.fn().mockReturnValue(true) };
    const core = { basicInfo: { requireMinNTQQBuild: minimum }, sendSsoCmdReqByContend: send };
    const logs = { pushLogWarn: vi.fn(), pushLogInfo: vi.fn(), pushLogError: vi.fn() };
    const client = new NativePacketClient(
      core as unknown as NapCoreContext,
      { error: vi.fn() } as unknown as PacketLogger,
      logs as unknown as LogStack,
      native as unknown as Napi2NativeLoader
    );
    return { client, send, minimum, native };
  }

  it('initializes the oldest supported build and clears availability after failure', async () => {
    const { client, minimum, native } = fixture();
    await client.init(0, '10', '20');
    expect(minimum).toHaveBeenCalledWith('40768');
    expect(client.available).toBe(true);
    native.initHook.mockReturnValue(false);
    await client.init(0, '10', '20');
    expect(client.available).toBe(false);
  });

  it.each(['success', 'failure', 'timeout'])('clears request timers after %s', async (outcome) => {
    vi.useFakeTimers();
    const { client, send } = fixture();
    const payload = Buffer.from([0, 255, 128]) as PacketBuf;
    if (outcome === 'success') send.mockResolvedValue({ rspbuffer: payload });
    if (outcome === 'failure') send.mockRejectedValue(new Error('network unavailable'));
    if (outcome === 'timeout') send.mockReturnValue(new Promise(() => {}));
    const pending = client.sendPacket('Test.Command', payload, true, 50);
    if (outcome === 'success') {
      await expect(pending).resolves.toEqual({ seq: 0, cmd: 'Test.Command', data: payload });
    } else {
      const assertion = expect(pending).rejects.toThrow(outcome === 'timeout' ? '超时' : 'network unavailable');
      if (outcome === 'timeout') await vi.advanceTimersByTimeAsync(50);
      await assertion;
    }
    expect(vi.getTimerCount()).toBe(0);
    expect(send).toHaveBeenCalledWith('Test.Command', payload);
  });
});
