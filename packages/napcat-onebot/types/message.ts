import { Type, Static } from '@sinclair/typebox';

export enum OB11MessageDataType {
  text = 'text',
  image = 'image',
  music = 'music',
  video = 'video',
  voice = 'record',
  file = 'file',
  at = 'at',
  reply = 'reply',
  json = 'json',
  face = 'face',
  mface = 'mface', // 商城表情
  markdown = 'markdown',
  node = 'node',  // 合并转发消息节点
  forward = 'forward',  // 合并转发消息，用于上报
  xml = 'xml',
  poke = 'poke',
  dice = 'dice',
  rps = 'rps',
  miniapp = 'miniapp', // json类
  contact = 'contact',
  location = 'location',
  onlinefile = 'onlinefile',  // 在线文件/文件夹
  flashtransfer = 'flashtransfer',  // QQ闪传
}
// ==================== 基础消息段类型 ====================

// 纯文本消息段
export const OB11MessageTextSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.text),
  data: Type.Object({
    text: Type.String({ description: '纯文本内容' }),
  }),
}, { $id: 'OB11MessageText', description: '纯文本消息段' });

// 表情消息段
export const OB11MessageFaceSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.face),
  data: Type.Object({
    id: Type.String({ description: '表情ID' }),
    resultId: Type.Optional(Type.String({ description: '结果ID' })),
    chainCount: Type.Optional(Type.Number({ description: '连击数' })),
  }),
}, { $id: 'OB11MessageFace', description: 'QQ表情消息段' });

// 商城表情消息段
export const OB11MessageMFaceSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.mface),
  data: Type.Object({
    emoji_package_id: Type.Number({ description: '表情包ID' }),
    emoji_id: Type.String({ description: '表情ID' }),
    key: Type.String({ description: '表情key' }),
    summary: Type.String({ description: '表情摘要' }),
  }),
}, { $id: 'OB11MessageMFace', description: '商城表情消息段' });

// @消息段
export const OB11MessageAtSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.at),
  data: Type.Object({
    qq: Type.String({ description: 'QQ号或all' }),
    name: Type.Optional(Type.String({ description: '显示名称' })),
  }),
}, { $id: 'OB11MessageAt', description: '@消息段' });

// 回复消息段
export const OB11MessageReplySchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.reply),
  data: Type.Object({
    id: Type.Optional(Type.String({ description: '消息ID的短ID映射' })),
    seq: Type.Optional(Type.Number({ description: '消息序列号，优先使用' })),
  }),
}, { $id: 'OB11MessageReply', description: '回复消息段' });

// ==================== 文件类消息段 ====================

// 文件消息段基础数据 Schema
export const FileBaseDataSchema = Type.Object({
  file: Type.String({ description: '文件路径/URL/file:///' }),
  path: Type.Optional(Type.String({ description: '文件路径' })),
  url: Type.Optional(Type.String({ description: '文件URL' })),
  name: Type.Optional(Type.String({ description: '文件名' })),
  thumb: Type.Optional(Type.String({ description: '缩略图' })),
}, { $id: 'FileBaseData', description: '文件消息段基础数据' });

// 文件消息基础接口 Schema
export const OB11MessageFileBaseSchema = Type.Object({
  data: FileBaseDataSchema,
}, { $id: 'OB11MessageFileBase', description: '文件消息基础接口' });

// 图片消息段
export const OB11MessageImageSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.image),
  data: Type.Intersect([
    FileBaseDataSchema,
    Type.Object({
      summary: Type.Optional(Type.String({ description: '图片摘要' })),
      sub_type: Type.Optional(Type.Number({ description: '图片子类型' })),
    }),
  ]),
}, { $id: 'OB11MessageImage', description: '图片消息段' });

// 语音消息段
export const OB11MessageRecordSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.voice),
  data: FileBaseDataSchema,
}, { $id: 'OB11MessageRecord', description: '语音消息段' });

// 视频消息段
export const OB11MessageVideoSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.video),
  data: FileBaseDataSchema,
}, { $id: 'OB11MessageVideo', description: '视频消息段' });

