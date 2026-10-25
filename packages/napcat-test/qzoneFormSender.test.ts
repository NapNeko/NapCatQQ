import { describe, expect, test } from 'vitest';
import { parseQzoneWebResponse } from '@/napcat-core/data/qzone-web';

const DOMAIN = 'document.domain="h5.qzone.qq.com";';
const ASSIGN_CALLBACK = 'cb=frameElement.callback;';
const TRY_SETUP = `var cb;try{${DOMAIN}${ASSIGN_CALLBACK}}catch(e){try{${DOMAIN}${ASSIGN_CALLBACK}}catch(e){${DOMAIN}${ASSIGN_CALLBACK}}}`;

function html (script: string, doctype = true): string {
  return `${doctype ? '<!DOCTYPE html>\n' : ''}<html>\n<head>\n<meta http-equiv="content-type" content="text/html; charset=utf-8" />\n</head>\n<body>\n<script type="text/javascript">\n${script}\n</script>\n</body>\n</html>`;
}

function callback (value: unknown): string {
  return `frameElement.callback(${JSON.stringify(value)});`;
}

describe('QQ空间 inert FormSender envelopes', () => {
  test.each([
    { code: 0, subcode: 0, data: '' },
    { code: 0, subcode: 0, data: { name: 'Ack' } },
    { code: 0, subcode: 0, data: { id: 0, content: 'synthetic reply', postTime: 1700000000 }, err: { code: 0 } },
  ])('accepts the observed three-domain try/catch wrapper with a synthetic response (%j)', (response) => {
    for (const doctype of [true, false]) {
      expect(parseQzoneWebResponse(html(`${TRY_SETUP}\n${callback(response)}`, doctype), true)).toEqual(response);
    }
  });

  test('accepts the upload domain preamble and explicit ret=0 without inventing code=0', () => {
    const response = { ret: 0, data: { url: 'https://images.example.test/upload.png', width: 20, height: 10 } };
    const body = html(`${DOMAIN}${callback(response)}`, false);

    expect(parseQzoneWebResponse(body)).toEqual(response);
    expect(() => parseQzoneWebResponse(body, true)).toThrow('成功状态');
  });

  test('supports formatting and tag case without accepting extra attributes or syntax', () => {
    const setup = 'var cb ; try { document.domain = "h5.qzone.qq.com" ; cb = frameElement.callback ; } catch (e) { try { document.domain="h5.qzone.qq.com"; cb=frameElement.callback; } catch(e) { document.domain="h5.qzone.qq.com"; cb=frameElement.callback; } }';
    const body = html(`${setup}\n frameElement.callback ( { "code": 0 } ) ;`)
      .replace('<html>', '<HTML>')
      .replace('http-equiv="content-type"', 'http-equiv="Content-Type"')
      .replace('charset=utf-8', 'charset=UTF-8')
      .replace(' />', '/>');

    expect(parseQzoneWebResponse(body, true)).toEqual({ code: 0 });
  });

  test('treats callback-looking content as data and preserves existing Ack normalization', () => {
    const response = { code: 0, data: { content: 'var cb; document.domain="other.test"; callback({"code":-1});', braces: '{}[]()' } };
    expect(parseQzoneWebResponse(html(`${TRY_SETUP}${callback(response)}`))).toEqual(response);
    expect(parseQzoneWebResponse(html(`${DOMAIN}frameElement.callback({"ret":0,"data":{name:"Ack"}});`)))
      .toEqual({ ret: 0, data: { name: 'Ack' } });
  });

  test.each(['Example Space', '', '合成空间名称', 'quote " and slash \\', 'line one\nline two', '}; callback({"code":-1});'])('accepts the observed bare name string key without changing its value (%j)', (name) => {
    const payload = `{"code":0,"subcode":0,"message":"","default":0,"data":{name:${JSON.stringify(name)}}}`;
    const body = html(`${TRY_SETUP}frameElement.callback(${payload});`);

    expect(parseQzoneWebResponse(body, true)).toEqual({ code: 0, subcode: 0, message: '', default: 0, data: { name } });
  });

  test('normalizes only object keys and preserves name-looking text inside JSON strings', () => {
    const content = '{name:"Example"}, name:"Ack", escaped quote \\"';
    const payload = `{"code":0,"data":{"content":${JSON.stringify(content)},name:"Example","nested":[{name:"Nested"}]}}`;

    expect(parseQzoneWebResponse(html(`${DOMAIN}frameElement.callback(${payload});`)))
      .toEqual({ code: 0, data: { content, name: 'Example', nested: [{ name: 'Nested' }] } });
  });

  test.each([
    '{"code":0,"data":{name:1}}',
    '{"code":0,"data":{name:null}}',
    '{"code":0,"data":{name:false}}',
    '{"code":0,"data":{name:["Example"]}}',
    '{"code":0,"data":{name:{"value":"Example"}}}',
    '{"code":0,"data":{name:someName}}',
    '{"code":0,"data":{name:"Example"+"suffix"}}',
    '{"code":0,"data":{name:("Example")}}',
    '{"code":0,"data":{name:\'Example\'}}',
    '{"code":0,"data":{other:"Example"}}',
    '{"code":0,"data":{namex:"Example"}}',
    '{"code":0,"data":[name:"Example"]}',
    '{"code":0,"data":{name:"Example",other:"value"}}',
    '{"code":-1,"\\u0063ode":0,"data":{name:"Example"}}',
    '{"code":0,"subcode":-1,"data":{name:"Example"}}',
  ])('does not extend bare-name compatibility to other syntax or failed statuses (%s)', (payload) => {
    expect(() => parseQzoneWebResponse(html(`${TRY_SETUP}frameElement.callback(${payload});`))).toThrow();
  });

  test.each([
    html(`${TRY_SETUP}${callback({ code: 0 })}`).replace('<body>', '<body onload="alert(1)">'),
    html(`${TRY_SETUP}${callback({ code: 0 })}`).replace('<head>', '<head><script>alert(1)</script>'),
    html(`${TRY_SETUP}${callback({ code: 0 })}`).replace('</body>', '<img src="x" onerror="alert(1)"></body>'),
    html(`${TRY_SETUP}${callback({ code: 0 })}`).replace('type="text/javascript"', 'type="text/javascript" src="https://example.test/x.js"'),
    html(`${TRY_SETUP}${callback({ code: 0 })}`).replace('type="text/javascript"', 'type="text/javascript" onload="alert(1)"'),
    html(`${TRY_SETUP}${callback({ code: 0 })}`).replace('</script>', '</script><script>callback({"code":0});</script>'),
    html(`${TRY_SETUP}${callback({ code: 0 })}`).replace('charset=utf-8', 'charset=gbk'),
    html(`alert(1);${TRY_SETUP}${callback({ code: 0 })}`),
    html(`${TRY_SETUP}alert(1);${callback({ code: 0 })}`),
    html(`${TRY_SETUP}${callback({ code: 0 })}alert(1);`),
    html(`${TRY_SETUP}${callback({ code: 0 })}${callback({ code: 0 })}`),
    html(`${TRY_SETUP}${callback({ code: 0 })}`).replace('"h5.qzone.qq.com"', '"other.example.test"'),
    html(`${DOMAIN}document.domain="other.example.test";${callback({ code: 0 })}`),
    html(`${TRY_SETUP}_Callback({"code":0});`),
    html(`${TRY_SETUP}cb({"code":0});`),
    html(callback({ code: 0 })),
    html(`${DOMAIN}frameElement.callback((function(){return {"code":0};})());`),
    html(`${DOMAIN}frameElement.callback({"code":(0,1)});`),
    '<html><body>login required</body></html>',
  ])('rejects unobserved HTML, setup and executable additions', (body) => {
    expect(() => parseQzoneWebResponse(body)).toThrow();
  });

  test.each([
    '{"code":0,"subcode":-1}',
    '{"code":0,"ret":-1}',
    '{"ret":0,"code":-1}',
    '{"ret":"0"}',
    '{"code":-1,"code":0}',
    '{"code":-1,"\\u0063ode":0}',
    '{"ret":-1,"ret":0}',
    '{"code":0,"data":{}};alert(1);frameElement.callback({"code":0}',
    '{"message":"success without numeric acknowledgement"}',
  ])('retains strict success and duplicate-code checks inside HTML (%s)', (payload) => {
    expect(() => parseQzoneWebResponse(html(`${TRY_SETUP}frameElement.callback(${payload});`))).toThrow();
  });

  test('never exposes callback contents when an HTML response cannot be parsed', () => {
    let error: unknown;
    try {
      parseQzoneWebResponse(html(`${DOMAIN}frameElement.callback({"code":0,"private":"synthetic-private",broken});`));
    } catch (value) {
      error = value;
    }
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('QQ空间响应JSON格式异常');
    expect((error as Error).message).not.toContain('synthetic-private');
  });

  test.each([
    '{"code":0}',
    'frameElement.callback({"code":0});',
    '_Callback({"code":0});',
    '<script>frameElement.callback({"code":0});</script>',
    'frameElement.callback({"code":0});</script>',
  ])('preserves the original accepted response envelopes (%s)', (body) => {
    expect(parseQzoneWebResponse(body, true)).toEqual({ code: 0 });
  });
});
