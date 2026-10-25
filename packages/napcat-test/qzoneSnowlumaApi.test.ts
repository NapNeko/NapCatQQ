import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NTQQQzoneApi } from '@/napcat-core/apis/qzone';
import { NTQQWebApi } from '@/napcat-core/apis/webapi';
import { RequestUtil } from '@/napcat-common/src/request';

function createApi () {
  const core = {
    selfInfo: { uin: '10001', uid: 'self-uid', nick: '本人' },
    apis: {
      UserApi: {
        getSKey: vi.fn().mockResolvedValue('s'),
        getPSkey: vi.fn().mockResolvedValue({ result: 0, domainPskeyMap: new Map([['qzone.qq.com', 'p']]) }),
      },
    },
  };
  return { api: new NTQQQzoneApi({} as never, core as never), core };
}

function response (data: Record<string, unknown>): Response {
  return new Response(`_preloadCallback(${JSON.stringify(data)});`);
}

function feedPage (key: string, hasMore: boolean, state: Record<string, unknown> = {}): Record<string, unknown> {
  return { code: 0, data: { data: [{ uin: 20002, nickname: '好友', abstime: 1700000000, appid: 311, key, html: '' }], main: { hasMoreFeeds: hasMore, ...state } } };
}

describe('SnowLuma Qzone compatibility transport', () => {
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

  it('reads the requested legacy list offset/count and keeps a real total', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ code: 0, total: 100, msglist: [{ tid: 'post', content: '正文', created_time: 1700000000, cmtnum: 5, secret: 1 }] }));
    await expect(api.getSnowlumaMsgList('20002', 40, 10)).resolves.toMatchObject({
      total: 100, total_known: true, msglist: [{ tid: 'post', content: '正文', time: 1700000000, comment_num: 5, is_private: true, images: [] }],
    });
    const url = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(url.pathname).toBe('/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_msglist_v6');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ uin: '20002', pos: '40', num: '10', replynum: '100', g_tk: '177685' });
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ method: 'GET', redirect: 'error' });
  });

  it('uses the alternate fixed read route only for explicit code -10000', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ code: -10000 })).mockResolvedValueOnce(response({ code: 0, total: 0, msglist: [] }));
    await expect(api.getSnowlumaMsgList()).resolves.toMatchObject({ total: 0, msglist: [] });
    const [url, options] = fetchMock.mock.calls[1]!;
    expect(new URL(String(url)).origin).toBe('https://user.qzone.qq.com');
    expect(new URL(String(url)).pathname).toBe('/proxy/domain/taotao.qq.com/cgi-bin/emotion_cgi_msglist_v6');
    expect(options?.headers).toMatchObject({ Referer: 'https://user.qzone.qq.com/10001' });
    fetchMock.mockResolvedValueOnce(response({ code: -3000 }));
    await expect(api.getSnowlumaMsgList()).rejects.toThrow('-3000');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('reads a tid and one flat comment page without synthesizing a modern feed reference', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ code: 0, tid: 'post', content: '正文', cmtnum: 90, commentlist: [{ tid: 0, uin: 20002, name: '甲', create_time: 1700000000, content: '评论', list_3: [{ tid: 1, uin: 20003, name: '乙', create_time: 1700000001, content: '回复' }] }] }));
    const page = await api.getSnowlumaMsgDetail('post', '20002', 20, 5);
    expect(page).toMatchObject({ tid: 'post', comment_num: 90, comments: [{ comment_id: '0', replies: [{ comment_id: '1', parent_comment_id: '0', parent_comment_uin: 20002 }] }] });
    const url = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ tid: 'post', uin: '20002', pos: '20', num: '5', not_trunc_con: '1' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid identities and pagination before ticket acquisition', async () => {
    const { api, core } = createApi();
    await expect(api.getSnowlumaMsgList('bad')).rejects.toThrow();
    await expect(api.getSnowlumaMsgList(undefined, -1)).rejects.toThrow();
    await expect(api.getSnowlumaMsgDetail('post', undefined, 0, 101)).rejects.toThrow();
    await expect(api.getSnowlumaFeeds(21)).rejects.toThrow('预算');
    await expect(api.getSnowlumaFeeds(1, 51)).rejects.toThrow();
    await expect(api.uploadCommentImage('not base64')).rejects.toThrow();
    expect(core.apis.UserApi.getSKey).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts each tid-based like/unlike exactly once with owner and timestamp', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ code: 0 })).mockResolvedValueOnce(response({ code: 0 }));
    await api.setSnowlumaLike('post', '20002', true, 1700000000);
    await api.setSnowlumaLike('post', '20002', false, 1700000000);
    expect(new URL(String(fetchMock.mock.calls[0]![0])).pathname).toContain('internal_dolike_app');
    expect(new URL(String(fetchMock.mock.calls[1]![0])).pathname).toContain('internal_unlike_app');
    expect(Object.fromEntries(new URLSearchParams(fetchMock.mock.calls[0]![1]?.body as string))).toMatchObject({
      opuin: '10001', fid: 'post', abstime: '1700000000', unikey: 'http://user.qzone.qq.com/20002/mood/post',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('uploads a comment image using native tickets and the returned real URL', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(new Response('frameElement.callback({"code":0,"data":{"url":"https://photo.example/image?a=1&b=2"}});</script>'));
    await expect(api.uploadCommentImage('aGVsbG8=')).resolves.toEqual({ url: 'https://photo.example/image?a=1&b=2' });
    const [url, options] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe('https://up.qzone.qq.com/cgi-bin/upload/cgi_upload_image?g_tk=177685');
    expect(options).toMatchObject({ method: 'POST', redirect: 'error' });
    expect(new URLSearchParams(options?.body as string).get('picfile')).toBe('aGVsbG8=');
    fetchMock.mockResolvedValueOnce(response({ code: 0, data: { url: 'javascript:private()' } }));
    await expect(api.uploadCommentImage('aGVsbG8=')).rejects.toThrow('图片地址无效');
    for (const url of [' https://photo.example/a ', 'https://photo.example/a' + String.fromCharCode(0)]) {
      fetchMock.mockResolvedValueOnce(response({ code: 0, data: { url } }));
      await expect(api.uploadCommentImage('aGVsbG8=')).rejects.toThrow('可用图片地址');
    }
  });

  it('accepts the observed FormSender upload envelope with ret acknowledgement and rejects conflicting codes', async () => {
    const { api } = createApi();
    const html = (body: Record<string, unknown>) => '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/></head><body><script type="text/javascript">document.domain="h5.qzone.qq.com";frameElement.callback(' + JSON.stringify(body) + ');</script></body></html>';
    fetchMock.mockResolvedValueOnce(new Response(html({ ret: 0, data: { url: 'https://photo.example/test.png' } })));
    await expect(api.uploadCommentImage('aGVsbG8=')).resolves.toEqual({ url: 'https://photo.example/test.png' });
    fetchMock.mockResolvedValueOnce(new Response(html({ ret: 0, code: -1, data: { url: 'https://photo.example/test.png' } })));
    await expect(api.uploadCommentImage('aGVsbG8=')).rejects.toThrow('勿自动重试');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('posts image comments with URLs and preserves the real parent for replies', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ code: 0, commentid: 0 }));
    await expect(api.commentSnowluma('post', '图片', '20002', { imageUrls: ['https://photo.example/a'] })).resolves.toEqual({ comment_id: '0' });
    const commentBody = new URLSearchParams(fetchMock.mock.calls[0]![1]?.body as string);
    expect(Object.fromEntries(commentBody)).toMatchObject({ hostUin: '20002', uin: '10001', topicId: '20002_post__1', richtype: '1', richval: 'https://photo.example/a' });
    fetchMock.mockResolvedValueOnce(response({ code: 0, data: { id: 'new-reply' } }));
    await expect(api.commentSnowluma('post', '回复', '20002', { comment_id: '0', comment_uin: '20003', reply_uin: '20004', reply_name: '丙' })).resolves.toEqual({ comment_id: 'new-reply', parent_comment_id: '0', parent_comment_uin: 20003 });
    const replyBody = new URLSearchParams(fetchMock.mock.calls[1]![1]?.body as string);
    expect(Object.fromEntries(replyBody)).toMatchObject({ uin: '10001', hostUin: '20002', commentId: '0', commentUin: '20003' });
    expect(replyBody.get('content')).toContain('20004');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never replays an uncertain write and rejects image replies before network IO', async () => {
    const { api } = createApi();
    await expect(api.commentSnowluma('post', '回复', '20002', { comment_id: '0', comment_uin: '20003', imageUrls: ['https://photo.example/a'] })).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockRejectedValueOnce(new Error('private transport detail'));
    await expect(api.commentSnowluma('post', '正文')).rejects.toThrow('勿自动重试');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('stops the existing image publisher if the account changes during either native ticket lookup', async () => {
    const request = vi.spyOn(RequestUtil, 'HttpGetText').mockRejectedValue(new Error('unexpected network request'));
    for (const stage of ['skey', 'pskey']) {
      const { core } = createApi();
      const web = new NTQQWebApi({} as never, core as never);
      if (stage === 'skey') {
        core.apis.UserApi.getSKey.mockImplementationOnce(async () => { core.selfInfo.uid = 'switched'; return 's'; });
      } else {
        core.apis.UserApi.getPSkey.mockImplementationOnce(async () => {
          core.selfInfo.uid = 'switched';
          return { result: 0, domainPskeyMap: new Map([['qzone.qq.com', 'p']]) };
        });
      }
      await expect(web.uploadImageToQzone('aGVsbG8=')).rejects.toThrow('QQ账号已切换');
    }
    expect(request).not.toHaveBeenCalled();
  });

  it('gets HTML feeds with bounded opaque continuation and actual server state', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response(feedPage('first', true, { pagenum: '2', begintime: '123', aisortNextTime: '456', externparam: 'opaque' })));
    fetchMock.mockResolvedValueOnce(response(feedPage('second', false)));
    const first = await api.getSnowlumaFeeds();
    expect(first.next_cursor).toMatch(/^slqf:/);
    expect(first.feeds[0]?.key).toBe('first');
    const next = await api.getSnowlumaFeeds(1, 5, first.next_cursor!);
    expect(next.feeds[0]?.key).toBe('second');
    expect(next.next_cursor).toBeNull();
    const url = new URL(String(fetchMock.mock.calls[1]![0]));
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ count: '5', pagenum: '2', begintime: '123', getAisort: '456', externparam: 'opaque', outputhtmlfeed: '1' });
    expect(url.searchParams.has('aisortNextTime')).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('walks server continuations for explicit page numbers and stops at the actual end', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response(feedPage('skip', true, { pagenum: '2' }))).mockResolvedValueOnce(response(feedPage('wanted', false)));
    const page = await api.getSnowlumaFeeds(2);
    expect(page.feeds.map(item => item.key)).toEqual(['wanted']);
    fetchMock.mockResolvedValueOnce(response(feedPage('last', false)));
    await expect(api.getSnowlumaFeeds(3)).resolves.toEqual({ feeds: [], has_more: false, next_cursor: null });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('binds feed cursors to account, page, lifetime and prevents clock-only continuation', async () => {
    const { api, core } = createApi();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(1000);
    fetchMock.mockResolvedValueOnce(response(feedPage('first', true, { pagenum: '2' })));
    const first = await api.getSnowlumaFeeds();
    await expect(api.getSnowlumaFeeds(3, 10, first.next_cursor!)).rejects.toThrow('不匹配');
    core.selfInfo.uid = 'other-account';
    await expect(api.getSnowlumaFeeds(1, 10, first.next_cursor!)).rejects.toThrow('游标');
    core.selfInfo.uid = 'self-uid';
    clock.mockReturnValue(601000);
    await expect(api.getSnowlumaFeeds(1, 10, first.next_cursor!)).rejects.toThrow('已过期');
    clock.mockReturnValue(1000);
    fetchMock.mockResolvedValueOnce(response(feedPage('stuck', true, { icServerTime: '999' })));
    await expect(api.getSnowlumaFeeds()).rejects.toThrow('未推进');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('enforces a shared 45-second read budget while skipping feed pages', async () => {
    const { api } = createApi();
    let now = 1000;
    let pages = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    fetchMock.mockImplementation(async () => {
      now += 16000;
      return response(feedPage('page', true, { pagenum: String(++pages + 1) }));
    });
    await expect(api.getSnowlumaFeeds(4)).rejects.toThrow('预算');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
