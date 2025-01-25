import { z } from 'zod'

import onlineStatusDataSchema from './online_status'
import { baseResponseSchema, commonResponseDataSchema } from './response'

const oneBotHttpApiUser = {
  '/set_qq_profile': {
    description: '设置账号信息',
    request: z.object({
      nickname: z.string().describe('昵称'),
      personal_note: z.string().describe('个性签名'),
      sex: z.string().optional().describe('性别')
    }),
    response: baseResponseSchema.extend({
      data: commonResponseDataSchema
    })
  },
  '/ArkSharePeer': {
    description: '获取推荐好友/群聊卡片',
    request: z
      .object({
        group_id: z
          .union([z.string(), z.number()])
          .optional()
          .describe('群聊ID，与 user_id 二选一'),
        user_id: z
          .union([z.string(), z.number()])
          .optional()
          .describe('用户ID，与 group_id 二选一'),
        phoneNumber: z.string().optional().describe('对方手机号码')
      })
      .refine(
        (data) =>
          (data.group_id && !data.user_id) || (!data.group_id && data.user_id),
        {
          message: 'group_id 和 user_id 必须二选一，且不能同时存在或同时为空',
          path: ['group_id', 'user_id'] // 错误路径
        }
      ),
    response: baseResponseSchema.extend({
      data: z.object({
        errCode: z.number(),
        errMsg: z.string(),
        arkJson: z.string()
      })
    })
  },
  '/ArkShareGroup': {
    description: '获取推荐群聊卡片',
    request: z.object({
      group_id: z.union([z.string(), z.number()]).describe('群聊ID')
    }),
    response: baseResponseSchema.extend({
      data: z.string()
    })
  },
  '/set_online_status': {
    description: '设置在线状态',
    request: z.object({
      data: onlineStatusDataSchema
    }),
    response: baseResponseSchema
  },
  '/get_friends_with_category': {
    description: '获取好友分组列表',
    request: z.object({}),
    response: baseResponseSchema.extend({
      data: z.array(
        z.object({
          categoryId: z.number(),
          categorySortId: z.number(),
          categoryName: z.string(),
          categoryMbCount: z.number(),
          onlineCount: z.number(),
          buddyList: z.array(
            z.object({
              qid: z.string(),
              longNick: z.string(),
              birthday_year: z.number(),
              birthday_month: z.number(),
              birthday_day: z.number(),
              age: z.number(),
              sex: z.string(),
              eMail: z.string(),
              phoneNum: z.string(),
              categoryId: z.number(),
              richTime: z.number(),
              richBuffer: z.object({}),
              uid: z.string(),
              uin: z.string(),
              nick: z.string(),
              remark: z.string(),
              user_id: z.number(),
              nickname: z.string(),
              level: z.number()
            })
          )
        })
      )
    })
  },
  '/set_qq_avatar': {
    description: '设置头像',
    request: z.object({
      file: z.string().describe('图片文件路径（服务器本地或者远程均可）')
    }),
    response: baseResponseSchema
  },
  '/send_like': {
    description: '点赞',
    request: z.object({
      user_id: z.union([z.string(), z.number()]).describe('对方QQ号'),
      times: z.number().describe('点赞次数')
    }),
    response: baseResponseSchema
  },
  '/create_collection': {
    description: '创建收藏',
    request: z.object({
      rawData: z.string().describe('收藏内容'),
      brief: z.string().describe('收藏简介')
    }),
    response: baseResponseSchema.extend({
      data: commonResponseDataSchema
    })
  },
  '/set_friend_add_request': {
    description: '处理好友请求',
    request: z.object({
      flag: z.string().describe('请求ID'),
      approve: z.boolean().describe('是否同意'),
      remark: z.string().describe('好友备注')
    }),
    response: baseResponseSchema
  },
  '/set_self_longnick': {
    description: '设置个性签名',
    request: z.object({
      longNick: z.string().describe('签名内容')
    }),
    response: baseResponseSchema.extend({
      data: commonResponseDataSchema
    })
  },
  '/get_stranger_info': {
    description: '获取账号信息',
    request: z.object({
      user_id: z.union([z.string(), z.number()]).describe('对方QQ号')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        user_id: z.number(),
        uid: z.string(),
        uin: z.string(),
        nickname: z.string(),
        age: z.number(),
        qid: z.string(),
        qqLevel: z.number(),
        sex: z.string(),
        long_nick: z.string(),
        reg_time: z.number(),
        is_vip: z.boolean(),
        is_years_vip: z.boolean(),
        vip_level: z.number(),
        remark: z.string(),
        status: z.number(),
        login_days: z.number()
      })
    })
  },
  '/get_friend_list': {
    description: '获取好友列表',
    request: z.object({
      no_cache: z.boolean().describe('是否不使用缓存')
    }),
    response: baseResponseSchema.extend({
      data: z.array(
        z.object({
          qid: z.string(),
          longNick: z.string(),
          birthday_year: z.number(),
          birthday_month: z.number(),
          birthday_day: z.number(),
          age: z.number(),
          sex: z.string(),
          eMail: z.string(),
          phoneNum: z.string(),
          categoryId: z.number(),
          richTime: z.number(),
          richBuffer: z.object({}),
          uid: z.string(),
          uin: z.string(),
          nick: z.string(),
          remark: z.string(),
          user_id: z.number(),
          nickname: z.string(),
          level: z.number()
        })
      )
    })
  },
  '/get_profile_like': {
    description: '获取点赞列表',
    request: z.object({}),
    response: baseResponseSchema.extend({
      data: z.object({
        total_count: z.number(),
        new_count: z.number(),
        new_nearby_count: z.number(),
        last_visit_time: z.number(),
        userInfos: z.array(
          z.object({
            uid: z.string(),
            src: z.number(),
            latestTime: z.number(),
            count: z.number(),
            giftCount: z.number(),
            customId: z.number(),
            lastCharged: z.number(),
            bAvailableCnt: z.number(),
            bTodayVotedCnt: z.number(),
            nick: z.string(),
            gender: z.number(),
            age: z.number(),
            isFriend: z.boolean(),
            isvip: z.boolean(),
            isSvip: z.boolean(),
            uin: z.number()
          })
        )
      })
    })
  },
  '/fetch_custom_face': {
    description: '获取收藏表情',
    request: z.object({
      count: z.number().optional().describe('获取数量')
    }),
    response: baseResponseSchema.extend({
      data: z.array(z.string())
    })
  },
  '/upload_private_file': {
    description: '上传私聊文件',
    request: z.object({
      user_id: z.union([z.string(), z.number()]),
      file: z.string(),
      name: z.string()
    }),
    response: baseResponseSchema
  },
  '/delete_friend': {
    description: '删除好友',
    request: z.object({
      user_id: z.union([z.string(), z.number()]).describe('自己QQ号？'),
      friend_id: z.union([z.string(), z.number()]).describe('好友QQ号'),
      temp_block: z.boolean().describe('是否加入黑名单'),
      temp_both_del: z.boolean().describe('是否双向删除')
    }),
    response: baseResponseSchema.extend({
      data: commonResponseDataSchema
    })
  },
  '/nc_get_user_status': {
    description: '获取用户在线状态',
    request: z.object({
      user_id: z.union([z.string(), z.number()]).describe('对方QQ号')
    }),
    response: baseResponseSchema.extend({
      data: z.object({
        status: z.number(),
        ext_status: z.number()
      })
    })
  }
} as const

export default oneBotHttpApiUser
