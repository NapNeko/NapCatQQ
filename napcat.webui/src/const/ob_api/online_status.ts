import { z } from 'zod'

// 定义 set_online_status 的 data 格式
const onlineStatusDataSchema = z.union([
  // 在线
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(0),
      battery_status: z.literal(0)
    })
    .describe('在线'),
  // Q我吧
  z
    .object({
      status: z.literal(60),
      ext_status: z.literal(0),
      battery_status: z.literal(0)
    })
    .describe('Q我吧'),
  // 离开
  z
    .object({
      status: z.literal(30),
      ext_status: z.literal(0),
      battery_status: z.literal(0)
    })
    .describe('离开'),
  // 忙碌
  z
    .object({
      status: z.literal(50),
      ext_status: z.literal(0),
      battery_status: z.literal(0)
    })
    .describe('忙碌'),
  // 请勿打扰
  z
    .object({
      status: z.literal(70),
      ext_status: z.literal(0),
      battery_status: z.literal(0)
    })
    .describe('请勿打扰'),
  // 隐身
  z
    .object({
      status: z.literal(40),
      ext_status: z.literal(0),
      battery_status: z.literal(0)
    })
    .describe('隐身'),
  // 听歌中
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1028),
      battery_status: z.literal(0)
    })
    .describe('听歌中'),
  // 春日限定
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(2037),
      battery_status: z.literal(0)
    })
    .describe('春日限定'),
  // 一起元梦
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(2025),
      battery_status: z.literal(0)
    })
    .describe('一起元梦'),
  // 求星搭子
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(2026),
      battery_status: z.literal(0)
    })
    .describe('求星搭子'),
  // 被掏空
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(2014),
      battery_status: z.literal(0)
    })
    .describe('被掏空'),
  // 今日天气
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1030),
      battery_status: z.literal(0)
    })
    .describe('今日天气'),
  // 我crash了
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(2019),
      battery_status: z.literal(0)
    })
    .describe('我crash了'),
  // 爱你
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(2006),
      battery_status: z.literal(0)
    })
    .describe('爱你'),
  // 恋爱中
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1051),
      battery_status: z.literal(0)
    })
    .describe('恋爱中'),
  // 好运锦鲤
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1071),
      battery_status: z.literal(0)
    })
    .describe('好运锦鲤'),
  // 水逆退散
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1201),
      battery_status: z.literal(0)
    })
    .describe('水逆退散'),
  // 嗨到飞起
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1056),
      battery_status: z.literal(0)
    })
    .describe('嗨到飞起'),
  // 元气满满
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1058),
      battery_status: z.literal(0)
    })
    .describe('元气满满'),
  // 宝宝认证
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1070),
      battery_status: z.literal(0)
    })
    .describe('宝宝认证'),
  // 一言难尽
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1063),
      battery_status: z.literal(0)
    })
    .describe('一言难尽'),
  // 难得糊涂
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(2001),
      battery_status: z.literal(0)
    })
    .describe('难得糊涂'),
  // emo中
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1401),
      battery_status: z.literal(0)
    })
    .describe('emo中'),
  // 我太难了
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1062),
      battery_status: z.literal(0)
    })
    .describe('我太难了'),
  // 我想开了
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(2013),
      battery_status: z.literal(0)
    })
    .describe('我想开了'),
  // 我没事
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1052),
      battery_status: z.literal(0)
    })
    .describe('我没事'),
  // 想静静
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1061),
      battery_status: z.literal(0)
    })
    .describe('想静静'),
  // 悠哉哉
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1059),
      battery_status: z.literal(0)
    })
    .describe('悠哉哉'),
  // 去旅行
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(2015),
      battery_status: z.literal(0)
    })
    .describe('去旅行'),
  // 信号弱
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1011),
      battery_status: z.literal(0)
    })
    .describe('信号弱'),
  // 出去浪
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(2003),
      battery_status: z.literal(0)
    })
    .describe('出去浪'),
  // 肝作业
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(2012),
      battery_status: z.literal(0)
    })
    .describe('肝作业'),
  // 学习中
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1018),
      battery_status: z.literal(0)
    })
    .describe('学习中'),
  // 搬砖中
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(2023),
      battery_status: z.literal(0)
    })
    .describe('搬砖中'),
  // 摸鱼中
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1300),
      battery_status: z.literal(0)
    })
    .describe('摸鱼中'),
  // 无聊中
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1060),
      battery_status: z.literal(0)
    })
    .describe('无聊中'),
  // timi中
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1027),
      battery_status: z.literal(0)
    })
    .describe('timi中'),
  // 睡觉中
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1016),
      battery_status: z.literal(0)
    })
    .describe('睡觉中'),
  // 熬夜中
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1032),
      battery_status: z.literal(0)
    })
    .describe('熬夜中'),
  // 追剧中
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1021),
      battery_status: z.literal(0)
    })
    .describe('追剧中'),
  // 我的电量
  z
    .object({
      status: z.literal(10),
      ext_status: z.literal(1000),
      battery_status: z.literal(0)
    })
    .describe('我的电量')
])

export default onlineStatusDataSchema
