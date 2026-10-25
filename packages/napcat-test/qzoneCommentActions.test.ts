// StreamBasic must be evaluated before OneBotAction because of their circular import.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, it, vi } from 'vitest';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { GetQzoneCommentList } from '@/napcat-onebot/action/extends/qzone/GetQzoneCommentList';
import { GetQzoneCommentReplies } from '@/napcat-onebot/action/extends/qzone/GetQzoneCommentReplies';
import { QzoneFeedReferenceExample } from '@/napcat-onebot/action/extends/qzone/common';
import { QzoneCommentPageExample, QzoneReplyPageExample } from '@/napcat-onebot/action/extends/qzone/common-comment';

function createCore () {
  return {
    apis: {
      QzoneApi: {
        getComments: vi.fn().mockResolvedValue(QzoneCommentPageExample),
        getCommentReplies: vi.fn().mockResolvedValue(QzoneReplyPageExample),
      },
    },
    context: { logger: { logError: vi.fn() } },
  };
}

describe('QQ空间评论读取 actions', () => {
  it('passes the complete reference and optional opaque cursor to comment reads', async () => {
    const core = createCore();
    const action = new GetQzoneCommentList(undefined as never, core as never);
    const reference = {
      ...QzoneFeedReferenceExample,
      union_id: { ...QzoneFeedReferenceExample.union_id, unknown_field: { large_id: '9007199254740993' } },
      cell_feed_transfer: { opaque: [0, false, 'keep'] },
    };
    const expected = structuredClone(reference);

    const first = await action.handle({ feed_ref: reference }, 'test', {} as never);
    await action.handle({ feed_ref: reference, cursor: 'next-comment-cursor' }, 'test', {} as never);

    expect(core.apis.QzoneApi.getComments.mock.calls).toEqual([[expected, undefined], [expected, 'next-comment-cursor']]);
    expect(first.data).toBe(QzoneCommentPageExample);
    expect(reference).toEqual(expected);
  });

  it('retains raw parent identity types, UID-only authors and every unknown field through handle parsing', async () => {
    const core = createCore();
    const action = new GetQzoneCommentReplies(undefined as never, core as never);
    const parent = {
      id: 0,
      user: { uid: 'u_commenter', uin: '', nick: '', portrait: { source: 'opaque-portrait' }, unknown_user: 'keep' },
      content: [{ type: 0, content: '原评论', unknown_segment: true }],
      replys: [{ id: 'reply-1', content: [{ type: 0, content: '内联回复' }] }],
      reply_attach_info: 'server-reply-pointer',
      like: { id: 'like-key', count: 0, status: 0 },
      unknown_field: { large_id: '9007199254740993' },
    };
    const expected = structuredClone(parent);

    const result = await action.handle({ feed_ref: QzoneFeedReferenceExample, comment: parent }, 'test', {} as never);
    await action.handle({ feed_ref: QzoneFeedReferenceExample, comment: { id: '0' }, cursor: 'next-reply-cursor' }, 'test', {} as never);

    expect(result.status).toBe('ok');
    expect(core.apis.QzoneApi.getCommentReplies.mock.calls).toEqual([
      [QzoneFeedReferenceExample, expected, undefined],
      [QzoneFeedReferenceExample, { id: '0' }, 'next-reply-cursor'],
    ]);
    expect(typeof core.apis.QzoneApi.getCommentReplies.mock.calls[0]?.[1]?.id).toBe('number');
    expect(typeof core.apis.QzoneApi.getCommentReplies.mock.calls[1]?.[1]?.id).toBe('string');
    expect(parent).toEqual(expected);
  });

  it('allows an omitted author or empty auxiliary user object when the parent ID is exact', async () => {
    const core = createCore();
    const action = new GetQzoneCommentReplies(undefined as never, core as never);
    for (const parent of [{ id: 'parent' }, { id: 'parent', user: {} }, { id: 0, user: { uin: '', uid: '' } }]) {
      const result = await action.handle({ feed_ref: QzoneFeedReferenceExample, comment: parent }, 'test', {} as never);
      expect(result.status).toBe('ok');
    }
    expect(core.apis.QzoneApi.getCommentReplies).toHaveBeenCalledTimes(3);
  });

  it('rejects malformed parent IDs before TypeBox can coerce them or invoke the core', async () => {
    const core = createCore();
    const action = new GetQzoneCommentReplies(undefined as never, core as never);
    for (const id of [undefined, null, false, true, '', ' ', -1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, {}, []]) {
      const result = await action.handle({ feed_ref: QzoneFeedReferenceExample, comment: { id } } as never, 'test', {} as never);
      expect(result.status).toBe('failed');
    }
    expect(core.apis.QzoneApi.getCommentReplies).not.toHaveBeenCalled();
  });

  it('rejects malformed read payloads and unsupported page controls before invoking the core', async () => {
    const cases = [
      [GetQzoneCommentList, { feed_ref: QzoneFeedReferenceExample, page_size: 100 }],
      [GetQzoneCommentList, { feed_ref: QzoneFeedReferenceExample, cursor: false }],
      [GetQzoneCommentList, { feed_ref: QzoneFeedReferenceExample, cursor: '' }],
      [GetQzoneCommentList, { feed_ref: QzoneFeedReferenceExample, cursor: 'x'.repeat(16385) }],
      [GetQzoneCommentList, { feed_ref: { union_id: {} } }],
      [GetQzoneCommentReplies, { feed_ref: QzoneFeedReferenceExample, comment: [] }],
      [GetQzoneCommentReplies, { feed_ref: QzoneFeedReferenceExample, comment: { id: 'parent', user: [] } }],
      [GetQzoneCommentReplies, { feed_ref: QzoneFeedReferenceExample, comment: { id: 'parent', user: null } }],
      [GetQzoneCommentReplies, { feed_ref: QzoneFeedReferenceExample, comment: { id: 'parent', content: '中'.repeat(22 * 1024) } }],
      [GetQzoneCommentReplies, { feed_ref: QzoneFeedReferenceExample, comment: { id: 'parent' }, page_size: 20 }],
      [GetQzoneCommentReplies, { feed_ref: QzoneFeedReferenceExample, comment: { id: 'parent' }, target_uin: '10002' }],
    ] as const;
    for (const [Action, payload] of cases) {
      const core = createCore();
      const result = await new Action(undefined as never, core as never).handle(payload as never, 'test', {} as never);
      expect(result.status).toBe('failed');
      expect(core.apis.QzoneApi.getComments).not.toHaveBeenCalled();
      expect(core.apis.QzoneApi.getCommentReplies).not.toHaveBeenCalled();
    }
  });

  it('returns partial and unknown metadata exactly instead of claiming complete comment history', async () => {
    const core = createCore();
    const page = {
      ...QzoneCommentPageExample,
      comment_num: null,
      comments: [{ ...QzoneCommentPageExample.comments[0]!, reply_num: null, has_more_replies: null, replies: [] }],
      has_more: true,
      next_cursor: 'next-page',
      raw: { unknown_server_field: true },
    };
    core.apis.QzoneApi.getComments.mockResolvedValueOnce(page);

    const result = await new GetQzoneCommentList(undefined as never, core as never).handle(
      { feed_ref: QzoneFeedReferenceExample }, 'test', {} as never
    );

    expect(result.data).toBe(page);
    expect(page.comments[0]?.has_more_replies).toBeNull();
    expect(page.raw).toEqual({ unknown_server_field: true });
  });

  it('surfaces cursor failures without retrying the read', async () => {
    const core = createCore();
    core.apis.QzoneApi.getComments.mockRejectedValueOnce(new Error('QQ空间评论游标无效或已过期'));

    const result = await new GetQzoneCommentList(undefined as never, core as never).handle(
      { feed_ref: QzoneFeedReferenceExample, cursor: 'expired-cursor' }, 'test', {} as never
    );

    expect(result.status).toBe('failed');
    expect(result.message).toContain('游标无效或已过期');
    expect(core.apis.QzoneApi.getComments).toHaveBeenCalledTimes(1);
  });

  it('declares complete API metadata with schema-valid detailed examples', () => {
    const core = createCore();
    const actions = [
      new GetQzoneCommentList(undefined as never, core as never),
      new GetQzoneCommentReplies(undefined as never, core as never),
    ];
    expect(actions.map(action => action.actionName)).toEqual(['get_qzone_comment_list', 'get_qzone_comment_replies']);
    for (const action of actions) {
      expect(action.actionSummary).not.toBe('');
      expect(action.actionDescription).not.toBe('');
      expect(action.actionTags).toContain('扩展接口');
      expect(TypeCompiler.Compile(action.payloadSchema).Check(action.payloadExample)).toBe(true);
      expect(TypeCompiler.Compile(action.returnSchema).Check(action.returnExample)).toBe(true);
    }
  });
});
