import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NTQQQzoneApi } from '@/napcat-core/apis/qzone';

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

function response (value: Record<string, unknown>): Response {
  return new Response(`_Callback(${JSON.stringify(value)});`, { status: 200 });
}

const ownDetail = { code: 0, tid: 'post-tid', uin: '10001', content: ' 原始正文\n ', ugc_right: 1 };

describe('Qzone profile, visibility and blacklist HTTP integration', () => {
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

  it.each([undefined, '20002'])('reads profile %s using the current account ticket without exposing other fields', async (target) => {
    const { api, core } = createApi();
    fetchMock.mockResolvedValueOnce(response({ code: 0, data: { spacename: '名称 & +', desc: '空间说明', private_field: 'secret' } }));

    await expect(api.getProfile(target)).resolves.toEqual({ name: '名称 & +', description: '空间说明' });

    const [rawUrl, options] = fetchMock.mock.calls[0]!;
    const url = new URL(String(rawUrl));
    expect(url.origin + url.pathname).toBe('https://h5.qzone.qq.com/proxy/domain/base.qzone.qq.com/cgi-bin/user/cgi_userinfo_get_all');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ uin: target ?? '10001', vuin: '10001', fupdate: '1', g_tk: '177685' });
    expect(options).toMatchObject({ method: 'GET', redirect: 'error', headers: { Cookie: 'uin=o10001; p_uin=o10001; skey=s; p_skey=p' } });
    expect(options?.body).toBeUndefined();
    expect(core.apis.UserApi.getPSkey).toHaveBeenCalledExactlyOnceWith(['qzone.qq.com']);
  });

  it('preserves empty profile values and rejects incomplete data', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ code: 0, data: { spacename: '', desc: '' } }));
    await expect(api.getProfile()).resolves.toEqual({ name: '', description: '' });
    fetchMock.mockResolvedValueOnce(response({ code: 0, data: { spacename: 'Name' } }));
    await expect(api.getProfile()).rejects.toThrow();
  });

  it.each([
    { patch: { name: '新空间 & +' }, bitmap: '2048', fields: { spacename: '新空间 & +' } },
    { patch: { description: '' }, bitmap: '4096', fields: { desc: '' } },
    { patch: { name: '', description: '第一行\r\n第二行' }, bitmap: '6144', fields: { spacename: '', desc: '第一行\n第二行' } },
  ])('updates only supplied profile fields (bitmap $bitmap)', async ({ patch, bitmap, fields }) => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ code: 0 }));

    await expect(api.setProfile(patch)).resolves.toBeUndefined();

    const [rawUrl, options] = fetchMock.mock.calls[0]!;
    expect(new URL(String(rawUrl)).pathname).toBe('/proxy/domain/w.qzone.qq.com/cgi-bin/user/cgi_apply_updateuserinfo_new');
    expect(options).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    expect(Object.fromEntries(new URLSearchParams(options?.body as string))).toEqual({ uin: '10001', pageindex: '3', fupdate: '1', mb: bitmap, ...fields });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid management arguments before acquiring tickets or making requests', async () => {
    const { api, core } = createApi();

    await expect(api.getProfile('invalid')).rejects.toThrow();
    await expect(api.setProfile({})).rejects.toThrow();
    await expect(api.setProfile({ name: [] } as never)).rejects.toThrow();
    await expect(api.setMsgRight('post-tid', 2)).rejects.toThrow();
    await expect(api.setMsgRight('post-tid', 16, [])).rejects.toThrow();
    await expect(api.setMsgRight('post-tid', 128, ['20002', 'bad'])).rejects.toThrow();
    await expect(api.setBan('bad')).rejects.toThrow();
    await expect(api.setBan('20002', 'false' as never)).rejects.toThrow();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(core.apis.UserApi.getSKey).not.toHaveBeenCalled();
  });

  it('reads the complete own post before changing visibility without changing content', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response(ownDetail)).mockResolvedValueOnce(response({ code: 0, subcode: 0, ugc_right: 16 }));

    await expect(api.setMsgRight('post-tid', 16, ['20002', '20002', '9007199254740993'])).resolves.toEqual({ ugc_right: 16 });

    const detailUrl = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(detailUrl.pathname).toBe('/proxy/domain/taotao.qq.com/cgi-bin/emotion_cgi_msgdetail_v6');
    expect(Object.fromEntries(detailUrl.searchParams)).toMatchObject({
      tid: 'post-tid', uin: '10001', not_trunc_con: '1', need_right: '1', not_adapt_outpic: '1',
    });
    expect(fetchMock.mock.calls[0]![1]?.method).toBe('GET');
    const [updateUrl, options] = fetchMock.mock.calls[1]!;
    expect(new URL(String(updateUrl)).pathname).toBe('/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_update');
    expect(options?.method).toBe('POST');
    const body = new URLSearchParams(options?.body as string);
    expect(body.get('con')).toBe(ownDetail.content);
    expect(body.get('tid')).toBe('post-tid');
    expect(body.get('hostuin')).toBe('10001');
    expect(body.get('ugc_right')).toBe('16');
    expect(body.get('allow_uins')).toBe('20002|9007199254740993');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([
    { ...ownDetail, tid: 'other-tid' },
    { ...ownDetail, uin: '20002' },
    { code: 0, tid: 'post-tid', content: 'no verified owner' },
    { ...ownDetail, richtype: 1, pic: [{ pic_id: 'unusable' }] },
    { ...ownDetail, richtype: 1, pic: [{ pic_id: 'X,   ,L', height: 100, width: 100 }] },
    { ...ownDetail, richtype: 1, pic: [{ pic_id: 'X,A,   ', height: 100, width: 100 }] },
    { ...ownDetail, video: [{ video_id: 'not-safe-to-rebuild' }] },
    { code: -3000, subcode: 0, private_message: 'secret' },
  ])('does not submit a destructive or unverified permission update (%j)', async (detail) => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response(detail));

    await expect(api.setMsgRight('post-tid', 64)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![1]?.method).toBe('GET');
  });

  it('prevents overlapping writes to the same post and releases the lock afterward', async () => {
    const { api } = createApi();
    let resolveDetail!: (value: Response) => void;
    fetchMock.mockImplementationOnce(() => new Promise(resolve => { resolveDetail = resolve; }));
    fetchMock.mockResolvedValueOnce(response({ code: 0 }));
    const first = api.setMsgRight('post-tid', 64);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await expect(api.setMsgRight('post-tid', 4)).rejects.toThrow('正在修改权限');
    resolveDetail(response(ownDetail));
    await expect(first).resolves.toEqual({ ugc_right: 64 });

    fetchMock.mockResolvedValueOnce(response(ownDetail)).mockResolvedValueOnce(response({ code: 0, ugc_right: '4' }));
    await expect(api.setMsgRight('post-tid', 4)).resolves.toEqual({ ugc_right: 4 });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('does not write after the active account changes while reading the post', async () => {
    const { api, core } = createApi();
    fetchMock.mockImplementationOnce(async () => {
      core.selfInfo.uin = '20002';
      core.selfInfo.uid = 'other-uid';
      return response(ownDetail);
    });

    await expect(api.setMsgRight('post-tid', 64)).rejects.toThrow('QQ账号已切换');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not report success when the server echoes a different visibility', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response(ownDetail)).mockResolvedValueOnce(response({ code: 0, ugc_right: 1 }));

    await expect(api.setMsgRight('post-tid', 64)).rejects.toThrow('返回权限与请求不一致');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not rewrite a post whose response contains malformed UTF-8 content', async () => {
    const { api } = createApi();
    const bytes = Buffer.concat([
      Buffer.from('{"code":0,"tid":"post-tid","uin":"10001","content":"'),
      Buffer.from([255]),
      Buffer.from('","ugc_right":1}'),
    ]);
    fetchMock.mockResolvedValueOnce(new Response(bytes));

    await expect(api.setMsgRight('post-tid', 64)).rejects.toThrow('QQ空间请求失败');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![1]?.method).toBe('GET');
  });

  it.each([{ enable: undefined, action: '1' }, { enable: true, action: '1' }, { enable: false, action: '2' }])('updates only the current account blacklist (enable=$enable)', async ({ enable, action }) => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(response({ code: 0, subcode: 0 }));

    await expect(api.setBan('9007199254740993', enable)).resolves.toBeUndefined();

    const [url, options] = fetchMock.mock.calls[0]!;
    expect(new URL(String(url)).pathname).toBe('/proxy/domain/w.qzone.qq.com/cgi-bin/right/cgi_black_action_new');
    expect(Object.fromEntries(new URLSearchParams(options?.body as string))).toEqual({
      uin: '10001', act_uin: '9007199254740993', action, fupdate: '1', qzreferrer: 'https://user.qzone.qq.com/10001/main',
    });
  });

  it.each([
    '{}',
    '_Callback({"code":0,"subcode":-1,"message":"private-response"});',
    '<html>private login page</html>',
    '_Callback({"code":0});window.privateSideEffect();',
  ])('rejects unconfirmed writes without exposing or executing a response (%s)', async (text) => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(new Response(text));
    let error: unknown;
    try {
      await api.setProfile({ name: 'Name' });
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(Error);
    expect(String(error)).not.toMatch(/private|window\./);
    expect(String(error)).toContain('勿自动重试');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('never replays an ambiguous write or follows a redirect with credentials', async () => {
    const { api } = createApi();
    fetchMock.mockResolvedValueOnce(new Response('private redirect', { status: 302 }));
    await expect(api.setBan('20002')).rejects.toThrow('未能确认结果');
    expect(fetchMock.mock.calls[0]![1]?.redirect).toBe('error');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
