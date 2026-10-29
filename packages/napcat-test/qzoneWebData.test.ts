import { describe, expect, test } from 'vitest';
import {
  buildQzoneBanBody,
  buildQzoneProfileBody,
  buildQzoneRightBody,
  normalizeQzoneRight,
  parseQzoneProfile,
  parseQzoneWebResponse,
} from '@/napcat-core/data/qzone-web';

describe('Qzone management response parsing', () => {
  test.each([
    '{"code":0,"subcode":0,"data":{"field":"raw"}}',
    '_Callback({"code":0,"subcode":0,"data":{"field":"raw"}});',
    'callback({"code":0,"subcode":0,"data":{"field":"raw"}})',
    '_preloadCallback({"code":0,"subcode":0,"data":{"field":"raw"}});',
    'back({"code":0,"subcode":0,"data":{"field":"raw"}});',
    'frameElement.callback({"code":0,"subcode":0,"data":{"field":"raw"}});',
    '<script>frameElement.callback({"code":0,"subcode":0,"data":{"field":"raw"}});</script>',
  ])('parses only an inert known response envelope (%s)', (text) => {
    expect(parseQzoneWebResponse(text, true)).toEqual({ code: 0, subcode: 0, data: { field: 'raw' } });
  });

  test('repairs observed name string fragments without treating a name alone as success', () => {
    expect(parseQzoneWebResponse('frameElement.callback({"code":0,"subcode":0,"data":{name:"Ack"}});'))
      .toEqual({ code: 0, subcode: 0, data: { name: 'Ack' } });
    expect(() => parseQzoneWebResponse('frameElement.callback({name:"Ack"});')).toThrow('成功状态');
    expect(parseQzoneWebResponse('callback({"code":0,"data":{name:"Other"}});'))
      .toEqual({ code: 0, data: { name: 'Other' } });
    expect(parseQzoneWebResponse('frameElement.callback({name:"Ack","code":0,"subcode":0});'))
      .toEqual({ name: 'Ack', code: 0, subcode: 0 });
    expect(parseQzoneWebResponse('frameElement.callback({"code":0,"data":{name:"Ack","extra":true}});'))
      .toEqual({ code: 0, data: { name: 'Ack', extra: true } });
    expect(parseQzoneWebResponse('frameElement.callback({name:"Other","code":0});'))
      .toEqual({ name: 'Other', code: 0 });
  });

  test.each([
    '{}',
    'null',
    '[]',
    '{"code":"0"}',
    '{"code":0,"subcode":null}',
    '{"code":-1,"subcode":0}',
    '{"code":0,"subcode":-1}',
    '{"code":0,"retcode":-1}',
    '{"code":-1,"code":0}',
    '{"code":-1,"\\u0063ode":0}',
    'unknownCallback({"code":0});',
    'alert("prefix");callback({"code":0});',
    'callback({"code":0});alert("suffix");',
    '<html><script>callback({"code":0});</script></html>',
    '<html>login</html>',
    '<script>{"code":0}</script>',
    '<script>alert("prefix");callback({"code":0});</script>',
  ])('rejects ambiguous, failed or executable wrappers (%s)', (text) => {
    expect(() => parseQzoneWebResponse(text)).toThrow();
  });

  test('requires explicit code=0 for profile routes and never exposes private response text', () => {
    expect(parseQzoneWebResponse('{"subcode":0}')).toEqual({ subcode: 0 });
    expect(() => parseQzoneWebResponse('{"subcode":0}', true)).toThrow('成功状态');
    let error: unknown;
    try {
      parseQzoneWebResponse('{"code":-3000,"message":"p_skey=private-secret"}');
    } catch (value) {
      error = value;
    }
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('QQ空间接口拒绝请求 (code=-3000)');
    expect((error as Error).message).not.toContain('private-secret');
  });

  test('preserves exact profile text and does not invent missing fields', () => {
    expect(parseQzoneProfile({ code: 0, data: { spacename: '', desc: '  第一行\n第二行  ', signature: 'not-returned' } }))
      .toEqual({ name: '', description: '  第一行\n第二行  ' });
    for (const response of [{}, { code: 0 }, { code: 0, data: {} }, { code: 0, data: { spacename: 1, desc: '' } }]) {
      expect(() => parseQzoneProfile(response)).toThrow();
    }
  });
});

