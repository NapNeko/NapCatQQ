import { describe, expect, test } from 'vitest';
import {
  buildQzonePublicRequest,
  parseQzonePublicResponse,
  QZONE_PUBLIC_ROUTES,
  type QzonePublicObject,
  type QzonePublicOperation,
} from '@/napcat-core/data/qzone-public';

function feed (): QzonePublicObject {
  return {
    cell_common: {
      union_id: { uf_key: 'synthetic-feed', ugc_id: 'synthetic-ugc', auxiliary: { keep: 0 } },
      cur_like_key: 'feed-like',
      domain_type: 3,
    },
    cell_user_info: { user: { uin: '10002', uid: 'u_author', nick: 'Synthetic author' } },
    cell_feed_transfer: { opaque: { token: 'synthetic-context', flags: [false, 0, null] } },
    cell_summary: { summary: [{ type: 0, content: 'Synthetic content' }] },
  };
}

function parent (): QzonePublicObject {
  return {
    id: 0,
    user: { uin: '10003', uid: null, nick: 'Synthetic parent' },
    content: [{ type: 0, content: 'Original parent' }],
    like: { id: 'parent-like', count: 4, status: 0 },
    reply_attach_info: 'parent-replies',
    has_more_reply: true,
    future: { zero: 0, nullable: null, flags: [true, false] },
  };
}

function reply (): QzonePublicObject {
  return { id: 'reply-0', user: { uid: 'u_recipient', uin: '', nick: 'Synthetic recipient' }, like: { id: 'reply-like' }, future: { retain: true } };
}

const currentUser = { uin: '10001', uid: 'u_current', nick: 'Synthetic current' };

describe('QQ public Qzone fixed protocol routes', () => {
  test('binds all operations to known service methods and OIDB hints', () => {
    expect(Object.keys(QZONE_PUBLIC_ROUTES)).toHaveLength(18);
    expect(QZONE_PUBLIC_ROUTES.capabilities).toEqual({ service: 'trpc.public_qzone.entrance_ctrl.EntranceCtrl', method: 'BatchEntranceWhitelist', oidb: '0x9741_0' });
    expect(QZONE_PUBLIC_ROUTES.feeds).toEqual({ service: 'trpc.qzone.feeds_reader.FeedsReader', method: 'GetPublicRecomFeeds', oidb: '0x9a38_0' });
    expect(QZONE_PUBLIC_ROUTES.follow).toEqual({ service: 'trpc.public_qzone.relation.RelationService', method: 'Follow', oidb: '0x9d1a_1' });
    expect(QZONE_PUBLIC_ROUTES.unfollow).toEqual({ service: 'trpc.public_qzone.relation.RelationService', method: 'Unfollow', oidb: '0x9d1b_1' });
    expect(QZONE_PUBLIC_ROUTES.commentLike).toEqual(QZONE_PUBLIC_ROUTES.like);
    expect(QZONE_PUBLIC_ROUTES.commentUnlike).toEqual(QZONE_PUBLIC_ROUTES.unlike);
    expect(QZONE_PUBLIC_ROUTES.deleteComment).toMatchObject({ method: 'DeleteComment', oidb: '0x9989_0' });
    expect(QZONE_PUBLIC_ROUTES.deleteReply).toMatchObject({ method: 'DeleteReply', oidb: '0x998a_0' });
    expect(QZONE_PUBLIC_ROUTES.forward).toEqual({ service: 'trpc.qzone.feeds_writer.FeedsWriter', method: 'ForwardFeed', oidb: '0x969a_1' });
    expect(Object.isFrozen(QZONE_PUBLIC_ROUTES)).toBe(true);
    expect(Object.values(QZONE_PUBLIC_ROUTES).every(Object.isFrozen)).toBe(true);
    expect(() => buildQzonePublicRequest('__proto__' as QzonePublicOperation, {})).toThrow();
  });

  test('builds entrance and recommendation requests without a tid-derived union', () => {
    expect(buildQzonePublicRequest('capabilities', { selfUin: '10001' })).toEqual({ uins: ['10001'], entrance_types: [1, 15] });
    expect(buildQzonePublicRequest('feeds', { refreshId: '10001_1700000000' })).toEqual({ refresh_id: '10001_1700000000' });
    const last = { uf_key: 'last-real-feed', future: { preserve: true } };
    expect(buildQzonePublicRequest('feeds', { refreshId: 'r', cursor: 'opaque-attach', lastUnionId: last }))
      .toEqual({ refresh_id: 'r', attach_info: 'opaque-attach', last_client_feed_union_id: last });
    expect(() => buildQzonePublicRequest('feeds', { refreshId: 'r', lastUnionId: { tid: 'legacy-tid' } })).toThrow('身份');
    expect(() => buildQzonePublicRequest('capabilities', { selfUin: 10001 as never })).toThrow();
  });
});

