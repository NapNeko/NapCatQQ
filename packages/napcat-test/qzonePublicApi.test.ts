import { afterEach, describe, expect, test, vi } from 'vitest';
import type { InstanceContext, NapCatCore } from '@/napcat-core';
import { NTQQQzonePublicApi } from '@/napcat-core/apis/qzone-public';

const feed = {
  cell_common: { union_id: { uf_key: 'synthetic-public-feed', opaque: { preserve: true } }, domain_type: 3, feed_type: 1, cur_like_key: 'synthetic-feed-like' },
  cell_feed_transfer: { opaque: 'synthetic-transfer' },
  cell_user_info: { user: { uin: '20002', uid: 'u_author', nick: 'Synthetic author' } },
  cell_summary: { summary: [{ type: 0, content: 'Synthetic public feed' }] },
};
const comment = { id: 'synthetic-comment', user: { uin: '10001', uid: null, nick: 'Synthetic' }, like: { id: 'synthetic-comment-like' }, reply_attach_info: 'parent-reply-cursor' };
const reply = { id: 'synthetic-reply', user: { uin: '10001', uid: 'u_self', nick: 'Synthetic' }, like: { id: 'synthetic-reply-like' } };

function setup () {
  const user = { uin: '10001', uid: 'u_self', nick: 'Synthetic' };
  const userApi = {
    getSKey: vi.fn().mockResolvedValue('synthetic-skey'),
    getPSkey: vi.fn().mockResolvedValue({ domainPskeyMap: new Map([['qzone.qq.com', 'synthetic-pskey']]) }),
  };
  const core = { selfInfo: user, apis: { UserApi: userApi } } as unknown as NapCatCore;
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => new Response(JSON.stringify({
    retcode: 0, data: { like: true, upvote: true, comment: { id: 'new' }, reply: { id: 'new-reply' }, ret_code: 0 },
  })));
  vi.stubGlobal('fetch', fetchMock);
  return { api: new NTQQQzonePublicApi({} as InstanceContext, core), core, user, userApi, fetchMock };
}

function response (data: Record<string, unknown>) {
  return new Response(JSON.stringify({ retcode: 0, data }));
}

