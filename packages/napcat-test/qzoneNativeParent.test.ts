// StreamBasic must be evaluated before OneBotAction because of their circular import.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, it, vi } from 'vitest';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { CommentQzone } from '@/napcat-onebot/action/extends/qzone/CommentQzone';
import { QzoneFeedReferenceExample, QzoneParentCommentSchema, QzoneUserSchema } from '@/napcat-onebot/action/extends/qzone/common';
import { normalizeQzoneCommentPayload } from '@/napcat-onebot/action/extends/qzone/common-snowluma';
import type { QzoneComment } from '@/napcat-core/data/qzone-rpc';

function createCore () {
  return {
    apis: {
      QzoneApi: {
        comment: vi.fn().mockResolvedValue({ comment_id: 'new-reply', comment: { id: 'new-reply' } }),
      },
    },
    context: { logger: { logError: vi.fn() } },
  };
}

function parentComment () {
  return {
    id: '0',
    user: { uin: '10002', uid: null, nick: '作者', portrait: { type: 1, opaque: 'keep' } },
    content: [{ type: 0, content: '原评论', extra: { keep: true } }],
    replys: [{ id: 'inline-reply', user: { uid: null }, opaque_reply: [false, 0] }],
    like: { id: 'raw-like-key', status: 0, count: 1 },
    opaque_parent: { keep: ['9007199254740993', null] },
  } satisfies QzoneComment;
}

describe('Qzone native parent with nullable raw UID', () => {
  it('retains null UID and complete raw parent fields through the real handle parser', async () => {
    const core = createCore();
    const parent = parentComment();
    const snapshot = structuredClone(parent);
    const payload = { feed_ref: QzoneFeedReferenceExample, content: '回复', comment: parent };
    const expectedPayload = structuredClone(payload);

    const normalized = normalizeQzoneCommentPayload(payload);
    expect(normalized.format).toBe('native');
    if (normalized.format === 'native') expect(normalized.comment).toBe(parent);
    const result = await new CommentQzone(undefined as never, core as never).handle(payload, 'test', {} as never);

    expect(result).toMatchObject({ status: 'ok', data: { comment_id: 'new-reply' } });
    expect(core.apis.QzoneApi.comment).toHaveBeenCalledExactlyOnceWith(QzoneFeedReferenceExample, '回复', snapshot, undefined);
    expect(core.apis.QzoneApi.comment.mock.calls[0]?.[2]).toHaveProperty('user.uid', null);
    expect(parent).toEqual(snapshot);
    expect(parent.user.uid).toBeNull();
    expect(payload).toEqual(expectedPayload);
  });

  it('keeps a nullable raw parent separate from an explicit reply target', async () => {
    const core = createCore();
    const parent = parentComment();
    const snapshot = structuredClone(parent);
    const target = { uin: '10003', uid: 'u_target', nick: '接收者', extra: { keep: true } };
    const expectedTarget = structuredClone(target);

    const result = await new CommentQzone(undefined as never, core as never).handle({
      feed_ref: QzoneFeedReferenceExample, content: '指定回复', comment: parent, reply_user: target,
    }, 'test', {} as never);

    expect(result.status).toBe('ok');
    expect(core.apis.QzoneApi.comment).toHaveBeenCalledExactlyOnceWith(QzoneFeedReferenceExample, '指定回复', snapshot, expectedTarget);
    expect(parent).toEqual(snapshot);
    expect(target).toEqual(expectedTarget);
  });

  it('allows null only in raw parent UID without relaxing parent identity or explicit target validation', async () => {
    const parentSchema = TypeCompiler.Compile(QzoneParentCommentSchema);
    const userSchema = TypeCompiler.Compile(QzoneUserSchema);
    expect(parentSchema.Check(parentComment())).toBe(true);
    expect(userSchema.Check({ uin: '10002', uid: null })).toBe(false);
    const invalidParents = [
      { id: '0', user: { uin: '10002', uid: false } },
      { id: '0', user: { uin: '10002', uid: 0 } },
      { id: '0', user: { uin: '10002', uid: {} } },
      { id: 0, user: { uin: '10002', uid: null } },
      { id: '0', user: { uid: null } },
      { id: '0', user: { uin: Number.MAX_SAFE_INTEGER + 1, uid: null } },
    ];
    const core = createCore();
    const action = new CommentQzone(undefined as never, core as never);
    for (const comment of invalidParents) {
      const result = await action.handle({ feed_ref: QzoneFeedReferenceExample, content: '回复', comment } as never, 'test', {} as never);
      expect(result.status).toBe('failed');
    }
    const invalidTarget = await action.handle({
      feed_ref: QzoneFeedReferenceExample, content: '回复', comment: parentComment(), reply_user: { uin: '10003', uid: null },
    } as never, 'test', {} as never);
    expect(invalidTarget.status).toBe('failed');
    expect(core.apis.QzoneApi.comment).not.toHaveBeenCalled();
  });
});