describe('QQ public Qzone request business data', () => {
  test('builds public detail and comment continuation with full context', () => {
    const source = feed();
    const common = source['cell_common'] as QzonePublicObject;
    expect(buildQzonePublicRequest('detail', { feed: source })).toEqual({
      union_id: common['union_id'], cell_feed_transfer: source['cell_feed_transfer'], feed_action_domain_type: 3, from_page: 1,
    });
    expect(buildQzonePublicRequest('comments', { feed: source, cursor: 'next-comments' })).toEqual({
      union_id: common['union_id'], cell_feed_transfer: source['cell_feed_transfer'], attach_info: 'next-comments',
    });
    for (const cursor of [undefined, '']) expect(() => buildQzonePublicRequest('comments', { feed: source, cursor })).toThrow();
    expect(() => buildQzonePublicRequest('detail', { feed: { union_id: { uf_key: 'reference-only' } } })).toThrow('cell_common');
  });

  test('replies retain the whole parent and honor fallback cursor and page size compatibility', () => {
    const source = feed();
    const comment = parent();
    const first = buildQzonePublicRequest('replies', { feed: source, comment });
    expect(first).toMatchObject({ cur_comment: comment, comment_attach_info: '', reply_attach_info: 'parent-replies', page_size: 20 });
    expect(first['cur_comment']).not.toBe(comment);
    expect((first['cur_comment'] as QzonePublicObject)['id']).toBe(0);
    expect(((first['cur_comment'] as QzonePublicObject)['user'] as QzonePublicObject)['uid']).toBeNull();
    expect(buildQzonePublicRequest('replies', { feed: source, comment, cursor: '', pageSize: 7.9 }))
      .toMatchObject({ reply_attach_info: 'parent-replies', page_size: 7 });
    expect(buildQzonePublicRequest('replies', { feed: source, comment, cursor: 'next-replies', pageSize: Number.MAX_SAFE_INTEGER + 1 }))
      .toMatchObject({ reply_attach_info: 'next-replies', page_size: Number.MAX_SAFE_INTEGER + 1 });
    expect(buildQzonePublicRequest('replies', { feed: source, comment: { id: 'parent-without-user' } }))
      .toMatchObject({ cur_comment: { id: 'parent-without-user' }, reply_attach_info: '' });
    for (const pageSize of [0, -1, NaN, Infinity, true, null]) {
      expect(() => buildQzonePublicRequest('replies', { feed: source, comment, pageSize: pageSize as number })).toThrow();
    }
  });

  test('distinguishes feed, parent-comment and reply like contexts', () => {
    for (const operation of ['like', 'unlike'] as const) {
      expect(buildQzonePublicRequest(operation, { feed: feed() })).toMatchObject({ like_key: 'feed-like', like_type: 1 });
    }
    for (const operation of ['commentLike', 'commentUnlike'] as const) {
      expect(buildQzonePublicRequest(operation, { feed: feed(), comment: parent() })).toMatchObject({ like_key: 'parent-like', like_type: 2 });
      const body = buildQzonePublicRequest(operation, { feed: feed(), comment: parent(), reply: reply() });
      expect(body).toMatchObject({ like_key: 'reply-like', like_type: 3 });
      expect(body).not.toHaveProperty('comment');
      expect(body).not.toHaveProperty('reply');
    }
  });

  test.each([
    { domain: 3, author: { uin: '10002', uid: 'u_author' }, identity: { target_uid: 'u_author' } },
    { domain: 3, author: { uin: '10002', uid: null }, identity: { target_uin: '10002' } },
    { domain: 1, author: { uin: '10002', uid: 'u_author' }, identity: { target_uin: '10002' } },
    { domain: 1, author: { uin: '', uid: 'u_author' }, identity: { target_uid: 'u_author' } },
    { domain: 3, author: { uin: '0', uid: 'u_author' }, identity: { target_uid: 'u_author' } },
    { domain: 3, author: { uin: 0, uid: 'u_author' }, identity: { target_uid: 'u_author' } },
  ])('uses the observed feed follow identity rule ($domain/$author)', ({ domain, author, identity }) => {
    const source = feed();
    (source['cell_common'] as QzonePublicObject)['domain_type'] = domain;
    source['cell_user_info'] = { user: author };
    for (const operation of ['follow', 'unfollow'] as const) {
      expect(buildQzonePublicRequest(operation, { feed: source })).toEqual({
        follow_from_type: 1, ...identity, follow_feed_id: 'synthetic-feed', cell_feed_transfer: source['cell_feed_transfer'],
      });
    }
  });

  test('rejects missing follow authors and does not substitute the ugc ID for follow_feed_id', () => {
    const source = feed();
    (source['cell_common'] as QzonePublicObject)['union_id'] = { ugc_id: 'ugc-only' };
    expect(buildQzonePublicRequest('follow', { feed: source })).not.toHaveProperty('follow_feed_id');
    source['cell_user_info'] = { user: { uin: '', uid: null } };
    expect(() => buildQzonePublicRequest('follow', { feed: source })).toThrow();
  });

  test('builds comments from text or raw rich items and snapshots every preserved field', () => {
    const source = feed();
    const rich = [{ type: 0, content: '  text  ', future: { color: 'blue' } }, { type: 1, uin: '10004', name: 'Mention', opaque: [0, false] }];
    const actor = { ...currentUser };
    const body = buildQzonePublicRequest('addComment', { feed: source, content: rich, user: actor });
    expect(body['comment']).toEqual({ user: currentUser, content: rich });
    (rich[0]!.future as QzonePublicObject)['color'] = 'changed';
    (source['cell_feed_transfer'] as QzonePublicObject)['opaque'] = 'changed';
    actor.nick = 'Changed after request';
    expect(((body['comment'] as QzonePublicObject)['content'] as QzonePublicObject[])[0]).toHaveProperty('future.color', 'blue');
    expect(body['cell_feed_transfer']).toHaveProperty('opaque.token', 'synthetic-context');
    expect(body['comment']).toHaveProperty('user.nick', 'Synthetic current');
    expect(buildQzonePublicRequest('addComment', { feed: feed(), content: ' \n ', user: currentUser }))
      .toHaveProperty('comment.content', [{ type: 0, content: ' \n ' }]);
    const unknownRich = [{}, { type: 'unknown', content: 42, future: { preserve: true } }];
    expect(buildQzonePublicRequest('addComment', { feed: feed(), content: unknownRich, user: currentUser }))
      .toHaveProperty('comment.content', unknownRich);
  });

  test('targets the parent or selected reply author while preserving nullable UID and raw ID zero', () => {
    const comment = parent();
    const parentReply = buildQzonePublicRequest('addReply', { feed: feed(), comment, content: 'reply', user: currentUser });
    expect(parentReply).toHaveProperty('comment.id', 0);
    expect(parentReply).toHaveProperty('reply.target_user', comment['user']);
    expect(parentReply).toHaveProperty('reply.target_user.uid', null);
    const selected = reply();
    expect(buildQzonePublicRequest('addReply', { feed: feed(), comment, reply: selected, content: [{ type: 0, content: 'reply' }], user: currentUser }))
      .toHaveProperty('reply.target_user', selected['user']);
    expect(comment).not.toHaveProperty('reply');
  });

  test('deletes using full original parent and reply snapshots', () => {
    const comment = parent();
    const selected = reply();
    expect(buildQzonePublicRequest('deleteComment', { feed: feed(), comment })).toHaveProperty('comment', comment);
    const body = buildQzonePublicRequest('deleteReply', { feed: feed(), comment, reply: selected });
    expect(body).toHaveProperty('comment', comment);
    expect(body).toHaveProperty('reply', selected);
    expect(body['comment']).not.toBe(comment);
    expect(body['reply']).not.toBe(selected);
  });

  test('forwards with an empty or exact text reason and no implicit second write', () => {
    expect(buildQzonePublicRequest('forward', { feed: feed() })).toHaveProperty('reason', '');
    expect(buildQzonePublicRequest('forward', { feed: feed(), reason: '  @{uin:10002,nick:Synthetic} \n' })).toHaveProperty('reason', '  @{uin:10002,nick:Synthetic} \n');
    expect(buildQzonePublicRequest('forward', { feed: feed() })).not.toHaveProperty('comment');
  });
});

