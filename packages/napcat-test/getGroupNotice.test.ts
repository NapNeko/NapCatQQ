// StreamBasic must be evaluated before OneBotAction: the two modules import each other,
// and loading OneBotAction first leaves BasicStream extending an uninitialized binding.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, test, vi } from 'vitest';
import { GetGroupNotice } from '../napcat-onebot/action/group/GetGroupNotice';

function feed (fid: string, settings?: Record<string, number>) {
  return {
    u: 10001,
    fid,
    pubt: 1750000000,
    msg: { text: `notice ${fid}`, text_face: '', title: '' },
    type: 1,
    fn: 0,
    cn: 0,
    vn: 0,
    settings,
    read_num: 3,
    is_read: 0,
    is_all_confirm: 0,
  };
}

function createAction (ret: unknown) {
  return new GetGroupNotice(
    undefined as never,
    { apis: { WebApi: { getGroupNotice: vi.fn().mockResolvedValue(ret) } } } as never
  );
}

describe('_get_group_notice', () => {
  test('returns "send to new member" notices from inst after feeds', async () => {
    const action = createAction({
      ec: 0,
      feeds: [feed('feed-1'), feed('feed-2')],
      inst: [feed('inst-1', { inst_no_pinned: 0 })],
    });

    const notices = await action._handle({ group_id: '123' });

    expect(notices.map(n => n.notice_id)).toEqual(['feed-1', 'feed-2', 'inst-1']);
    expect(notices.map(n => n.send_to_new_member)).toEqual([false, false, true]);
    expect(notices[2]?.message.text).toBe('notice inst-1');
  });

  test('maps inst_no_pinned to pinned only when the field is present', async () => {
    const action = createAction({
      ec: 0,
      feeds: [feed('feed-1', { tip_window_type: 1 })],
      inst: [feed('pinned', { inst_no_pinned: 0 }), feed('unpinned', { inst_no_pinned: 1 })],
    });

    const notices = await action._handle({ group_id: '123' });

    expect(notices.find(n => n.notice_id === 'feed-1')?.pinned).toBeUndefined();
    expect(notices.find(n => n.notice_id === 'pinned')?.pinned).toBe(true);
    expect(notices.find(n => n.notice_id === 'unpinned')?.pinned).toBe(false);
  });

  test('keeps working when inst is missing and skips duplicated notices', async () => {
    const withoutInst = await createAction({ ec: 0, feeds: [feed('feed-1')] })._handle({ group_id: '123' });
    expect(withoutInst.map(n => n.notice_id)).toEqual(['feed-1']);

    const duplicated = await createAction({
      ec: 0,
      feeds: [feed('same')],
      inst: [feed('same', { inst_no_pinned: 0 })],
    })._handle({ group_id: '123' });
    expect(duplicated.map(n => n.notice_id)).toEqual(['same']);
  });
});
