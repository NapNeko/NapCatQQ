export const NewActionsExamples = {
  GetDoubtFriendsAddRequest: {
    payload: { count: 10 },
    response: [{ user_id: 123456789, nickname: '昵称', age: 20, sex: 'male', reason: '申请理由', flag: 'flag_123' }],
  },
  SetDoubtFriendsAddRequest: {
    payload: { flag: 'flag_123', approve: true },
    response: {},
  },
};
