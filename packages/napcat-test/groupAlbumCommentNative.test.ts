// StreamBasic must be evaluated before OneBotAction because of their circular import.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, it, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { NTQQWebApi } from '@/napcat-core/apis/webapi';
import { createAlbumCommentRequest, createAlbumMediaFeed } from '@/napcat-core/data/album';
import type { NodeIKernelAlbumService } from '@/napcat-core/services/NodeIKernelAlbumService';
import { DoGroupAlbumComment } from '@/napcat-onebot/action/extends/DoGroupAlbumComment';

describe('do_group_album_comment native arguments', () => {
  it('submits the documented payload with an empty like object required by QQNT', async () => {
    const result = { result: 0, comment: { id: 'comment-id' } };
    const doQunComment = vi.fn<NodeIKernelAlbumService['doQunComment']>().mockResolvedValue(result);
    const core = { selfInfo: { uin: '10001' }, apis: {} as { WebApi: NTQQWebApi } };
    core.apis.WebApi = new NTQQWebApi({
      session: { getAlbumService: () => ({ doQunComment }) },
    } as never, core as never);
    const action = new DoGroupAlbumComment(undefined as never, core as never);

    await expect(action._handle({
      group_id: '12345',
      album_id: 'album-id',
      lloc: 'photo-id',
      content: '测试评论',
    })).resolves.toBe(result);

    expect(doQunComment).toHaveBeenCalledExactlyOnceWith(
      expect.any(Number),
      { map_info: [], map_bytes_info: [], map_user_account: [] },
      '12345',
      2,
      expect.objectContaining({
        cell_media: expect.objectContaining({
          album_id: 'album-id',
          media_items: [{ image: { lloc: 'photo-id' } }],
        }),
      }),
      expect.objectContaining({
        client_key: expect.any(Number),
        content: [expect.objectContaining({ type: 0, content: '测试评论' })],
        user: { uin: '10001' },
        like: { id: '', count: 0, status: 0 },
      })
    );
  });

  // Optional native regression: point this at a QQ installation's wrapper.node.
  // An unbound service parses arguments but cannot log in or submit a comment.
  it.skipIf(!process.env['NAPCAT_TEST_QQ_WRAPPER'])('passes native argument conversion (issue #1979)', () => {
    const wrapperPath = resolve(process.env['NAPCAT_TEST_QQ_WRAPPER']!);
    const args = [
      1234,
      { map_info: [], map_bytes_info: [], map_user_account: [] },
      '12345',
      2,
      createAlbumMediaFeed('10001', 'album-id', 'photo-id'),
      createAlbumCommentRequest('10001', '测试评论', 1234567890),
    ];
    const probe = spawnSync(process.execPath, ['-e', `
      const assert = require('node:assert/strict');
      const fs = require('node:fs');
      const { wrapperPath, args } = JSON.parse(fs.readFileSync(0, 'utf8'));
      const native = { exports: {} };
      process.dlopen(native, wrapperPath);
      const service = new native.exports.NodeIKernelAlbumService();
      const legacyArgs = args.slice();
      legacyArgs[5] = { ...args[5] };
      delete legacyArgs[5].like;
      assert.throws(() => service.doQunComment(...legacyArgs), /Cannot convert undefined or null to object/);
      // Reaching the unbound-service check proves all six arguments were converted.
      assert.throws(() => service.doQunComment(...args), /implementation of IKernelAlbumService is not valid/);
      process.exit(0);
    `], {
      cwd: dirname(wrapperPath),
      input: JSON.stringify({ wrapperPath, args }),
      encoding: 'utf8',
      timeout: 10000,
      windowsHide: true,
    });

    expect(probe.error).toBeUndefined();
    expect(probe.status, probe.stderr || probe.stdout).toBe(0);
  });
});
