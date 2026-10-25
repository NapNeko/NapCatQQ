import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NTQQQzoneApi } from '@/napcat-core/apis/qzone';
import type { QzoneComment, QzoneFeed, QzoneFeedReference } from '@/napcat-core/data/qzone-rpc';

const unionId = { uf_key: 'union-key', ugc_id: 'ugc-key', feed_id: 'feed-key', serialized_data: 'opaque', ext_ids: [{ ext_id_type: 5, str: 'mood-tid' }] };
const feed: QzoneFeed = {
  cell_common: { union_id: unionId, feed_type: 1, feed_sub_type: 1, cur_like_key: 'like-key', domain_type: 1 },
  cell_summary: { summary: [{ type: 0, content: '正文' }] },
  cell_user_info: { user: { uin: '10001', uid: 'self-uid', nick: '当前账号' } },
  cell_feed_transfer: { opaque: 'context' },
};
const reference: QzoneFeedReference = {
  union_id: unionId, cell_feed_transfer: { opaque: 'context' }, feed_action_domain_type: 1, like_key: 'like-key',
};

function response (data: Record<string, unknown>, retcode = 0): Response {
  return new Response(JSON.stringify({ retcode, data }), { status: 200 });
}

function createApi () {
  const core = {
    selfInfo: { uin: '10001', uid: 'self-uid', nick: '当前账号' },
    apis: {
      UserApi: {
        getSKey: vi.fn().mockResolvedValue('s'),
        getPSkey: vi.fn().mockResolvedValue({ result: 0, domainPskeyMap: new Map([['qzone.qq.com', 'p']]) }),
        getUidByUinV2: vi.fn().mockResolvedValue('target-uid'),
      },
    },
  };
  return { api: new NTQQQzoneApi({} as never, core as never), core };
}

