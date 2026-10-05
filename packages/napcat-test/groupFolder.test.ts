import { describe, expect, test } from 'vitest';
import { OB11Construct } from '../napcat-onebot/helper/data';

describe('group file folder construction', () => {
  test('exposes the last modification time and modifier of a folder', () => {
    const folder = OB11Construct.folder('123', {
      folderId: '/folder-1',
      parentFolderId: '/',
      folderName: '资料',
      createTime: 1700000000,
      modifyTime: 1750000000,
      createUin: '10001',
      creatorName: 'creator',
      totalFileCount: 2,
      modifyUin: '10002',
      modifyName: 'uploader',
      usedSpace: '0',
    });

    expect(folder).toMatchObject({
      group_id: 123,
      folder_id: '/folder-1',
      creator: 10001,
      modify_time: 1750000000,
      modifier: 10002,
      modifier_name: 'uploader',
    });
  });
});
