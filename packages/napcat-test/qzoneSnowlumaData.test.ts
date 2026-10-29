import { describe, expect, test } from 'vitest';
import {
  buildSlQzoneCommentBody,
  buildSlQzoneLikeBody,
  parseSlQzoneComment,
  parseSlQzoneMsgDetail,
  parseSlQzoneMsgList,
} from '@/napcat-core/data/qzone-snowluma';

describe('SnowLuma-compatible mood list projections', () => {
  test('maps wire fields and photo preference while retaining exact body text', () => {
    const result = parseSlQzoneMsgList({
      code: 0,
      total: '23',
      msglist: [{
        tid: 'post-local-x',
        content: '  independently written\ntext  ',
        created_time: '31',
        cmtnum: '8',
        secret: '1',
        pic: [{ smallurl: 'https://cdn.example.test/tiny', url2: 'https://cdn.example.test/medium', url3: 'https://cdn.example.test/full' }],
      }],
    });
    expect(result).toEqual({
      total: 23,
      total_known: true,
      msglist: [{
        tid: 'post-local-x', content: '  independently written\ntext  ', time: 31, comment_num: 8, is_private: true, images: ['https://cdn.example.test/full'],
      }],
    });
  });

  test('labels the page-length total fallback and preserves the declared legacy sentinels', () => {
    expect(parseSlQzoneMsgList({ msglist: [{}] })).toEqual({
      total: 1, total_known: false, msglist: [{ tid: '', content: '', time: 0, comment_num: 0, is_private: false, images: [] }],
    });
    expect(parseSlQzoneMsgList({ total: 0, msglist: [] })).toEqual({ total: 0, total_known: true, msglist: [] });
    expect(parseSlQzoneMsgList({ total: null, msglist: [] }).total_known).toBe(false);
  });

  test('rejects missing arrays, unsafe identities and malformed supplied values rather than inventing success', () => {
    for (const response of [
      {}, { msglist: null }, { msglist: [null] }, { msglist: [{}], total: 'bad' },
      { msglist: [{ tid: Number.MAX_SAFE_INTEGER + 1 }] }, { msglist: [{ created_time: -1 }] },
      { msglist: [{ cmtnum: 'bad' }] }, { msglist: [{ content: false }] }, { msglist: [{ pic: 'bad' }] },
      { code: -10000, subcode: 0, msglist: [] }, { code: 0, subcode: '0', msglist: [] },
    ]) expect(() => parseSlQzoneMsgList(response)).toThrow();
  });
});

function detail (overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    code: 0,
    tid: 'discussion-local-z',
    content: 'discussion text',
    cmtnum: '41',
    commentlist: [{
      tid: 0,
      uin: '135790',
      name: 'parent author',
      create_time: '7',
      content: 'parent text',
      list_3: [
        { tid: 'nested-local-b', uin: 246810, name: 'reply author', create_time: 9, content: 'reply text' },
      ],
    }],
    ...overrides,
  };
}

describe('SnowLuma-compatible tid detail', () => {
  test('normalizes legacy create_time and parent identities while preserving comment ID zero', () => {
    expect(parseSlQzoneMsgDetail(detail(), 'discussion-local-z')).toEqual({
      tid: 'discussion-local-z',
      content: 'discussion text',
      comment_num: 41,
      comments: [{
        comment_id: '0',
        uin: 135790,
        name: 'parent author',
        time: 7,
        content: 'parent text',
        replies: [{
          comment_id: 'nested-local-b', uin: 246810, name: 'reply author', time: 9, content: 'reply text', parent_comment_id: '0', parent_comment_uin: 135790,
        }],
      }],
    });
  });

  test('treats only missing or null comment batches as no supplied inline comments', () => {
    expect(parseSlQzoneMsgDetail(detail({ commentlist: null }), 'discussion-local-z').comments).toEqual([]);
    expect(parseSlQzoneMsgDetail(detail({ commentlist: undefined }), 'discussion-local-z').comment_num).toBe(41);
    expect(parseSlQzoneMsgDetail(detail({ commentlist: [{ tid: 'parent-only', uin: 135790, name: '', create_time: 0, content: '', list_3: null }] }), 'discussion-local-z').comments[0]?.replies).toEqual([]);
  });

  test('requires matching post identity, measured total and complete comment fields', () => {
    for (const value of [
      detail({ tid: 'different-post' }), detail({ content: undefined }), detail({ cmtnum: undefined }),
      detail({ commentlist: {} }), detail({ commentlist: [{ tid: 0, uin: 135790, name: 'author', time: 10, content: 'wrong timestamp field' }] }),
      detail({ commentlist: [{ tid: Number.MAX_SAFE_INTEGER + 1, uin: 135790, name: 'author', create_time: 10, content: '' }] }),
      detail({ commentlist: [{ tid: 'parent', uin: '9007199254740993', name: 'author', create_time: 10, content: '' }] }),
      detail({ code: 0, subcode: -99 }),
    ]) expect(() => parseSlQzoneMsgDetail(value, 'discussion-local-z')).toThrow();
  });
});

