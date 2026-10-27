// StreamBasic must be evaluated before OneBotAction because they import each other.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, test, vi } from 'vitest';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import {
  CommentQzonePublicFeed,
  DeleteQzonePublicComment,
  DeleteQzonePublicReply,
  ForwardQzonePublicFeed,
  GetQzonePublicCapabilities,
  GetQzonePublicComments,
  GetQzonePublicFeedDetail,
  GetQzonePublicFeeds,
  GetQzonePublicReplies,
  ReplyQzonePublicFeed,
  SetQzonePublicCommentLike,
  SetQzonePublicFollow,
  SetQzonePublicLike,
  SetQzonePublicUpvote,
} from '../napcat-onebot/action/extends/qzone-public';

const FEED = {
  cell_id: { id: 'feed-id', extra_id: 'raw-id' },
  cell_feed_transfer: { transfer: 'raw-transfer' },
  extra_feed: { nested: [1, true, null, { opaque: '001' }] },
};
const COMMENT = {
  id: 'comment-id',
  like: { id: 'comment-like-id', extra_like: true },
  reply_attach_info: 'reply-cursor',
  extra_comment: { opaque: '002' },
};
const REPLY = { id: 'reply-id', like: { id: 'reply-like-id' }, extra_reply: [false, 3] };
const CONTENT = '保留评论正文';

const ACTION_CASES = [
  { Action: GetQzonePublicCapabilities, name: 'get_qzone_public_capabilities', method: 'getCapabilities', payload: {}, args: [] },
  { Action: GetQzonePublicFeeds, name: 'get_qzone_public_feeds', method: 'getFeeds', payload: { cursor: 'feeds-cursor' }, args: ['feeds-cursor'] },
  { Action: GetQzonePublicFeedDetail, name: 'get_qzone_public_feed_detail', method: 'getFeedDetail', payload: { feed: FEED }, args: [FEED] },
  { Action: GetQzonePublicComments, name: 'get_qzone_public_comments', method: 'getComments', payload: { feed: FEED, cursor: 'detail-cursor' }, args: [FEED, 'detail-cursor'] },
  { Action: GetQzonePublicReplies, name: 'get_qzone_public_replies', method: 'getReplies', payload: { feed: FEED, comment: COMMENT, cursor: 'next-replies', page_size: '7' }, args: [FEED, COMMENT, 'next-replies', 7] },
  { Action: SetQzonePublicUpvote, name: 'set_qzone_public_upvote', method: 'setUpvote', payload: { feed: FEED, enable: false }, args: [FEED, false] },
  { Action: SetQzonePublicLike, name: 'set_qzone_public_like', method: 'setLike', payload: { feed: FEED, enable: false }, args: [FEED, false] },
  { Action: SetQzonePublicFollow, name: 'set_qzone_public_follow', method: 'setFollow', payload: { feed: FEED, enable: false }, args: [FEED, false] },
  { Action: SetQzonePublicCommentLike, name: 'set_qzone_public_comment_like', method: 'setCommentLike', payload: { feed: FEED, comment: COMMENT, reply: REPLY, enable: false }, args: [FEED, COMMENT, false, REPLY] },
  { Action: CommentQzonePublicFeed, name: 'comment_qzone_public_feed', method: 'addComment', payload: { feed: FEED, content: CONTENT }, args: [FEED, CONTENT] },
  { Action: ReplyQzonePublicFeed, name: 'reply_qzone_public_feed', method: 'addReply', payload: { feed: FEED, comment: COMMENT, content: CONTENT, reply: REPLY }, args: [FEED, COMMENT, CONTENT, REPLY] },
  { Action: DeleteQzonePublicComment, name: 'delete_qzone_public_comment', method: 'deleteComment', payload: { feed: FEED, comment: COMMENT }, args: [FEED, COMMENT] },
  { Action: DeleteQzonePublicReply, name: 'delete_qzone_public_reply', method: 'deleteReply', payload: { feed: FEED, comment: COMMENT, reply: REPLY }, args: [FEED, COMMENT, REPLY] },
  { Action: ForwardQzonePublicFeed, name: 'forward_qzone_public_feed', method: 'forwardFeed', payload: { feed: FEED, reason: '转发理由' }, args: [FEED, '转发理由'] },
] as const;

type ActionConstructor = typeof ACTION_CASES[number]['Action'];

function createAction (Action: ActionConstructor) {
  const nativeResult = {
    feeds: [FEED],
    has_more: true,
    next_cursor: 'next-feeds',
    extra_result: { untouched: [null, 1, false, '001'] },
  };
  const methods = Object.fromEntries(ACTION_CASES.map(({ method }) => [method, vi.fn().mockResolvedValue(nativeResult)]));
  const action = new Action(undefined as never, {
    context: { logger: { logError: vi.fn() } },
    apis: { QzonePublicApi: methods },
  } as never);
  return { action, methods, nativeResult };
}

