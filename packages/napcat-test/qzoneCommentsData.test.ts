import { describe, expect, test } from 'vitest';
import { normalizeQzoneComment, normalizeQzoneReply } from '@/napcat-core/data/qzone-comments';
import { normalizeQzoneFeed, normalizeQzoneMediaImages, normalizeQzoneRichContent, type QzoneComment } from '@/napcat-core/data/qzone-rpc';

describe('Qzone comment and reply projections', () => {
  test('keeps unknown comment values null without inventing history or counts', () => {
    const comment = { future_field: { opaque: true } };
    const normalized = normalizeQzoneComment(comment);
    expect(normalized).toEqual({
      comment_id: null,
      user_id: null,
      uid: null,
      nickname: null,
      time: null,
      content: null,
      images: null,
      like_count: null,
      liked: null,
      reply_num: null,
      has_more_replies: null,
      replies: [],
      comment,
    });
    expect(normalized.comment).toBe(comment);
  });

  test('normalizes the observed parent fields and preserves its complete raw object', () => {
    const reply = {
      id: 'reply-1',
      user: { uin: '10002', uid: 'u_reply', nick: '回复者' },
      target_user: { uin: '10001', uid: 'u_parent', nick: '作者' },
      time: '1700000001',
      content: [{ type: 0, content: '原始回复' }],
      like: { id: 'reply-like-key', count: '3', status: 0 },
      future_reply_field: 'keep',
    };
    const comment: QzoneComment = {
      id: '0',
      user: { uin: '10001', uid: 'u_parent', nick: '作者', portrait: 'https://example.com/avatar' },
      time: 1700000000,
      content: [{ type: 0, content: '第一行\n' }, { type: 1, name: 'Qiao', uin: '10003' }],
      media_items: [{ type: 0, image: { photo_url: [{ spec: 6, url: { url: 'https://example.com/original' } }] } }],
      like: { id: 'parent-like-key', count: 7, status: 1 },
      reply_num: 12,
      has_more_reply: true,
      reply_attach_info: 'opaque-token',
      replys: [reply],
      unknown_field: [0, false, 'keep'],
    };
    const normalized = normalizeQzoneComment(comment);
    expect(normalized).toMatchObject({
      comment_id: '0',
      user_id: '10001',
      uid: 'u_parent',
      nickname: '作者',
      time: 1700000000,
      content: '第一行\n@Qiao',
      images: ['https://example.com/original'],
      like_count: 7,
      liked: true,
      reply_num: 12,
      has_more_replies: true,
    });
    expect(normalized.replies).toHaveLength(1);
    expect(normalized.replies[0]).toMatchObject({
      reply_id: 'reply-1',
      user_id: '10002',
      uid: 'u_reply',
      nickname: '回复者',
      time: 1700000001,
      content: '原始回复',
      like_count: 3,
      liked: false,
      target_user_id: '10001',
      target_uid: 'u_parent',
      target_nickname: '作者',
    });
    expect(normalized.comment).toBe(comment);
    expect(normalized.replies[0]?.reply).toBe(reply);
    expect(comment['reply_attach_info']).toBe('opaque-token');
    expect(comment.user?.['portrait']).toBe('https://example.com/avatar');
    expect(comment['unknown_field']).toEqual([0, false, 'keep']);
  });

  test('uses time rather than create_time and does not turn display defaults into facts', () => {
    expect(normalizeQzoneComment({ create_time: 1700000000 }).time).toBeNull();
    expect(normalizeQzoneReply({ create_time: 1700000000 }).time).toBeNull();
    expect(normalizeQzoneComment({ time: 0, reply_num: 0, has_more_reply: false, like: { count: 0, status: 0 } }))
      .toMatchObject({ time: 0, reply_num: 0, has_more_replies: false, like_count: 0, liked: false });
    expect(normalizeQzoneReply({ time: '0', like: { count: '0', status: '1' } })).toMatchObject({ time: 0, like_count: 0, liked: null });
    expect(normalizeQzoneComment({ has_more_reply: 1, like: { status: 2 } })).toMatchObject({ has_more_replies: null, liked: null });
  });

  test('accepts ID zero while never inventing a rounded numeric identity', () => {
    for (const id of [0, '0']) {
      const raw = { id };
      expect(normalizeQzoneComment(raw).comment_id).toBe('0');
      expect(normalizeQzoneReply(raw).reply_id).toBe('0');
      expect(normalizeQzoneComment(raw).comment.id).toBe(id);
    }
    expect(normalizeQzoneReply({ id: '9007199254740993' }).reply_id).toBe('9007199254740993');
    for (const id of [Number.MAX_SAFE_INTEGER + 1, -1, NaN, Infinity, 0.5, '', '   ']) {
      expect(normalizeQzoneComment({ id }).comment_id).toBeNull();
      expect(normalizeQzoneReply({ id }).reply_id).toBeNull();
    }
  });

  test('preserves UID-only authors and separates author identity from reply target', () => {
    const reply: QzoneComment = {
      id: 0,
      user: { uid: 'uid-only', nick: '' },
      target_user: { uin: '9007199254740993', uid: 'target-uid', nick: '回复目标' },
      content: [{ type: 0, content: '仅原文' }],
    };
    expect(normalizeQzoneReply(reply)).toMatchObject({
      reply_id: '0',
      user_id: null,
      uid: 'uid-only',
      nickname: '',
      content: '仅原文',
      target_user_id: '9007199254740993',
      target_uid: 'target-uid',
      target_nickname: '回复目标',
    });
    expect(normalizeQzoneComment({ user: { uin: '', uid: 'uid-only' } })).toMatchObject({ user_id: null, uid: 'uid-only' });
    expect(normalizeQzoneReply({ user: { uin: '10001', uid: '' } })).toMatchObject({ user_id: '10001', uid: null, target_user_id: null });
    expect(normalizeQzoneReply({ user: { uin: Number.MAX_SAFE_INTEGER + 1 } } as never).user_id).toBeNull();
  });

  test('does not infer reply totals or continuation from inline replies', () => {
    const comment = { replys: [{ id: 'a' }, { id: 'b' }] };
    expect(normalizeQzoneComment(comment)).toMatchObject({ reply_num: null, has_more_replies: null });
    expect(normalizeQzoneComment(comment).replies).toHaveLength(2);
    expect(normalizeQzoneComment({ replys: [] })).toMatchObject({ replies: [], reply_num: null, has_more_replies: null });
    expect(normalizeQzoneComment({ reply_num: 20, has_more_reply: true })).toMatchObject({ replies: [], reply_num: 20, has_more_replies: true });
  });

  test('retains unknown reply media while projecting only known images', () => {
    const video = { type: 1, video: { url: 'https://example.com/video', cover: { default_url: { url: 'https://example.com/cover' } } } };
    const unknown = { type: 99, vendor_media: { raw: true } };
    const reply = { media_items: [video, unknown], unknown_reply_field: { keep: true } };
    const result = normalizeQzoneReply(reply);
    expect(result.images).toBeNull();
    expect(result.reply).toBe(reply);
    expect(result.reply['media_items']).toEqual([video, unknown]);
    expect(normalizeQzoneReply({ media_items: [video] }).images).toEqual([]);
    expect(normalizeQzoneReply({ media_items: [] }).images).toEqual([]);
  });

  test('preserves unsupported text segments and invalid numbers as unknown projections', () => {
    const reply = { content: [{ type: 99, content: 'future segment' }], time: 'unknown', like: { count: -1, status: true } };
    expect(normalizeQzoneReply(reply)).toMatchObject({ content: null, time: null, like_count: null, liked: null });
    expect(normalizeQzoneReply(reply).reply).toBe(reply);
    expect(normalizeQzoneComment({ reply_num: '9007199254740993' }).reply_num).toBeNull();
  });

  test('does not silently drop malformed inline reply entries', () => {
    expect(() => normalizeQzoneComment({ replys: [null] } as never)).toThrow('内联回复');
    expect(() => normalizeQzoneComment({ replys: 'bad-shape' } as never)).toThrow('内联回复');
    expect(() => normalizeQzoneReply(null as never)).toThrow('回复数据');
    expect(() => normalizeQzoneComment(null as never)).toThrow('评论数据');
  });

  test('shares rich text and image projections with feed normalization without changing feed behavior', () => {
    const content = [{ type: 0, content: 'same ' }, { type: 1, name: 'Qiao' }];
    const media = [{ type: 0, image: { default_url: { url: '//example.com/image' } } }];
    const feed = normalizeQzoneFeed({ cell_summary: { summary: content }, cell_media: { media_items: media } });
    const comment = normalizeQzoneComment({ content, media_items: media });
    expect(normalizeQzoneRichContent(content)).toBe(feed.content);
    expect(normalizeQzoneMediaImages(media)).toEqual(feed.images);
    expect(comment.content).toBe(feed.content);
    expect(comment.images).toEqual(feed.images);
  });
});