// 文件消息段
export const OB11MessageFileSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.file),
  data: FileBaseDataSchema,
}, { $id: 'OB11MessageFile', description: '文件消息段' });

// ==================== 音乐消息段 ====================

// ID音乐消息段数据
const IdMusicDataSchema = Type.Object({
  type: Type.Union([
    Type.Literal('qq'),
    Type.Literal('163'),
    Type.Literal('kugou'),
    Type.Literal('migu'),
    Type.Literal('kuwo'),
  ], { description: '音乐平台类型' }),
  id: Type.Union([Type.String(), Type.Number()], { description: '音乐ID' }),
});

// 自定义音乐消息段数据
const CustomMusicDataSchema = Type.Object({
  type: Type.Union([
    Type.Literal('qq'),
    Type.Literal('163'),
    Type.Literal('kugou'),
    Type.Literal('migu'),
    Type.Literal('kuwo'),
    Type.Literal('custom'),
  ], { description: '音乐平台类型' }),
  id: Type.Undefined(),
  url: Type.String({ description: '点击后跳转URL' }),
  audio: Type.Optional(Type.String({ description: '音频URL' })),
  title: Type.Optional(Type.String({ description: '音乐标题' })),
  image: Type.String({ description: '封面图片URL' }),
  content: Type.Optional(Type.String({ description: '音乐简介' })),
});

// ID音乐消息段
export const OB11MessageIdMusicSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.music),
  data: IdMusicDataSchema,
}, { $id: 'OB11MessageIdMusic', description: 'ID音乐消息段' });

// 自定义音乐消息段
export const OB11MessageCustomMusicSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.music),
  data: CustomMusicDataSchema,
}, { $id: 'OB11MessageCustomMusic', description: '自定义音乐消息段' });

// ==================== 特殊消息段 ====================

// 戳一戳消息段
export const OB11MessagePokeSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.poke),
  data: Type.Object({
    type: Type.String({ description: '戳一戳类型' }),
    id: Type.String({ description: '戳一戳ID' }),
  }),
}, { $id: 'OB11MessagePoke', description: '戳一戳消息段' });

// 骰子消息段
export const OB11MessageDiceSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.dice),
  data: Type.Object({
    result: Type.Union([Type.Number(), Type.String()], { description: '骰子结果' }),
  }),
}, { $id: 'OB11MessageDice', description: '骰子消息段' });

// 猜拳消息段
export const OB11MessageRPSSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.rps),
  data: Type.Object({
    result: Type.Union([Type.Number(), Type.String()], { description: '猜拳结果' }),
  }),
}, { $id: 'OB11MessageRPS', description: '猜拳消息段' });

// 联系人消息段
export const OB11MessageContactSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.contact),
  data: Type.Object({
    type: Type.Union([Type.Literal('qq'), Type.Literal('group')], { description: '联系人类型' }),
    id: Type.String({ description: '联系人ID' }),
  }),
}, { $id: 'OB11MessageContact', description: '联系人消息段' });

// 位置消息段
export const OB11MessageLocationSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.location),
  data: Type.Object({
    lat: Type.Union([Type.String(), Type.Number()], { description: '纬度' }),
    lon: Type.Union([Type.String(), Type.Number()], { description: '经度' }),
    title: Type.Optional(Type.String({ description: '标题' })),
    content: Type.Optional(Type.String({ description: '内容' })),
  }),
}, { $id: 'OB11MessageLocation', description: '位置消息段' });

// ==================== 富文本消息段 ====================

// JSON消息段
export const OB11MessageJsonSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.json),
  data: Type.Object({
    data: Type.Union([Type.String(), Type.Object({})], { description: 'JSON数据' }),
    config: Type.Optional(Type.Object({
      token: Type.String({ description: 'token' }),
    })),
  }),
}, { $id: 'OB11MessageJson', description: 'JSON消息段' });

// XML消息段
export const OB11MessageXmlSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.xml),
  data: Type.Object({
    data: Type.String({ description: 'XML数据' }),
  }),
}, { $id: 'OB11MessageXml', description: 'XML消息段' });