describe('Qzone public OneBot actions', () => {
  test.each(ACTION_CASES)('$name delegates complete raw objects and returns the original JSON object', async ({ Action, name, method, payload, args }) => {
    const { action, methods, nativeResult } = createAction(Action);
    const response = await action.handle(structuredClone(payload) as never, 'test', {} as never);

    expect(action.actionName).toBe(name);
    expect(response.status).toBe('ok');
    expect(response.data).toBe(nativeResult);
    expect(methods[method]).toHaveBeenCalledExactlyOnceWith(...args);
    for (const [otherMethod, mock] of Object.entries(methods)) {
      if (otherMethod !== method) expect(mock).not.toHaveBeenCalled();
    }
  });

  test.each(ACTION_CASES)('$name provides compilable OpenAPI schemas and examples', ({ Action }) => {
    const { action, nativeResult } = createAction(Action);

    expect(action.actionSummary).not.toBe('');
    expect(action.actionDescription).not.toBe('');
    expect(action.actionTags.length).toBeGreaterThan(0);
    expect(action.payloadSchema).toBeDefined();
    expect(action.returnSchema).toBeDefined();
    expect(action.payloadExample).toBeDefined();
    expect(action.returnExample).toBeDefined();
    expect(TypeCompiler.Compile(action.payloadSchema!).Check(action.payloadExample)).toBe(true);
    const checkResult = TypeCompiler.Compile(action.returnSchema!);
    expect(checkResult.Check(action.returnExample)).toBe(true);
    expect(checkResult.Check(nativeResult)).toBe(true);
  });

  test('reply pagination uses the SL empty cursor default for parent-cursor fallback', async () => {
    const { action, methods } = createAction(GetQzonePublicReplies);

    await action.handle({ feed: FEED, comment: COMMENT } as never, 'test', {} as never);
    await action.handle({ feed: FEED, comment: COMMENT, cursor: '' } as never, 'test', {} as never);

    expect(methods['getReplies']).toHaveBeenNthCalledWith(1, FEED, COMMENT, '', 20);
    expect(methods['getReplies']).toHaveBeenNthCalledWith(2, FEED, COMMENT, '', 20);
  });

  test('comment pagination requires a non-empty detail cursor', async () => {
    const { action, methods } = createAction(GetQzonePublicComments);

    const missing = await action.handle({ feed: FEED } as never, 'test', {} as never);
    expect(missing).toMatchObject({ status: 'failed', retcode: 400 });
    expect(methods['getComments']).not.toHaveBeenCalled();

    const empty = await action.handle({ feed: FEED, cursor: '' } as never, 'test', {} as never);
    expect(empty).toMatchObject({ status: 'failed', retcode: 400 });
    expect(methods['getComments']).not.toHaveBeenCalled();
  });

  test.each([
    { value: true, expected: true },
    { value: false, expected: false },
    { value: 1, expected: true },
    { value: 0, expected: false },
    { value: 'true', expected: true },
    { value: 'false', expected: false },
    { value: '1', expected: true },
    { value: '0', expected: false },
    { value: ' TRUE ', expected: true },
    { value: ' FALSE ', expected: false },
    { value: 'yes', expected: true },
    { value: 'no', expected: false },
    { value: ' ON ', expected: true },
    { value: ' OFF ', expected: false },
    { value: 2, expected: true },
    { value: -1, expected: true },
    { value: 0.1, expected: true },
  ])('normalizes enable=$value without merging upvote, like and follow', async ({ value, expected }) => {
    for (const { Action, method } of ACTION_CASES.filter(({ method }) => ['setUpvote', 'setLike', 'setFollow', 'setCommentLike'].includes(method))) {
      const { action, methods } = createAction(Action);
      const response = await action.handle({ feed: FEED, comment: COMMENT, enable: value } as never, 'test', {} as never);

      expect(response.status).toBe('ok');
      expect(methods[method]).toHaveBeenCalledExactlyOnceWith(...(method === 'setCommentLike' ? [FEED, COMMENT, expected, undefined] : [FEED, expected]));
    }
  });

  test('uses documented defaults for optional mutation parameters', async () => {
    for (const { Action, method } of ACTION_CASES.filter(({ method }) => ['setUpvote', 'setLike', 'setFollow', 'setCommentLike'].includes(method))) {
      const { action, methods } = createAction(Action);
      await action.handle({ feed: FEED, comment: COMMENT } as never, 'test', {} as never);
      expect(methods[method]).toHaveBeenCalledExactlyOnceWith(...(method === 'setCommentLike' ? [FEED, COMMENT, true, undefined] : [FEED, true]));
    }

    const forward = createAction(ForwardQzonePublicFeed);
    await forward.action.handle({ feed: FEED } as never, 'test', {} as never);
    expect(forward.methods['forwardFeed']).toHaveBeenCalledExactlyOnceWith(FEED, '');

    const reply = createAction(ReplyQzonePublicFeed);
    await reply.action.handle({ feed: FEED, comment: COMMENT, content: CONTENT } as never, 'test', {} as never);
    expect(reply.methods['addReply']).toHaveBeenCalledExactlyOnceWith(FEED, COMMENT, CONTENT, undefined);
  });

  test.each(['maybe', '', '2', null, {}, []].map(enable => ({ enable })))('rejects unsupported enable=$enable', async ({ enable }) => {
    const { action, methods } = createAction(SetQzonePublicLike);
    const response = await action.handle({ feed: FEED, enable } as never, 'test', {} as never);

    expect(response).toMatchObject({ status: 'failed', retcode: 400 });
    expect(methods['setLike']).not.toHaveBeenCalled();
  });

  test.each([
    { pageSize: 1, expected: 1 },
    { pageSize: '1', expected: 1 },
    { pageSize: 20, expected: 20 },
    { pageSize: '37', expected: 37 },
    { pageSize: 1.5, expected: 1 },
    { pageSize: '1.9', expected: 1 },
    { pageSize: ' 2e1 ', expected: 20 },
    { pageSize: '0x10', expected: 16 },
    { pageSize: Number.MAX_SAFE_INTEGER + 1, expected: Number.MAX_SAFE_INTEGER + 1 },
  ])('normalizes SL-compatible page_size=$pageSize to $expected', async ({ pageSize, expected }) => {
    const { action, methods } = createAction(GetQzonePublicReplies);
    const response = await action.handle({ feed: FEED, comment: COMMENT, page_size: pageSize } as never, 'test', {} as never);

    expect(response.status).toBe('ok');
    expect(methods['getReplies']).toHaveBeenCalledExactlyOnceWith(FEED, COMMENT, '', expected);
  });

  test.each([0, -1, 0.9, '', ' ', '0', '-1', 'abc', true, null, Infinity, 'Infinity'])('rejects invalid page_size=%j', async (pageSize) => {
    const { action, methods } = createAction(GetQzonePublicReplies);
    const response = await action.handle({ feed: FEED, comment: COMMENT, page_size: pageSize } as never, 'test', {} as never);

    expect(response).toMatchObject({ status: 'failed', retcode: 400 });
    expect(methods['getReplies']).not.toHaveBeenCalled();
  });

  test.each([CommentQzonePublicFeed, ReplyQzonePublicFeed])('preserves arbitrary rich content objects', async (Action) => {
    const { action, methods } = createAction(Action);
    const content = [{ type: 0, content: '正文', unknown: { id: '001', list: [null, false] } }, { type: 1, uid: '123', extra: ['a'] }];
    const response = await action.handle({ feed: FEED, comment: COMMENT, content } as never, 'test', {} as never);

    expect(response.status).toBe('ok');
    const method = Action === CommentQzonePublicFeed ? 'addComment' : 'addReply';
    expect(methods[method]).toHaveBeenCalledExactlyOnceWith(...(method === 'addComment' ? [FEED, content] : [FEED, COMMENT, content, undefined]));
  });

  test.each(['', '[]', '[1]', 123, false, null, {}, [], ['text'], [1], [null], [[]]].map(content => ({ content })))('rejects invalid rich content=$content before conversion', async ({ content }) => {
    const { action, methods } = createAction(CommentQzonePublicFeed);
    const response = await action.handle({ feed: FEED, content } as never, 'test', {} as never);

    expect(response).toMatchObject({ status: 'failed', retcode: 400 });
    expect(methods['addComment']).not.toHaveBeenCalled();
  });

  test.each([CommentQzonePublicFeed, ReplyQzonePublicFeed])('normalizes JSON-array content strings using the SL consumer contract', async (Action) => {
    const { action, methods } = createAction(Action);
    const content = [{ type: 0, content: '正文', future: { opaque: '001' } }];
    const method = Action === CommentQzonePublicFeed ? 'addComment' : 'addReply';
    const response = await action.handle({ feed: FEED, comment: COMMENT, content: ` ${JSON.stringify(content)} ` } as never, 'test', {} as never);

    expect(response.status).toBe('ok');
    expect(methods[method]).toHaveBeenCalledExactlyOnceWith(...(method === 'addComment' ? [FEED, content] : [FEED, COMMENT, content, undefined]));
  });

  test.each(['   ', '[invalid]'])('preserves non-empty SL text content %j', async (content) => {
    const { action, methods } = createAction(CommentQzonePublicFeed);
    const response = await action.handle({ feed: FEED, content } as never, 'test', {} as never);

    expect(response.status).toBe('ok');
    expect(methods['addComment']).toHaveBeenCalledExactlyOnceWith(FEED, content);
  });

  test('feed cursors are optional, non-empty and limited to 65536 characters', async () => {
    const { action, methods } = createAction(GetQzonePublicFeeds);
    const first = await action.handle({} as never, 'test', {} as never);
    expect(first.status).toBe('ok');
    expect(methods['getFeeds']).toHaveBeenCalledExactlyOnceWith(undefined);
    methods['getFeeds']!.mockClear();

    for (const cursor of ['', 'a'.repeat(65537)]) {
      const response = await action.handle({ cursor } as never, 'test', {} as never);
      expect(response).toMatchObject({ status: 'failed', retcode: 400 });
    }
    expect(methods['getFeeds']).not.toHaveBeenCalled();
    const cursor = 'a'.repeat(65536);
    expect((await action.handle({ cursor } as never, 'test', {} as never)).status).toBe('ok');
    expect(methods['getFeeds']).toHaveBeenCalledExactlyOnceWith(cursor);
  });

  test.each([
    { Action: GetQzonePublicFeeds, method: 'getFeeds', field: 'cursor', payload: {}, args: [] },
    { Action: GetQzonePublicComments, method: 'getComments', field: 'cursor', payload: { feed: FEED }, args: [FEED] },
    { Action: GetQzonePublicReplies, method: 'getReplies', field: 'cursor', payload: { feed: FEED, comment: COMMENT }, args: [FEED, COMMENT] },
    { Action: ForwardQzonePublicFeed, method: 'forwardFeed', field: 'reason', payload: { feed: FEED }, args: [FEED] },
  ])('$method uses SL string coercion for $field', async ({ Action, method, field, payload, args }) => {
    for (const value of [42, false]) {
      const { action, methods } = createAction(Action);
      const response = await action.handle({ ...payload, [field]: value } as never, 'test', {} as never);
      expect(response.status).toBe('ok');
      expect(methods[method]).toHaveBeenCalledExactlyOnceWith(...args, String(value), ...(method === 'getReplies' ? [20] : []));
    }
    for (const value of [null, {}, []]) {
      const { action, methods } = createAction(Action);
      const response = await action.handle({ ...payload, [field]: value } as never, 'test', {} as never);
      expect(response).toMatchObject({ status: 'failed', retcode: 400 });
      expect(methods[method]).not.toHaveBeenCalled();
    }
  });

  test.each([
    { feed: null, comment: COMMENT, reply: REPLY },
    { feed: [], comment: COMMENT, reply: REPLY },
    { feed: 'feed-id', comment: COMMENT, reply: REPLY },
    { feed: FEED, comment: null, reply: REPLY },
    { feed: FEED, comment: 'comment-id', reply: REPLY },
    { feed: FEED, comment: COMMENT, reply: [] },
    { feed: FEED, comment: COMMENT, reply: 'reply-id' },
  ])('requires raw objects for feed, comment and reply: %j', async (payload) => {
    const { action, methods } = createAction(DeleteQzonePublicReply);
    const response = await action.handle(payload as never, 'test', {} as never);

    expect(response).toMatchObject({ status: 'failed', retcode: 400 });
    expect(methods['deleteReply']).not.toHaveBeenCalled();
  });

  test('WebSocket validation preserves echo and prevents writes', async () => {
    const { action, methods } = createAction(DeleteQzonePublicReply);
    const response = await action.websocketHandle({ feed: FEED, comment: COMMENT } as never, 'public-echo', 'test', {} as never);

    expect(response).toMatchObject({ status: 'failed', retcode: 1400, echo: 'public-echo' });
    expect(methods['deleteReply']).not.toHaveBeenCalled();
  });

  test('reports core failures through the existing OneBot error response', async () => {
    const { action, methods } = createAction(SetQzonePublicUpvote);
    methods['setUpvote']!.mockRejectedValue(new Error('public interaction rejected'));
    const response = await action.handle({ feed: FEED } as never, 'test', {} as never);

    expect(response).toMatchObject({ status: 'failed', message: 'public interaction rejected' });
    expect(methods['setUpvote']).toHaveBeenCalledExactlyOnceWith(FEED, true);
  });
});
