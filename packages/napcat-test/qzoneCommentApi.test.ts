import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NTQQQzoneApi } from '@/napcat-core/apis/qzone';
import type { QzoneComment, QzoneFeed, QzoneFeedReference } from '@/napcat-core/data/qzone-rpc';

function createApi () {
  const core = {
    selfInfo: { uin: '10001', uid: 'self-uid', nick: '当前账号' },
    apis: {
      UserApi: {
        getSKey: vi.fn().mockResolvedValue('s'),
        getPSkey: vi.fn().mockResolvedValue({ result: 0, domainPskeyMap: new Map([['qzone.qq.com', 'p']]) }),
      },
    },
  };
  return { api: new NTQQQzoneApi({} as never, core as never), core };
}

function response (data: Record<string, unknown>, retcode = 0): Response {
  return new Response(JSON.stringify({ retcode, data }), { status: 200 });
}

function reference (): QzoneFeedReference {
  return {
    union_id: { uf_key: 'old-key', ugc_id: 'old-ugc', feed_id: 'old-feed', serialized_data: 'old-opaque' },
    cell_feed_transfer: { nested: { value: 'old-transfer' } },
    feed_action_domain_type: 1,
    like_key: 'old-like',
  };
}

function parent (): QzoneComment {
  return {
    id: 0,
    user: { uid: 'uid-only-author', nick: '父评论作者', portrait: 'https://example.com/avatar' },
    time: 1700000000,
    content: [{ type: 0, content: ' 原评论 ' }],
    like: { id: 'parent-like', count: 2, status: 1 },
    reply_num: 8,
    has_more_reply: true,
    reply_attach_info: 'inline-reply-end',
    replys: [{ id: 'inline-reply', content: [{ type: 0, content: '内联回复' }] }],
    opaque: { keep: 'parent-context' },
  };
}

function detail (comments: QzoneComment[] = [parent()]): { feed: { feed: QzoneFeed }; attach_info: string; has_more: boolean; extra: string; } {
  return {
    feed: {
      feed: {
        cell_common: {
          union_id: { uf_key: 'fresh-key', ugc_id: 'fresh-ugc', feed_id: 'fresh-feed', serialized_data: 'fresh-opaque' },
          feed_type: 1,
          feed_sub_type: 1,
          domain_type: 2,
          cur_like_key: 'fresh-like',
        },
        cell_feed_transfer: { nested: { value: 'fresh-transfer' } },
        cell_comment: { num: 32, comments },
        cell_summary: { summary: [{ type: 0, content: '说说正文' }] },
      },
    },
    attach_info: 'comment-page-2',
    has_more: true,
    extra: 'retained-business-data',
  };
}

