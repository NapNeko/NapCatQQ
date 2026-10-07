// StreamBasic must be evaluated before OneBotAction: the two modules import each other,
// and loading OneBotAction first leaves BasicStream extending an uninitialized binding.
import '../napcat-onebot/action/stream/StreamBasic';
import { describe, expect, test, vi } from 'vitest';
import { GetGroupFilesByFolder } from '../napcat-onebot/action/go-cqhttp/GetGroupFilesByFolder';

const FOLDER_ITEM = {
  peerId: '123',
  folderInfo: {
    folderId: 'sub_folder_1',
    folderName: '子目录',
    createTime: 1,
    createUin: '9',
    creatorName: '创建者',
    totalFileCount: 2,
    modifyTime: 2,
    modifyUin: '9',
    modifyName: '修改者',
  },
};

function createAction (items: unknown[]) {
  const getGroupFileList = vi.fn().mockResolvedValue(items);
  const action = new GetGroupFilesByFolder(
    undefined as never,
    {
      apis: {
        MsgApi: { getGroupFileList },
      },
    } as never
  );
  return { action, getGroupFileList };
}

describe('get_group_files_by_folder subfolders', () => {
  test('maps folderInfo entries into folders', async () => {
    const { action } = createAction([FOLDER_ITEM]);

    const res = await action._handle({ group_id: '123', file_count: 50 });

    expect(res.folders).toHaveLength(1);
    expect(res.folders[0]).toMatchObject({
      group_id: 123,
      folder_id: 'sub_folder_1',
      folder_name: '子目录',
      total_file_count: 2,
    });
    expect(res.files).toHaveLength(0);
  });

  test('returns empty arrays when the folder holds nothing', async () => {
    const { action } = createAction([]);

    const res = await action._handle({ group_id: '123', file_count: 50 });

    expect(res.files).toHaveLength(0);
    expect(res.folders).toHaveLength(0);
  });

  test('passes the requested folder id through to the core API', async () => {
    const { action, getGroupFileList } = createAction([]);

    await action._handle({ group_id: '123', file_count: 50, folder_id: 'parent_1' });

    expect(getGroupFileList).toHaveBeenCalledWith('123', expect.objectContaining({ folderId: 'parent_1' }));
  });
});