// Markdown消息段
export const OB11MessageMarkdownSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.markdown),
  data: Type.Object({
    content: Type.String({ description: 'Markdown内容' }),
  }),
}, { $id: 'OB11MessageMarkdown', description: 'Markdown消息段' });

// 小程序消息段
export const OB11MessageMiniAppSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.miniapp),
  data: Type.Object({
    data: Type.String({ description: '小程序数据' }),
  }),
}, { $id: 'OB11MessageMiniApp', description: '小程序消息段' });

// ==================== 在线文件消息段 ====================

// 在线文件消息段
export const OB11MessageOnlineFileSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.onlinefile),
  data: Type.Object({
    msgId: Type.String({ description: '消息ID' }),
    elementId: Type.String({ description: '元素ID' }),
    fileName: Type.String({ description: '文件名' }),
    fileSize: Type.String({ description: '文件大小' }),
    isDir: Type.Boolean({ description: '是否为目录' }),
  }),
}, { $id: 'OB11MessageOnlineFile', description: '在线文件消息段' });

// 闪传消息段
export const OB11MessageFlashTransferSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.flashtransfer),
  data: Type.Object({
    fileSetId: Type.String({ description: '文件集ID' }),
  }),
}, { $id: 'OB11MessageFlashTransfer', description: 'QQ闪传消息段' });

// ==================== 合并转发消息段（递归类型）====================

// 由于 TypeBox 的递归类型限制，我们需要使用 Type.Recursive
// 但为了与原始类型完全兼容，我们使用 Type.Unknown 来表示递归部分

// 合并转发消息节点
export const OB11MessageNodeSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.node),
  data: Type.Object({
    id: Type.Optional(Type.String({ description: '转发消息ID' })),
    user_id: Type.Optional(Type.Union([Type.Number(), Type.String()], { description: '发送者QQ号' })),
    uin: Type.Optional(Type.Union([Type.Number(), Type.String()], { description: '发送者QQ号(兼容go-cqhttp)' })),
    nickname: Type.String({ description: '发送者昵称' }),
    name: Type.Optional(Type.String({ description: '发送者昵称(兼容go-cqhttp)' })),
    // content 使用 Any 以支持循环引用，实际类型是 OB11MessageMixType
    content: Type.Any({ description: '消息内容 (OB11MessageMixType)' }),
    source: Type.Optional(Type.String({ description: '消息来源' })),
    news: Type.Optional(Type.Array(Type.Object({
      text: Type.String({ description: '新闻文本' }),
    }))),
    summary: Type.Optional(Type.String({ description: '摘要' })),
    prompt: Type.Optional(Type.String({ description: '提示' })),
    time: Type.Optional(Type.String({ description: '时间' })),
  }),
}, { $id: 'OB11MessageNode', description: '合并转发消息节点' });

// 合并转发消息段
export const OB11MessageForwardSchema = Type.Object({
  type: Type.Literal(OB11MessageDataType.forward),
  data: Type.Object({
    id: Type.String({ description: '合并转发ID' }),
    // content 使用 Any 以支持类型兼容，实际类型是 OB11Message[]
    content: Type.Optional(Type.Any({ description: '消息内容 (OB11Message[])' })),
  }),
}, { $id: 'OB11MessageForward', description: '合并转发消息段' });

// ==================== 消息段联合类型 ====================

// 所有消息段的联合类型（与原始 OB11MessageData 完全一致）
export const OB11MessageDataSchema = Type.Union([
  OB11MessageTextSchema,
  OB11MessageFaceSchema,
  OB11MessageMFaceSchema,
  OB11MessageAtSchema,
  OB11MessageReplySchema,
  OB11MessageImageSchema,
  OB11MessageRecordSchema,
  OB11MessageVideoSchema,
  OB11MessageFileSchema,
  OB11MessageIdMusicSchema,
  OB11MessageCustomMusicSchema,
  OB11MessagePokeSchema,
  OB11MessageDiceSchema,
  OB11MessageRPSSchema,
  OB11MessageContactSchema,
  OB11MessageJsonSchema,
  OB11MessageMarkdownSchema,
  OB11MessageNodeSchema,
  OB11MessageForwardSchema,
  OB11MessageOnlineFileSchema,
  OB11MessageFlashTransferSchema,
], { $id: 'OB11MessageData', description: 'OneBot 11 消息段' });

