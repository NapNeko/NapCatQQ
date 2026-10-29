// StreamBasic must be evaluated before OneBotAction because of their circular import.
import '../napcat-onebot/action/stream/StreamBasic';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { GetQzoneFeeds } from '@/napcat-onebot/action/extends/qzone/GetQzoneFeeds';
import { GetQzoneMsgList } from '@/napcat-onebot/action/extends/qzone/GetQzoneMsgList';
import { GetQzoneMsgDetail } from '@/napcat-onebot/action/extends/qzone/GetQzoneMsgDetail';
import { LikeQzone } from '@/napcat-onebot/action/extends/qzone/LikeQzone';
import { UnlikeQzone } from '@/napcat-onebot/action/extends/qzone/UnlikeQzone';
import { CommentQzone } from '@/napcat-onebot/action/extends/qzone/CommentQzone';
import { SendQzoneMsg } from '@/napcat-onebot/action/extends/SendQzoneMsg';
import { DeleteQzoneMsg } from '@/napcat-onebot/action/extends/DeleteQzoneMsg';
import { QzoneFeedItemExample, QzoneFeedReferenceExample } from '@/napcat-onebot/action/extends/qzone/common';
import { SlQzoneFeedsExample, SlQzoneMsgDetailExample, SlQzoneMsgListExample } from '@/napcat-onebot/action/extends/qzone/common-snowluma';

const tempDirs: string[] = [];

function createCore () {
  const QzoneApi = {
    getFriendFeeds: vi.fn().mockResolvedValue({ feeds: [QzoneFeedItemExample], has_more: false, next_cursor: null }),
    getMsgList: vi.fn().mockResolvedValue({ msglist: [QzoneFeedItemExample], has_more: false, next_cursor: null }),
    getMsgDetail: vi.fn().mockResolvedValue({ ...QzoneFeedItemExample, comments: [] }),
    setLike: vi.fn().mockResolvedValue(undefined),
    comment: vi.fn().mockResolvedValue({ comment_id: 'native-comment', comment: { id: 'native-comment', extra: 'raw' } }),
    getSnowlumaFeeds: vi.fn().mockResolvedValue(SlQzoneFeedsExample),
    getSnowlumaMsgList: vi.fn().mockResolvedValue(SlQzoneMsgListExample),
    getSnowlumaMsgDetail: vi.fn().mockResolvedValue(SlQzoneMsgDetailExample),
    setSnowlumaLike: vi.fn().mockResolvedValue(undefined),
    commentSnowluma: vi.fn().mockResolvedValue({ comment_id: 'sl-comment' }),
    uploadCommentImage: vi.fn().mockResolvedValue({ url: 'https://images.example.test/comment.png' }),
    publishMsg: vi.fn().mockResolvedValue({ tid: 'published', time: 1700000000 }),
  };
  return {
    NapCatTempPath: '',
    selfInfo: { uin: '10001', uid: 'u_current' },
    apis: {
      QzoneApi,
      WebApi: {
        uploadImageToQzone: vi.fn().mockResolvedValue('published-richval'),
        publishQzoneMsg: vi.fn().mockResolvedValue({ tid: 'published-image', time: 1700000001 }),
        deleteQzoneMsg: vi.fn().mockResolvedValue(undefined),
      },
    },
    context: { logger: { logError: vi.fn() } },
  };
}

function withImageDirectory (core: ReturnType<typeof createCore>) {
  const directory = mkdtempSync(join(tmpdir(), 'napcat-qzone-sl-actions-'));
  tempDirs.push(directory);
  core.NapCatTempPath = directory;
  return directory;
}

