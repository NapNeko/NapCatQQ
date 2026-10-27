// StreamBasic must be evaluated before OneBotAction because they import each other.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, test, vi } from 'vitest';
import { OB11HttpServerAdapter } from '../napcat-onebot/network/http-server';
import { CommentQzonePublicFeed, DeleteQzonePublicReply } from '../napcat-onebot/action/extends/qzone-public';

const FEED = { cell_common: { union_id: { feed_id: 'opaque' } }, future_feed: [1, false] };
const COMMENT = { id: 'comment-id', like: { id: 'comment-like-id' }, future_comment: true };
const REPLY = { id: 'reply-id', user: { uid: 'recipient' }, future_reply: { keep: true } };

function fixture (Action = DeleteQzonePublicReply as typeof DeleteQzonePublicReply | typeof CommentQzonePublicFeed) {
  const result = { upstream_result: { unknown: 'preserved' } };
  const methods = { deleteReply: vi.fn().mockResolvedValue(result), addComment: vi.fn().mockResolvedValue(result) };
  const action = new Action(undefined as never, {
    context: { logger: { logError: vi.fn() } },
    apis: { QzonePublicApi: methods },
  } as never);
  // Exercise the adapter handler without opening a listener or constructing native QQ services.
  const adapter = Object.assign(Object.create(OB11HttpServerAdapter.prototype), {
    name: 'test-http', config: {}, actions: new Map([[action.actionName, action]]),
  }) as OB11HttpServerAdapter;
  return { adapter, action, methods, result };
}

async function request (
  adapter: OB11HttpServerAdapter,
  actionName: string,
  method: string,
  query: Record<string, unknown>,
  body: Record<string, unknown> = {},
  contentType = 'application/json'
) {
  const json = vi.fn();
  await adapter.httpApiRequest({
    method,
    path: `/${actionName}`,
    query,
    body,
    is: (type: string) => type === contentType,
  } as never, { json } as never);
  return json.mock.calls[0]?.[0];
}

describe('Qzone public HTTP parameter compatibility', () => {
  test.each(['GET', 'FORM'])('%s decodes feed, comment and reply JSON values before action validation', async (transport) => {
    const { adapter, action, methods, result } = fixture();
    const parameters = { feed: JSON.stringify(FEED), comment: JSON.stringify(COMMENT), reply: JSON.stringify(REPLY) };
    const response = transport === 'GET'
      ? await request(adapter, action.actionName, 'GET', parameters)
      : await request(adapter, action.actionName, 'POST', {}, parameters, 'application/x-www-form-urlencoded');

    expect(response).toMatchObject({ status: 'ok', data: result });
    expect(methods.deleteReply).toHaveBeenCalledExactlyOnceWith(FEED, COMMENT, REPLY);
  });

  test('POST query parameters receive the same decoding and override body parameters', async () => {
    const { adapter, action, methods } = fixture();
    const response = await request(adapter, action.actionName, 'POST', {
      feed: JSON.stringify(FEED), comment: JSON.stringify(COMMENT), reply: JSON.stringify(REPLY),
    }, { feed: {}, comment: {}, reply: {} });

    expect(response.status).toBe('ok');
    expect(methods.deleteReply).toHaveBeenCalledExactlyOnceWith(FEED, COMMENT, REPLY);
  });

  test('JSON request bodies and WebSocket parameters retain strict object validation', async () => {
    const { adapter, action, methods } = fixture();
    const parameters = { feed: JSON.stringify(FEED), comment: JSON.stringify(COMMENT), reply: JSON.stringify(REPLY) };
    const http = await request(adapter, action.actionName, 'POST', {}, { ...parameters });
    const websocket = await action.websocketHandle({ ...parameters } as never, 'strict-echo', 'test', {} as never);

    expect(http).toMatchObject({ status: 'failed', retcode: 400 });
    expect(websocket).toMatchObject({ status: 'failed', retcode: 1400, echo: 'strict-echo' });
    expect(methods.deleteReply).not.toHaveBeenCalled();
  });

  test('query content is decoded before rich content validation, including quoted strings', async () => {
    const { adapter, action, methods } = fixture(CommentQzonePublicFeed);
    const query = { feed: JSON.stringify(FEED) };
    const invalid = await request(adapter, action.actionName, 'GET', { ...query, content: '123' });
    expect(invalid).toMatchObject({ status: 'failed', retcode: 400 });
    expect(methods.addComment).not.toHaveBeenCalled();

    const quoted = await request(adapter, action.actionName, 'GET', { ...query, content: '"123"' });
    expect(quoted.status).toBe('ok');
    expect(methods.addComment).toHaveBeenCalledExactlyOnceWith(FEED, '123');
    methods.addComment.mockClear();

    const content = [{ type: 0, content: '正文', future: { keep: true } }];
    expect((await request(adapter, action.actionName, 'GET', { ...query, content: JSON.stringify(content) })).status).toBe('ok');
    expect(methods.addComment).toHaveBeenCalledExactlyOnceWith(FEED, content);
  });

  test('other OneBot actions retain their existing undecoded HTTP parameters', async () => {
    const { adapter } = fixture();
    const handle = vi.fn().mockResolvedValue({ status: 'ok', retcode: 0, data: {} });
    Object.assign(adapter, { actions: new Map([['other_action', { handle, useStream: false }]]) });
    const parameters = { feed: JSON.stringify(FEED), content: '123' };

    await request(adapter, 'other_action', 'GET', parameters);

    expect(handle.mock.calls[0]?.[0]).toEqual(parameters);
  });
});