// 消息混合类型（数组、字符串或单个消息段）
export const OB11MessageMixTypeSchema = Type.Union([
  Type.Array(OB11MessageDataSchema),
  Type.String(),
  OB11MessageDataSchema,
], { $id: 'OB11MessageMixType', description: 'OneBot 11 消息混合类型' });

// ==================== 发送消息请求 ====================

// 发送消息请求
export const OB11PostSendMsgSchema = Type.Object({
  message_type: Type.Optional(Type.Union([Type.Literal('private'), Type.Literal('group')], { description: '消息类型' })),
  user_id: Type.Optional(Type.String({ description: '用户QQ号' })),
  group_id: Type.Optional(Type.String({ description: '群号' })),
  message: OB11MessageMixTypeSchema,
  messages: Type.Optional(OB11MessageMixTypeSchema),
  auto_escape: Type.Optional(Type.Union([Type.Boolean(), Type.String()], { description: '是否作为纯文本发送' })),
  source: Type.Optional(Type.String({ description: '消息来源' })),
  news: Type.Optional(Type.Array(Type.Object({
    text: Type.String({ description: '文本' }),
  }))),
  summary: Type.Optional(Type.String({ description: '摘要' })),
  prompt: Type.Optional(Type.String({ description: '提示' })),
  time: Type.Optional(Type.String({ description: '时间' })),
}, { $id: 'OB11PostSendMsg', description: 'OneBot 11 发送消息请求' });

// ==================== 完整消息对象 ====================

// 发送者信息 Schema（注意：OB11Sender 类型已在 data.ts 中定义，这里只提供 Schema）
export const OB11SenderSchema = Type.Object({
  user_id: Type.Union([Type.Number(), Type.String()], { description: '发送者QQ号' }),
  nickname: Type.String({ description: '发送者昵称' }),
  card: Type.Optional(Type.String({ description: '群名片' })),
  role: Type.Optional(Type.String({ description: '角色' })),
  sex: Type.Optional(Type.String({ description: '性别' })),
  age: Type.Optional(Type.Number({ description: '年龄' })),
  area: Type.Optional(Type.String({ description: '地区' })),
  level: Type.Optional(Type.String({ description: '等级' })),
  title: Type.Optional(Type.String({ description: '头衔' })),
}, { $id: 'OB11Sender', description: 'OneBot 11 发送者信息' });

// 完整消息对象
export const OB11MessageSchema = Type.Object({
  real_seq: Type.Optional(Type.String({ description: '真实序列号' })),
  temp_source: Type.Optional(Type.Number({ description: '临时会话来源' })),
  message_sent_type: Type.Optional(Type.String({ description: '消息发送类型' })),
  target_id: Type.Optional(Type.Number({ description: '目标ID' })),
  self_id: Type.Optional(Type.Number({ description: '机器人QQ号' })),
  time: Type.Number({ description: '消息时间戳' }),
  message_id: Type.Number({ description: '消息ID' }),
  message_seq: Type.Number({ description: '消息序列号' }),
  real_id: Type.Number({ description: '真实ID' }),
  user_id: Type.Union([Type.Number(), Type.String()], { description: '发送者QQ号' }),
  group_id: Type.Optional(Type.Union([Type.Number(), Type.String()], { description: '群号' })),
  group_name: Type.Optional(Type.String({ description: '群名称' })),
  message_type: Type.Union([Type.Literal('private'), Type.Literal('group')], { description: '消息类型' }),
  sub_type: Type.Optional(Type.Union([
    Type.Literal('friend'),
    Type.Literal('group'),
    Type.Literal('normal'),
  ], { description: '消息子类型' })),
  sender: OB11SenderSchema,
  message: Type.Union([Type.Array(OB11MessageDataSchema), Type.String()], { description: '消息内容' }),
  message_format: Type.Union([Type.Literal('array'), Type.Literal('string')], { description: '消息格式' }),
  raw_message: Type.String({ description: '原始消息' }),
  font: Type.Number({ description: '字体' }),
  post_type: Type.Optional(Type.String({ description: '上报类型' })),
  raw: Type.Optional(Type.Unknown({ description: '原始消息对象' })),
  emoji_likes_list: Type.Optional(Type.Array(Type.Object({
    emoji_id: Type.String({ description: '表情ID' }),
    emoji_type: Type.String({ description: '表情类型' }),
    likes_cnt: Type.String({ description: '点赞数' }),
  }), { description: '表情点赞列表' })),
}, { $id: 'OB11Message', description: 'OneBot 11 完整消息对象' });

