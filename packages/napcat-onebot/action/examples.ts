export const ActionExamples = {
  GetGroupInfo: {
    payload: { group_id: '123456789' },
    return: {
      group_id: 123456789,
      group_name: '测试群',
      member_count: 10,
      max_member_count: 500,
      group_all_shut: 0,
      group_remark: ''
    }
  },
  GetGroupList: {
    payload: {},
    return: [
      {
        group_id: 123456789,
        group_name: '测试群',
        member_count: 10,
        max_member_count: 500,
        group_all_shut: 0,
        group_remark: ''
      }
    ]
  },
  GetGroupMemberList: {
    payload: { group_id: '123456789' },
    return: [
      {
        group_id: 123456789,
        user_id: 987654321,
        nickname: '测试成员',
        card: '群名片',
        role: 'member'
      }
    ]
  },
  SendGroupMsg: {
    payload: { group_id: '123456789', message: 'hello' },
    return: { message_id: 123456 }
  },
  SendLike: {
    payload: { user_id: '123456789', times: 1 },
    return: null
  },
  GetFriendList: {
    payload: {},
    return: [
      {
        user_id: 123456789,
        nickname: '测试好友',
        remark: '备注'
      }
    ]
  },
  GetStrangerInfo: {
    payload: { user_id: '123456789' },
    return: {
      user_id: 123456789,
      nickname: '陌生人',
      sex: 'unknown',
      age: 0
    }
  },
  SetFriendRemark: {
    payload: { user_id: '123456789', remark: '新备注' },
    return: null
  },
  GetCookies: {
    payload: { domain: 'qun.qq.com' },
    return: { cookies: 'p_skey=xxxx; p_uin=xxxx', bkn: '123456' }
  },
  SendPrivateMsg: {
    payload: { user_id: '123456789', message: 'hello' },
    return: { message_id: 123456 }
  },
  OCRImage: {
    payload: { image: 'https://example.com/test.jpg' },
    return: [{ text: '识别文本', confidence: 0.99 }]
  },
  GetClientkey: {
    payload: {},
    return: { clientkey: 'abcdef123456' }
  },
  SetQQAvatar: {
    payload: { file: 'base64://...' },
    return: null
  },
  SetGroupKickMembers: {
    payload: { group_id: '123456789', user_id: ['987654321'], reject_add_request: false },
    return: null
  },
  GetLoginInfo: {
    payload: {},
    return: { user_id: 123456789, nickname: '机器人' }
  },
  GetVersionInfo: {
    payload: {},
    return: {
      app_name: 'NapCatQQ',
      app_version: '1.0.0',
      protocol_version: 'v11'
    }
  },
  GetStatus: {
    payload: {},
    return: { online: true, good: true }
  },
  DeleteMsg: {
    payload: { message_id: 123456 },
    return: null
  },
  SetGroupWholeBan: {
    payload: { group_id: '123456789', enable: true },
    return: null
  },
  SetGroupBan: {
    payload: { group_id: '123456789', user_id: '987654321', duration: 1800 },
    return: null
  },
  SetGroupKick: {
    payload: { group_id: '123456789', user_id: '987654321', reject_add_request: false },
    return: null
  },
  SetGroupAdmin: {
    payload: { group_id: '123456789', user_id: '987654321', enable: true },
    return: null
  },
  SetGroupName: {
    payload: { group_id: '123456789', group_name: '新群名' },
    return: null
  },
  SetGroupCard: {
    payload: { group_id: '123456789', user_id: '987654321', card: '新名片' },
    return: null
  },
  GetGroupMemberInfo: {
    payload: { group_id: '123456789', user_id: '987654321' },
    return: {
      group_id: 123456789,
      user_id: 987654321,
      nickname: '成员昵称',
      card: '名片',
      role: 'member'
    }
  },
  SendMsg: {
    payload: { message_type: 'group', group_id: '123456789', message: 'hello' },
    return: { message_id: 123456 }
  },
  GetMsg: {
    payload: { message_id: 123456 },
    return: {
      time: 123456789,
      message_type: 'group',
      message_id: 123456,
      real_id: 123456,
      sender: { user_id: 987654321, nickname: '昵称' },
      message: 'hello'
    }
  },
  SetGroupLeave: {
    payload: { group_id: '123456789', is_dismiss: false },
    return: null
  },
  CanSendRecord: {
    payload: {},
    return: { yes: true }
  },
  CanSendImage: {
    payload: {},
    return: { yes: true }
  },
  SetFriendAddRequest: {
    payload: { flag: '12345', approve: true, remark: '好友' },
    return: null
  },
  SetGroupAddRequest: {
    payload: { flag: '12345', sub_type: 'add', approve: true },
    return: null
  },
  DelEssenceMsg: {
    payload: { message_id: 12345 },
    return: null
  },
  SetEssenceMsg: {
    payload: { message_id: 12345 },
    return: null
  },
  GetGroupEssence: {
    payload: { group_id: '123456789' },
    return: [
      {
        msg_seq: 12345,
        msg_random: 67890,
        sender_id: 987654321,
        sender_nick: '发送者',
        operator_id: 123456789,
        operator_nick: '操作者',
        message_id: 123456,
        operator_time: 1234567890,
        content: [{ type: 'text', data: { text: '精华消息内容' } }]
      }
    ]
  },
  GetGroupShutList: {
    payload: { group_id: '123456789' },
    return: [
      {
        user_id: 987654321,
        nickname: '禁言成员',
        card: '名片',
        shut_up_time: 1234567890
      }
    ]
  },
  GetGroupDetailInfo: {
    payload: { group_id: '123456789' },
    return: {
      group_id: 123456789,
      group_name: '测试群',
      member_count: 10,
      max_member_count: 500,
      group_all_shut: 0,
      group_remark: ''
    }
  },
  DelGroupNotice: {
    payload: { group_id: '123456789', notice_id: 'abc-123' },
    return: null
  },
  GetAiRecord: {
    payload: { group_id: '123456789', character: 'ai' },
    return: { msg: 'AI回复内容' }
  },
  GetGroupNotice: {
    payload: { group_id: '123456789' },
    return: [
      {
        notice_id: 'abc-123',
        sender_id: 987654321,
        publish_time: 1234567890,
        message: { text: '公告内容', images: [] }
      }
    ]
  },
  SendGroupAiRecord: {
    payload: { group_id: '123456789', character: 'ai', text: '你好' },
    return: { message_id: 123456 }
  },
  GetFile: {
    payload: { file: 'abc-123' },
    return: {
      file: '/path/to/file',
      url: 'http://example.com/file',
      file_size: '1024',
      file_name: 'test.txt'
    }
  },
  GetImage: {
    payload: { file: 'abc-123' },
    return: {
      file: '/path/to/image.jpg',
      url: 'http://example.com/image.jpg',
      file_size: '1024',
      file_name: 'image.jpg'
    }
  },
  GetRecord: {
    payload: { file: 'abc-123', out_format: 'mp3' },
    return: {
      file: '/path/to/record.mp3',
      url: 'http://example.com/record.mp3',
      file_size: '1024',
      file_name: 'record.mp3',
      base64: '...'
    }
  },
  GetGroupFileUrl: {
    payload: { group_id: '123456789', file_id: 'abc-123' },
    return: { url: 'http://example.com/group_file' }
  },
  GetPrivateFileUrl: {
    payload: { file_id: 'abc-123' },
    return: { url: 'http://example.com/private_file' }
  },
  GetAiCharacters: {
    payload: { group_id: '123456789' },
    return: [
      {
        type: '常用',
        characters: [
          { character_id: 'ai-1', character_name: 'AI助手', preview_url: 'http://...' }
        ]
      }
    ]
  },
  SetOnlineStatus: {
    payload: { status: 11, ext_status: 0, battery_status: 100 },
    return: null
  },
  SetGroupRemark: {
    payload: { group_id: '123456789', remark: '群备注' },
    return: null
  },
  GetCollectionList: {
    payload: { category: '1', count: '10' },
    return: []
  },
  SetSpecialTitle: {
    payload: { group_id: '123456789', user_id: '987654321', special_title: '群头衔' },
    return: null
  },
  MarkMsgAsRead: {
    payload: { group_id: '123456789' },
    return: null
  },
  ForwardSingleMsg: {
    payload: { message_id: 12345, group_id: '123456789' },
    return: null
  },
  SendPoke: {
    payload: { group_id: '123456789', user_id: '987654321' },
    return: null
  },
  SetGroupTodo: {
    payload: { group_id: '123456789', message_id: '12345' },
    return: null
  },
  GetCredentials: {
    payload: { domain: 'qun.qq.com' },
    return: { cookies: '...', token: 123456 }
  },
  GetGroupSystemMsg: {
    payload: { count: 10 },
    return: {
      invited_requests: [],
      InvitedRequest: [],
      join_requests: []
    }
  },
  GetRecentContact: {
    payload: { count: 10 },
    return: []
  },
  GetCSRF: {
    payload: {},
    return: { token: 123456789 }
  },
  SetMsgEmojiLike: {
    payload: { message_id: 12345, emoji_id: '124' },
    return: null
  },
  UploadGroupFile: {
    payload: { group_id: '123456789', file: '/path/to/file', name: 'test.txt' },
    return: null
  },
  Common: {
    errors: [
      { code: 1400, description: '请求参数错误或业务逻辑执行失败' },
      { code: 1401, description: '权限不足' },
      { code: 1404, description: '资源不存在' }
    ]
  }
};