afterEach(() => {
  for (const directory of tempDirs.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('QQ空间 SnowLuma action compatibility', () => {
  it('defaults to SL feeds and routes old opaque cursors before applying SL defaults', async () => {
    const core = createCore();
    const action = new GetQzoneFeeds(undefined as never, core as never);

    const result = await action.handle({}, 'test', {} as never);
    await action.handle({ page_num: '2', count: '5', unrelated: 'ignored' } as never, 'test', {} as never);
    await action.handle({ cursor: 'slqf:continuation' }, 'test', {} as never);
    await action.handle({ cursor: 'old-native-cursor' }, 'test', {} as never);
    await action.handle({ format: 'native' }, 'test', {} as never);

    expect(result).toMatchObject({ status: 'ok', data: SlQzoneFeedsExample });
    expect(core.apis.QzoneApi.getSnowlumaFeeds.mock.calls).toEqual([
      [1, 10, undefined], [2, 5, undefined], [1, 10, 'slqf:continuation'],
    ]);
    expect(core.apis.QzoneApi.getFriendFeeds.mock.calls).toEqual([['old-native-cursor'], [undefined]]);
  });

  it('defaults to SL list pagination while retaining native raw results and lossless target IDs', async () => {
    const core = createCore();
    const action = new GetQzoneMsgList(undefined as never, core as never);

    const result = await action.handle({}, 'test', {} as never);
    await action.handle({ target_uin: '9007199254740993', pos: '40', num: '10' }, 'test', {} as never);
    const native = await action.handle({ format: 'native', target_uin: 10002 }, 'test', {} as never);
    await action.handle({ target_uin: '10003', cursor: 'native-list-cursor' }, 'test', {} as never);

    expect(result).toMatchObject({ status: 'ok', data: SlQzoneMsgListExample });
    expect(core.apis.QzoneApi.getSnowlumaMsgList.mock.calls).toEqual([
      [undefined, 0, 20], ['9007199254740993', 40, 10],
    ]);
    expect(core.apis.QzoneApi.getMsgList.mock.calls).toEqual([['10002', undefined], ['10003', 'native-list-cursor']]);
    expect(native).toHaveProperty('data.msglist.0.feed_ref', QzoneFeedReferenceExample);
    expect(native).toHaveProperty('data.msglist.0.feed', QzoneFeedItemExample.feed);
  });

  it('routes detail by its explicit anchor and does not project native raw comments', async () => {
    const core = createCore();
    const action = new GetQzoneMsgDetail(undefined as never, core as never);
    const reference = { ...QzoneFeedReferenceExample, cell_feed_transfer: { keep: [0, false, 'raw'] } };

    const sl = await action.handle({ tid: 0, target_uin: 10002, pos: '2', num: '3' }, 'test', {} as never);
    const native = await action.handle({ feed_ref: reference }, 'test', {} as never);

    expect(sl).toMatchObject({ status: 'ok', data: SlQzoneMsgDetailExample });
    expect(core.apis.QzoneApi.getSnowlumaMsgDetail).toHaveBeenCalledExactlyOnceWith('0', '10002', 2, 3);
    expect(core.apis.QzoneApi.getMsgDetail).toHaveBeenCalledExactlyOnceWith(reference);
    expect(native).toHaveProperty('data.feed', QzoneFeedItemExample.feed);
  });

  it('uses one like backend per anchor and returns explicit null for both SL operations', async () => {
    const core = createCore();
    for (const Action of [LikeQzone, UnlikeQzone]) {
      const action = new Action(undefined as never, core as never);
      const result = await action.handle({ tid: 'post', target_uin: '10002', abstime: '123' }, 'test', {} as never);
      expect(JSON.parse(JSON.stringify(result))).toMatchObject({ status: 'ok', data: null });
      await action.handle({ feed_ref: QzoneFeedReferenceExample }, 'test', {} as never);
    }

    expect(core.apis.QzoneApi.setSnowlumaLike.mock.calls).toEqual([
      ['post', '10002', true, 123], ['post', '10002', false, 123],
    ]);
    expect(core.apis.QzoneApi.setLike.mock.calls).toEqual([[QzoneFeedReferenceExample, true], [QzoneFeedReferenceExample, false]]);
  });

  it('normalizes SL root comments and complete reply pairs while retaining native comments', async () => {
    const core = createCore();
    const action = new CommentQzone(undefined as never, core as never);
    const root = await action.handle({ tid: 'post', content: false, ignored: true } as never, 'test', {} as never);
    await action.handle({
      tid: 'post',
      target_uin: 10002,
      content: '回复',
      comment_id: 0,
      comment_uin: 10003,
      reply_uin: '10004',
      reply_name: '  回复目标  ',
      images: [],
    }, 'test', {} as never);
    const native = await action.handle({ feed_ref: QzoneFeedReferenceExample, content: '原生评论' }, 'test', {} as never);

    expect(root).toMatchObject({ status: 'ok', data: { comment_id: 'sl-comment' } });
    expect(core.apis.QzoneApi.commentSnowluma.mock.calls).toEqual([
      ['post', 'false', undefined, undefined],
      ['post', '回复', '10002', { comment_id: '0', comment_uin: '10003', reply_uin: '10004', reply_name: '  回复目标  ' }],
    ]);
    expect(native).toMatchObject({ status: 'ok', data: { comment_id: 'native-comment', comment: { id: 'native-comment', extra: 'raw' } } });
    expect(core.apis.QzoneApi.comment).toHaveBeenCalledExactlyOnceWith(QzoneFeedReferenceExample, '原生评论', undefined, undefined);
  });

  it('uploads root comment images in order and removes temporary sources while preserving user files', async () => {
    const core = createCore();
    const directory = withImageDirectory(core);
    const localImage = join(directory, 'user-image.png');
    writeFileSync(localImage, 'user image');
    core.apis.QzoneApi.uploadCommentImage
      .mockResolvedValueOnce({ url: 'https://images.example.test/first.png' })
      .mockResolvedValueOnce({ url: 'https://images.example.test/second.png' });

    await new CommentQzone(undefined as never, core as never)._handle({
      tid: 'post', content: '图片评论', images: ['base64://aGVsbG8=', pathToFileURL(localImage).href],
    });

    expect(core.apis.QzoneApi.uploadCommentImage.mock.calls).toEqual([
      [Buffer.from('hello').toString('base64')], [Buffer.from('user image').toString('base64')],
    ]);
    expect(core.apis.QzoneApi.commentSnowluma).toHaveBeenCalledExactlyOnceWith('post', '图片评论', undefined, {
      imageUrls: ['https://images.example.test/first.png', 'https://images.example.test/second.png'],
    });
    expect(readdirSync(directory)).toEqual(['user-image.png']);
    expect(readFileSync(localImage, 'utf8')).toBe('user image');
    expect(core.apis.QzoneApi.comment).not.toHaveBeenCalled();
  });

  it.each(['upload failure', 'invalid URL'])('stops comment publishing after %s and cleans temporary images', async (failure) => {
    const core = createCore();
    const directory = withImageDirectory(core);
    if (failure === 'upload failure') core.apis.QzoneApi.uploadCommentImage.mockRejectedValue(new Error('upload failed'));
    else core.apis.QzoneApi.uploadCommentImage.mockResolvedValue({ url: 'javascript:alert(1)' });

    await expect(new CommentQzone(undefined as never, core as never)._handle({
      tid: 'post', content: '图片评论', images: ['base64://aGVsbG8=', 'base64://d29ybGQ='],
    })).rejects.toThrow();

    expect(core.apis.QzoneApi.uploadCommentImage).toHaveBeenCalledTimes(1);
    expect(core.apis.QzoneApi.commentSnowluma).not.toHaveBeenCalled();
    expect(core.apis.QzoneApi.comment).not.toHaveBeenCalled();
    expect(readdirSync(directory)).toEqual([]);
  });

  it('stops the image comment chain when either account identifier changes during upload', async () => {
    for (const change of [{ uin: '10002' }, { uid: 'u_other' }]) {
      const core = createCore();
      const directory = withImageDirectory(core);
      core.apis.QzoneApi.uploadCommentImage.mockImplementationOnce(async () => {
        Object.assign(core.selfInfo, change);
        return { url: 'https://images.example.test/uploaded.png' };
      });

      await expect(new CommentQzone(undefined as never, core as never)._handle({
        tid: 'post', content: '图片评论', images: ['base64://aGVsbG8=', 'base64://d29ybGQ='],
      })).rejects.toThrow('QQ账号已切换');

      expect(core.apis.QzoneApi.uploadCommentImage).toHaveBeenCalledTimes(1);
      expect(core.apis.QzoneApi.commentSnowluma).not.toHaveBeenCalled();
      expect(readdirSync(directory)).toEqual([]);
    }
  });

  it('rejects ambiguous routing and malformed known parameters before any API call', async () => {
    const cases = [
      [GetQzoneFeeds, { format: 'native', page_num: 1 }],
      [GetQzoneFeeds, { cursor: 'native-cursor', count: 10 }],
      [GetQzoneFeeds, { format: 'native', cursor: 'slqf:cursor' }],
      [GetQzoneFeeds, { format: 'snowluma', cursor: 'native-cursor' }],
      [GetQzoneFeeds, { page_num: false }],
      [GetQzoneFeeds, { count: 51 }],
      [GetQzoneFeeds, { target_uin: '10002' }],
      [GetQzoneMsgList, { format: 'native', pos: 0 }],
      [GetQzoneMsgList, { cursor: 'native-cursor', num: 20 }],
      [GetQzoneMsgList, { format: 'snowluma', cursor: 'native-cursor' }],
      [GetQzoneMsgList, { cursor: 'slqf:cursor' }],
      [GetQzoneMsgList, { target_uin: Number.MAX_SAFE_INTEGER + 1 }],
      [GetQzoneMsgList, { pos: null }],
      [GetQzoneMsgList, { num: 0 }],
      [GetQzoneMsgDetail, {}],
      [GetQzoneMsgDetail, { feed_ref: QzoneFeedReferenceExample, tid: 'post' }],
      [GetQzoneMsgDetail, { feed_ref: QzoneFeedReferenceExample, pos: 0 }],
      [GetQzoneMsgDetail, { tid: true }],
      [GetQzoneMsgDetail, { tid: Number.MAX_SAFE_INTEGER + 1 }],
      [LikeQzone, { tid: 'post', abstime: -1 }],
      [LikeQzone, { tid: 'post', abstime: true }],
      [UnlikeQzone, { feed_ref: QzoneFeedReferenceExample, target_uin: '10002' }],
      [CommentQzone, { tid: 'post', content: 'x', comment_id: 0 }],
      [CommentQzone, { tid: 'post', content: 'x', comment_uin: '10002' }],
      [CommentQzone, { tid: 'post', content: 'x', reply_uin: '10002' }],
      [CommentQzone, { tid: 'post', content: 'x', reply_name: 'name' }],
      [CommentQzone, { tid: 'post', content: 'x', reply_uin: '10002', reply_name: 'name' }],
      [CommentQzone, { tid: 'post', content: 'x', comment_id: 0, comment_uin: '9007199254740993' }],
      [CommentQzone, { tid: 'post', content: 'x', comment: { id: 'native-parent', user: { uin: '10002' } } }],
      [CommentQzone, { feed_ref: QzoneFeedReferenceExample, content: 'x', images: [] }],
      [CommentQzone, { tid: 'post', content: null }],
      [CommentQzone, { tid: 'post', content: 'x', images: [''] }],
      [DeleteQzoneMsg, { tid: Number.MAX_SAFE_INTEGER + 1 }],
      [DeleteQzoneMsg, { tid: 'post', target_uin: '10002' }],
      [SendQzoneMsg, { content: 'x', ugc_right: true }],
      [SendQzoneMsg, { content: 'x', target_uins: [Number.MAX_SAFE_INTEGER + 1] }],
    ] as const;
    for (const [Action, payload] of cases) {
      const core = createCore();
      const result = await new Action(undefined as never, core as never).handle(payload as never, 'test', {} as never);
      expect(result.status, JSON.stringify(payload)).toBe('failed');
      for (const method of [...Object.values(core.apis.QzoneApi), ...Object.values(core.apis.WebApi)]) {
        expect(method, JSON.stringify(payload)).not.toHaveBeenCalled();
      }
    }
  });

  it('validates all reply and identity fields before any image upload', async () => {
    const core = createCore();
    const action = new CommentQzone(undefined as never, core as never);
    const cases = [
      { tid: 'post', comment_id: 0, comment_uin: 10002 },
      { tid: 'post', comment_id: 0 },
      { tid: 'post', reply_uin: 10002, reply_name: 'name' },
      { tid: 'post\n' },
      { tid: 'post', comment_uin: false },
      { tid: 'post', reply_name: ['invalid'] },
      { tid: 'post', images: ['base64://aGVsbG8=', 1] },
    ];
    for (const payload of cases) {
      const result = await action.handle({ content: 'x', images: ['base64://aGVsbG8='], ...payload } as never, 'test', {} as never);
      expect(result.status).toBe('failed');
    }
    expect(core.apis.QzoneApi.uploadCommentImage).not.toHaveBeenCalled();
    expect(core.apis.QzoneApi.commentSnowluma).not.toHaveBeenCalled();
  });

  it('does not retry uncertain SL writes through any native backend', async () => {
    const core = createCore();
    core.apis.QzoneApi.setSnowlumaLike.mockRejectedValue(new Error('写入结果未知'));
    core.apis.QzoneApi.commentSnowluma.mockRejectedValue(new Error('写入结果未知'));

    expect((await new LikeQzone(undefined as never, core as never).handle({ tid: 'post' }, 'test', {} as never)).status).toBe('failed');
    expect((await new CommentQzone(undefined as never, core as never).handle({ tid: 'post', content: 'x' }, 'test', {} as never)).status).toBe('failed');
    expect(core.apis.QzoneApi.setSnowlumaLike).toHaveBeenCalledExactlyOnceWith('post', undefined, true, 0);
    expect(core.apis.QzoneApi.commentSnowluma).toHaveBeenCalledExactlyOnceWith('post', 'x', undefined, undefined);
    expect(core.apis.QzoneApi.setLike).not.toHaveBeenCalled();
    expect(core.apis.QzoneApi.comment).not.toHaveBeenCalled();
  });

  it('keeps server publish times, preserves empty image captions, and marks missing times as unknown', async () => {
    const core = createCore();
    const directory = withImageDirectory(core);
    const action = new SendQzoneMsg(undefined as never, core as never);

    await expect(action._handle({ content: false })).resolves.toEqual({ tid: 'published', time: 1700000000 });
    await expect(action._handle({ content: '', images: ['base64://aGVsbG8='] }))
      .resolves.toEqual({ tid: 'published-image', time: 1700000001 });
    core.apis.QzoneApi.publishMsg.mockResolvedValue({ tid: 'old-mock' } as never);
    await expect(action._handle({ content: 'x' })).resolves.toEqual({ tid: 'old-mock', time: 0 });

    expect(core.apis.QzoneApi.publishMsg).toHaveBeenNthCalledWith(1, 'false', 1, undefined);
    expect(core.apis.WebApi.publishQzoneMsg).toHaveBeenCalledExactlyOnceWith('', ['published-richval'], 1, undefined);
    expect(readdirSync(directory)).toEqual([]);
  });

  it('normalizes safe numeric delete IDs and serializes success with explicit null', async () => {
    const core = createCore();
    const result = await new DeleteQzoneMsg(undefined as never, core as never).handle({ tid: 0 }, 'test', {} as never);

    expect(core.apis.WebApi.deleteQzoneMsg).toHaveBeenCalledExactlyOnceWith('0');
    expect(JSON.parse(JSON.stringify(result))).toMatchObject({ status: 'ok', data: null });
  });

  it('requires a complete initial account identity before starting image publishing', async () => {
    const core = createCore();
    const directory = withImageDirectory(core);
    core.selfInfo.uid = '';

    await expect(new SendQzoneMsg(undefined as never, core as never)._handle({
      content: '带图', images: ['base64://aGVsbG8='],
    })).rejects.toThrow('需要已登录');

    expect(core.apis.WebApi.uploadImageToQzone).not.toHaveBeenCalled();
    expect(core.apis.WebApi.publishQzoneMsg).not.toHaveBeenCalled();
    expect(core.apis.QzoneApi.publishMsg).not.toHaveBeenCalled();
    expect(readdirSync(directory)).toEqual([]);
  });

  it('publishes schema-valid SL examples and accepts the documented unknown-total metadata', () => {
    const core = createCore();
    const actions = [
      new GetQzoneFeeds(undefined as never, core as never), new GetQzoneMsgList(undefined as never, core as never),
      new GetQzoneMsgDetail(undefined as never, core as never), new LikeQzone(undefined as never, core as never),
      new UnlikeQzone(undefined as never, core as never), new CommentQzone(undefined as never, core as never),
      new SendQzoneMsg(undefined as never, core as never), new DeleteQzoneMsg(undefined as never, core as never),
    ];
    for (const action of actions) {
      expect(TypeCompiler.Compile(action.payloadSchema).Check(action.payloadExample)).toBe(true);
      expect(TypeCompiler.Compile(action.returnSchema).Check(action.returnExample)).toBe(true);
    }
    expect(TypeCompiler.Compile(actions[1]!.returnSchema).Check({ total: 0, total_known: false, msglist: [] })).toBe(true);
  });
});