// ==================== TypeScript 类型导出 ====================

export type OB11MessageText = Static<typeof OB11MessageTextSchema>;
export type OB11MessageFace = Static<typeof OB11MessageFaceSchema>;
export type OB11MessageMFace = Static<typeof OB11MessageMFaceSchema>;
export type OB11MessageAt = Static<typeof OB11MessageAtSchema>;
export type OB11MessageReply = Static<typeof OB11MessageReplySchema>;
export type OB11MessageFileBase = Static<typeof OB11MessageFileBaseSchema>;
export type OB11MessageImage = Static<typeof OB11MessageImageSchema>;
export type OB11MessageRecord = Static<typeof OB11MessageRecordSchema>;
export type OB11MessageVideo = Static<typeof OB11MessageVideoSchema>;
export type OB11MessageFile = Static<typeof OB11MessageFileSchema>;
export type OB11MessageIdMusic = Static<typeof OB11MessageIdMusicSchema>;
export type OB11MessageCustomMusic = Static<typeof OB11MessageCustomMusicSchema>;
export type OB11MessagePoke = Static<typeof OB11MessagePokeSchema>;
export type OB11MessageDice = Static<typeof OB11MessageDiceSchema>;
export type OB11MessageRPS = Static<typeof OB11MessageRPSSchema>;
export type OB11MessageContact = Static<typeof OB11MessageContactSchema>;
export type OB11MessageLocation = Static<typeof OB11MessageLocationSchema>;
export type OB11MessageJson = Static<typeof OB11MessageJsonSchema>;
export type OB11MessageXml = Static<typeof OB11MessageXmlSchema>;
export type OB11MessageMarkdown = Static<typeof OB11MessageMarkdownSchema>;
export type OB11MessageMiniApp = Static<typeof OB11MessageMiniAppSchema>;
export type OB11MessageNode = Static<typeof OB11MessageNodeSchema>;
export type OB11MessageForward = Static<typeof OB11MessageForwardSchema>;
export type OB11MessageOnlineFile = Static<typeof OB11MessageOnlineFileSchema>;
export type OB11MessageFlashTransfer = Static<typeof OB11MessageFlashTransferSchema>;
export type OB11MessageData = Static<typeof OB11MessageDataSchema>;
export type OB11MessageMixType = Static<typeof OB11MessageMixTypeSchema>;
export type OB11PostSendMsg = Static<typeof OB11PostSendMsgSchema>;
// 注意：OB11Sender 类型已在 data.ts 中定义，避免重复导出
// export type OB11Sender = Static<typeof OB11SenderSchema>;
export type OB11Message = Static<typeof OB11MessageSchema>;

// 合并转发消息节点纯文本接口定义
export type OB11MessageNodePlain = OB11MessageNode & {
  data: {
    content?: Array<OB11MessageData>;
    message: Array<OB11MessageData>;
  };
};

// 返回数据接口定义
export interface OB11Return<DataType> {
  status: string;
  retcode: number;
  data: DataType;
  message: string;
  echo?: unknown; // ws调用api才有此字段
  wording?: string;  // go-cqhttp字段，错误信息
  stream?: 'stream-action' | 'normal-action'; // 流式返回标记
}

// 合并转发消息接口定义
export interface OB11ForwardMessage extends OB11Message {
  content: OB11MessageData[] | string;
}

// 消息类型枚举
export enum OB11MessageType {
  private = 'private',
  group = 'group',
}

export interface OB11PostContext {
  message_type?: 'private' | 'group';
  user_id?: string;
  group_id?: string;
}
