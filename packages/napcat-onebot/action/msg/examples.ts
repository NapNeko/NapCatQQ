export const MsgActionsExamples = {
  DeleteMsg: {
    payload: { message_id: 123456 },
    response: {},
  },
  GetMsg: {
    payload: { message_id: 123456 },
    response: {
      time: 1710000000,
      message_type: 'group',
      message_id: 123456,
      real_id: 123456,
      sender: { user_id: 123456789, nickname: '昵称' },
      message: 'hello',
    },
  },
  MarkMsgAsRead: {
    payload: { group_id: '123456' },
    response: {},
  },
  SendMsg: {
    payload: { message_type: 'group', group_id: '123456', message: 'hello' },
    response: { message_id: 123456 },
  },
  SendPrivateMsg: {
    payload: { user_id: '123456789', message: 'hello' },
    response: { message_id: 123456 },
  },
  SetMsgEmojiLike: {
    payload: { message_id: 123456, emoji_id: '12345' },
    response: {},
  },
};
