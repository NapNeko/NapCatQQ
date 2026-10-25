import { describe, expect, it } from 'vitest';
import {
  advanceSlQzoneFeedState,
  initialSlQzoneFeedState,
  parseSlQzoneFeeds,
  slQzoneFeedPosition,
  type SlQzoneFeedState,
} from '@/napcat-core/data/qzone-snowluma-feeds';

// All payloads here are newly synthesized protocol data, not reference-project fixtures.
function packet (items: unknown[], main: Record<string, unknown> = { hasMoreFeeds: false }): string {
  return `_preloadCallback(${JSON.stringify({ code: 0, subcode: 0, data: { main, data: items } })});`;
}

function post (html: string, extra: Record<string, unknown> = {}) {
  return { uin: '330003', nickname: '林', abstime: '1800000123', appid: '311', key: 'entry-nine', html, ...extra };
}

function ownHtml (body: string, footer = ''): string {
  return `<article class="f-single"><div class="user-pto"><img src="https://example.test/portrait.png"></div><div class="f-item" data-key="entry-nine"><input name="feed_data" data-uin="330003" data-fkey="entry-nine" data-tid="tid-nine">${body}</div>${footer}</article>`;
}

describe('independent SL feed data-literal parsing', () => {
  it('accepts the required JS data subset without evaluating it', () => {
    const input = '_preloadCallback({code:0,subcode:0,data:{main:{hasMoreFeeds:false},data:[undefined,,{uin:\'330003\',nickname:\'云\\u2601\',abstime:1800000123,appid:\'311\',key:\'entry-nine\',html:\'\\x3Cdiv class="f-item" data-key="entry-nine"\\x3E\\x3Cdiv class="f-info"\\x3E文字 undefined, } )\\x3C/div\\x3E\\x3C/div\\x3E\',},],},});';
    const result = parseSlQzoneFeeds(input);
    expect(result.has_more).toBe(false);
    expect(result.feeds).toHaveLength(1);
    expect(result.feeds[0]).toMatchObject({ uin: 330003, nickname: '云☁', time: 1800000123, appid: 311, content: '文字 undefined, } )', content_complete: true });
    expect(result.feeds[0]?.html).toContain('<div');
  });

  it('accepts JSON and recognized complete wrappers, including comments inside data only', () => {
    const data = { code: 0, data: { data: [], hasmore: '0' } };
    for (const text of [JSON.stringify(data), `_Callback(${JSON.stringify(data)})`, `callback(${JSON.stringify(data)});`, '{/* data-only */code:0,data:{main:{hasMoreFeeds:false},data:[],},}']) {
      expect(parseSlQzoneFeeds(text)).toMatchObject({ feeds: [], has_more: false });
    }
  });

  it('does not interpret undefined in strings or as a property name', () => {
    const result = parseSlQzoneFeeds('{code:0,data:{main:{hasMoreFeeds:false,undefined:\'ordinary key\',externparam:undefined},data:[{uin:330003,appid:311,key:\'entry-nine\',html:\'undefined\',nickname:\'undefined\',abstime:0}]}}');
    expect(result.feeds[0]?.nickname).toBe('undefined');
    expect(result.feeds[0]?.html).toBe('undefined');
    expect(result.main?.['undefined']).toBe('ordinary key');
    expect(result.main).not.toHaveProperty('externparam');
    expect(advanceSlQzoneFeedState({ ...initialSlQzoneFeedState(), externparam: 'retained' }, result.main!).externparam).toBe('retained');
  });

  it.each([
    '_preloadCallback({code:0,data:{main:{hasMoreFeeds:false},data:[]}});danger();',
    'danger();_preloadCallback({code:0,data:{main:{hasMoreFeeds:false},data:[]}});',
    'unknownCallback({code:0,data:{main:{hasMoreFeeds:false},data:[]}});',
    '<script>_preloadCallback({code:0,data:{main:{hasMoreFeeds:false},data:[]}});</script>',
    '{code:0,data:(function(){throw new Error("private");})()}',
    '{code:0,data:{get main(){return {hasMoreFeeds:false}},data:[]}}',
    '{code:0,data:{main:{hasMoreFeeds:false},data:[],x:new Date()}}',
    '{code:0,data:{main:{hasMoreFeeds:false},data:[],x:Infinity}}',
    '{code:0,data:{main:{hasMoreFeeds:false},data:[],x:NaN}}',
    '{code:0,data:{main:{hasMoreFeeds:false},data:[],"__proto__":{"polluted":true}}}',
    '{code:0,data:{main:{hasMoreFeeds:false},data:[],"constr\\u0075ctor":{}}}',
    '{code:0,data:{main:{hasMoreFeeds:false},data:[],x:/regex/}}',
  ])('rejects executable or unsupported bodies without echoing their text (%#)', (text) => {
    let error: unknown;
    try {
      parseSlQzoneFeeds(text);
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(Error);
    expect(String(error)).not.toMatch(/private|danger|polluted|function/);
    expect(({} as { polluted?: boolean; }).polluted).toBeUndefined();
  });

  it('requires explicit numeric success and a recognizable page structure', () => {
    for (const body of [
      {}, { code: '0', data: { data: [], hasmore: 0 } }, { code: 0, subcode: -1 },
      { code: -7, subcode: 0 }, { code: 0, subcode: '0' },
      { code: 0, data: {} }, { code: 0, data: { data: [] } },
      { code: 0, data: { data: [], main: null } },
      { code: 0, data: { data: [], main: { hasMoreFeeds: 'false' } } },
      { code: 0, data: { data: [], main: { hasMoreFeeds: false, error: 'private failure' } } },
      { code: 0, data: { data: [], hasmore: true } },
    ]) expect(() => parseSlQzoneFeeds(JSON.stringify(body))).toThrow();
  });

  it('rejects duplicate root success keys even when quoted or escaped, without rejecting ordinary unknown duplicates', () => {
    const data = 'data:{main:{hasMoreFeeds:false},data:[]}';
    for (const keys of [
      'code:-1,code:0',
      'code:-1,"code":0',
      '"co\\u0064e":-1,code:0',
      'co\\u0064e:-1,code:0',
      'code:0,subcode:-9,"sub\\u0063ode":0',
      'code:0,subcode:0,subcode:0',
    ]) expect(() => parseSlQzoneFeeds(`_preloadCallback({${keys},${data}});`)).toThrow();
    expect(parseSlQzoneFeeds('{code:0,message:\'old\',message:\'new\',data:{main:{hasMoreFeeds:false,code:-9,code:0},data:[]}}').feeds).toEqual([]);
  });

  it('uses main.hasMoreFeeds before the legacy fallback and keeps the raw main state', () => {
    const main = { hasMoreFeeds: '1', pagenum: '7', externparam: 'sort=chronological&opaque=a%26b', icServerTime: '1800001000' };
    const result = parseSlQzoneFeeds(packet([], main));
    expect(result).toEqual({ feeds: [], has_more: true, main });
    expect(() => parseSlQzoneFeeds(JSON.stringify({ code: 0, data: { main: {}, hasmore: 0, data: [] } }))).toThrow('结束标志');
  });

  it('bounds input and nesting before passing data to JSON5', () => {
    expect(() => parseSlQzoneFeeds(' '.repeat(8 * 1024 * 1024 + 1))).toThrow('过大');
    expect(() => parseSlQzoneFeeds(`{code:0,data:${'['.repeat(66)}0${']'.repeat(66)}}`)).toThrow();
    expect(() => parseSlQzoneFeeds('{code:0,data:{main:{hasMoreFeeds:false},data:[/* never closed')).toThrow();
    expect(() => parseSlQzoneFeeds('{code:0,data:{main:{hasMoreFeeds:false},data:["unterminated]}}')).toThrow();
  });

  it('rejects malformed real entries rather than dropping them along with padding', () => {
    for (const item of [12, 'bad', [], post('', { uin: 'not-a-number' }), post('', { abstime: Number.MAX_SAFE_INTEGER + 1 }), post('', { html: {} }), post('', { key: {} })]) {
      expect(() => parseSlQzoneFeeds(packet([null, item]))).toThrow();
    }
    expect(parseSlQzoneFeeds(packet([null, null])).feeds).toEqual([]);
  });
});

describe('independent passive HTML feed projection', () => {
  it('extracts own text, matching tid, original images and explicit counters while retaining HTML exactly', () => {
    const html = ownHtml('<div class="f-info">测试 &amp; 文字<br>第二行<img alt="[云]" src="https://example.test/face.gif"></div><a class="img-item" data-originurl="//cdn.example.test/full.webp?a=1&amp;b=2"><img src="https://example.test/thumb.webp"></a>', '<div class="f-single-foot"><a class="qz_like_btn_v3" data-likecnt="17">赞</a></div>');
    const feed = parseSlQzoneFeeds(packet([post(html, { commentcnt: '6' })])).feeds[0]!;
    expect(feed).toEqual({
      uin: 330003,
      nickname: '林',
      time: 1800000123,
      appid: 311,
      key: 'entry-nine',
      html,
      tid: 'tid-nine',
      content: '测试 & 文字\n第二行[云]',
      content_complete: true,
      images: ['https://cdn.example.test/full.webp?a=1&b=2'],
      like_count: 17,
      comment_count: 6,
    });
  });

  it('distinguishes truncated text from hidden complete text without including expand controls', () => {
    const partial = ownHtml('<div class="f-info">短内容<a data-cmd="qz_toggle">阅读全文</a></div>');
    expect(parseSlQzoneFeeds(packet([post(partial)])).feeds[0]).toMatchObject({ content: '短内容', content_complete: false });
    const full = ownHtml('<div class="f-info">短内容<a data-cmd="qz_toggle">展开</a></div><div class="f-info qz_info_complete" style="display:none">完整内容<p>下一段</p><a data-cmd="qz_toggle">收起</a></div>');
    expect(parseSlQzoneFeeds(packet([post(full)])).feeds[0]).toMatchObject({ content: '完整内容\n下一段', content_complete: true });
  });

  it('keeps avatars, comments, repost bodies, scripts and video covers out of the original post', () => {
    const html = ownHtml(`<div class="f-info">原帖<script>dangerous()</script></div>
      <div class="mod-comments"><div class="f-info">评论内容</div><a class="img-item"><img src="https://example.test/comment.png"></a><a class="qz_like_btn_v3" data-likecnt="9999"></a></div>
      <div class="f-item-passive"><div class="f-info">转发正文</div><a class="img-item"><img src="https://example.test/repost.png"></a></div>
      <div class="f-ct-video"><a class="img-item"><img src="https://example.test/video-cover.png"></a></div>
      <a class="img-item" data-v_itemid="v"><img src="https://example.test/another-cover.png"></a>
      <a class="img-item"><img truesrc="https://example.test/photo.png" src="https://example.test/loading.png"></a>`);
    const feed = parseSlQzoneFeeds(packet([post(html)])).feeds[0]!;
    expect(feed.content).toBe('原帖');
    expect(feed.images).toEqual(['https://example.test/photo.png']);
    expect(feed.like_count).toBeNull();
  });

  it('does not derive a mood tid from a feed key, another author or a non-mood app', () => {
    const mismatched = ownHtml('<div class="f-info">文字</div>').replace('data-uin="330003"', 'data-uin="440004"');
    expect(parseSlQzoneFeeds(packet([post(mismatched)])).feeds[0]?.tid).toBeNull();
    expect(parseSlQzoneFeeds(packet([post(ownHtml('<div class="f-info">相册说明</div>'), { appid: 4 })])).feeds[0]?.tid).toBeNull();
    const absent = parseSlQzoneFeeds(packet([post('<div class="unrecognized">没有可确认的正文</div>')])).feeds[0]!;
    expect(absent).toMatchObject({ tid: null, content: null, content_complete: null, images: null, like_count: null, comment_count: null });
  });

  it('handles normal void tags/entities and deduplicates images without accepting unsafe URLs', () => {
    const html = ownHtml('<div class="f-info"><p>段落一&nbsp;文字</p><p>段落二</p></div><a class="img-item" data-url3="https://example.test/a.png"><img src="https://example.test/ignored.png"></a><a class="img-item"><img src="https://example.test/a.png"></a><a class="img-item" data-originurl="javascript:alert(1)"><img src="data:image/png;base64,AAAA"></a>');
    const feed = parseSlQzoneFeeds(packet([post(html, { likecnt: '4', commentcnt: 0 })])).feeds[0]!;
    expect(feed.content).toBe('段落一 文字\n\n段落二');
    expect(feed.images).toEqual(['https://example.test/a.png']);
    expect(feed.like_count).toBe(4);
    expect(feed.comment_count).toBe(0);
  });

  it('declines ambiguous content roots and bounds excessive HTML structure', () => {
    const duplicate = '<div class="f-item" data-key="entry-nine"><div class="f-info">A</div></div><div class="f-item" data-key="entry-nine"><div class="f-info">B</div></div>';
    expect(parseSlQzoneFeeds(packet([post(duplicate)])).feeds[0]?.content).toBeNull();
    expect(() => parseSlQzoneFeeds(packet([post(`<div>${'<span>'.repeat(70)}deep${'</span>'.repeat(70)}</div>`)]))).toThrow('HTML');
    expect(() => parseSlQzoneFeeds(packet([post('x'.repeat(2 * 1024 * 1024 + 1))]))).toThrow('HTML过大');
  });
});

describe('SL feed server state helpers', () => {
  it('uses explicit initial fields and updates only values actually supplied by the server', () => {
    const first = initialSlQzoneFeedState();
    expect(first).toEqual({ begintime: '0', dayspac: '0', pagenum: '1', aisortEndTime: '0', aisortOffset: '0', aisortBeginTime: '0', aisortNextTime: '0', icServerTime: '0', externparam: '', daylist: '', uinlist: '' });
    const next = advanceSlQzoneFeedState(first, { pagenum: '0007', begintime: '1800000000', aisortNextTime: 3, externparam: 'opaque=%26&sort=x', daylist: 'day-a', uinlist: '330003', ignored: 'never put into query state' });
    expect(next).toMatchObject({ pagenum: '7', begintime: '1800000000', aisortNextTime: '3', externparam: 'opaque=%26&sort=x', daylist: 'day-a', uinlist: '330003' });
    expect(first.pagenum).toBe('1');
    const partial = advanceSlQzoneFeedState(next, { externparam: '', daylist: '', uinlist: '', aisortOffset: '8' });
    expect(partial).toMatchObject({ pagenum: '7', externparam: next.externparam, daylist: 'day-a', uinlist: '', aisortOffset: '8' });
    expect(partial).not.toHaveProperty('ignored');
  });

  it('does not count clock-only changes or property order as pagination progress', () => {
    const state = advanceSlQzoneFeedState(initialSlQzoneFeedState(), { externparam: 'p=2', pagenum: '2' });
    const changedClock = advanceSlQzoneFeedState(state, { icServerTime: '1800000123' });
    expect(slQzoneFeedPosition(changedClock)).toBe(slQzoneFeedPosition(state));
    const reordered = Object.fromEntries(Object.entries(state).reverse()) as unknown as SlQzoneFeedState;
    expect(slQzoneFeedPosition(reordered)).toBe(slQzoneFeedPosition(state));
    expect(slQzoneFeedPosition(advanceSlQzoneFeedState(state, { externparam: 'p=3' }))).not.toBe(slQzoneFeedPosition(state));
  });

  it('preserves large digit strings without rounding and rejects unsafe numeric or oversized state', () => {
    expect(advanceSlQzoneFeedState(initialSlQzoneFeedState(), { icServerTime: '9007199254740993' }).icServerTime).toBe('9007199254740993');
    for (const update of [{ pagenum: 0 }, { pagenum: '-2' }, { dayspac: 1.5 }, { begintime: Number.MAX_SAFE_INTEGER + 1 }, { externparam: {} }, { daylist: 'x'.repeat(32769) }]) {
      expect(() => advanceSlQzoneFeedState(initialSlQzoneFeedState(), update)).toThrow();
    }
  });
});
