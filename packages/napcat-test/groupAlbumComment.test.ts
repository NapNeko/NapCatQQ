// StreamBasic must be evaluated before OneBotAction because they import each other.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, test, vi } from 'vitest';
import { NTQQWebApi } from '../napcat-core/apis/webapi';
import { DoGroupAlbumComment } from '../napcat-onebot/action/extends/DoGroupAlbumComment';

const GROUP_ID = '123456';
const ALBUM_ID = 'album_id_1';
const BATCH_ID = '2147483658';
const LLOC = 'media_id_1';
const UIN = '654321';
const CONTENT = '很有意思';
const BASE_PAYLOAD = { group_id: GROUP_ID, album_id: ALBUM_ID, content: CONTENT };

function createAction () {
  const nativeResult = { result: 0 };
  const doQunComment = vi.fn().mockResolvedValue(nativeResult);
  const context = {
    session: { getAlbumService: () => ({ doQunComment }) },
    logger: { logError: vi.fn() },
  };
  const webApi = new NTQQWebApi(context as never, { selfInfo: { uin: UIN } } as never);
  const action = new DoGroupAlbumComment(undefined as never, {
    context,
    apis: { WebApi: webApi },
  } as never);
  return { action, webApi, doQunComment, nativeResult };
}

describe('do_group_album_comment', () => {
  test.each([
    { name: '原有单图评论', target: { lloc: LLOC }, batchId: '', mediaItems: [{ image: { lloc: LLOC } }] },
    { name: '仅指定上传批次', target: { batch_id: BATCH_ID }, batchId: BATCH_ID, mediaItems: [] },
    { name: '批次评论允许空 lloc', target: { batch_id: BATCH_ID, lloc: '' }, batchId: BATCH_ID, mediaItems: [] },
    { name: '同时提供批次和图片时评论单图', target: { batch_id: BATCH_ID, lloc: LLOC }, batchId: BATCH_ID, mediaItems: [{ image: { lloc: LLOC } }] },
  ])('$name', async ({ target, batchId, mediaItems }) => {
    const { action, doQunComment, nativeResult } = createAction();

    const response = await action.handle({ ...BASE_PAYLOAD, ...target }, 'test', {} as never);

    expect(response.status).toBe('ok');
    expect(response.data).toBe(nativeResult);
    expect(doQunComment).toHaveBeenCalledExactlyOnceWith(
      expect.any(Number),
      { map_info: [], map_bytes_info: [], map_user_account: [] },
      GROUP_ID,
      2,
      {
        cell_common: { time: '' },
        cell_user_info: { user: { uin: UIN } },
        cell_media: { album_id: ALBUM_ID, batch_id: batchId, media_items: mediaItems },
      },
      expect.objectContaining({
        client_key: expect.any(Number),
        content: [{ type: 0, content: CONTENT, who: 0, uid: '', name: '', url: '' }],
        user: { uin: UIN },
      })
    );
  });

  test.each([
    {},
    { lloc: '' },
    { batch_id: '' },
    { lloc: '', batch_id: '' },
  ])('拒绝未指定有效评论目标的请求：%j', async (target) => {
    const { action, doQunComment } = createAction();

    const response = await action.handle({ ...BASE_PAYLOAD, ...target }, 'test', {} as never);

    expect(response).toMatchObject({ status: 'failed', retcode: 400 });
    expect(response.message).toContain('lloc');
    expect(response.message).toContain('batch_id');
    expect(doQunComment).not.toHaveBeenCalled();
  });

  test('WebSocket 请求同样校验评论目标并保留 echo', async () => {
    const { action, doQunComment } = createAction();

    const response = await action.websocketHandle(BASE_PAYLOAD, 'echo', 'test', {} as never);

    expect(response).toMatchObject({ status: 'failed', retcode: 1400, echo: 'echo' });
    expect(doQunComment).not.toHaveBeenCalled();
  });

  test('批次评论仍要求提供评论内容', async () => {
    const { action, doQunComment } = createAction();

    const response = await action.handle({ group_id: GROUP_ID, album_id: ALBUM_ID, batch_id: BATCH_ID } as never, 'test', {} as never);

    expect(response).toMatchObject({ status: 'failed', retcode: 400 });
    expect(doQunComment).not.toHaveBeenCalled();
  });

  test('底层评论失败时返回错误', async () => {
    const { action, doQunComment } = createAction();
    doQunComment.mockRejectedValue(new Error('comment failed'));

    const response = await action.handle({ ...BASE_PAYLOAD, batch_id: BATCH_ID }, 'test', {} as never);

    expect(response).toMatchObject({ status: 'failed', message: 'comment failed' });
    expect(doQunComment).toHaveBeenCalledOnce();
  });
});

describe('doAlbumMediaPlainCommentByNTQQ', () => {
  test('保留原有四参数调用的单图评论行为', async () => {
    const { webApi, doQunComment, nativeResult } = createAction();

    await expect(webApi.doAlbumMediaPlainCommentByNTQQ(GROUP_ID, ALBUM_ID, LLOC, CONTENT)).resolves.toBe(nativeResult);

    expect(doQunComment.mock.calls[0]?.[4].cell_media).toEqual({
      album_id: ALBUM_ID,
      batch_id: '',
      media_items: [{ image: { lloc: LLOC } }],
    });
  });

  test('直接调用核心 API 时也拒绝空评论目标', async () => {
    const { webApi, doQunComment } = createAction();

    await expect(webApi.doAlbumMediaPlainCommentByNTQQ(GROUP_ID, ALBUM_ID, undefined, CONTENT))
      .rejects.toThrow('lloc 或 batch_id');
    expect(doQunComment).not.toHaveBeenCalled();
  });
});