describe('Qzone modern HTTP2RPC API', () => {
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

  it('uses the fixed JSON RPC route, PSKey-first gtk and only current account cookies', async () => {
    const { api, core } = createApi();
    fetchMock.mockResolvedValueOnce(response({ feeds: [{ feed }], has_more: false }));

    const result = await api.getFriendFeeds();

    expect(result.feeds).toHaveLength(1);
    expect(result.feeds[0]?.tid).toBe('mood-tid');
    expect(result.feeds[0]?.feed).toEqual(feed);
    expect(result.next_cursor).toBeNull();
    expect(core.apis.UserApi.getPSkey).toHaveBeenCalledExactlyOnceWith(['qzone.qq.com']);
    const [url, options] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe('https://h5.qzone.qq.com/http2rpc/gotrpc/v1/trpc.qzone.feeds_reader.FeedsReader/GetFriendFeeds?g_tk=177685');
    expect(options).toMatchObject({ method: 'POST', redirect: 'error', signal: expect.any(AbortSignal) });
    expect(options?.headers).toMatchObject({
      Cookie: 'uin=o10001; p_uin=o10001; skey=s; p_skey=p',
      'Content-Type': 'application/json',
      'x-oidb': '{"uint32_command":"0x97e5","uint32_service_type":"0"}',
      'x-web-qua': 'V1_HT5_QZ_9.9.32_001_IDC_B',
    });
    expect(JSON.parse(options?.body as string)).toEqual({ refresh_id: expect.stringMatching(/^10001_\d+$/) });
  });

  it('falls back to SKey gtk and rejects missing auth without leaking ticket errors', async () => {
    const { api, core } = createApi();
    core.apis.UserApi.getPSkey.mockRejectedValueOnce(new Error('private ticket detail'));
    fetchMock.mockResolvedValueOnce(response({ feeds: [], has_more: false }));
    await api.getFriendFeeds();
    expect(String(fetchMock.mock.calls[0]![0])).toContain('g_tk=177688');

    core.apis.UserApi.getSKey.mockRejectedValueOnce(new Error('private skey detail'));
    core.apis.UserApi.getPSkey.mockRejectedValueOnce(new Error('private pskey detail'));
    await expect(api.getFriendFeeds()).rejects.toThrow('QQ空间取票失败');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid identity and account switches during ticket acquisition', async () => {
    const { api, core } = createApi();
    core.selfInfo.uin = '';
    await expect(api.getFriendFeeds()).rejects.toThrow('需要已登录');
    expect(core.apis.UserApi.getSKey).not.toHaveBeenCalled();
    core.selfInfo.uin = '10001';
    core.apis.UserApi.getPSkey.mockImplementationOnce(async () => {
      core.selfInfo.uin = '20001';
      core.selfInfo.uid = 'another-uid';
      return { result: 0, domainPskeyMap: new Map([['qzone.qq.com', 'p']]) };
    });
    await expect(api.getFriendFeeds()).rejects.toThrow('QQ账号已切换');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('retains the refresh id, attach info and last non-ad full union identity across pages', async () => {
    const { api } = createApi();
    const ad: QzoneFeed = { cell_common: { feed_type: 3, union_id: { uf_key: 'ad-key' } } };
    const unknown: QzoneFeed = { cell_common: { feed_type: 1, union_id: { uf_key: '' } }, new_cell: { opaque: true } };
    const noIdentity: QzoneFeed = { cell_common: { feed_type: 1 }, new_cell: { opaque: 'also-preserved' } };
    fetchMock.mockResolvedValueOnce(response({ feeds: [{ feed }, { feed: ad }, { feed: unknown }, { feed: noIdentity }], has_more: true, attach_info: 'page-2' }));
    fetchMock.mockResolvedValueOnce(response({ feeds: [{ feed: unknown }], has_more: false }));
    const first = await api.getFriendFeeds();
    expect(first.feeds).toHaveLength(4);
    expect(first.feeds[2]?.feed).toEqual(unknown);
    expect(first.feeds[2]?.feed_ref).toBeNull();
    expect(first.feeds[3]?.feed_ref).toBeNull();
    expect(first.next_cursor).toEqual(expect.any(String));
    const firstRequest = JSON.parse(fetchMock.mock.calls[0]![1]?.body as string);
    // A caller mutating returned display data must not change the cached pagination identity.
    first.feeds[0]!.feed.cell_common!.union_id!.uf_key = 'caller-mutated';
    const last = await api.getFriendFeeds(first.next_cursor!);
    expect(last.feeds[0]?.feed).toEqual(unknown);
    expect(last.has_more).toBe(false);
    expect(JSON.parse(fetchMock.mock.calls[1]![1]?.body as string)).toEqual({
      refresh_id: firstRequest.refresh_id, attach_info: 'page-2', last_client_feed_union_id: unionId,
    });
  });

  it('rejects cursors for a different query kind, target or account and after expiry', async () => {
    const { api, core } = createApi();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(1000000);
    fetchMock.mockImplementation(async () => response({ feeds: [{ feed }], has_more: true, attach_info: 'next' }));
    const friend = await api.getFriendFeeds();
    await expect(api.getMsgList(undefined, friend.next_cursor!)).rejects.toThrow('游标无效');
    const moods = await api.getMsgList('20001');
    await expect(api.getMsgList('30001', moods.next_cursor!)).rejects.toThrow('游标无效');
    core.selfInfo.uin = '20001';
    core.selfInfo.uid = 'other-uid';
    await expect(api.getFriendFeeds(friend.next_cursor!)).rejects.toThrow('游标无效');
    core.selfInfo.uin = '10001';
    core.selfInfo.uid = 'self-uid';
    clock.mockReturnValue(1000000 + 10 * 60 * 1000);
    await expect(api.getFriendFeeds(friend.next_cursor!)).rejects.toThrow('已过期');
    await expect(api.getFriendFeeds('x'.repeat(16385))).rejects.toThrow('游标无效');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('bounds saved cursors and evicts the oldest issued token', async () => {
    const { api } = createApi();
    fetchMock.mockImplementation(async () => response({ feeds: [{ feed }], has_more: true, attach_info: 'next' }));
    const first = await api.getFriendFeeds();
    for (let i = 0; i < 128; i++) await api.getFriendFeeds();
    await expect(api.getFriendFeeds(first.next_cursor!)).rejects.toThrow('游标无效');
    expect(fetchMock).toHaveBeenCalledTimes(129);
  });

  it('uses resolved UID for mood lists and returns explicit seal state without a fake total', async () => {
    const { api, core } = createApi();
    const seal = { type: 1, summary: '已封存', additional: 'preserved' };
    fetchMock.mockResolvedValueOnce(response({ feeds: [], has_more: false, seal_off_memory: seal }));
    const result = await api.getMsgList('20001');
    expect(core.apis.UserApi.getUidByUinV2).toHaveBeenCalledExactlyOnceWith('20001');
    expect(JSON.parse(fetchMock.mock.calls[0]![1]?.body as string)).toEqual({
      host_uid: 'target-uid', host_uin: '20001', attach_info: '', feed_action_domain_type: 1,
    });
    expect(result).toEqual({ msglist: [], has_more: false, next_cursor: null, seal_off_memory: seal });
    expect(result).not.toHaveProperty('total');
  });

  it('rejects malformed pages, malformed continuation and unresolved target accounts', async () => {
    const { api, core } = createApi();
    fetchMock.mockResolvedValueOnce(response({ has_more: false }));
    await expect(api.getFriendFeeds()).rejects.toThrow('列表响应格式异常');
    fetchMock.mockResolvedValueOnce(response({ feeds: [{ feed }], has_more: true }));
    await expect(api.getFriendFeeds()).rejects.toThrow('续页信息无效');
    core.apis.UserApi.getUidByUinV2.mockResolvedValueOnce('');
    await expect(api.getMsgList('20001')).rejects.toThrow('无法解析目标QQ号');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reads the exact detail nesting and preserves raw comments and feed identity', async () => {
    const { api } = createApi();
    const parent: QzoneComment = { id: '0', user: { uin: '20001', uid: 'peer-uid' }, custom: { keep: true } };
    const detailFeed = { ...feed, cell_comment: { comments: [parent] } };
    fetchMock.mockResolvedValueOnce(response({ feed: { feed: detailFeed } }));
    const detail = await api.getMsgDetail(reference);
    expect(detail.comments).toEqual([parent]);
    expect(detail.feed).toEqual(detailFeed);
    expect(JSON.parse(fetchMock.mock.calls[0]![1]?.body as string)).toEqual({
      union_id: unionId, cell_feed_transfer: { opaque: 'context' }, feed_action_domain_type: 1, from_page: 1,
    });
    fetchMock.mockResolvedValueOnce(response({ feed: detailFeed }));
    await expect(api.getMsgDetail(reference)).rejects.toThrow('未返回说说详情');
  });

  it('publishes with session author and mapped privacy, and accepts only a returned server tid', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ feed }));
    await expect(api.publishMsg('正文', 16, ['20001'])).resolves.toEqual({ tid: 'mood-tid', time: 0 });
    const request = JSON.parse(fetchMock.mock.calls[0]![1]?.body as string);
    expect(request).toMatchObject({
      from: 3,
      feed: {
        cell_user_info: { user: { uin: '10001', uid: 'self-uid', nick: '当前账号' } },
        cell_summary: { summary: [{ type: 0, content: '正文' }] },
        cell_permission: { right: { flag: [3], white_uins: ['20001'] } },
      },
    });
    fetchMock.mockResolvedValueOnce(response({ feed: { cell_common: { client_key: 'local-key-only' } } }));
    await expect(api.publishMsg('第二条')).rejects.toThrow('结果未知');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns publish time only from the server feed without substituting the current clock', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ feed: { ...feed, cell_common: { ...feed.cell_common, time: '1700000123' } } }));
    await expect(api.publishMsg('带服务端时间')).resolves.toEqual({ tid: 'mood-tid', time: 1700000123 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not turn a malformed supplied publish time into a missing-time sentinel', async () => {
    const { api } = createApi();
    for (const time of [-1, 'bad', Number.MAX_SAFE_INTEGER + 1]) {
      fetchMock.mockResolvedValueOnce(response({ feed: { ...feed, cell_common: { ...feed.cell_common, time } } }));
      await expect(api.publishMsg('仅发表一次')).rejects.toThrow('勿自动重试');
    }
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('uses distinct official like/unlike routes and requires the business result', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ like: { status: 1 } }));
    fetchMock.mockResolvedValueOnce(response({ like: { status: 0 } }));
    await api.setLike(reference, true);
    await api.setLike(reference, false);
    expect(String(fetchMock.mock.calls[0]![0])).toContain('/DoLike?');
    expect(String(fetchMock.mock.calls[1]![0])).toContain('/UnLike?');
    expect(JSON.parse(fetchMock.mock.calls[0]![1]?.body as string)).toEqual({
      like_key: 'like-key', union_id: unionId, like_type: 1, cell_feed_transfer: { opaque: 'context' },
    });
    fetchMock.mockResolvedValueOnce(response({}));
    await expect(api.setLike(reference, true)).rejects.toThrow('未返回点赞结果');
    await expect(api.setLike({ union_id: unionId }, true)).rejects.toThrow('缺少QQ空间点赞标识');
    fetchMock.mockResolvedValueOnce(response({ like: {} }));
    await api.setLike({ ...reference, like_key: 'k'.repeat(8192) }, true);
    expect(JSON.parse(fetchMock.mock.calls[3]![1]?.body as string).like_key).toHaveLength(8192);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('passes the full parent comment for replies and never trusts it as the acting author', async () => {
    const { api } = createApi();
    const parent: QzoneComment = {
      id: '0',
      user: { uin: '20001', uid: 'peer-uid', nick: '父评论作者' },
      like: { id: 'parent-like' },
      additional: { opaque: true },
    };
    const reply = { id: 'reply-id', user: { uin: '10001' }, opaque: 'returned' };
    fetchMock.mockResolvedValueOnce(response({ reply }));
    await expect(api.comment(reference, '回复正文', parent, { uin: '30001', uid: 'reply-target' })).resolves.toEqual({ comment_id: 'reply-id', comment: reply });
    expect(String(fetchMock.mock.calls[0]![0])).toContain('/AddReply?');
    expect(JSON.parse(fetchMock.mock.calls[0]![1]?.body as string)).toMatchObject({
      union_id: unionId,
      comment: parent,
      reply: { user: { uin: '10001', uid: 'self-uid' }, target_user: { uin: '30001', uid: 'reply-target' }, content: [{ content: '回复正文', type: 0 }] },
    });
    await expect(api.comment(reference, '回复', undefined, { uin: '30001' })).rejects.toThrow('必须与父评论');
    await expect(api.comment(reference, '回复', { id: '0' })).rejects.toThrow('用户信息无效');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('accepts an empty optional UID on a returned parent while retaining the session actor UID', async () => {
    const { api } = createApi();
    const parent: QzoneComment = { id: 'parent', user: { uin: '20001', uid: '', nick: '' }, opaque: 'retained' };
    fetchMock.mockResolvedValueOnce(response({ reply: { id: 'empty-uid-reply' } }));
    await expect(api.comment(reference, '回复', parent)).resolves.toEqual({ comment_id: 'empty-uid-reply', comment: { id: 'empty-uid-reply' } });
    expect(JSON.parse(fetchMock.mock.calls[0]![1]?.body as string)).toMatchObject({
      comment: parent,
      reply: { target_user: { uin: '20001', uid: '', nick: '' }, user: { uin: '10001', uid: 'self-uid' } },
    });
  });

  it('requires a nonempty server comment id and does not replay ambiguous writes', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ comment: { id: '0', additional: true } }));
    await expect(api.comment(reference, '评论')).resolves.toEqual({ comment_id: '0', comment: { id: '0', additional: true } });
    expect(String(fetchMock.mock.calls[0]![0])).toContain('/AddComment?');
    fetchMock.mockResolvedValueOnce(response({ comment: {} }));
    await expect(api.comment(reference, '评论')).rejects.toThrow('结果未知');
    fetchMock.mockRejectedValueOnce(new Error('transport contains private cookie'));
    await expect(api.publishMsg('正文')).rejects.toThrow('未能确认结果');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('accepts bounded parent and returned comment IDs that pass the public schema', async () => {
    const { api } = createApi();
    const id = 'c'.repeat(8192);
    const parent = { id, user: { uin: '20001', uid: '' } };
    fetchMock.mockResolvedValueOnce(response({ reply: { id } }));

    await expect(api.comment(reference, '回复', parent)).resolves.toMatchObject({ comment_id: id });
    expect(JSON.parse(fetchMock.mock.calls[0]![1]?.body as string).comment.id).toBe(id);
  });

  it('rejects HTTP errors, redirects, malformed JSON and outer RPC errors without returning server secrets', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(new Response('private response', { status: 302, headers: { Location: 'https://other.example' } }));
    await expect(api.getFriendFeeds()).rejects.toThrow('QQ空间请求失败');
    fetchMock.mockResolvedValueOnce(new Response('private response', { status: 500 }));
    await expect(api.getFriendFeeds()).rejects.toThrow('QQ空间请求失败');
    fetchMock.mockResolvedValueOnce(new Response('not json but private', { status: 200 }));
    await expect(api.getFriendFeeds()).rejects.toThrow('响应格式异常');
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ retcode: 4003, message: 'private credential text', data: {} })));
    try {
      await api.getFriendFeeds();
      expect.fail('must reject business failure');
    } catch (error) {
      expect(String(error)).not.toContain('private');
      expect(String(error)).toContain('4003');
    }
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('aborts a hanging request at the finite timeout and never retries a publish', async () => {
    vi.useFakeTimers();
    const { api } = createApi();
    fetchMock.mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    }));
    const pending = api.publishMsg('正文');
    const assertion = expect(pending).rejects.toThrow('未能确认结果');
    await vi.advanceTimersByTimeAsync(15000);
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('bounds auth waits and streamed response size', async () => {
    vi.useFakeTimers();
    const { api, core } = createApi();
    core.apis.UserApi.getSKey.mockImplementationOnce(() => new Promise(() => {}));
    const pending = api.getFriendFeeds();
    const assertion = expect(pending).rejects.toThrow('取票超时');
    await vi.advanceTimersByTimeAsync(15000);
    await assertion;
    expect(fetchMock).not.toHaveBeenCalled();
    vi.useRealTimers();
    fetchMock.mockResolvedValueOnce(new Response(new Uint8Array(8 * 1024 * 1024 + 1)));
    await expect(api.getFriendFeeds()).rejects.toThrow('QQ空间请求失败');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
