// StreamBasic must be evaluated before OneBotAction because of their circular import.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, it, vi } from 'vitest';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { GetQzoneFeeds, GetQzoneFeedsPayloadSchema } from '@/napcat-onebot/action/extends/qzone/GetQzoneFeeds';
import { GetQzoneMsgList, GetQzoneMsgListPayloadSchema } from '@/napcat-onebot/action/extends/qzone/GetQzoneMsgList';
import { GetQzoneMsgDetail, GetQzoneMsgDetailPayloadSchema } from '@/napcat-onebot/action/extends/qzone/GetQzoneMsgDetail';
import { LikeQzone } from '@/napcat-onebot/action/extends/qzone/LikeQzone';
import { UnlikeQzone } from '@/napcat-onebot/action/extends/qzone/UnlikeQzone';
import { CommentQzone } from '@/napcat-onebot/action/extends/qzone/CommentQzone';
import { QzoneFeedItemExample, QzoneFeedReferenceExample } from '@/napcat-onebot/action/extends/qzone/common';

function createCore () {
  const QzoneApi = {
    getFriendFeeds: vi.fn().mockResolvedValue({ feeds: [QzoneFeedItemExample], has_more: false, next_cursor: null }),
    getMsgList: vi.fn().mockResolvedValue({ msglist: [QzoneFeedItemExample], has_more: false, next_cursor: null }),
    getMsgDetail: vi.fn().mockResolvedValue({ ...QzoneFeedItemExample, comments: [] }),
    setLike: vi.fn().mockResolvedValue(undefined),
    comment: vi.fn().mockResolvedValue({ comment_id: 'new-comment', comment: { id: 'new-comment' } }),
  };
  return { apis: { QzoneApi }, context: { logger: { logError: vi.fn() } } };
}

