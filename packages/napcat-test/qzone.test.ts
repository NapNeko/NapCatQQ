import { describe, expect, test } from 'vitest';
import {
  buildQzonePublishBody,
  buildQzoneUploadImageBody,
  parseQzonePublishResponse,
  parseQzoneUploadImageResponseText,
  toQzoneRichval,
} from '@/napcat-core/data/qzone';

describe('Qzone data helpers', () => {
  test('buildQzoneUploadImageBody encodes required fields', () => {
    const body = buildQzoneUploadImageBody({
      uin: '123456',
      skey: 'sk',
      pskey: 'pk',
      g_tk: '999',
      base64: 'AAAA',
    });
    const params = new URLSearchParams(body);
    expect(params.get('uin')).toBe('123456');
    expect(params.get('skey')).toBe('sk');
    expect(params.get('p_skey')).toBe('pk');
    expect(params.get('picfile')).toBe('AAAA');
    expect(params.get('uploadtype')).toBe('1');
    expect(params.get('albumtype')).toBe('7');
    expect(params.get('base64')).toBe('1');
    expect(params.get('qzreferrer')).toContain('123456');
  });

  test('parseQzoneUploadImageResponseText parses valid callback wrapper', () => {
    const raw = 'frameElement.callback({"code":0,"data":{"albumid":"a1","lloc":"l1","type":"22","height":"100","width":"200"}});</script>';
    const parsed = parseQzoneUploadImageResponseText(raw);
    expect(parsed.code).toBe(0);
    expect(parsed.data?.albumid).toBe('a1');
    expect(parsed.data?.lloc).toBe('l1');
  });

  test('parseQzoneUploadImageResponseText throws on malformed response', () => {
    expect(() => parseQzoneUploadImageResponseText('not a valid response')).toThrow();
  });

  test('toQzoneRichval builds expected format', () => {
    const richval = toQzoneRichval({ albumid: 'a1', lloc: 'l1', type: '22', height: '100', width: '200' });
    expect(richval).toBe(',a1,l1,l1,22,100,200,,100,200');
  });

  test('buildQzonePublishBody without images omits richval/richtype', () => {
    const body = buildQzonePublishBody({
      hostuin: '123456',
      content: 'hello world',
      ugcRight: 1,
    });
    const params = new URLSearchParams(body);
    expect(params.get('con')).toBe('hello world');
    expect(params.get('ugc_right')).toBe('1');
    expect(params.has('richval')).toBe(false);
    expect(params.has('richtype')).toBe(false);
    expect(params.has('allow_uins')).toBe(false);
  });

  test('buildQzonePublishBody with images and allow_uins sets richtype and who', () => {
    const body = buildQzonePublishBody({
      hostuin: '123456',
      content: 'with pic',
      richval: ',a1,l1,l1,22,100,200,,100,200\t,a2,l2,l2,22,100,200,,100,200',
      ugcRight: 16,
      allowUins: '10001|10002',
    });
    const params = new URLSearchParams(body);
    expect(params.get('richtype')).toBe('1');
    expect(params.get('richval')).toContain('\t');
    expect(params.get('ugc_right')).toBe('16');
    expect(params.get('allow_uins')).toBe('10001|10002');
    expect(params.get('who')).toBe('1');
  });

  test('parseQzonePublishResponse extracts tid on success', () => {
    const result = parseQzonePublishResponse({ subcode: 0, tid: 'tid123' });
    expect(result.tid).toBe('tid123');
  });

  test('parseQzonePublishResponse prefers t1_tid over tid', () => {
    const result = parseQzonePublishResponse({ subcode: 0, tid: 'tid123', t1_tid: 't1tid456' });
    expect(result.tid).toBe('t1tid456');
  });

  test('parseQzonePublishResponse throws when subcode indicates failure', () => {
    expect(() => parseQzonePublishResponse({ subcode: -200, message: '权限不足' })).toThrow('权限不足');
  });

  test('parseQzonePublishResponse throws when tid missing', () => {
    expect(() => parseQzonePublishResponse({ subcode: 0 })).toThrow();
  });
});
