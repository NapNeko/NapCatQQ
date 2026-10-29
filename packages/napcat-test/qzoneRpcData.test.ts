import { describe, expect, test } from 'vitest';
import {
  buildQzonePublishRequest,
  buildQzoneText,
  getQzoneGtk,
  getQzoneTid,
  normalizeQzoneFeed,
  parseQzoneRpcResponse,
  QZONE_REFERENCE_MAX_BYTES,
  validateQzoneFeedReference,
  type QzoneFeed,
} from '@/napcat-core/data/qzone-rpc';

describe('Qzone RPC response and feed identity', () => {
  test('accepts only a successful object data envelope and preserves raw fields', () => {
    const data = { feeds: [], extra: { server_field: true } };
    expect(parseQzoneRpcResponse({ retcode: 0, data })).toBe(data);
    for (const input of [null, [], {}, { retcode: '0', data }, { retcode: 0 }, { retcode: 0, data: [] }]) {
      expect(() => parseQzoneRpcResponse(input)).toThrow();
    }
  });

  test('does not echo credential-shaped server errors', () => {
    expect(() => parseQzoneRpcResponse({ retcode: 4003, message: 'p_skey=private-value', data: null }))
      .toThrow('QQ空间请求失败 (retcode=4003)');
    expect(() => parseQzoneRpcResponse({ retcode: 'p_skey=private-value' }))
      .toThrow('QQ空间请求失败');
  });

  test('uses an explicit mood extension ahead of ugc_id and never labels an album ID as a tid', () => {
    expect(getQzoneTid({ cell_common: { feed_sub_type: 1, union_id: { ugc_id: 'fallback', ext_ids: [{ ext_id_type: 5, str: 'mood-tid' }] } } }))
      .toBe('mood-tid');
    expect(getQzoneTid({ cell_common: { app_id: 311, union_id: { ugc_id: 'fallback' } } })).toBe('fallback');
    expect(getQzoneTid({ cell_common: { feed_sub_type: 2, union_id: { ugc_id: 'album-id' } } })).toBeNull();
    expect(getQzoneTid({ cell_common: { union_id: { uf_key: 'feed-key', ugc_id: 'unclassified' } } })).toBeNull();
  });

  test('preserves numeric extension strings and rejects already-rounded numbers', () => {
    expect(getQzoneTid({ cell_common: { union_id: { ext_ids: [{ ext_id_type: 5, unsigned_numeric: '9007199254740993' }] } } })).toBe('9007199254740993');
    expect(getQzoneTid({ cell_common: { union_id: { ext_ids: [{ ext_id_type: 5, numeric: 9007199254740992 }] } } })).toBeNull();
  });

  test('retains complete references without rebuilding identities from tid', () => {
    const reference = {
      union_id: { uf_key: 'feed-key', ugc_id: 'mood-id', serialized_data: 'opaque', ext_ids: [{ ext_id_type: 5, str: 'mood-id', extra: 1 }] },
      cell_feed_transfer: { cookie: 'opaque-server-transfer', nested: [1, true, null] },
      feed_action_domain_type: 1,
      like_key: 'server-like-key',
    };
    expect(validateQzoneFeedReference(reference)).toBe(reference);
    const withEmptyDefaults = { union_id: { uf_key: 'issued-key', ugc_id: '', feed_id: '', serialized_data: '' } };
    expect(validateQzoneFeedReference(withEmptyDefaults)).toBe(withEmptyDefaults);
    expect(() => validateQzoneFeedReference({ tid: 'mood-id' })).toThrow();
    expect(() => validateQzoneFeedReference({ union_id: {} })).toThrow();
    expect(() => validateQzoneFeedReference({ union_id: { uf_key: '' } })).toThrow();
    expect(() => validateQzoneFeedReference({ union_id: { uf_key: 'key' }, feed_action_domain_type: 4 })).toThrow();
  });

  test('bounds UTF-8 reference size and rejects non-JSON or cyclic transfer data', () => {
    expect(() => validateQzoneFeedReference({ union_id: { uf_key: 'key' }, cell_feed_transfer: '中'.repeat(QZONE_REFERENCE_MAX_BYTES / 2) })).toThrow('64KiB');
    expect(() => validateQzoneFeedReference({ union_id: { uf_key: 'key' }, cell_feed_transfer: 1n })).toThrow('JSON');
    const cycle: Record<string, unknown> = {};
    cycle['self'] = cycle;
    expect(() => validateQzoneFeedReference({ union_id: { uf_key: 'key' }, cell_feed_transfer: cycle })).toThrow();
  });
});