describe('QQ public Qzone JSON and identity boundaries', () => {
  test.each([null, true, -1, Number.MAX_SAFE_INTEGER + 1, '', 'bad\nidentity'])('rejects invalid parent identities without changing their types (%j)', (id) => {
    expect(() => buildQzonePublicRequest('deleteComment', { feed: feed(), comment: { id } })).toThrow();
  });

  test('rejects non-JSON, circular, oversized and excessively nested raw context', () => {
    const circular: QzonePublicObject = {};
    circular['self'] = circular;
    const nested: QzonePublicObject = {};
    let cursor = nested;
    for (let index = 0; index < 80; index++) { cursor['nested'] = {}; cursor = cursor['nested'] as QzonePublicObject; }
    for (const context of [circular, { value: () => 0 }, { value: new Date() }, { value: Infinity }, { value: 'x'.repeat(8 * 1024 * 1024 + 1) }, nested]) {
      const source = feed();
      source['cell_feed_transfer'] = context;
      expect(() => buildQzonePublicRequest('detail', { feed: source })).toThrow();
    }
    const sparse: unknown[] = [];
    sparse.length = 1;
    const source = feed();
    source['cell_feed_transfer'] = sparse;
    expect(() => buildQzonePublicRequest('detail', { feed: source })).toThrow();
  });

  test.each(['', [], [null], [1], [false], ['text'], [[{}]]].map(value => ({ value })))('rejects malformed comment content ($value)', ({ value }) => {
    expect(() => buildQzonePublicRequest('addComment', { feed: feed(), content: value as never, user: currentUser })).toThrow();
  });

  test('preserves unknown JSON keys without triggering prototype setters', () => {
    const source = feed();
    source['cell_feed_transfer'] = JSON.parse('{"__proto__":{"synthetic":true},"constructor":{"opaque":0}}');
    const transfer = buildQzonePublicRequest('detail', { feed: source })['cell_feed_transfer'] as QzonePublicObject;
    expect(Object.prototype.hasOwnProperty.call(transfer, '__proto__')).toBe(true);
    expect(Object.getPrototypeOf(transfer)).toBe(Object.prototype);
    expect(Object.getOwnPropertyDescriptor(transfer, '__proto__')?.value).toEqual({ synthetic: true });
  });

  test('accepts a full returned feed larger than an old reference-handle limit', () => {
    const source = feed();
    source['cell_comment'] = { comments: [{ id: 'large-comment', content: [{ type: 0, content: 'x'.repeat(70000) }] }] };
    expect(buildQzonePublicRequest('detail', { feed: source })).toHaveProperty('union_id.uf_key', 'synthetic-feed');
  });
});

