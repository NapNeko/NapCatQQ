import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createOfflineRecovery } from '../napcat-core/helper/offline-recovery';

function setup (restartResult: boolean | Error = true) {
  const state = { online: false };
  const onOffline = vi.fn();
  const onRecovered = vi.fn();
  const restart = vi.fn(async () => {
    if (restartResult instanceof Error) throw restartResult;
    return restartResult;
  });
  const handleOffline = createOfflineRecovery({
    isOnline: () => state.online,
    onOffline,
    onRecovered,
    restart,
  });
  return { state, onOffline, onRecovered, restart, handleOffline };
}

describe('offline recovery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('kicked offline restarts after a short delay', async () => {
    const { restart, onOffline, handleOffline } = setup();
    handleOffline('kicked', false);

    expect(onOffline).toHaveBeenCalledWith('kicked');
    await vi.advanceTimersByTimeAsync(3_000);
    expect(restart).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(500);
    expect(restart).toHaveBeenCalledTimes(1);
    expect(restart).toHaveBeenCalledWith('kicked');
  });

  test('silent offline waits for the account to reconnect before restarting', async () => {
    const { restart, handleOffline } = setup();
    handleOffline('silent', true);

    await vi.advanceTimersByTimeAsync(3_500);
    expect(restart).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(restart).toHaveBeenCalledTimes(1);
  });

  test('silent offline that recovers on its own does not restart', async () => {
    const { state, restart, onRecovered, handleOffline } = setup();
    handleOffline('silent', true);

    await vi.advanceTimersByTimeAsync(10_000);
    state.online = true;
    await vi.advanceTimersByTimeAsync(60_000);

    expect(restart).not.toHaveBeenCalled();
    expect(onRecovered).toHaveBeenCalledTimes(1);
  });

  test('a kick during the silent-offline wait restarts without waiting the full minute', async () => {
    const { restart, handleOffline } = setup();
    handleOffline('silent', true);
    await vi.advanceTimersByTimeAsync(1_000);
    handleOffline('kicked', false);

    await vi.advanceTimersByTimeAsync(3_500);
    expect(restart).toHaveBeenCalledTimes(1);
    expect(restart).toHaveBeenCalledWith('kicked');
    await vi.advanceTimersByTimeAsync(120_000);
    expect(restart).toHaveBeenCalledTimes(1);
  });

  test('repeated offline events schedule only one restart', async () => {
    const { restart, onOffline, handleOffline } = setup();
    handleOffline('kicked', false);
    handleOffline('kicked again', false);
    handleOffline('silent', true);

    await vi.advanceTimersByTimeAsync(120_000);
    expect(restart).toHaveBeenCalledTimes(1);
    expect(onOffline).toHaveBeenCalledTimes(3);
  });

  test.each([false, new Error('boom')])('a failed restart (%s) can be retried by the next offline event', async (result) => {
    const { restart, handleOffline } = setup(result);
    handleOffline('kicked', false);
    await vi.advanceTimersByTimeAsync(3_500);
    expect(restart).toHaveBeenCalledTimes(1);

    handleOffline('kicked', false);
    await vi.advanceTimersByTimeAsync(3_500);
    expect(restart).toHaveBeenCalledTimes(2);
  });
});