describe('Qzone profile and blacklist form bodies', () => {
  test.each([
    { profile: { name: '名称 & +' }, fields: { spacename: '名称 & +' }, bitmap: '2048' },
    { profile: { description: '' }, fields: { desc: '' }, bitmap: '4096' },
    { profile: { name: '', description: '一\r\n二\r' }, fields: { spacename: '', desc: '一\n二' }, bitmap: '6144' },
  ])('only submits supplied profile fields (%j)', ({ profile, fields, bitmap }) => {
    const body = new URLSearchParams(buildQzoneProfileBody('10001', profile));
    expect(Object.fromEntries(body)).toEqual({ uin: '10001', pageindex: '3', fupdate: '1', mb: bitmap, ...fields });
    expect(body.has('signature')).toBe(false);
  });

  test('rejects invalid profile input and preserves omitted fields', () => {
    expect(() => buildQzoneProfileBody('10001', {})).toThrow();
    expect(() => buildQzoneProfileBody('10001', { name: undefined })).toThrow();
    expect(() => buildQzoneProfileBody('10001', { name: 'x'.repeat(8193) })).toThrow();
    expect(() => buildQzoneProfileBody('10001', { name: 42 } as never)).toThrow();
    expect(() => buildQzoneProfileBody('10001', { description: null } as never)).toThrow();
    expect(() => buildQzoneProfileBody('invalid', { name: 'space' })).toThrow();
    expect(() => buildQzoneProfileBody('10001', { signature: 'not-a-supported-field' } as never)).toThrow();
    expect(new URLSearchParams(buildQzoneProfileBody('10001', { name: 'space' })).has('desc')).toBe(false);
  });

  test('builds ban and unban independently with an exact decimal target', () => {
    for (const enable of [true, false]) {
      expect(Object.fromEntries(new URLSearchParams(buildQzoneBanBody('10001', '9007199254740993', enable)))).toEqual({
        uin: '10001', act_uin: '9007199254740993', action: enable ? '1' : '2', fupdate: '1', qzreferrer: 'https://user.qzone.qq.com/10001/main',
      });
    }
    expect(() => buildQzoneBanBody('10001', 'bad', true)).toThrow();
    expect(() => buildQzoneBanBody('10001', '10002', 'false' as never)).toThrow();
  });
});

function detail (overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { code: 0, subcode: 0, tid: 'T1', uin: '10001', content: ' original\ntext ', ...overrides };
}

function observedEmptyForwardFields (): Record<string, unknown> {
  return { rt_tid: '', rt_uin: 0, rt_con: { conlist: null, content: '' }, rt_source: 0 };
}

