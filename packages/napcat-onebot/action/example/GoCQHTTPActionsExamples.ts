export const GoCQHTTPActionsExamples = {
  GetStrangerInfo: {
    payload: { user_id: '123456789' },
    response: { user_id: 123456789, nickname: '昵称', sex: 'unknown' },
  },
  GetGroupHonorInfo: {
    payload: { group_id: '123456', type: 'all' },
    response: { group_id: 123456, current_talkative: {}, talkative_list: [] },
  },
  GetForwardMsg: {
    payload: { message_id: '123456' },
    response: { messages: [] },
  },
  SendForwardMsg: {
    payload: { group_id: '123456', messages: [] },
    response: { message_id: 123456 },
  },
  GetGroupAtAllRemain: {
    payload: { group_id: '123456' },
    response: { can_at_all: true, remain_at_all_count_for_group: 10, remain_at_all_count_for_self: 10 },
  },
  CreateGroupFileFolder: {
    payload: { group_id: '123456', name: '测试目录' },
    response: { result: {}, groupItem: {} },
  },
  DeleteGroupFile: {
    payload: { group_id: '123456', file_id: 'file_uuid_123' },
    response: {},
  },
  DeleteGroupFileFolder: {
    payload: { group_id: '123456', folder_id: 'folder_uuid_123' },
    response: {},
  },
  DownloadFile: {
    payload: { url: 'https://example.com/file.png', thread_count: 1, headers: 'User-Agent: NapCat' },
    response: { file: '/path/to/downloaded/file' },
  },
  GetFriendMsgHistory: {
    payload: { user_id: '123456789', message_seq: 0, count: 20 },
    response: { messages: [] },
  },
  GetGroupFilesByFolder: {
    payload: { group_id: '123456', folder_id: 'folder_id' },
    response: { files: [], folders: [] },
  },
  GetGroupFileSystemInfo: {
    payload: { group_id: '123456' },
    response: { file_count: 10, limit_count: 10000, used_space: 1024, total_space: 10737418240 },
  },
  GetGroupMsgHistory: {
    payload: { group_id: '123456', message_seq: 0, count: 20 },
    response: { messages: [] },
  },
  GetGroupRootFiles: {
    payload: { group_id: '123456' },
    response: { files: [], folders: [] },
  },
  GetOnlineClient: {
    payload: { no_cache: false },
    response: [],
  },
  GoCQHTTPCheckUrlSafely: {
    payload: { url: 'https://example.com' },
    response: { level: 1 },
  },
  GoCQHTTPDeleteFriend: {
    payload: { user_id: '123456789' },
    response: {},
  },
  GoCQHTTPGetModelShow: {
    payload: { model: 'iPhone 13' },
    response: { variants: [] },
  },
  GoCQHTTPSetModelShow: {
    payload: { model: 'iPhone 13', model_show: 'iPhone 13' },
    response: {},
  },
  QuickAction: {
    payload: { context: {}, operation: {} },
    response: {},
  },
  SendGroupNotice: {
    payload: { group_id: '123456', content: '公告内容', image: 'base64://...' },
    response: {},
  },
  SetGroupPortrait: {
    payload: { group_id: '123456', file: 'base64://...' },
    response: { result: 0, errMsg: '' },
  },
  SetQQProfile: {
    payload: { nickname: '新昵称', personal_note: '个性签名' },
    response: {},
  },
  UploadGroupFile: {
    payload: { group_id: '123456', file: '/path/to/file', name: 'test.txt' },
    response: { file_id: 'file_uuid_123' },
  },
  UploadPrivateFile: {
    payload: { user_id: '123456789', file: '/path/to/file', name: 'test.txt' },
    response: { file_id: 'file_uuid_123' },
  },
};
