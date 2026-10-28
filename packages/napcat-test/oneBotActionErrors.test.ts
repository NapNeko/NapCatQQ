// Evaluate the stream module first to resolve its circular import with OneBotAction.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, test, vi } from 'vitest';
import { OneBotAction } from '../napcat-onebot/action/OneBotAction';
import type { NetworkAdapterConfig } from '../napcat-onebot/config/config';
import { LogWrapper } from '../napcat-core/helper/log';

class RejectingAction extends OneBotAction<unknown, string> {
  rejection: unknown;

  async _handle (): Promise<string> {
    throw this.rejection;
  }
}

const emptyError = new Error('');
const circular: Record<string, unknown> = {};
circular['self'] = circular;
const throwingMessage = {
  get message () {
    throw new Error('Cannot read message');
  },
};

describe.each(['http', 'websocket'] as const)('%s action errors', (transport) => {
  test.each([
    { label: 'Error', rejection: new Error('Action failed'), message: 'Action failed' },
    { label: 'string', rejection: 'Action failed', message: 'Action failed' },
    { label: 'error-like object', rejection: { message: 'Action failed' }, message: 'Action failed' },
    { label: 'stack fallback', rejection: emptyError, message: emptyError.stack },
    { label: 'null', rejection: null },
    { label: 'undefined', rejection: undefined },
    { label: 'number', rejection: 42 },
    { label: 'empty string', rejection: '' },
    { label: 'plain object', rejection: {} },
    { label: 'circular object', rejection: circular },
    { label: 'throwing message getter', rejection: throwingMessage },
  ])('returns a failure response for $label', async ({ rejection, message }) => {
    const logError = vi.fn((...args: unknown[]) => LogWrapper.prototype.formatMsg(args));
    const action = new RejectingAction({} as never, { context: { logger: { logError } } } as never);
    action.rejection = rejection;
    const config = {} as NetworkAdapterConfig;
    const echo = 'request-123';

    const response = transport === 'http'
      ? await action.handle({}, 'test', config, undefined, echo)
      : await action.websocketHandle({}, echo, 'test', config);

    const expectedMessage = message ?? (transport === 'http' ? '未知错误，可能操作超时' : 'Error');
    expect(response).toMatchObject({
      status: 'failed',
      retcode: transport === 'http' ? 200 : 1200,
      data: null,
      message: expectedMessage,
      wording: expectedMessage,
      echo,
      stream: 'normal-action',
    });
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError.mock.calls[0]?.[0]).toBe('发生错误');
    expect(logError.mock.results[0]?.value).toContain('发生错误');
    if (rejection instanceof Error) {
      expect(logError.mock.calls[0]?.[1]).toBe(rejection);
    }

    // The same action can still serve a subsequent successful request.
    vi.spyOn(action, '_handle').mockResolvedValueOnce('ok');
    const nextResponse = transport === 'http'
      ? await action.handle({}, 'test', config, undefined, 'next-request')
      : await action.websocketHandle({}, 'next-request', 'test', config);
    expect(nextResponse).toMatchObject({ status: 'ok', retcode: 0, data: 'ok', echo: 'next-request' });
  });

  test('preserves stream error packets and structured WebSocket echo', async () => {
    const action = new RejectingAction({} as never, { context: { logger: { logError: vi.fn() } } } as never);
    action.useStream = true;
    action.rejection = null;
    const config = {} as NetworkAdapterConfig;
    const echo = { request: 123 };

    const response = transport === 'http'
      ? await action.handle({}, 'test', config, undefined, 'stream-request')
      : await action.websocketHandle({}, echo, 'test', config);

    expect(response).toMatchObject({
      status: 'failed',
      retcode: transport === 'http' ? 200 : 1200,
      data: { type: 'error', data_type: 'error' },
      echo: transport === 'http' ? 'stream-request' : echo,
      stream: 'stream-action',
    });
  });
});
