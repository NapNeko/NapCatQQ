export const FileActionsExamples = {
  GetFile: {
    payload: { file: 'file_id_123' },
    response: { file: '/path/to/file', url: 'http://...', file_size: 1024, file_name: 'test.jpg' },
  },
  GetGroupFileUrl: {
    payload: { group_id: '123456', file_id: 'file_id_123', busid: 102 },
    response: { url: 'http://...' },
  },
  GetImage: {
    payload: { file: 'image_id_123' },
    response: { file: '/path/to/image', url: 'http://...' },
  },
  GetPrivateFileUrl: {
    payload: { user_id: '123456789', file_id: 'file_id_123' },
    response: { url: 'http://...' },
  },
  GetRecord: {
    payload: { file: 'record_id_123', out_format: 'mp3' },
    response: { file: '/path/to/record', url: 'http://...' },
  },
};
