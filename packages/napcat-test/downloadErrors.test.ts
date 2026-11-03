// Evaluate the stream module first to resolve its circular import with OneBotAction.
import '../napcat-onebot/action/stream/StreamBasic';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { httpDownload, uriToLocalFile } from '../napcat-common/src/file';
import UploadGroupFile from '../napcat-onebot/action/go-cqhttp/UploadGroupFile';
import type { NetworkAdapterConfig } from '../napcat-onebot/config/config';
import { LogWrapper } from '../napcat-core/helper/log';

afterEach(() => vi.unstubAllGlobals());

const circular: Record<string, unknown> = {};
circular['self'] = circular;
const causes = [
  { label: 'Error', cause: Object.assign(new Error('connection failed'), { code: 'ECONNRESET' }) },
  { label: 'string', cause: 'network unavailable' },
  { label: 'circular object', cause: circular },
  { label: 'undefined', cause: undefined },
];

describe('download errors', () => {
  test.each(causes)('preserves the original error with $label cause', async ({ cause }) => {
    const error = Object.assign(new TypeError('fetch failed'), { cause });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));

    await expect(httpDownload('https://example.invalid/file')).rejects.toBe(error);
    await expect(uriToLocalFile('.', 'https://example.invalid/file')).rejects.toBe(error);
    expect(error.cause).toBe(cause);
  });

  test('preserves the native fetch error and its cause', async () => {
    // Fetch rejects this forbidden port before opening a network connection.
    const nativeFetch = globalThis.fetch;
    let original: unknown;
    vi.stubGlobal('fetch', vi.fn(async (...args: Parameters<typeof fetch>) => {
      try {
        return await nativeFetch(...args);
      } catch (error) {
        original = error;
        throw error;
      }
    }));
    const rejection = await httpDownload('http://127.0.0.1:1/file').catch(error => error);
    expect(original).toBeInstanceOf(TypeError);
    expect(rejection).toBe(original);
    expect(rejection.cause).toBeInstanceOf(Error);
  });
});

describe.each(['http', 'websocket'] as const)('%s upload download errors', (transport) => {
  test.each(causes)('returns the download message and logs the original error with $label cause', async ({ cause }) => {
    const error = Object.assign(new TypeError('fetch failed'), { cause });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
    const logError = vi.fn((...args: unknown[]) => LogWrapper.prototype.formatMsg(args));
    const action = new UploadGroupFile({} as never, {
      NapCatTempPath: '.', context: { logger: { logError } },
    } as never);
    const config = {} as NetworkAdapterConfig;
    const payload = { group_id: '123', file: 'https://example.invalid/file', name: 'file', upload_file: true };
    const echo = transport === 'http' ? 'request-123' : { request: 123 };

    for (const useStream of [false, true]) {
      action.useStream = useStream;
      const response = transport === 'http'
        ? await action.handle(payload, 'test', config, undefined, 'request-123')
        : await action.websocketHandle(payload, echo, 'test', config);
      expect(response).toEqual({
        status: 'failed',
        retcode: transport === 'http' ? 200 : 1200,
        data: useStream ? { type: 'error', data_type: 'error' } : null,
        message: 'fetch failed',
        wording: 'fetch failed',
        echo,
        stream: useStream ? 'stream-action' : 'normal-action',
      });
      expect(logError).toHaveBeenLastCalledWith('发生错误', error);
      expect(logError.mock.results.at(-1)?.value).toContain(error.stack);
    }
  });
});