function requestBody (fetchMock: ReturnType<typeof setup>['fetchMock'], index = 0) {
  return JSON.parse(fetchMock.mock.calls[index]![1]!.body as string) as Record<string, unknown>;
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('public Qzone HTTP integration', () => {
  test('uses scoped native tickets and the fixed JSON gateway and metadata', async () => {
    const { api, userApi, fetchMock } = setup();
    await api.getCapabilities();
    expect(userApi.getPSkey).toHaveBeenCalledWith(['qzone.qq.com']);
    const [url, options] = fetchMock.mock.calls[0]!;
    expect(String(url)).toMatch(/^https:\/\/h5\.qzone\.qq\.com\/http2rpc\/gotrpc\/v1\/trpc\.public_qzone\.entrance_ctrl\.EntranceCtrl\/BatchEntranceWhitelist\?g_tk=\d+$/);
    expect(options).toMatchObject({ method: 'POST', redirect: 'error', signal: expect.any(AbortSignal) });
    const headers = options!.headers as Record<string, string>;
    expect(headers['x-web-qua']).toBe('V1_HT5_QZ_9.9.32_001_IDC_B');
    expect(JSON.parse(headers['x-oidb']!)).toEqual({ uint32_command: '0x9741', uint32_service_type: '0' });
    expect(headers['Cookie']).toContain('p_skey=synthetic-pskey');
    expect(requestBody(fetchMock)).toEqual({ uins: ['10001'], entrance_types: [1, 15] });
  });

  test('keeps page metadata and full identities and terminates only on has_more', async () => {
    const { api, fetchMock } = setup();
    fetchMock.mockResolvedValueOnce(response({ feeds: [{ feed }], has_more: true, attach_info: 'attach-one', bottom_title: { title: 'More' } }));
    const first = await api.getFeeds();
    expect(first).toMatchObject({ feeds: [feed], has_more: true, bottom_title: { title: 'More' } });
    expect(first.next_cursor).toBeTypeOf('string');
    const initial = requestBody(fetchMock);
    expect(initial['refresh_id']).toMatch(/^10001_\d+$/);
    expect(initial).not.toHaveProperty('attach_info');
    fetchMock.mockResolvedValueOnce(response({ feeds: [], has_more: false, attach_info: '', extra: true }));
    expect(await api.getFeeds(first.next_cursor!)).toEqual({ feeds: [], has_more: false, attach_info: '', extra: true, next_cursor: null });
    expect(requestBody(fetchMock, 1)).toEqual({ refresh_id: initial['refresh_id'], attach_info: 'attach-one', last_client_feed_union_id: feed.cell_common.union_id });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('an ad-only page retains the last non-ad full union object', async () => {
    const { api, fetchMock } = setup();
    fetchMock.mockResolvedValueOnce(response({ feeds: [{ feed }], has_more: true, attach_info: 'one' }));
    const first = await api.getFeeds();
    const ad = { cell_common: { feed_type: 3, union_id: { uf_key: 'ad' } } };
    fetchMock.mockResolvedValueOnce(response({ feeds: [{ feed: ad }], has_more: true, attach_info: 'two' }));
    const second = await api.getFeeds(first.next_cursor!);
    fetchMock.mockResolvedValueOnce(response({ feeds: [], has_more: false }));
    await api.getFeeds(second.next_cursor!);
    expect(requestBody(fetchMock, 2)['last_client_feed_union_id']).toEqual(feed.cell_common.union_id);
  });

  test.each([8193, 65536])('continues an issued cursor with %s characters of upstream attach_info', async (length) => {
    const { api, fetchMock } = setup();
    const attach = 'x'.repeat(length);
    fetchMock.mockResolvedValueOnce(response({ feeds: [{ feed }], has_more: true, attach_info: attach }));
    const first = await api.getFeeds();
    fetchMock.mockResolvedValueOnce(response({ feeds: [], has_more: false }));
    await api.getFeeds(first.next_cursor!);
    expect(requestBody(fetchMock, 1)['attach_info']).toBe(attach);
  });

  test('returned feed mutation cannot alter a stored continuation identity', async () => {
    const { api, fetchMock } = setup();
    fetchMock.mockResolvedValueOnce(response({ feeds: [{ feed: structuredClone(feed) }], has_more: true, attach_info: 'one' }));
    const first = await api.getFeeds();
    (first.feeds[0]!['cell_common'] as Record<string, unknown>)['union_id'] = { uf_key: 'changed-by-caller' };
    fetchMock.mockResolvedValueOnce(response({ feeds: [], has_more: false }));
    await api.getFeeds(first.next_cursor!);
    expect(requestBody(fetchMock, 1)['last_client_feed_union_id']).toEqual(feed.cell_common.union_id);
  });

  test('rejects cross-account and expired cursors before fetching', async () => {
    const { api, user, fetchMock } = setup();
    let now = 1700000000000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    fetchMock.mockResolvedValueOnce(response({ feeds: [{ feed }], has_more: true, attach_info: 'one' }));
    const first = await api.getFeeds();
    user.uid = 'other-session';
    await expect(api.getFeeds(first.next_cursor!)).rejects.toThrow('游标');
    user.uid = 'u_self';
    now += 10 * 60 * 1000 + 1;
    await expect(api.getFeeds(first.next_cursor!)).rejects.toThrow('游标');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('aborts before effects when the account switches while tickets are being read', async () => {
    const { api, user, userApi, fetchMock } = setup();
    userApi.getPSkey.mockImplementationOnce(async () => {
      user.uin = '30003';
      return { domainPskeyMap: new Map([['qzone.qq.com', 'synthetic-pskey']]) };
    });
    await expect(api.setUpvote(feed)).rejects.toThrow('切换');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('rejects malformed write input before ticket or network activity', async () => {
    const { api, userApi, fetchMock } = setup();
    await expect(api.addComment({}, 'text')).rejects.toThrow();
    expect(userApi.getSKey).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test.each([
    ['upvote', (api: NTQQQzonePublicApi) => api.setUpvote(feed), 'UFOComment/Upvote'],
    ['downvote', (api: NTQQQzonePublicApi) => api.setUpvote(feed, false), 'UFOComment/Downvote'],
    ['like', (api: NTQQQzonePublicApi) => api.setLike(feed), 'InteractionWriter/DoLike'],
    ['unlike', (api: NTQQQzonePublicApi) => api.setLike(feed, false), 'InteractionWriter/UnLike'],
    ['follow', (api: NTQQQzonePublicApi) => api.setFollow(feed), 'RelationService/Follow'],
    ['unfollow', (api: NTQQQzonePublicApi) => api.setFollow(feed, false), 'RelationService/Unfollow'],
    ['comment like', (api: NTQQQzonePublicApi) => api.setCommentLike(feed, comment), 'InteractionWriter/DoLike'],
    ['reply unlike', (api: NTQQQzonePublicApi) => api.setCommentLike(feed, comment, false, reply), 'InteractionWriter/UnLike'],
    ['comment', (api: NTQQQzonePublicApi) => api.addComment(feed, 'Comment'), 'InteractionWriter/AddComment'],
    ['reply', (api: NTQQQzonePublicApi) => api.addReply(feed, comment, 'Reply', reply), 'InteractionWriter/AddReply'],
    ['delete comment', (api: NTQQQzonePublicApi) => api.deleteComment(feed, comment), 'InteractionWriter/DeleteComment'],
    ['delete reply', (api: NTQQQzonePublicApi) => api.deleteReply(feed, comment, reply), 'InteractionWriter/DeleteReply'],
    ['forward', (api: NTQQQzonePublicApi) => api.forwardFeed(feed, 'Reason'), 'FeedsWriter/ForwardFeed'],
  ])('dispatches %s once using its own business route', async (_label, invoke, suffix) => {
    const { api, fetchMock } = setup();
    await invoke(api);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]![0])).toContain(`.${suffix}?`);
  });

  test('keeps reply cursor defaults and explicit page_size and raw null-UID parent', async () => {
    const { api, fetchMock } = setup();
    await api.getReplies(feed, comment, undefined, 7);
    expect(requestBody(fetchMock)).toMatchObject({ cur_comment: comment, reply_attach_info: 'parent-reply-cursor', page_size: 7 });
    await api.getReplies(feed, comment, '', 20);
    expect(requestBody(fetchMock, 1)).toMatchObject({ cur_comment: comment, reply_attach_info: 'parent-reply-cursor', page_size: 20 });
    expect(comment.user.uid).toBeNull();
  });

  test('does not retry or expose ticket values on HTTP, JSON or business failure', async () => {
    const { api, fetchMock } = setup();
    fetchMock.mockResolvedValueOnce(new Response('private ticket=synthetic-pskey', { status: 403 }));
    await expect(api.setLike(feed)).rejects.toThrow('勿自动重试');
    fetchMock.mockResolvedValueOnce(new Response('synthetic-pskey'));
    await expect(api.addComment(feed, 'Text')).rejects.toThrow('勿自动重试');
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ retcode: -1, message: 'synthetic-pskey' })));
    await expect(api.setFollow(feed)).rejects.not.toThrow('synthetic-pskey');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test('bounds response streams and cancels oversized bodies', async () => {
    const { api, fetchMock } = setup();
    const cancel = vi.fn();
    fetchMock.mockResolvedValueOnce(new Response(new ReadableStream({
      start (controller) { controller.enqueue(new Uint8Array(8 * 1024 * 1024 + 1)); },
      cancel,
    })));
    await expect(api.getCapabilities()).rejects.toThrow('请求失败');
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