describe('Qzone comment and reply page transport', () => {
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('gets the first comment batch from detail and returns its updated full reference and raw response', async () => {
    const { api } = createApi();
    const business = detail();
    fetchMock.mockResolvedValueOnce(response(business));

    const page = await api.getComments(reference());

    expect(String(fetchMock.mock.calls[0]![0])).toContain('/GetFeedDetail?');
    expect(page).toMatchObject({
      comment_num: 32,
      has_more: true,
      next_cursor: expect.any(String),
      raw: business,
      feed_ref: {
        union_id: business.feed.feed.cell_common!.union_id,
        cell_feed_transfer: business.feed.feed.cell_feed_transfer,
        feed_action_domain_type: 2,
        like_key: 'fresh-like',
      },
    });
    expect(page.comments[0]).toMatchObject({
      comment_id: '0',
      user_id: null,
      uid: 'uid-only-author',
      nickname: '父评论作者',
      time: 1700000000,
      content: ' 原评论 ',
      like_count: 2,
      liked: true,
      reply_num: 8,
      has_more_replies: true,
      comment: parent(),
    });
    expect(page.comments[0]?.replies).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fetches exactly one continuation page with the fresh context and never invents a page-size or total', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response(detail()));
    fetchMock.mockResolvedValueOnce(response({ cell_comment: { comments: [{ id: 'next-comment', opaque: true }] }, has_more: false, extra: 'next' }));
    const first = await api.getComments(reference());
    const next = await api.getComments(first.feed_ref, first.next_cursor!);

    const [url, options] = fetchMock.mock.calls[1]!;
    expect(String(url)).toContain('/GetComment?');
    expect(options?.headers).toMatchObject({ 'x-oidb': '{"uint32_command":"0x9bfd","uint32_service_type":"1"}' });
    expect(JSON.parse(options?.body as string)).toEqual({
      union_id: first.feed_ref.union_id, attach_info: 'comment-page-2', cell_feed_transfer: first.feed_ref.cell_feed_transfer,
    });
    expect(next).toMatchObject({ comment_num: null, has_more: false, next_cursor: null, raw: { extra: 'next' } });
    expect(next.comments).toHaveLength(1);
    expect(next.comments[0]?.comment).toEqual({ id: 'next-comment', opaque: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('preserves old detail comments and exposes a usable continuation without another detail read', async () => {
    const { api } = createApi();
    const original = reference();
    original['opaque_entry'] = { preserve: 'internal-context' };
    const business = detail();
    delete business.feed.feed.cell_feed_transfer;
    fetchMock.mockResolvedValueOnce(response(business));
    fetchMock.mockResolvedValueOnce(response({ cell_comment: { num: 33, comments: [] }, has_more: false }));

    const first = await api.getMsgDetail(original);
    expect(first.comments).toEqual([parent()]);
    expect(first.feed_ref).not.toHaveProperty('cell_feed_transfer');
    expect(first.feed_ref).not.toHaveProperty('opaque_entry');
    expect(first.comment_has_more).toBe(true);
    expect(first.comment_next_cursor).toEqual(expect.any(String));
    const next = await api.getComments(first.feed_ref!, first.comment_next_cursor!);
    expect(String(fetchMock.mock.calls[1]![0])).toContain('/GetComment?');
    expect(JSON.parse(fetchMock.mock.calls[1]![1]?.body as string)).toMatchObject({
      union_id: business.feed.feed.cell_common!.union_id, cell_feed_transfer: original.cell_feed_transfer,
    });
    expect(next.feed_ref).toMatchObject({ cell_feed_transfer: original.cell_feed_transfer, opaque_entry: { preserve: 'internal-context' } });
    expect(next.comment_num).toBe(33);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not issue a detail continuation when its old normalized feed_ref is null', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ feed: { feed: { cell_comment: { comments: [parent()] } } }, has_more: true, attach_info: 'next' }));
    const result = await api.getMsgDetail(reference());
    expect(result.feed_ref).toBeNull();
    expect(result.comments).toEqual([parent()]);
    expect(result.comment_has_more).toBe(true);
    expect(result.comment_next_cursor).toBeNull();
  });

  it('retains missing detail union/transfer from the supplied context for explicit comment reads', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ feed: { feed: { cell_comment: { num: 0, comments: [] } } }, has_more: false }));
    await expect(api.getComments(reference())).resolves.toMatchObject({
      feed_ref: reference(), comment_num: 0, comments: [], has_more: false, next_cursor: null,
    });
  });

  it('returns additional replies using numeric parent id zero and a complete UID-only parent', async () => {
    const { api } = createApi();
    const originalParent = parent();
    const reply = { id: 1, user: { uid: 'reply-uid', nick: '' }, target_user: { uid: 'uid-only-author' }, time: 1700000001, content: [{ type: 0, content: '追加回复' }], opaque: true };
    fetchMock.mockResolvedValueOnce(response({ replys: [reply], has_more: true, reply_attach_info: 'reply-page-2', opaque: 'kept' }));

    const page = await api.getCommentReplies(reference(), originalParent);

    const [url, options] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain('/GetReplies?');
    expect(options?.headers).toMatchObject({ 'x-oidb': '{"uint32_command":"0x9bfe","uint32_service_type":"1"}' });
    const request = JSON.parse(options?.body as string);
    expect(request).toEqual({
      union_id: reference().union_id,
      cur_comment: originalParent,
      comment_attach_info: '',
      reply_attach_info: 'inline-reply-end',
      page_size: 20,
      cell_feed_transfer: reference().cell_feed_transfer,
    });
    expect(request.cur_comment.id).toBe(0);
    expect(page).toMatchObject({ comment_id: '0', reply_num: 8, has_more: true, next_cursor: expect.any(String), raw: { opaque: 'kept' } });
    expect(page.replies).toHaveLength(1);
    expect(page.replies[0]).toMatchObject({ reply_id: '1', uid: 'reply-uid', target_uid: 'uid-only-author', content: '追加回复', reply });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('supports read parents without user and preserves string id zero without write-author validation', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ replys: [], has_more: false }));
    const result = await api.getCommentReplies(reference(), { id: '0', opaque: { data: true } });
    expect(result).toMatchObject({ comment_id: '0', reply_num: null, replies: [], has_more: false, next_cursor: null });
    expect(JSON.parse(fetchMock.mock.calls[0]![1]?.body as string)).toMatchObject({
      cur_comment: { id: '0', opaque: { data: true } }, reply_attach_info: '', comment_attach_info: '', page_size: 20,
    });
  });

  it('snapshots the parent and transfer before awaiting auth and uses stored context on continuation', async () => {
    const { api } = createApi();
    const inputRef = reference();
    const savedRef = structuredClone(inputRef);
    const inputParent = parent();
    const savedParent = structuredClone(inputParent);
    fetchMock.mockResolvedValueOnce(response({ replys: [{ id: 'page-one' }], has_more: true, reply_attach_info: 'reply-page-2' }));
    fetchMock.mockResolvedValueOnce(response({ replys: [{ id: 'page-two' }], has_more: false, reply_num: 9 }));
    const pending = api.getCommentReplies(inputRef, inputParent);
    (inputRef.cell_feed_transfer as { nested: { value: string; }; }).nested.value = 'caller-transfer-mutation';
    inputParent.user!.nick = 'caller-user-mutation';
    inputParent.content![0]!.content = 'caller-content-mutation';
    inputParent.replys!.push({ id: 'caller-injected' });
    const first = await pending;
    expect(JSON.parse(fetchMock.mock.calls[0]![1]?.body as string)).toMatchObject({ cur_comment: savedParent, cell_feed_transfer: savedRef.cell_feed_transfer });
    // A different author identity is rejected, while modified display/body fields never replace the cached parent.
    await expect(api.getCommentReplies(savedRef, inputParent, first.next_cursor!)).rejects.toThrow('游标无效');
    const callerParent = structuredClone(savedParent);
    callerParent.content = [{ type: 0, content: 'ignored new body' }];
    callerParent.replys = [{ id: 'ignored extra reply' }];
    const last = await api.getCommentReplies(savedRef, callerParent, first.next_cursor!);
    expect(JSON.parse(fetchMock.mock.calls[1]![1]?.body as string)).toEqual({
      union_id: savedRef.union_id,
      cur_comment: { ...savedParent, reply_attach_info: 'reply-page-2', has_more_reply: true },
      comment_attach_info: '',
      reply_attach_info: 'reply-page-2',
      page_size: 20,
      cell_feed_transfer: savedRef.cell_feed_transfer,
    });
    expect(last.replies).toHaveLength(1);
    expect(last.reply_num).toBe(9);
    expect(last.next_cursor).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('protects cached comment context from mutations through returned feed_ref and raw objects', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response(detail()));
    fetchMock.mockResolvedValueOnce(response({ cell_comment: { comments: [] }, has_more: false }));
    const first = await api.getComments(reference());
    const savedRef = structuredClone(first.feed_ref);
    (first.feed_ref.cell_feed_transfer as { nested: { value: string; }; }).nested.value = 'response-mutation';
    ((first.raw['feed'] as { feed: QzoneFeed; }).feed.cell_feed_transfer as { nested: { value: string; }; }).nested.value = 'raw-mutation';
    const next = await api.getComments(savedRef, first.next_cursor!);
    expect(next.feed_ref).toEqual(savedRef);
    expect(JSON.parse(fetchMock.mock.calls[1]![1]?.body as string).cell_feed_transfer).toEqual(savedRef.cell_feed_transfer);
  });

  it('binds cursors to query kind, full feed reference and exact parent id/user', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response(detail()));
    const comments = await api.getComments(reference());
    const ref = comments.feed_ref;
    fetchMock.mockResolvedValueOnce(response({ replys: [], has_more: true, reply_attach_info: 'reply-next' }));
    const replies = await api.getCommentReplies(ref, parent());
    await expect(api.getCommentReplies(ref, parent(), comments.next_cursor!)).rejects.toThrow('游标无效');
    await expect(api.getComments(ref, replies.next_cursor!)).rejects.toThrow('游标无效');
    for (const modified of [
      { ...ref, union_id: { ...ref.union_id, serialized_data: 'different-union-context' } },
      { ...ref, cell_feed_transfer: { different: true } },
      { ...ref, feed_action_domain_type: 3 },
    ]) {
      await expect(api.getComments(modified, comments.next_cursor!)).rejects.toThrow('游标无效');
    }
    await expect(api.getCommentReplies(ref, { ...parent(), id: '0' }, replies.next_cursor!)).rejects.toThrow('游标无效');
    await expect(api.getCommentReplies(ref, { ...parent(), user: { uid: 'other-user' } }, replies.next_cursor!)).rejects.toThrow('游标无效');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('allows JSON property reordering but rejects account changes and expired cursors before network IO', async () => {
    const { api, core } = createApi();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(1000000);
    fetchMock.mockResolvedValueOnce(response(detail()));
    fetchMock.mockResolvedValueOnce(response({ cell_comment: { comments: [] }, has_more: false }));
    const first = await api.getComments(reference());
    const reordered = Object.fromEntries(Object.entries(first.feed_ref).reverse()) as QzoneFeedReference;
    await api.getComments(reordered, first.next_cursor!);
    core.selfInfo.uin = '20002';
    core.selfInfo.uid = 'another-uid';
    await expect(api.getComments(first.feed_ref, first.next_cursor!)).rejects.toThrow('游标无效');
    core.selfInfo.uin = '10001';
    core.selfInfo.uid = 'self-uid';
    clock.mockReturnValue(1000000 + 10 * 60 * 1000);
    await expect(api.getComments(first.feed_ref, first.next_cursor!)).rejects.toThrow('已过期');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reuses the shared 128-entry cursor bound across existing feeds and new comment pages', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response(detail()));
    const first = await api.getComments(reference());
    fetchMock.mockImplementation(async () => response({ feeds: [{ feed: detail().feed.feed }], has_more: true, attach_info: 'feed-next' }));
    for (let i = 0; i < 128; i++) await api.getFriendFeeds();
    await expect(api.getComments(first.feed_ref, first.next_cursor!)).rejects.toThrow('游标无效');
    expect(fetchMock).toHaveBeenCalledTimes(129);
  });

  it('rejects malformed parents and reference bodies before acquiring tickets', async () => {
    const { api, core } = createApi();
    const cycle: Record<string, unknown> = { id: 0 };
    cycle['loop'] = cycle;
    const badParents: unknown[] = [
      {}, { id: '' }, { id: true }, { id: null }, { id: -1 }, { id: 1.5 }, { id: Number.MAX_SAFE_INTEGER + 1 },
      { id: 0, user: [] }, { id: 0, user: 'bad' }, { id: 0, opaque: 'x'.repeat(65536) },
      { id: 0, number: Number.NaN }, { id: 0, method: () => {} }, cycle,
    ];
    for (const invalid of badParents) await expect(api.getCommentReplies(reference(), invalid as QzoneComment)).rejects.toThrow();
    await expect(api.getComments({ union_id: {} })).rejects.toThrow();
    await expect(api.getCommentReplies(reference(), { id: 0, reply_attach_info: 12 })).rejects.toThrow('续页信息无效');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(core.apis.UserApi.getSKey).not.toHaveBeenCalled();
  });

  it('rejects missing or non-advancing server pointers rather than repeating the same page', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ ...detail(), attach_info: undefined }));
    await expect(api.getComments(reference())).rejects.toThrow('未推进');
    fetchMock.mockResolvedValueOnce(response(detail()));
    const first = await api.getComments(reference());
    fetchMock.mockResolvedValueOnce(response({ cell_comment: { comments: [] }, has_more: true, attach_info: 'comment-page-2' }));
    await expect(api.getComments(first.feed_ref, first.next_cursor!)).rejects.toThrow('未推进');
    fetchMock.mockResolvedValueOnce(response({ replys: [], has_more: true }));
    await expect(api.getCommentReplies(reference(), parent())).rejects.toThrow('未推进');
    fetchMock.mockResolvedValueOnce(response({ replys: [], has_more: true, reply_attach_info: 'inline-reply-end' }));
    await expect(api.getCommentReplies(reference(), parent())).rejects.toThrow('未推进');
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('does not disguise malformed response objects as successful empty pages', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response(detail()));
    const first = await api.getComments(reference());
    fetchMock.mockResolvedValueOnce(response({}));
    await expect(api.getComments(first.feed_ref, first.next_cursor!)).rejects.toThrow('cell_comment');
    fetchMock.mockResolvedValueOnce(response({ cell_comment: { comments: [null] }, has_more: false }));
    await expect(api.getComments(first.feed_ref, first.next_cursor!)).rejects.toThrow('评论响应格式异常');
    fetchMock.mockResolvedValueOnce(response({}));
    await expect(api.getCommentReplies(reference(), parent())).rejects.toThrow('回复响应格式异常');
    fetchMock.mockResolvedValueOnce(response({ replys: [null], has_more: false }));
    await expect(api.getCommentReplies(reference(), parent())).rejects.toThrow('回复响应格式异常');
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('accepts omitted empty lists only when the server explicitly marks the final page', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response(detail()));
    const first = await api.getComments(reference());
    for (const lastPage of [{ has_more: false }, { cell_comment: { num: 0 }, has_more: false }]) {
      fetchMock.mockResolvedValueOnce(response(lastPage));
      await expect(api.getComments(first.feed_ref, first.next_cursor!)).resolves.toMatchObject({
        comments: [], has_more: false, next_cursor: null, raw: lastPage,
      });
    }
    fetchMock.mockResolvedValueOnce(response({ has_more: false }));
    await expect(api.getCommentReplies(reference(), parent())).resolves.toMatchObject({
      replies: [], has_more: false, next_cursor: null, raw: { has_more: false },
    });
    for (const badPage of [{ cell_comment: {} }, { has_more: true, attach_info: 'advanced' }, { cell_comment: null, has_more: false }, { cell_comment: { comments: null }, has_more: false }]) {
      fetchMock.mockResolvedValueOnce(response(badPage));
      await expect(api.getComments(first.feed_ref, first.next_cursor!)).rejects.toThrow('评论响应');
    }
    for (const badPage of [{ has_more: true, reply_attach_info: 'advanced' }, { replys: null, has_more: false }]) {
      fetchMock.mockResolvedValueOnce(response(badPage));
      await expect(api.getCommentReplies(reference(), parent())).rejects.toThrow('回复响应');
    }
    expect(fetchMock).toHaveBeenCalledTimes(10);
  });

  it('retains detail compatibility for omitted initial comment cells and never echoes private RPC errors', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ feed: { feed: {} }, has_more: false }));
    const page = await api.getComments(reference());
    expect(page).toMatchObject({ comment_num: null, comments: [], has_more: false, next_cursor: null });
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ retcode: 4003, message: 'private credential', data: {} })));
    try {
      await api.getCommentReplies(reference(), parent());
      expect.fail('must reject business error');
    } catch (error) {
      expect(String(error)).toContain('4003');
      expect(String(error)).not.toContain('private');
    }
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
