import { Type } from '@sinclair/typebox';

export const OB11UserSchema = Type.Object({
  birthday_year: Type.Optional(Type.Number({ description: '出生年份' })),
  birthday_month: Type.Optional(Type.Number({ description: '出生月份' })),
  birthday_day: Type.Optional(Type.Number({ description: '出生日期' })),
  phone_num: Type.Optional(Type.String({ description: '手机号' })),
  email: Type.Optional(Type.String({ description: '邮箱' })),
  category_id: Type.Optional(Type.Number({ description: '分组ID' })),
  user_id: Type.Number({ description: 'QQ号' }),
  nickname: Type.String({ description: '昵称' }),
  remark: Type.Optional(Type.String({ description: '备注' })),
  sex: Type.Optional(Type.String({ description: '性别' })),
  level: Type.Optional(Type.Number({ description: '等级' })),
  age: Type.Optional(Type.Number({ description: '年龄' })),
  qid: Type.Optional(Type.String({ description: 'QID' })),
  login_days: Type.Optional(Type.Number({ description: '登录天数' })),
  categoryName: Type.Optional(Type.String({ description: '分组名称' })),
  categoryId: Type.Optional(Type.Number({ description: '分组ID' })),
}, { description: 'OneBot 11 用户信息' });

export const OB11GroupSchema = Type.Object({
  group_all_shut: Type.Number({ description: '是否全员禁言' }),
  group_remark: Type.String({ description: '群备注' }),
  group_id: Type.Number({ description: '群号' }),
  group_name: Type.String({ description: '群名称' }),
  member_count: Type.Optional(Type.Number({ description: '成员人数' })),
  max_member_count: Type.Optional(Type.Number({ description: '最大成员人数' })),
}, { description: 'OneBot 11 群信息' });

export const OB11GroupMemberSchema = Type.Object({
  group_id: Type.Number({ description: '群号' }),
  user_id: Type.Number({ description: 'QQ号' }),
  nickname: Type.String({ description: '昵称' }),
  card: Type.Optional(Type.String({ description: '名片' })),
  sex: Type.Optional(Type.String({ description: '性别' })),
  age: Type.Optional(Type.Number({ description: '年龄' })),
  join_time: Type.Optional(Type.Number({ description: '入群时间戳' })),
  last_sent_time: Type.Optional(Type.Number({ description: '最后发言时间戳' })),
  level: Type.Optional(Type.String({ description: '等级' })),
  qq_level: Type.Optional(Type.Number({ description: 'QQ等级' })),
  role: Type.Optional(Type.String({ description: '角色 (owner/admin/member)' })),
  title: Type.Optional(Type.String({ description: '头衔' })),
  area: Type.Optional(Type.String({ description: '地区' })),
  unfriendly: Type.Optional(Type.Boolean({ description: '是否不良记录' })),
  title_expire_time: Type.Optional(Type.Number({ description: '头衔过期时间' })),
  card_changeable: Type.Optional(Type.Boolean({ description: '是否允许修改名片' })),
  shut_up_timestamp: Type.Optional(Type.Number({ description: '禁言截止时间戳' })),
  is_robot: Type.Optional(Type.Boolean({ description: '是否为机器人' })),
  qage: Type.Optional(Type.Number({ description: 'Q龄' })),
}, { description: 'OneBot 11 群成员信息' });

export const OB11NotifySchema = Type.Object({
  request_id: Type.Number({ description: '请求ID' }),
  invitor_uin: Type.Number({ description: '邀请者QQ' }),
  invitor_nick: Type.String({ description: '邀请者昵称' }),
  group_id: Type.Number({ description: '群号' }),
  group_name: Type.String({ description: '群名称' }),
  message: Type.String({ description: '附言' }),
  checked: Type.Boolean({ description: '是否已处理' }),
  actor: Type.Number({ description: '操作者QQ' }),
  requester_nick: Type.String({ description: '申请者昵称' }),
}, { description: 'OneBot 11 通知信息' });

export const lastestMessageSchema = Type.Object({
  self_id: Type.Number({ description: '发送者QQ号' }),
  user_id: Type.Number({ description: '接收者QQ号' }),
  time: Type.Number({ description: '时间戳' }),
  real_seq: Type.String({ description: '消息序号' }),
  message_type: Type.String({ description: '消息类型' }),
  sender: Type.Object({
    user_id: Type.Number({ description: '用户QQ号' }),
    nickname: Type.String({ description: '用户昵称' }),
    card: Type.Optional(Type.String({ description: '用户名片' })),
    role: Type.Optional(Type.String({ description: '用户角色' })),
  }),
  raw_message: Type.String({ description: '原始消息' }),
  font: Type.Number({ description: '字体大小' }),
  sub_type: Type.String({ description: '子类型' }),
  message: Type.Unknown({ description: '消息内容' }),
  message_format: Type.String({ description: '消息格式' }),
  post_type: Type.String({ description: '发布类型' }),
  group_id: Type.Number({ description: '群号' }),
  group_name: Type.String({ description: '群名称' }),
}, { description: '最后一条消息' });

export const OB11MessageSchema = Type.Intersect([
  lastestMessageSchema,
  Type.Object({
    message_id: Type.Number({ description: '消息ID' }),
    message_seq: Type.Number({ description: '消息序列号' }),
    emoji_likes_list: Type.Array(Type.Object({
      emoji_id: Type.String({ description: '表情符号ID' }),
      emoji_type: Type.String({ description: '表情符号类型' }),
      likes_cnt: Type.String({ description: '点赞数' }),
    })),
  }, { description: 'OneBot 11 消息信息' })
]);