describe('QQ public Qzone response acknowledgements', () => {
  test('requires numeric gateway retcode zero and object data without exposing server text', () => {
    for (const response of [null, {}, { retcode: '0', data: {} }, { retcode: -1, data: {}, message: 'synthetic-private' }, { retcode: 0, data: [] }, { retcode: 0, data: null }]) {
      expect(() => parseQzonePublicResponse(response, 'feeds')).toThrow();
    }
    try { parseQzonePublicResponse({ retcode: -1, data: {}, message: 'synthetic-private' }, 'feeds'); } catch (error) {
      expect((error as Error).message).not.toContain('synthetic-private');
    }
  });

  test.each([
    ['upvote', 'upvote'], ['downvote', 'upvote'], ['like', 'like'], ['unlike', 'like'],
    ['commentLike', 'like'], ['commentUnlike', 'like'], ['addComment', 'comment'], ['addReply', 'reply'],
  ] as const)('checks the %s business result beyond gateway success', (operation, field) => {
    for (const result of [undefined, null, false, 0, '']) expect(() => parseQzonePublicResponse({ retcode: 0, data: { [field]: result } }, operation)).toThrow();
    expect(parseQzonePublicResponse({ retcode: 0, data: { [field]: { status: false, count: 0 }, future: { keep: true } } }, operation))
      .toEqual({ [field]: { status: false, count: 0 }, future: { keep: true } });
  });

  test.each(['follow', 'unfollow'] as const)('checks optional %s business ret_code and tolerates protobuf zero defaults', (operation) => {
    for (const code of [undefined, null, 0, '0']) expect(parseQzonePublicResponse({ retcode: 0, data: { ret_code: code, future: true } }, operation)).toHaveProperty('future', true);
    for (const code of [-1, 1, '1', false, '', {}, []]) expect(() => parseQzonePublicResponse({ retcode: 0, data: { ret_code: code, ret_msg: 'synthetic-private' } }, operation)).toThrow();
  });

  test.each(['deleteComment', 'deleteReply', 'forward'] as const)('does not invent an undocumented success field for %s', (operation) => {
    expect(parseQzonePublicResponse({ retcode: 0, data: {} }, operation)).toEqual({});
  });

  test('returns preserved business data snapshots and permits a whole response above an old handle limit', () => {
    const data = { feeds: [{ feed: feed() }], has_more: false, future: { retained: true }, text: 'x'.repeat(70000) };
    const parsed = parseQzonePublicResponse({ retcode: 0, data }, 'feeds');
    expect(parsed).toEqual(data);
    data.future.retained = false;
    expect(parsed).toHaveProperty('future.retained', true);
  });
});