describe('Qzone RPC feed projections', () => {
  test('keeps missing values unknown while retaining the original feed', () => {
    const feed = { future_cell: { unknown: 'retained' } };
    expect(normalizeQzoneFeed(feed)).toEqual({
      tid: null,
      user_id: null,
      content: null,
      time: null,
      comment_num: null,
      like_num: null,
      images: null,
      feed_ref: null,
      feed,
    });
    expect(normalizeQzoneFeed(feed).feed).toBe(feed);
  });

  test('normalizes observed text, counts and image variants without including video covers', () => {
    const feed: QzoneFeed = {
      cell_common: { feed_sub_type: 1, time: '1700000000', union_id: { uf_key: 'key', ugc_id: 'tid' }, cur_like_key: 'like-key', domain_type: 1 },
      cell_user_info: { user: { uin: '10001' } },
      cell_summary: { summary: [{ type: 0, content: 'Hello ' }, { type: 1, name: 'Qiao' }, { type: 0, content: '[em]e100[/em]' }] },
      cell_comment: { num: 0, comments: [] },
      cell_like: { num: 2 },
      cell_media: {
        media_items: [
          { type: 0, image: { photo_url: [{ spec: 1, url: { url: 'https://example.com/big.jpg' } }, { spec: 6, url: { url: '//example.com/original.jpg' } }] } },
          { type: 1, video: { cover: { default_url: { url: 'https://example.com/video-cover.jpg' } } } },
        ],
      },
      cell_feed_transfer: { unknown: true },
    };
    const result = normalizeQzoneFeed(feed);
    expect(result).toMatchObject({ tid: 'tid', user_id: '10001', content: 'Hello @Qiao[em]e100[/em]', time: 1700000000, comment_num: 0, like_num: 2, images: ['https://example.com/original.jpg'] });
    expect(result.feed_ref).toEqual({ union_id: feed.cell_common!.union_id, like_key: 'like-key', feed_action_domain_type: 1, cell_feed_transfer: { unknown: true } });
    expect(result.feed).toBe(feed);
  });

  test('distinguishes known empty values from unknown or malformed sections', () => {
    expect(normalizeQzoneFeed({ cell_summary: { summary: [] }, cell_media: { media_items: [] } })).toMatchObject({ content: '', images: [] });
    expect(normalizeQzoneFeed({ cell_summary: { summary: [{ type: 99, content: 'future' }] } }).content).toBeNull();
    expect(normalizeQzoneFeed({ cell_media: { media_items: [{ type: 0, image: {} }] } }).images).toBeNull();
    expect(normalizeQzoneFeed({ cell_comment: { num: -1 }, cell_like: { num: 'not-a-number' } })).toMatchObject({ comment_num: null, like_num: null });
  });

  test('declines unusable action handles while keeping their raw source', () => {
    const feed = { cell_common: { union_id: { uf_key: '' } }, untouched: true };
    const result = normalizeQzoneFeed(feed);
    expect(result.feed_ref).toBeNull();
    expect(result.feed).toBe(feed);
  });
});

describe('Qzone RPC pure-text publish body', () => {
  test('uses the official RichMsg shape and preserves text exactly', () => {
    expect(buildQzoneText(' hello\n[em]e100[/em] ')).toEqual([
      { content: ' hello\n[em]e100[/em] ', media_items: [], name: '', type: 0, uid: '', uin: '', url: '', who: 0 },
    ]);
    expect(() => buildQzoneText(' \n ')).toThrow();
    expect(() => buildQzoneText('x'.repeat(2001))).toThrow('2000');
  });

  test.each([[1, 1], [4, 2], [16, 3], [128, 4], [64, 5]])('maps legacy permission %i to modern flag %i', (legacy, modern) => {
    const result = buildQzonePublishRequest({ uin: '10001', uid: 'uid', nick: 'Qiao' }, 'post', legacy, ['10002'], 1700000000, 'client-key');
    expect(result).toMatchObject({
      from: 3,
      feed: {
        cell_common: { time: 1700000000, client_key: 'client-key', feed_type: 1, feed_sub_type: 1, feed_biz_type: 0, union_id: { uf_key: 'client-key', ugc_id: 'client-key', feed_id: 'client-key' } },
        cell_user_info: { user: { uin: '10001', uid: 'uid', nick: 'Qiao' } },
        cell_permission: { right: { flag: [modern] } },
      },
    });
    const permission = result.feed['cell_permission'] as { right: Record<string, unknown>; };
    expect(permission.right['white_uins']).toEqual(legacy === 16 ? ['10002'] : undefined);
    expect(permission.right['black_uins']).toEqual(legacy === 128 ? ['10002'] : undefined);
    expect(result.feed).not.toHaveProperty('cell_media');
  });

  test('rejects unsupported rights and incomplete target lists before publishing', () => {
    for (const right of [0, 2, 3, 5, 256, NaN]) {
      expect(() => buildQzonePublishRequest({ uin: '10001' }, 'post', right)).toThrow();
    }
    for (const right of [16, 128]) {
      expect(() => buildQzonePublishRequest({ uin: '10001' }, 'post', right)).toThrow('target_uins');
      expect(() => buildQzonePublishRequest({ uin: '10001' }, 'post', right, [])).toThrow('target_uins');
    }
    expect(() => buildQzonePublishRequest({ uin: '' }, 'post', 1)).toThrow();
    expect(() => buildQzonePublishRequest({ uin: '10001' }, 'post', 1, ['bad-uin'])).toThrow();
  });

  test('matches known gtk values without needing an account key', () => {
    expect(getQzoneGtk('')).toBe(5381);
    expect(getQzoneGtk('abc')).toBe(193485963);
  });
});
