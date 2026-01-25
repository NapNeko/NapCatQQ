export const GroupActionsExamples = {
  DelEssenceMsg: {
    payload: { message_id: 123456 },
    response: {},
  },
  DelGroupNotice: {
    payload: { group_id: '123456', notice_id: 'notice_123' },
    response: {},
  },
  GetGroupDetailInfo: {
    payload: { group_id: '123456' },
    response: { group_id: 123456, group_name: '测试群', member_count: 100, max_member_count: 500 },
  },
  GetGroupEssence: {
    payload: { group_id: '123456' },
    response: [{ message_id: 123456, sender_id: 123456, sender_nick: '昵称', operator_id: 123456, operator_nick: '昵称', operator_time: 1710000000, content: '精华内容' }],
  },
  GetGroupInfo: {
    payload: { group_id: '123456' },
    response: { group_id: 123456, group_name: '测试群', member_count: 100, max_member_count: 500 },
  },
  GetGroupList: {
    payload: {},
    response: [{ group_id: 123456, group_name: '测试群', member_count: 100, max_member_count: 500 }],
  },
  GetGroupMemberInfo: {
    payload: { group_id: '123456', user_id: '123456789' },
    response: { group_id: 123456, user_id: 123456789, nickname: '昵称', card: '名片', role: 'member' },
  },
  GetGroupMemberList: {
    payload: { group_id: '123456' },
    response: [{ group_id: 123456, user_id: 123456789, nickname: '昵称', card: '名片', role: 'member' }],
  },
  GetGroupNotice: {
    payload: { group_id: '123456' },
    response: [{ notice_id: 'notice_123', sender_id: 123456, publish_time: 1710000000, message: { text: '公告内容', image: [] } }],
  },
  SendGroupMsg: {
    payload: { group_id: '123456', message: 'hello' },
    response: { message_id: 123456 },
  },
  SetEssenceMsg: {
    payload: { message_id: 123456 },
    response: {},
  },
  SetGroupAddRequest: {
    payload: { flag: 'flag_123', sub_type: 'add', approve: true },
    response: {},
  },
  SetGroupAdmin: {
    payload: { group_id: '123456', user_id: '123456789', enable: true },
    response: {},
  },
  SetGroupBan: {
    payload: { group_id: '123456', user_id: '123456789', duration: 1800 },
    response: {},
  },
  SetGroupCard: {
    payload: { group_id: '123456', user_id: '123456789', card: '新名片' },
    response: {},
  },
  SetGroupKick: {
    payload: { group_id: '123456', user_id: '123456789', reject_add_request: false },
    response: {},
  },
  SetGroupLeave: {
    payload: { group_id: '123456', is_dismiss: false },
    response: {},
  },
  SetGroupName: {
    payload: { group_id: '123456', group_name: '新群名' },
    response: {},
  },
  SetGroupWholeBan: {
    payload: { group_id: '123456', enable: true },
    response: {},
  },
};
