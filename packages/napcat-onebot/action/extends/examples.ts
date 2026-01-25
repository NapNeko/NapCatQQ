export const ExtendsActionsExamples = {
  OCRImage: {
    payload: { image: 'image_id_123' },
    response: { texts: [{ text: '识别内容', coordinates: [] }] },
  },
  GetAiCharacters: {
    payload: { group_id: '123456' },
    response: { characters: [] },
  },
  GetClientkey: {
    payload: {},
    response: { clientkey: 'abcdef123456' },
  },
  SetQQAvatar: {
    payload: { file: 'base64://...' },
    response: {},
  },
  SetGroupKickMembers: {
    payload: { group_id: '123456', user_id: ['123456789'], reject_add_request: false },
    response: {},
  },
  TranslateEnWordToZn: {
    payload: { words: ['hello'] },
    response: { words: ['你好'] },
  },
  GetRkey: {
    payload: {},
    response: { rkey: '...' },
  },
  SetLongNick: {
    payload: { longNick: '个性签名' },
    response: {},
  },
  SetSpecialTitle: {
    payload: { group_id: '123456', user_id: '123456789', special_title: '头衔' },
    response: {},
  },
};