describe('SnowLuma-compatible like and comment forms', () => {
  test('builds tid-based like resources with distinct operator and post owner', () => {
    const enabled = new URLSearchParams(buildSlQzoneLikeBody('246810', '135790', 'post-local-x', true, 42));
    const disabled = new URLSearchParams(buildSlQzoneLikeBody('246810', '135790', 'post-local-x', false, 42));
    expect(enabled.get('unikey')).toBe('http://user.qzone.qq.com/135790/mood/post-local-x');
    expect(enabled.get('curkey')).toBe(enabled.get('unikey'));
    expect(Object.fromEntries(enabled)).toMatchObject({ opuin: '246810', fid: 'post-local-x', abstime: '42', appid: '311', qzreferrer: 'https://user.qzone.qq.com/246810' });
    expect([...disabled]).toEqual([...enabled]);
    expect(() => buildSlQzoneLikeBody('246810', 'bad-owner', 'post-local-x', true, 0)).toThrow();
    expect(() => buildSlQzoneLikeBody('246810', '135790', 'post-local-x', true, -1)).toThrow();
    expect(() => buildSlQzoneLikeBody('246810', '135790', 'post-local-x', 'false' as never, 0)).toThrow();
  });

  test('uses direct uploaded URLs for ordinary image comments and keeps whitespace unchanged', () => {
    const body = new URLSearchParams(buildSlQzoneCommentBody('246810', '135790', 'post-local-x', '  image comment\n ', {
      imageUrls: ['https://cdn.example.test/comment-a', 'https://cdn.example.test/comment-b'],
    }));
    expect(Object.fromEntries(body)).toMatchObject({
      uin: '246810',
      hostUin: '135790',
      topicId: '135790_post-local-x__1',
      content: '  image comment\n ',
      richtype: '1',
      richval: 'https://cdn.example.test/comment-a\thttps://cdn.example.test/comment-b',
      format: 'json',
      ref: 'feeds',
      feedsType: '100',
    });
    expect(body.has('commentId')).toBe(false);
    expect(new URLSearchParams(buildSlQzoneCommentBody('246810', '135790', 'post-local-x', 'text')).get('richtype')).toBe('');
  });

  test('separates parent author from addressed recipient and escapes mention grammar before form encoding', () => {
    const options = { comment_id: '0', comment_uin: '135790', reply_uin: '112233', reply_name: ' recipient%,} ' };
    const body = new URLSearchParams(buildSlQzoneCommentBody('246810', '135790', 'post-local-x', 'reply body', options));
    expect(Object.fromEntries(body)).toMatchObject({ uin: '246810', hostUin: '135790', hostuin: '246810', topicId: '135790_post-local-x', commentId: '0', commentUin: '135790', format: 'fs', ref: '' });
    expect(body.get('content')).toBe('@{uin:112233,nick:recipient%25%2C%7D,auto:1} reply body');
    expect(body.has('replyId')).toBe(false);
    expect(body.has('richval')).toBe(false);
    expect(new URLSearchParams(buildSlQzoneCommentBody('246810', '135790', 'post-local-x', 'reply body', { comment_id: '0', comment_uin: '135790' })).get('content')).toBe('reply body');
  });

  test('rejects mismatched parent/recipient pairs, unsafe authors and any image reply before returning a body', () => {
    for (const options of [
      { comment_id: '0' }, { comment_uin: '135790' }, { reply_uin: '112233', reply_name: 'recipient' },
      { comment_id: '0', comment_uin: '135790', reply_uin: '112233' },
      { comment_id: '0', comment_uin: '9007199254740993' },
      { comment_id: '0', comment_uin: '135790', imageUrls: ['https://cdn.example.test/picture'] },
      { imageUrls: ['javascript:alert(1)'] }, { imageUrls: ['https://user:password@cdn.example.test/picture'] },
    ]) expect(() => buildSlQzoneCommentBody('246810', '135790', 'post-local-x', 'body', options)).toThrow();
    expect(() => buildSlQzoneCommentBody('246810', '135790', 'post-local-x', ' ', { comment_id: '0', comment_uin: '135790' })).toThrow();
  });
});

describe('SnowLuma-compatible comment acknowledgements', () => {
  test('supports both ordinary ID casings and the documented empty-ID sentinel only after acknowledgement', () => {
    expect(parseSlQzoneComment({ code: 0, commentid: 0 })).toEqual({ comment_id: '0' });
    expect(parseSlQzoneComment({ subcode: 0, commentId: 'fresh-comment' })).toEqual({ comment_id: 'fresh-comment' });
    expect(parseSlQzoneComment({ code: 0 })).toEqual({ comment_id: '' });
    expect(parseSlQzoneComment({ code: 0, data: { id: 'another-endpoint-shape' } })).toEqual({ comment_id: '' });
    expect(() => parseSlQzoneComment({})).toThrow('成功状态');
    expect(() => parseSlQzoneComment({ code: 0, commentid: Number.MAX_SAFE_INTEGER + 1 })).toThrow();
  });

  test('requires a real reply identity and returns the supplied safe parent identity', () => {
    const options = { comment_id: 'parent-local-c', comment_uin: '135790' };
    expect(parseSlQzoneComment({ code: 0, data: { id: 0 } }, options)).toEqual({ comment_id: '0', parent_comment_id: 'parent-local-c', parent_comment_uin: 135790 });
    for (const response of [{ code: 0 }, { code: 0, data: {} }, { code: 0, data: { id: '' } }, { subcode: 0, data: { id: 'not-acknowledged' } }]) {
      expect(() => parseSlQzoneComment(response, options)).toThrow();
    }
  });

  test('rejects either error code without echoing server message text', () => {
    expect(() => parseSlQzoneComment({ code: 0, subcode: -9, message: 'private response text' })).toThrow('QQ空间兼容接口拒绝请求 (subcode=-9)');
    expect(() => parseSlQzoneComment({ code: '0', commentid: 'ignored' })).toThrow('QQ空间兼容接口拒绝请求');
  });
});