describe('Qzone permission update preflight', () => {
  test('validates rights and all target IDs without lossy conversion or silent omission', () => {
    expect(normalizeQzoneRight(16, ['10002', '10002', '9007199254740993']))
      .toEqual({ right: 16, targetUins: ['10002', '9007199254740993'] });
    for (const right of [0, 2, 3, 5, 256, NaN, Infinity]) expect(() => normalizeQzoneRight(right)).toThrow();
    expect(() => normalizeQzoneRight(16)).toThrow('target_uins');
    expect(() => normalizeQzoneRight(128, [])).toThrow('target_uins');
    expect(() => normalizeQzoneRight(128, ['10002', 'bad'])).toThrow();
    expect(() => normalizeQzoneRight(1, [10002] as never)).toThrow();
  });

  test('rebuilds pure text with exact content, ownership, defaults and selective visibility', () => {
    const body = new URLSearchParams(buildQzoneRightBody(detail(), '10001', 'T1', 128, ['10002', '10002']));
    expect(Object.fromEntries(body)).toEqual({
      syn_tweet_verson: '1',
      tid: 'T1',
      paramstr: '1',
      pic_template: '',
      richtype: '',
      richval: '',
      special_url: '',
      subrichtype: '',
      pic_bo: '',
      con: ' original\ntext ',
      feedversion: '1',
      ver: '1',
      ugc_right: '128',
      to_sign: '0',
      ugcright_id: 'T1',
      hostuin: '10001',
      code_version: '1',
      format: 'fs',
      qzreferrer: 'https://user.qzone.qq.com/10001',
      allow_uins: '10002',
    });
    expect(new URLSearchParams(buildQzoneRightBody(detail(), '10001', 'T1', 64, ['10002'])).has('allow_uins')).toBe(false);
    expect(new URLSearchParams(buildQzoneRightBody(detail({ richtype: '', subrichtype: '' }), '10001', 'T1', 4)).get('richtype')).toBe('');
  });

  test('accepts the observed plain-text forward placeholder and retains subtype 2', () => {
    const value = detail({ ...observedEmptyForwardFields(), t1_subtype: 2 });
    const body = new URLSearchParams(buildQzoneRightBody(value, '10001', 'T1', 4));
    expect(Object.fromEntries(body)).toMatchObject({ con: ' original\ntext ', richtype: '', richval: '', subrichtype: '2' });
    expect(value['rt_con']).toEqual({ conlist: null, content: '' });
  });

  test('accepts the same observed placeholder on complete image posts without dropping image data', () => {
    const value = detail({
      ...observedEmptyForwardFields(),
      t1_subtype: 1,
      pic: [{ pic_id: ',SYNTHETIC-ALBUM,SYNTHETIC-LOCATION', pictype: 3, height: 96, width: 128, smallurl: 'https://photo.example/a?bo=metadata' }],
    });
    const body = new URLSearchParams(buildQzoneRightBody(value, '10001', 'T1', 64));
    expect(Object.fromEntries(body)).toMatchObject({
      con: ' original\ntext ',
      richtype: '1',
      subrichtype: '1',
      richval: ',SYNTHETIC-ALBUM,SYNTHETIC-LOCATION,SYNTHETIC-LOCATION,3,96,128,,0,0',
      pic_bo: 'metadata\tmetadata',
    });
  });

  test.each([
    { rt_con: { conlist: null, content: ' ' } },
    { rt_con: { conlist: null, content: 'forwarded text' } },
    { rt_con: { conlist: [], content: '' } },
    { rt_con: { conlist: [{}], content: '' } },
    { rt_con: { content: '' } },
    { rt_con: { conlist: null } },
    { rt_con: { conlist: null, content: '', unknown: 0 } },
    { rt_con: [{ conlist: null, content: '' }] },
    { rt_con: 'nonempty' },
    { rt_tid: 'forwarded' },
    { rt_uin: 10002 },
    { rt_source: 1 },
    { rt_tid: undefined },
    { rt_uin: '0' },
    { rt_source: undefined },
    { video: { vid: 'video-id' } },
    { music: { url: 'https://music.example/song' } },
    { forward: { tid: 'forwarded' } },
    { origin: { tid: 'original' } },
  ])('does not generalize the observed empty forward object to other content (%j)', (overrides) => {
    const value = detail({ ...observedEmptyForwardFields(), t1_subtype: 1, ...overrides });
    expect(() => buildQzoneRightBody(value, '10001', 'T1', 4)).toThrow('媒体或转发内容');
  });

  test.each([
    { pic: [{ pic_id: ',ALBUM,LOCATION', pictype: 3, height: 96, width: 128 }] },
    { richtype: 1 },
    { richtype: 2 },
    { richtype: '' },
    { subrichtype: 2 },
    { t1_subtype: 9 },
    { rt_con: undefined },
  ])('restricts subtype 2 to the observed ordinary text layout (%j)', (overrides) => {
    const value = detail({ ...observedEmptyForwardFields(), t1_subtype: 2, ...overrides });
    expect(() => buildQzoneRightBody(value, '10001', 'T1', 4)).toThrow();
  });

  test('preserves all conlist segments including whitespace instead of using a truncated summary', () => {
    const value = detail({ content: 'summary', conlist: [{ con: ' \nfirst' }, { con: '  ' }, { con: 'last\n ' }] });
    expect(new URLSearchParams(buildQzoneRightBody(value, '10001', 'T1', 4)).get('con')).toBe(' \nfirst  last\n ');
    expect(new URLSearchParams(buildQzoneRightBody(detail({ content: '' }), '10001', 'T1', 4)).get('con')).toBe('');
    expect(() => buildQzoneRightBody(detail({ conlist: [{ con: 'kept' }, {}] }), '10001', 'T1', 4)).toThrow('分段不完整');
    expect(() => buildQzoneRightBody(detail({ content: undefined }), '10001', 'T1', 4)).toThrow('完整正文');
  });

  test('preserves image order, complete richvals, bo alignment and version metadata', () => {
    const value = detail({
      conlist: [{ con: 'image text' }],
      richtype: 1,
      t1_subtype: 1,
      pic_template: 'template',
      feedversion: 3,
      ver: '2',
      code_version: 5,
      to_sign: 1,
      ugcright_id: 'right-key',
      pic: [
        { pic_id: 'X,ALBUM1,LLOC1,extra', pictype: 22, height: 800, width: 600, url1: 'https://photo.example/a?bo=abc%2Cdef' },
        { pic_id: 'X,ALBUM2,LLOC2,extra', type: '23', b_height: '400', b_width: '300', smallurl: 'https://photo.example/b?bo=second' },
      ],
    });
    const body = new URLSearchParams(buildQzoneRightBody(value, '10001', 'T1', 64));
    expect(body.get('richval')).toBe(',ALBUM1,LLOC1,LLOC1,22,800,600,,0,0\t,ALBUM2,LLOC2,LLOC2,23,400,300,,0,0');
    expect(body.get('pic_bo')).toBe('abc,def,second\tabc,def,second');
    expect(Object.fromEntries(body)).toMatchObject({ con: 'image text', pic_template: 'template', feedversion: '3', ver: '2', code_version: '5', to_sign: '1', ugcright_id: 'right-key' });
    expect(value['ugc_right']).toBeUndefined();
  });

  test.each([
    { pic: [{ pic_id: 'X,A,L', height: 100, width: 100 }, {}], richtype: 1 },
    { pic: [{ pic_id: 'broken' }], richtype: 1 },
    { pic: [{ pic_id: 'X,   ,L', height: 100, width: 100 }], richtype: 1 },
    { pic: [{ pic_id: 'X,A,   ', height: 100, width: 100 }], richtype: 1 },
    { pic: [], richtype: 1 },
    { pic: [{ pic_id: 'X,A,L' }], richtype: 0 },
    { pic: [{ pic_id: 'X,A,L', height: 'unknown', width: 100 }], richtype: 1 },
    { pic: [{ pic_id: 'X,A,L', height: null, b_height: 100, width: 100 }], richtype: 1 },
    { pic: [{ pic_id: 'X,A,L', height: 100, width: 100, url1: 'https://photo.example/a?bo=one' }, { pic_id: 'X,A,L2', height: 100, width: 100 }], richtype: 1 },
    { pic: [{ pic_id: 'X,A,L', height: 100, width: 100, url1: 'https://photo.example/a?bo=%GG' }], richtype: 1 },
    { richval: 'unknown-media' },
    { richtype: 2 },
    { t1_subtype: 9 },
    { video: { vid: 'video-id' } },
    { music: { url: 'https://music.example/song' } },
    { rt_tid: 'forwarded-tid' },
    { special_url: 'https://example.com/shared' },
  ])('rejects incomplete or unsupported media instead of partially resubmitting it (%j)', (overrides) => {
    expect(() => buildQzoneRightBody(detail(overrides), '10001', 'T1', 64)).toThrow();
  });

  test('requires every existing image to retain positive known dimensions', () => {
    for (const picture of [
      { pic_id: 'X,A,L', width: 100 },
      { pic_id: 'X,A,L', height: 100 },
      { pic_id: 'X,A,L', height: 0, width: 100 },
      { pic_id: 'X,A,L', height: 100, width: '0' },
    ]) {
      expect(() => buildQzoneRightBody(detail({ richtype: 1, pic: [picture] }), '10001', 'T1', 64)).toThrow();
    }
    expect(() => buildQzoneRightBody(detail({
      richtype: 1,
      pic: [
        { pic_id: 'X,A,L1', height: 100, width: 100 },
        { pic_id: 'X,A,L2', width: 100 },
      ],
    }), '10001', 'T1', 64)).toThrow('尺寸不完整');
  });

  test('requires the exact requested tid and current-account owner before returning a body', () => {
    expect(() => buildQzoneRightBody(detail({ tid: 'other-tid' }), '10001', 'T1', 64)).toThrow('不匹配');
    expect(() => buildQzoneRightBody(detail({ uin: '10002' }), '10001', 'T1', 64)).toThrow('自己的说说');
    expect(() => buildQzoneRightBody(detail({ uin: undefined }), '10001', 'T1', 64)).toThrow('自己的说说');
    expect(() => buildQzoneRightBody(detail({ code: -1, subcode: 0 }), '10001', 'T1', 64)).toThrow();
    expect(new URLSearchParams(buildQzoneRightBody(detail({ uin: 10001 }), '10001', 'T1', 4)).get('hostuin')).toBe('10001');
  });
});
