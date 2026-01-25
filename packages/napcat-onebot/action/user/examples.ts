export const UserActionsExamples = {
  GetCookies: {
    payload: { domain: 'qun.qq.com' },
    response: { cookies: 'p_skey=xxx; p_uin=o0123456789;' },
  },
  GetFriendList: {
    payload: {},
    response: [{ user_id: 123456789, nickname: '昵称', remark: '备注' }],
  },
  GetRecentContact: {
    payload: { count: 10 },
    response: [
      {
        lastestMsg: 'hello',
        peerUin: '123456789',
        remark: 'remark',
        msgTime: '1710000000',
        chatType: 1,
        msgId: '12345',
        sendNickName: 'nick',
        sendMemberName: 'card',
        peerName: 'name',
      },
    ],
  },
  SendLike: {
    payload: { user_id: '123456789', times: 10 },
    response: {},
  },
  SetFriendAddRequest: {
    payload: { flag: 'flag_123', approve: true, remark: '好友' },
    response: {},
  },
  SetFriendRemark: {
    payload: { user_id: '123456789', remark: '新备注' },
    response: {},
  },
};