describe('QQ空间 OneBot actions', () => {
  it('passes the opaque cursor through and keeps raw feed fields in the result', async () => {
    const core = createCore();
    const action = new GetQzoneFeeds(undefined as never, core as never);

    const first = await action._handle({});
    await action._handle({ cursor: 'next-page' });

    expect(core.apis.QzoneApi.getFriendFeeds.mock.calls).toEqual([[undefined], ['next-page']]);
    expect(first.feeds[0]?.feed_ref).toEqual(QzoneFeedReferenceExample);
    expect(first.feeds[0]?.feed).toEqual(QzoneFeedItemExample.feed);
    expect(first).not.toHaveProperty('total');
  });

  it('uses the current account by default and preserves numeric or string target account IDs', async () => {
    const core = createCore();
    const action = new GetQzoneMsgList(undefined as never, core as never);

    await action._handle({});
    await action._handle({ target_uin: 123456, cursor: 'next-page' });
    await action._handle({ target_uin: '9007199254740993' });

    expect(core.apis.QzoneApi.getMsgList.mock.calls).toEqual([
      [undefined, undefined],
      ['123456', 'next-page'],
      ['9007199254740993', undefined],
    ]);
  });

  it('forwards the complete reference to detail and both like operations', async () => {
    const core = createCore();
    const reference = {
      ...QzoneFeedReferenceExample,
      cell_feed_transfer: { source_token: 'opaque-transfer', unknown_field: 7 },
    };

    await new GetQzoneMsgDetail(undefined as never, core as never)._handle({ feed_ref: reference });
    await new LikeQzone(undefined as never, core as never)._handle({ feed_ref: reference });
    await new UnlikeQzone(undefined as never, core as never)._handle({ feed_ref: reference });

    expect(core.apis.QzoneApi.getMsgDetail).toHaveBeenCalledExactlyOnceWith(reference);
    expect(core.apis.QzoneApi.setLike.mock.calls).toEqual([[reference, true], [reference, false]]);
  });

  it('preserves opaque reference fields and empty auxiliary union keys through schema parsing', async () => {
    const core = createCore();
    const reference = {
      union_id: {
        uf_key: 'feed-key',
        ugc_id: '',
        feed_id: '',
        serialized_data: '',
        ext_ids: [{ ext_id_type: 5, str: 'tid', unknown_numeric: '9007199254740993' }],
        unknown_field: { keep: 'unchanged' },
      },
      cell_feed_transfer: { unknown_fields: [0, false, 'opaque-transfer'] },
    };
    const action = new GetQzoneMsgDetail(undefined as never, core as never);
    const expected = structuredClone(reference);

    const result = await action.handle({ feed_ref: reference }, 'test', {} as never);

    expect(result.status).toBe('ok');
    expect(core.apis.QzoneApi.getMsgDetail).toHaveBeenCalledExactlyOnceWith(expected);
    expect(reference).toEqual(expected);
    expect(reference.union_id.ext_ids[0]?.unknown_numeric).toBe('9007199254740993');
  });

  it('preserves a complete parent comment and empty auxiliary UID through the real handle parser', async () => {
    const core = createCore();
    const parent = {
      id: '0',
      user: { uin: '10002', uid: '', nick: '评论作者', opaque_user: { keep: true } },
      content: [{ type: 0, content: '原评论', unknown_segment: 'keep' }],
      replys: [{ id: 'reply-1', content: [{ type: 0, content: '楼中楼' }] }],
      like: { id: 'comment-like-key', count: 2, status: 0 },
      unknown_field: { serialized: '9007199254740993' },
    };
    const expected = structuredClone(parent);
    const action = new CommentQzone(undefined as never, core as never);

    const result = await action.handle({
      feed_ref: QzoneFeedReferenceExample, content: '回复', comment: parent,
    }, 'test', {} as never);

    expect(result.status).toBe('ok');
    expect(core.apis.QzoneApi.comment).toHaveBeenCalledExactlyOnceWith(
      QzoneFeedReferenceExample, '回复', expected, undefined
    );
    expect(parent).toEqual(expected);
  });

  it('publishes root comments and replies without synthesizing parent identities', async () => {
    const core = createCore();
    const action = new CommentQzone(undefined as never, core as never);
    const parent = { id: '0', user: { uin: '10002', uid: 'u_parent' }, opaque_field: 'keep' };
    const target = { uin: '10003', uid: 'u_reply', nick: '回复目标' };

    const result = await action._handle({ feed_ref: QzoneFeedReferenceExample, content: '正文' });
    await action._handle({ feed_ref: QzoneFeedReferenceExample, content: '回复', comment: parent });
    await action._handle({ feed_ref: QzoneFeedReferenceExample, content: '楼中楼', comment: parent, reply_user: target });

    expect(core.apis.QzoneApi.comment.mock.calls).toEqual([
      [QzoneFeedReferenceExample, '正文', undefined, undefined],
      [QzoneFeedReferenceExample, '回复', parent, undefined],
      [QzoneFeedReferenceExample, '楼中楼', parent, target],
    ]);
    expect(result.comment_id).toBe('new-comment');
  });

  it('rejects empty comments and reply targets without a parent before invoking the API', async () => {
    const core = createCore();
    const action = new CommentQzone(undefined as never, core as never);

    const blank = await action.handle({ feed_ref: QzoneFeedReferenceExample, content: '  \n ' }, 'test', {} as never);
    const orphan = await action.handle({
      feed_ref: QzoneFeedReferenceExample,
      content: '正文',
      reply_user: { uin: '10003' },
    }, 'test', {} as never);

    expect(blank.status).toBe('failed');
    expect(orphan.status).toBe('failed');
    expect(core.apis.QzoneApi.comment).not.toHaveBeenCalled();
  });

  it('rejects invalid references, oversized cursors and unsupported legacy pagination', () => {
    const feeds = TypeCompiler.Compile(GetQzoneFeedsPayloadSchema);
    const list = TypeCompiler.Compile(GetQzoneMsgListPayloadSchema);
    const detail = TypeCompiler.Compile(GetQzoneMsgDetailPayloadSchema);

    expect(feeds.Check({ cursor: 'a'.repeat(16385) })).toBe(false);
    expect(feeds.Check({ page_num: 1, count: 10 })).toBe(false);
    expect(list.Check({ pos: 0, num: 20 })).toBe(false);
    expect(list.Check({ target_uin: Number.MAX_SAFE_INTEGER + 1 })).toBe(false);
    expect(list.Check({ target_uin: 'not-a-qq-number' })).toBe(false);
    expect(detail.Check({ tid: 'shuoshuo-tid' })).toBe(false);
    expect(detail.Check({ feed_ref: { union_id: [] } })).toBe(false);
    expect(detail.Check({ feed_ref: { union_id: {} } })).toBe(false);
    expect(detail.Check({ feed_ref: { ...QzoneFeedReferenceExample, feed_action_domain_type: 0 } })).toBe(false);
  });

  it('surfaces API errors as failed actions and only calls the write API once', async () => {
    const core = createCore();
    core.apis.QzoneApi.setLike.mockRejectedValue(new Error('QQ空间返回的点赞结果不完整'));
    const action = new LikeQzone(undefined as never, core as never);

    const result = await action.handle({ feed_ref: QzoneFeedReferenceExample }, 'test', {} as never);

    expect(result.status).toBe('failed');
    expect(result.message).toContain('点赞结果不完整');
    expect(core.apis.QzoneApi.setLike).toHaveBeenCalledTimes(1);
  });

  it('returns explicit null data for both successful like actions', async () => {
    const core = createCore();
    for (const Action of [LikeQzone, UnlikeQzone]) {
      const result = await new Action(undefined as never, core as never).handle(
        { feed_ref: QzoneFeedReferenceExample }, 'test', {} as never
      );
      expect(JSON.parse(JSON.stringify(result))).toMatchObject({ status: 'ok', retcode: 0, data: null });
    }
  });

  it('declares the SnowLuma action names with schema-valid payload and result examples', () => {
    const core = createCore();
    const actions = [
      new GetQzoneFeeds(undefined as never, core as never),
      new GetQzoneMsgList(undefined as never, core as never),
      new GetQzoneMsgDetail(undefined as never, core as never),
      new LikeQzone(undefined as never, core as never),
      new UnlikeQzone(undefined as never, core as never),
      new CommentQzone(undefined as never, core as never),
    ];

    expect(actions.map(action => action.actionName)).toEqual([
      'get_qzone_feeds', 'get_qzone_msg_list', 'get_qzone_msg_detail', 'like_qzone', 'unlike_qzone', 'comment_qzone',
    ]);
    for (const action of actions) {
      expect(TypeCompiler.Compile(action.payloadSchema).Check(action.payloadExample)).toBe(true);
      expect(TypeCompiler.Compile(action.returnSchema).Check(action.returnExample)).toBe(true);
    }
  });
});
